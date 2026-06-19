import { expandCourseCodeVariants } from "@/lib/course-codes";

/** Expand Yale roadmap codes to include CourseTable 4-digit variants. */
export function y(codes: string[]): string[] {
  return expandCourseCodeVariants(codes);
}
