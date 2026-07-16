import type { CatalogCourse } from "@/data/courses";
import type { UserCourse } from "@/lib/audit";
import { subjectFromCode } from "@/lib/course-codes";
import {
  allListingCodes,
  alternateCodesForCourse,
  codesForRequirementMatch,
  type CrosslistLookup,
} from "@/lib/crosslist";

/** Marker stored in skills[] when the DB column has not been migrated yet. */
export const DEPT_ALLOC_SKILL_PREFIX = "_dept:";

export { subjectFromCode };

export type DepartmentOption = {
  /** Subject prefix, e.g. "HIST". Stored as the allocation value. */
  subject: string;
  /** A representative course code for this listing, e.g. "HIST 205". */
  code: string;
};

type CrosslistFields = {
  course_code: string;
  crosslisted_codes?: string[] | null;
};

function listingCodesForCourse(course: CrosslistFields, lookup?: CrosslistLookup): string[] {
  const base = allListingCodes({
    code: course.course_code,
    crosslistedCodes: course.crosslisted_codes ?? undefined,
  });
  const fromLookup = alternateCodesForCourse(course.course_code, lookup);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...base, ...fromLookup]) {
    const c = raw.trim();
    if (!c) continue;
    const key = c.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

/** Distinct department listings (one per subject) a cross-listed course could count toward. */
export function getDepartmentOptions(
  course: CrosslistFields,
  lookup?: CrosslistLookup,
): DepartmentOption[] {
  const seen = new Set<string>();
  const out: DepartmentOption[] = [];
  for (const code of listingCodesForCourse(course, lookup)) {
    const subject = subjectFromCode(code);
    if (!subject || seen.has(subject)) continue;
    seen.add(subject);
    out.push({ subject, code });
  }
  return out;
}

/** True when the course is cross-listed across more than one department. */
export function courseHasDepartmentChoice(
  course: CrosslistFields,
  lookup?: CrosslistLookup,
): boolean {
  return getDepartmentOptions(course, lookup).length > 1;
}

export function catalogCourseHasDepartmentChoice(course: CatalogCourse): boolean {
  return (
    getDepartmentOptions({
      course_code: course.code,
      crosslisted_codes: course.crosslistedCodes,
    }).length > 1
  );
}

export function departmentAllocationFromSkills(skills: string[]): string | null {
  const marker = skills.find((s) => s.startsWith(DEPT_ALLOC_SKILL_PREFIX));
  return marker ? marker.slice(DEPT_ALLOC_SKILL_PREFIX.length) : null;
}

export function stripDepartmentMarkers(skills: string[]): string[] {
  return skills.filter((s) => !s.startsWith(DEPT_ALLOC_SKILL_PREFIX));
}

/**
 * The department a course is pinned to, or null when it should count for every
 * listing. Reads the dedicated column first, then falls back to the skills
 * marker (for rows saved before the column was migrated). Only honored when the
 * course actually has a cross-listing choice and the pick is a valid subject.
 */
export function getEffectiveDepartmentAllocation(
  course: UserCourse,
  lookup?: CrosslistLookup,
): string | null {
  const options = getDepartmentOptions(course, lookup);
  if (options.length < 2) return null;
  const valid = new Set(options.map((o) => o.subject));

  const fromCol = course.department_allocation;
  if (fromCol && valid.has(fromCol)) return fromCol;

  const fromSkills = departmentAllocationFromSkills(course.skills ?? []);
  if (fromSkills && valid.has(fromSkills)) return fromSkills;

  return null;
}

/**
 * Codes to use when matching a course against a requirement slot. Normally this
 * is every cross-listed code, but when the student pins the course to one
 * department we only expose that department's codes so it stops satisfying the
 * other department's requirements.
 */
export function matchCodesWithDepartment(course: UserCourse, lookup?: CrosslistLookup): string[] {
  const all = codesForRequirementMatch(course.course_code, course.crosslisted_codes, lookup);
  const alloc = getEffectiveDepartmentAllocation(course, lookup);
  if (!alloc) return all;
  const filtered = all.filter((c) => subjectFromCode(c) === alloc);
  return filtered.length ? filtered : all;
}

export function departmentAllocationLabel(course: UserCourse, lookup?: CrosslistLookup): string {
  const alloc = getEffectiveDepartmentAllocation(course, lookup);
  if (alloc) return alloc;
  return "All departments";
}
