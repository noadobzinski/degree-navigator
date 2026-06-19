/** Marker stored in skills[] when WR is optional and not yet claimed (no DB column needed). */
export const WR_OPTIONAL_SKILL = "_wr_optional";

/** Normalize Yale / CourseTable codes for requirement matching (2200 → 220, etc.). */
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

/** Yale course identity — same for 3- and 4-digit forms (e.g. CHEM 220 / CHEM 2200). */
export function courseIdentityKey(code: string): string {
  return canonicalCourseCode(code);
}

/**
 * Numeric Yale renumbering only (3↔4 digits). Does not consult equivalent groups.
 */
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

/**
 * All string forms for a course code: raw, canonical, 3↔4 digit Yale renumbering,
 * and manual equivalent-group members (e.g. CHEM 174 / CHEM 175).
 */
export function codeVariants(code: string): string[] {
  const out = new Set(numericCodeVariants(code));
  const groupId = matchGroupId.get(canonicalCourseCode(code));
  if (groupId) {
    for (const [key, id] of matchGroupId) {
      if (id === groupId) out.add(key);
    }
  }
  return [...out];
}

/** Map keys for catalog / season lookups (all equivalent spellings). */
export function codeLookupKeys(code: string): string[] {
  return [...new Set(codeVariants(code).map((v) => v.toUpperCase()))];
}

/** Known equivalents beyond simple trailing-zero renumbering. */
const EQUIVALENT_GROUPS: string[][] = [
  ["CHEM 161", "CHEM 1610"],
  ["CHEM 165", "CHEM 1650"],
  ["CHEM 220", "CHEM 2200"],
  ["CHEM 221", "CHEM 2210"],
  ["CHEM 222", "CHEM 2220", "CHEM 2220L"],
  ["CHEM 174", "CHEM 175", "CHEM 1340L", "CHEM 1360L", "CHEM 134L", "CHEM 136L", "CHEM 1710L"],
  ["MATH 112", "MATH 1120"],
  ["MATH 115", "MATH 1150"],
  ["MATH 120", "MATH 1200"],
  ["BIOL 101", "BIOL 1010"],
  ["BIOL 102", "BIOL 1020"],
  ["BIOL 103", "BIOL 1030"],
  ["BIOL 104", "BIOL 1040"],
  ["MCDB 310", "MCDB 3100"],
  ["PHYS 170", "PHYS 1700"],
  ["PHYS 171", "PHYS 1710"],
  ["PHYS 180", "PHYS 1800"],
  ["PHYS 181", "PHYS 1810"],
  ["PSYC 110", "PSYC 1100"],
  ["SOCY 126", "SOCY 1260"],
  ["SOCY 151", "SOCY 1510"],
  ["ENGL 114", "ENGL 1140"],
  ["ENGL 115", "ENGL 1150"],
  ["CPSC 202", "CPSC 2020"],
  ["AMTH 244", "AMTH 2440"],
  ["APHY 151", "APHY 1510"],
  ["APHY 322", "APHY 3220"],
  ["APHY 420", "APHY 4200"],
  ["APHY 439", "APHY 4390"],
  ["CGSC 110", "CGSC 1100"],
  ["ENAS 1300", "CPSC 100"],
];

const matchGroupId = new Map<string, string>();

for (const group of EQUIVALENT_GROUPS) {
  const id = group.map((c) => canonicalCourseCode(c)).sort().join("|");
  for (const code of group) {
    for (const variant of numericCodeVariants(code)) {
      matchGroupId.set(courseIdentityKey(variant), id);
    }
  }
}

export function courseCodesMatch(a: string, b: string): boolean {
  if (courseIdentityKey(a) === courseIdentityKey(b)) return true;
  const ga = matchGroupId.get(courseIdentityKey(a));
  const gb = matchGroupId.get(courseIdentityKey(b));
  return !!ga && ga === gb;
}

export function courseMatchesAny(code: string, candidates: string[]): boolean {
  return candidates.some((c) => courseCodesMatch(code, c));
}

/** Identity keys for courses the student has already taken/planned (merges 220 ↔ 2200). */
export function buildCompletedCourseIdentitySet(
  courses: Iterable<{ course_code: string }>,
): Set<string> {
  const set = new Set<string>();
  for (const course of courses) {
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

/** CourseTable lists WR when a section may be taken with writing credit. */
export function isOptionalWritingOffered(catalogSkills: string[], code: string): boolean {
  return catalogSkills.includes("WR") && !isMandatoryWritingCourse(code);
}

export type UserCourseSkillsFields = {
  skills: string[];
  counts_as_wr?: boolean | null;
};

/** Skills that count toward distributional / track audits. */
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

/** Strip optional WR from stored skills when first adding a course. */
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

/** Expand Yale roadmap codes to include CourseTable 4-digit variants. */
export function expandCourseCodeVariants(codes: string[]): string[] {
  const out = new Set<string>();
  for (const code of codes) {
    for (const variant of codeVariants(code)) out.add(variant);
  }
  return [...out];
}
