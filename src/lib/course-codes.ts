/** Marker stored in skills[] when WR is optional and not yet claimed (no DB column needed). */
export const WR_OPTIONAL_SKILL = "_wr_optional";

export type CatalogRenumberingGroups = string[][];

/** Normalize Yale / CourseTable codes (2200 → 220 when trailing-zero migration). */
export function canonicalCourseCode(code: string): string {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, " ");
  const match = normalized.match(/^([A-Z&]+)\s+(\d{3,4})(L?)$/);
  if (!match) return normalized;
  const [, subject, num, labSuffix] = match;
  let base = num;
  if (num.length === 4 && num.endsWith("0")) {
    base = num.slice(0, 3);
  }
  return `${subject} ${base}${labSuffix}`;
}

/** Manual equivalents that title matching cannot infer (lab clusters, cross-dept aliases). */
const MANUAL_EQUIVALENT_GROUPS: string[][] = [
  ["CHEM 174", "CHEM 175", "CHEM 1340L", "CHEM 1360L", "CHEM 134L", "CHEM 136L", "CHEM 1710L"],
  ["ENAS 1300", "CPSC 100"],
];

const staticMatchGroupId = new Map<string, string>();
const staticGroupCodes = new Map<string, string[]>();

let catalogMatchGroupId = new Map<string, string>();
let catalogGroupCodes = new Map<string, string[]>();

function registerGroups(
  groups: string[][],
  idMap: Map<string, string>,
  membersMap: Map<string, string[]>,
) {
  for (const group of groups) {
    const codes = [...new Set(group.map((c) => c.trim().toUpperCase()))];
    if (codes.length < 2) continue;
    const id = codes.map((c) => canonicalCourseCode(c)).sort().join("|");
    membersMap.set(id, codes);
    for (const code of codes) {
      idMap.set(canonicalCourseCode(code), id);
      idMap.set(code, id);
    }
  }
}

registerGroups(MANUAL_EQUIVALENT_GROUPS, staticMatchGroupId, staticGroupCodes);

export function registerCatalogRenumberingGroups(groups: CatalogRenumberingGroups) {
  catalogMatchGroupId = new Map();
  catalogGroupCodes = new Map();
  registerGroups(groups, catalogMatchGroupId, catalogGroupCodes);
}

function groupIdForCode(code: string): string | undefined {
  const upper = code.trim().toUpperCase();
  const canon = canonicalCourseCode(upper);
  return catalogMatchGroupId.get(canon) ?? catalogMatchGroupId.get(upper) ?? staticMatchGroupId.get(canon) ?? staticMatchGroupId.get(upper);
}

function codesInGroup(groupId: string): string[] {
  return catalogGroupCodes.get(groupId) ?? staticGroupCodes.get(groupId) ?? [];
}

/**
 * Stable identity for deduping and audits.
 * Uses CourseTable-derived renumbering groups when loaded (e.g. CHEM 220 ≡ CHEM 2200, AFAM 186 ≡ AFAM 1986).
 */
export function courseIdentityKey(code: string): string {
  return groupIdForCode(code) ?? canonicalCourseCode(code);
}

function numericCodeVariants(code: string): string[] {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, " ");
  const out = new Set<string>([normalized, canonicalCourseCode(normalized)]);

  const match = normalized.match(/^([A-Z&]+)\s+(\d{3,4})(L?)$/);
  if (match) {
    const [, subject, num, labSuffix] = match;
    const nums = new Set([num]);
    if (num.length === 3) nums.add(`${num}0`);
    if (num.length === 4 && num.endsWith("0")) nums.add(num.slice(0, 3));
    for (const n of nums) {
      const form = `${subject} ${n}${labSuffix}`;
      out.add(form);
      out.add(canonicalCourseCode(form));
    }
  }

  return [...out];
}

export function codeVariants(code: string): string[] {
  const out = new Set(numericCodeVariants(code));
  const gid = groupIdForCode(code);
  if (gid) {
    for (const c of codesInGroup(gid)) {
      out.add(c);
      out.add(canonicalCourseCode(c));
    }
  }
  return [...out];
}

export function codeLookupKeys(code: string): string[] {
  return [...new Set(codeVariants(code).map((v) => v.toUpperCase()))];
}

export function courseCodesMatch(a: string, b: string): boolean {
  if (courseIdentityKey(a) === courseIdentityKey(b)) return true;
  return codeVariants(a).some((va) => codeVariants(b).some((vb) => va === vb));
}

export function courseMatchesAny(code: string, candidates: string[]): boolean {
  return candidates.some((c) => courseCodesMatch(code, c));
}

export function buildCompletedCourseIdentitySet(
  courses: Iterable<{ course_code: string }>,
): Set<string> {
  const set = new Set<string>();
  for (const course of courses) {
    set.add(courseIdentityKey(course.course_code));
    for (const variant of codeVariants(course.course_code)) {
      set.add(courseIdentityKey(variant));
    }
  }
  return set;
}

export function hasCompletedCourseCode(code: string, completed: Set<string>): boolean {
  return codeVariants(code).some((variant) => completed.has(courseIdentityKey(variant)));
}

export function lookupCatalogEntry<T>(code: string, catalog: Record<string, T>): T | undefined {
  for (const key of codeLookupKeys(code)) {
    const hit = catalog[key];
    if (hit) return hit;
  }
  return undefined;
}

const MANDATORY_WR_CODES = ["ENGL 114", "ENGL 115", "ENGL 1140", "ENGL 1150"];

export function isMandatoryWritingCourse(code: string): boolean {
  return courseMatchesAny(code, MANDATORY_WR_CODES);
}

export function isOptionalWritingOffered(catalogSkills: string[], code: string): boolean {
  return catalogSkills.includes("WR") && !isMandatoryWritingCourse(code);
}

export type UserCourseSkillsFields = {
  skills: string[];
  counts_as_wr?: boolean | null;
};

export function effectiveSkills(course: UserCourseSkillsFields): string[] {
  const skills = [...(course.skills ?? [])].filter((s) => s !== WR_OPTIONAL_SKILL);
  if (course.counts_as_wr === true) {
    return skills.includes("WR") ? skills : [...skills, "WR"];
  }
  if (course.counts_as_wr === false) {
    return skills.filter((s) => s !== "WR");
  }
  if (skills.includes("WR")) return skills;
  return skills;
}

export function skillsForNewCourse(
  catalogSkills: string[],
  code: string,
): { skills: string[]; counts_as_wr: boolean | null } {
  if (!catalogSkills.includes("WR")) {
    return { skills: catalogSkills, counts_as_wr: null };
  }
  if (isMandatoryWritingCourse(code)) {
    return { skills: catalogSkills, counts_as_wr: true };
  }
  return {
    skills: [...catalogSkills.filter((s) => s !== "WR"), WR_OPTIONAL_SKILL],
    counts_as_wr: false,
  };
}

export function expandCourseCodeVariants(codes: string[]): string[] {
  const out = new Set<string>();
  for (const code of codes) {
    for (const variant of codeVariants(code)) out.add(variant);
  }
  return [...out];
}
