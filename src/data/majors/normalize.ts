import type { MajorRequirements } from "./types";

/**
 * Yale roadmaps list elective credits inside the degree structure (concentration,
 * literature courses, MCDB general electives, etc.) — not as a separate "Electives"
 * section. Merge optional `electives` / `electiveGroups` into core for audit and UI.
 */
export function mergeElectivesIntoCore(reqs: MajorRequirements): MajorRequirements {
  const hasElectives = (reqs.electives?.length ?? 0) > 0;
  const hasElectiveGroups = (reqs.electiveGroups?.length ?? 0) > 0;
  if (!hasElectives && !hasElectiveGroups) return reqs;
  return {
    ...reqs,
    core: [...reqs.core, ...(reqs.electives ?? [])],
    coreGroups: [...(reqs.coreGroups ?? []), ...(reqs.electiveGroups ?? [])],
    electives: undefined,
    electiveGroups: undefined,
  };
}
