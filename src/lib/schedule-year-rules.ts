import { firstFallYearForClass, seasonToTermFields } from "@/lib/coursetable-seasons";

export type StudentYearLevel = 1 | 2 | 3 | 4;

const YEAR_NAMES: Record<StudentYearLevel, string> = {
  1: "First-year",
  2: "Sophomore",
  3: "Junior",
  4: "Senior",
};

/** Which Yale year (1–4) a semester falls in for a given class year. */
export function studentYearLevel(classYear: number, seasonCode: string): StudentYearLevel {
  const firstFall = firstFallYearForClass(classYear);
  const { term, year } = seasonToTermFields(seasonCode);
  const academicYearStart = term === "Fall" ? year : year - 1;
  const level = academicYearStart - firstFall + 1;
  return Math.min(4, Math.max(1, level)) as StudentYearLevel;
}

export function studentYearLabel(classYear: number, seasonCode: string): string {
  return YEAR_NAMES[studentYearLevel(classYear, seasonCode)];
}

export type YearRestrictionKind = "junior" | "senior";

export function yearRestrictionsInTitle(title: string): YearRestrictionKind[] {
  const lower = title.toLowerCase();
  const found: YearRestrictionKind[] = [];
  if (/\bjunior\b/.test(lower)) found.push("junior");
  if (/\bsenior\b/.test(lower)) found.push("senior");
  return found;
}

export function yearRestrictionViolation(
  courseTitle: string,
  classYear: number,
  seasonCode: string,
): string | null {
  const level = studentYearLevel(classYear, seasonCode);
  const restrictions = yearRestrictionsInTitle(courseTitle);

  if (restrictions.includes("junior") && level !== 3) {
    return `"${courseTitle}" includes "Junior" — typically taken in junior year (year 3), not ${YEAR_NAMES[level]} year.`;
  }
  if (restrictions.includes("senior") && level !== 4) {
    return `"${courseTitle}" includes "Senior" — typically taken in senior year (year 4), not ${YEAR_NAMES[level]} year.`;
  }
  return null;
}
