import { canonicalCourseCode } from "@/lib/course-codes";

/** Resolve Yale course credit value from CourseTable (often 0 for half-credit bios). */
export function resolveCatalogCredits(apiCredits: number, courseCode: string): number {
  if (apiCredits === 0.5) return 0.5;
  if (apiCredits >= 1) return apiCredits;

  const canonical = canonicalCourseCode(courseCode);
  if (/^BIOL 10[1-4]$/.test(canonical)) return 0.5;
  if (/^CHEM (134|136|174|175|222)L?$/.test(canonical)) return 0.5;
  if (canonical.endsWith("L") || /\d+L$/.test(courseCode.toUpperCase())) return 0.5;

  return apiCredits > 0 ? apiCredits : 1;
}

export function formatCourseCredits(credits: number): string {
  if (credits === 0.5) return "0.5 cr";
  if (Number.isInteger(credits)) return `${credits} cr`;
  return `${credits} cr`;
}

export function isHalfCreditCourse(credits: number): boolean {
  return credits > 0 && credits < 1;
}
