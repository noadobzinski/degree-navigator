import type { RequirementSlot } from "../majors/types";

export const YCPS_CERTIFICATES_URL = "https://catalog.yale.edu/ycps/programs_certificates/";

export type CertificateCategory = "language" | "interdisciplinary" | "skills";

export type Certificate = {
  id: string;
  name: string;
  department: string;
  category: CertificateCategory;
  description: string;
  /** Link to the YCPS subject page for this certificate. */
  catalogUrl: string;
  /** Suggested / required background (not always counted in the 5–6 credits). */
  prerequisite?: RequirementSlot;
  requirements: RequirementSlot[];
  /** Cohort or selective program — declare on Hub after acceptance. */
  requiresApplication?: boolean;
};
