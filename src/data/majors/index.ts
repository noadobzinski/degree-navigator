import { CATALOG_MAJORS } from "./catalog";
import { DETAILED_MAJORS } from "./detailed";
import type { Major } from "./types";

export type { Major, MajorRequirements, RequirementSlot } from "./types";
export { YALE_ROADMAP_PDF } from "./types";

const DETAILED_IDS = new Set(DETAILED_MAJORS.map((m) => m.id));

/** All Yale College majors from the official Major Roadmaps. Detailed audits for 9; catalog templates for the rest. */
export const MAJORS: Major[] = [
  ...DETAILED_MAJORS,
  ...CATALOG_MAJORS.filter((m) => !DETAILED_IDS.has(m.id)),
].sort((a, b) => a.name.localeCompare(b.name));

export const MAJORS_BY_ID: Record<string, Major> = Object.fromEntries(
  MAJORS.map((m) => [m.id, m]),
);

export const MAJOR_DEPARTMENTS: string[] = [
  ...new Set(MAJORS.map((m) => m.department)),
].sort();

export function majorCourseCount(major: Major, degree: "BA" | "BS"): number {
  const reqs = major.requirements[degree] ?? Object.values(major.requirements)[0];
  return reqs?.totalCourses ?? 0;
}
