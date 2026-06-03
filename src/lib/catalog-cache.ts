import { CATALOG_BY_CODE, type CatalogCourse } from "@/data/courses";
import {
  COURSETABLE_API,
  currentSeasonCode,
  dedupeCourseTableCourses,
  type CourseTableCourse,
} from "@/lib/coursetable";
import { buildCrosslistLookup, type CrosslistLookup } from "@/lib/crosslist";

type CatalogCacheEntry = {
  courses: CatalogCourse[];
  fetchedAt: number;
};

const catalogCacheBySeason = new Map<string, CatalogCacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function fetchSeasonCatalog(season: string): Promise<CatalogCourse[]> {
  const cached = catalogCacheBySeason.get(season);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.courses;
  }

  const res = await fetch(`${COURSETABLE_API}/api/catalog/public/${season}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`CourseTable catalog unavailable (${res.status})`);
  }

  const raw = (await res.json()) as CourseTableCourse[];
  const courses = dedupeCourseTableCourses(raw);
  catalogCacheBySeason.set(season, { courses, fetchedAt: Date.now() });
  return courses;
}

export function buildMergedCatalog(courses: CatalogCourse[]): Record<string, CatalogCourse> {
  const merged: Record<string, CatalogCourse> = { ...CATALOG_BY_CODE };
  for (const c of courses) {
    const keys = [c.code, ...(c.crosslistedCodes ?? [])];
    for (const code of keys) {
      merged[code.toUpperCase()] = c;
    }
  }
  return merged;
}

let crosslistCache: { seasons: string; lookup: CrosslistLookup; fetchedAt: number } | null = null;

/** Cross-list groups from CourseTable catalog (cached ~1 hour). */
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
