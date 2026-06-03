/** Marker stored in skills[] when WR is optional and not yet claimed (no DB column needed). */
export const WR_OPTIONAL_SKILL = "_wr_optional";

/** Normalize Yale / CourseTable codes for requirement matching (1610 → 161, etc.). */
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

/** Known equivalents (CourseTable 4-digit / alternate lab numbers). */
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
];

const matchGroupId = new Map<string, string>();

for (const group of EQUIVALENT_GROUPS) {
  const id = group.map((c) => canonicalCourseCode(c)).sort().join("|");
  for (const code of group) {
    matchGroupId.set(canonicalCourseCode(code), id);
  }
}

export function courseCodesMatch(a: string, b: string): boolean {
  const ca = canonicalCourseCode(a);
  const cb = canonicalCourseCode(b);
  if (ca === cb) return true;
  const ga = matchGroupId.get(ca);
  const gb = matchGroupId.get(cb);
  return !!ga && ga === gb;
}

export function courseMatchesAny(code: string, candidates: string[]): boolean {
  return candidates.some((c) => courseCodesMatch(code, c));
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
