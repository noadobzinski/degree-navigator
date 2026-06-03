import { CATALOG_MAJORS } from "./catalog";
import { DETAILED_MAJORS } from "./detailed";
import { ROADMAP_MAJORS } from "./roadmap-majors";
import type { Major } from "./types";

export type { Major, MajorConcentration, MajorRequirements, RequirementGroup, RequirementSlot } from "./types";
export { mergeElectivesIntoCore } from "./normalize";
export { concentrationsForMajor, resolveMajorRequirements } from "./resolve";
export { YALE_DOUBLE_MAJOR_MAX_OVERLAP, YALE_ROADMAP_PDF } from "./types";

const DETAILED_IDS = new Set(DETAILED_MAJORS.map((m) => m.id));
const ROADMAP_IDS = new Set(ROADMAP_MAJORS.map((m) => m.id));
const OVERRIDE_IDS = new Set([...DETAILED_IDS, ...ROADMAP_IDS]);

/** All Yale College majors from the official Major Roadmaps (April–May 2026). */
export const MAJORS: Major[] = [
  ...DETAILED_MAJORS,
  ...ROADMAP_MAJORS.filter((m) => !DETAILED_IDS.has(m.id)),
  ...CATALOG_MAJORS.filter((m) => !OVERRIDE_IDS.has(m.id)),
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
