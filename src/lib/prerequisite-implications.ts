import type { UserCourse } from "@/lib/audit";
import { courseIdentityKey, courseMatchesAny } from "@/lib/course-codes";

export type PrerequisiteImplication = {
  triggers: string[];
  implies: string[];
  reason: string;
};

/** Yale sequences: later courses imply earlier prereqs for requirement matching (0 credits). */
export const PREREQUISITE_IMPLICATIONS: PrerequisiteImplication[] = [
  {
    triggers: ["MATH 120", "MATH 1200"],
    implies: ["MATH 112", "MATH 1120", "MATH 115", "MATH 1150"],
    reason: "Multivariable calculus (MATH 1200) assumes MATH 1120 and MATH 1150",
  },
  {
    triggers: ["CHEM 221", "CHEM 2210", "CHEM 222", "CHEM 2220", "CHEM 2220L", "CHEM 222L"],
    implies: ["CHEM 220", "CHEM 2200"],
    reason: "Organic Chemistry II assumes Organic Chemistry I",
  },
  {
    triggers: ["MATH 115", "MATH 1150"],
    implies: ["MATH 112", "MATH 1120"],
    reason: "MATH 1150 assumes MATH 1120",
  },
];

export function impliedPrerequisiteCourses(
  courses: UserCourse[],
  titleByCode?: Record<string, string>,
): UserCourse[] {
  const real = courses.filter((c) => !c.implied_prerequisite);
  const seen = new Set(real.map((c) => courseIdentityKey(c.course_code)));
  const implied: UserCourse[] = [];

  for (const rule of PREREQUISITE_IMPLICATIONS) {
    const triggered = real.some((c) => courseMatchesAny(c.course_code, rule.triggers));
    if (!triggered) continue;

    for (const code of rule.implies) {
      const key = courseIdentityKey(code);
      if (seen.has(key)) continue;
      seen.add(key);
      implied.push({
        id: `implied:${key}`,
        course_code: code,
        course_title: titleByCode?.[code.toUpperCase()] ?? `${code} (implied)`,
        credits: 0,
        distributional: [],
        skills: [],
        status: "completed",
        term: null,
        year: null,
        implied_prerequisite: true,
      });
    }
  }

  return implied;
}

export function activeImplicationNotes(courses: UserCourse[]): string[] {
  const real = courses.filter((c) => !c.implied_prerequisite);
  return PREREQUISITE_IMPLICATIONS.filter((rule) =>
    real.some((c) => courseMatchesAny(c.course_code, rule.triggers)),
  ).map((r) => r.reason);
}
