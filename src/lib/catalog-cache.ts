import { CATALOG_BY_CODE, type CatalogCourse } from "@/data/courses";
import {
  COURSETABLE_API,
  currentSeasonCode,
  dedupeCourseTableCourses,
  type CourseTableCourse,
} from "@/lib/coursetable";
import { codeLookupKeys, registerCatalogRenumberingGroups } from "@/lib/course-codes";
import {
  buildRenumberingGroups,
  seasonRecordsFromCourseTable,
  serializeRenumberingGroups,
  type SeasonCourseRecord,
} from "@/lib/course-renumbering";
import { buildCrosslistLookup, type CrosslistLookup } from "@/lib/crosslist";
import { recentCatalogSeasons } from "@/lib/coursetable-seasons";

type CatalogCacheEntry = {
  courses: CatalogCourse[];
  records: SeasonCourseRecord[];
  fetchedAt: number;
};

const catalogCacheBySeason = new Map<string, CatalogCacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000;

/** Enough semesters to span Yale's 3→4 digit catalog migration (~2024–2025). */
export function renumberingCatalogSeasons(now = new Date()): string[] {
  return recentCatalogSeasons(14, now).map((s) => s.code);
}

async function fetchSeasonCatalogBundle(season: string): Promise<CatalogCacheEntry> {
  const cached = catalogCacheBySeason.get(season);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached;
  }

  const res = await fetch(`${COURSETABLE_API}/api/catalog/public/${season}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`CourseTable catalog unavailable (${res.status})`);
  }

  const raw = (await res.json()) as CourseTableCourse[];
  const bundle: CatalogCacheEntry = {
    courses: dedupeCourseTableCourses(raw),
    records: seasonRecordsFromCourseTable(season, raw),
    fetchedAt: Date.now(),
  };
  catalogCacheBySeason.set(season, bundle);
  return bundle;
}

export async function fetchSeasonCatalog(season: string): Promise<CatalogCourse[]> {
  return (await fetchSeasonCatalogBundle(season)).courses;
}

export function buildMergedCatalog(courses: CatalogCourse[]): Record<string, CatalogCourse> {
  const merged: Record<string, CatalogCourse> = { ...CATALOG_BY_CODE };
  for (const c of courses) {
    const keys = [c.code, ...(c.crosslistedCodes ?? [])].flatMap((code) => codeLookupKeys(code));
    for (const key of keys) {
      merged[key] = c;
    }
  }
  return merged;
}

export type AuditCatalogByCode = Record<string, { ycAttributes?: string[] }>;

export function buildAuditCatalogByCode(courses: CatalogCourse[]): AuditCatalogByCode {
  const merged = buildMergedCatalog(courses);
  const out: AuditCatalogByCode = {};
  for (const [code, course] of Object.entries(merged)) {
    if (course.ycAttributes?.length) {
      out[code] = { ycAttributes: course.ycAttributes };
    }
  }
  return out;
}

let auditCatalogCache: { seasons: string; catalog: AuditCatalogByCode; fetchedAt: number } | null =
  null;

export async function getAuditCatalogByCode(
  seasons: string[] = [currentSeasonCode()],
): Promise<AuditCatalogByCode> {
  const key = [...seasons].sort().join(",");
  if (
    auditCatalogCache &&
    auditCatalogCache.seasons === key &&
    Date.now() - auditCatalogCache.fetchedAt < CACHE_TTL_MS
  ) {
    return auditCatalogCache.catalog;
  }
  const all: CatalogCourse[] = [];
  for (const season of seasons) {
    try {
      all.push(...(await fetchSeasonCatalog(season)));
    } catch {
      /* skip unavailable terms */
    }
  }
  const catalog = buildAuditCatalogByCode(all);
  auditCatalogCache = { seasons: key, catalog, fetchedAt: Date.now() };
  return catalog;
}

let crosslistCache: { seasons: string; lookup: CrosslistLookup; fetchedAt: number } | null = null;
let renumberingCache: { seasons: string; groups: string[][]; fetchedAt: number } | null = null;

async function loadSeasonBundles(seasons: string[]): Promise<CatalogCacheEntry[]> {
  const bundles: CatalogCacheEntry[] = [];
  for (const season of seasons) {
    try {
      bundles.push(await fetchSeasonCatalogBundle(season));
    } catch {
      /* skip unavailable terms */
    }
  }
  return bundles;
}

export async function getRenumberingGroups(
  seasons: string[] = renumberingCatalogSeasons(),
): Promise<string[][]> {
  const key = [...seasons].sort().join(",");
  if (
    renumberingCache &&
    renumberingCache.seasons === key &&
    Date.now() - renumberingCache.fetchedAt < CACHE_TTL_MS
  ) {
    return renumberingCache.groups;
  }

  const bundles = await loadSeasonBundles(seasons);
  const records = bundles.flatMap((b) => b.records);
  const groups = serializeRenumberingGroups(buildRenumberingGroups(records));
  renumberingCache = { seasons: key, groups, fetchedAt: Date.now() };
  registerCatalogRenumberingGroups(groups);
  return groups;
}

export async function ensureRenumberingRegistered(seasons?: string[]): Promise<void> {
  await getRenumberingGroups(seasons ?? renumberingCatalogSeasons());
}

export async function getCrosslistLookup(
  seasons: string[] = [currentSeasonCode()],
): Promise<CrosslistLookup> {
  const key = [...seasons].sort().join(",");
  if (
    crosslistCache &&
    crosslistCache.seasons === key &&
    Date.now() - crosslistCache.fetchedAt < CACHE_TTL_MS
  ) {
    return crosslistCache.lookup;
  }
  await ensureRenumberingRegistered(renumberingCatalogSeasons());
  const all: CatalogCourse[] = [];
  for (const season of seasons) {
    try {
      all.push(...(await fetchSeasonCatalog(season)));
    } catch {
      /* skip unavailable terms */
    }
  }
  const lookup = buildCrosslistLookup([...Object.values(CATALOG_BY_CODE), ...all]);
  crosslistCache = { seasons: key, lookup, fetchedAt: Date.now() };
  return lookup;
}
