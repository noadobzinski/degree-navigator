export type RequirementSlot = {
  id: string;
  label: string;
  description?: string;
  codes?: string[];
  codePrefix?: string[];
  minLevel?: number;
  maxLevel?: number;
  needCount: number;
  exclusive?: boolean;
};

export type MajorRequirements = {
  totalCourses: number;
  prerequisites?: RequirementSlot[];
  core: RequirementSlot[];
  electives?: RequirementSlot[];
  senior?: RequirementSlot[];
};

export type Major = {
  id: string;
  /** Yale subject code from the official Major Roadmaps (e.g. "CPSC", "EP&E"). */
  roadmapCode: string;
  name: string;
  department: string;
  degrees: ("BA" | "BS")[];
  defaultDegree: "BA" | "BS";
  requirements: {
    BA?: MajorRequirements;
    BS?: MajorRequirements;
  };
  notes?: string;
};

export const YALE_ROADMAP_PDF =
  "https://registrar.yale.edu/sites/default/files/2026-05/Yale%20College%20Major%20Roadmaps_0.pdf";
