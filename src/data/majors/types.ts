export type RequirementSlot = {
  id: string;
  label: string;
  description?: string;
  codes?: string[];
  codePrefix?: string[];
  /** All listed skills must be present (after optional WR selection). */
  requiredSkills?: string[];
  minLevel?: number;
  maxLevel?: number;
  needCount: number;
  exclusive?: boolean;
};

/** Breadth rule: satisfy `pickCount` of the listed slots (e.g. 4 of 7 CGSC subfields). */
export type RequirementGroup = {
  id: string;
  label: string;
  description?: string;
  pickCount: number;
  slots: RequirementSlot[];
};

export type MajorRequirements = {
  totalCourses: number;
  prerequisites?: RequirementSlot[];
  prerequisiteGroups?: RequirementGroup[];
  core: RequirementSlot[];
  coreGroups?: RequirementGroup[];
  electives?: RequirementSlot[];
  electiveGroups?: RequirementGroup[];
  senior?: RequirementSlot[];
  seniorGroups?: RequirementGroup[];
};

/** Yale College: at most two term courses may overlap between two majors. */
export const YALE_DOUBLE_MAJOR_MAX_OVERLAP = 2;

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
