import type { CatalogCourse } from "@/data/courses";
import { canonicalCourseCode, courseCodesMatch, courseMatchesAny } from "@/lib/course-codes";

/** All Yale course codes for one offering (including cross-listings). */
export function allListingCodes(entry: { code: string; crosslistedCodes?: string[] }): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [entry.code, ...(entry.crosslistedCodes ?? [])]) {
    const c = raw.trim();
    if (!c) continue;
    const key = c.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

/** Map canonical code → all canonical codes in the same cross-listed group. */
export type CrosslistLookup = Map<string, Set<string>>;

/** JSON-safe form for sending lookup to the client. */
export function serializeCrosslistLookup(lookup: CrosslistLookup): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [canon, group] of lookup) {
    out[canon] = [...group];
  }
  return out;
}

export function deserializeCrosslistLookup(data: Record<string, string[]>): CrosslistLookup {
  const lookup: CrosslistLookup = new Map();
  for (const [canon, codes] of Object.entries(data)) {
    lookup.set(canon, new Set(codes));
  }
  return lookup;
}

export function buildCrosslistLookup(catalog: Iterable<CatalogCourse>): CrosslistLookup {
  const lookup: CrosslistLookup = new Map();

  for (const course of catalog) {
    const group = new Set(allListingCodes(course).map((c) => canonicalCourseCode(c)));
    for (const canon of group) {
      lookup.set(canon, group);
    }
  }

  return lookup;
}

/** Alternate course codes (excluding the primary) for audit display and matching. */
export function alternateCodesForCourse(
  courseCode: string,
  lookup: CrosslistLookup | undefined,
): string[] {
  if (!lookup) return [];
  const group = lookup.get(canonicalCourseCode(courseCode));
  if (!group) return [];
  return [...group].filter((c) => !courseCodesMatch(c, courseCode));
}

export function codesForRequirementMatch(
  courseCode: string,
  crosslistedCodes?: string[] | null,
  lookup?: CrosslistLookup,
): string[] {
  const fromCourse = [courseCode, ...(crosslistedCodes ?? [])];
  const fromLookup = alternateCodesForCourse(courseCode, lookup);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...fromCourse, ...fromLookup]) {
    const key = raw.trim().toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(raw.trim());
    }
  }
  return out;
}

export function formatCrosslistNote(
  courseCode: string,
  crosslistedCodes?: string[] | null,
  lookup?: CrosslistLookup,
): string | null {
  const alts = [
    ...new Set([
      ...(crosslistedCodes ?? []),
      ...alternateCodesForCourse(courseCode, lookup),
    ]),
  ].filter((c) => !courseCodesMatch(c, courseCode));
  if (!alts.length) return null;
  return `Also listed as ${alts.join(", ")}`;
}

export function courseMatchesCodePrefix(
  code: string,
  prefix: string,
  minLevel?: number,
  maxLevel?: number,
): boolean {
  const upper = code.toUpperCase();
  if (!upper.startsWith(prefix.toUpperCase())) return false;
  const numMatch = upper.match(/(\d{3,4})/);
  const num = numMatch ? parseInt(numMatch[1], 10) : 0;
  if (minLevel && num < minLevel) return false;
  if (maxLevel && num > maxLevel) return false;
  return true;
}

export function ycAttributesForCourseCodes(
  codesToCheck: string[],
  catalogByCode?: Record<string, { ycAttributes?: string[] }>,
): Set<string> {
  const attrs = new Set<string>();
  if (!catalogByCode) return attrs;
  for (const raw of codesToCheck) {
    const entry =
      catalogByCode[raw.trim()] ??
      catalogByCode[raw.trim().toUpperCase()];
    for (const a of entry?.ycAttributes ?? []) attrs.add(a);
  }
  return attrs;
}

export function courseMatchesSlotCodes(
  codesToCheck: string[],
  slot: {
    codes?: string[];
    codePrefix?: string[];
    minLevel?: number;
    maxLevel?: number;
    requiredAttributes?: string[];
  },
  catalogByCode?: Record<string, { ycAttributes?: string[] }>,
): boolean {
  if (slot.requiredAttributes?.length) {
    const attrs = ycAttributesForCourseCodes(codesToCheck, catalogByCode);
    return slot.requiredAttributes.some((req) => attrs.has(req));
  }
  if (slot.codes?.length && codesToCheck.some((code) => courseMatchesAny(code, slot.codes!))) {
    return true;
  }
  if (slot.codePrefix?.length) {
    return codesToCheck.some((code) =>
      slot.codePrefix!.some((p) =>
        courseMatchesCodePrefix(code, p, slot.minLevel, slot.maxLevel),
      ),
    );
  }
  return false;
}
