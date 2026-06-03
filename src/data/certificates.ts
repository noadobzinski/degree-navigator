import type { RequirementSlot } from "./majors/types";

export type Certificate = {
  id: string;
  name: string;
  department: string;
  description: string;
  requirements: RequirementSlot[];
};

/** Yale College certificates and structured credentials (YCPS / roadmaps). */
export const CERTIFICATES: Certificate[] = [
  {
    id: "data-science",
    name: "Data Science",
    department: "Statistics & Data Science",
    description: "Five-course sequence in computation, probability, and statistical modeling.",
    requirements: [
      { id: "intro", label: "Intro data science (S&DS 1000 or equivalent)", codes: ["S&DS 100", "S&DS 123"], needCount: 1 },
      { id: "prob", label: "Probability (S&DS 2300 or 2380)", codes: ["S&DS 230", "S&DS 238"], needCount: 1 },
      { id: "lin", label: "Linear algebra", codes: ["MATH 222", "MATH 225", "MATH 230"], needCount: 1 },
      { id: "comp", label: "Computation (CPSC 1001, 2010, or 2020)", codes: ["CPSC 100", "CPSC 201", "CPSC 202"], needCount: 1 },
      { id: "advanced", label: "Advanced S&DS or CPSC course (DUS approval)", codePrefix: ["S&DS", "CPSC"], minLevel: 200, needCount: 1 },
    ],
  },
  {
    id: "cs",
    name: "Computing",
    department: "Computer Science",
    description: "Programming and computer science foundations for non–CPSC majors.",
    requirements: [
      { id: "intro", label: "CPSC 2010 or equivalent", codes: ["CPSC 201"], needCount: 1 },
      { id: "second", label: "Second CPSC course (2230+)", codePrefix: ["CPSC"], minLevel: 200, needCount: 1 },
      { id: "elective", label: "Third CPSC elective (DUS approval)", codePrefix: ["CPSC"], minLevel: 200, needCount: 1 },
    ],
  },
  {
    id: "human-rights",
    name: "Human Rights Studies",
    department: "Human Rights",
    description: "Interdisciplinary study of human rights theory and practice.",
    requirements: [
      { id: "gateway", label: "Gateway course in human rights", codePrefix: ["HRTS", "GLBL", "PLSC", "HIST"], needCount: 1 },
      { id: "core", label: "3 core human rights courses", codePrefix: ["HRTS", "GLBL", "PLSC", "HIST", "ANTH", "SOCY"], needCount: 3 },
      { id: "elective", label: "2 electives (DUS approval)", codePrefix: ["HRTS", "GLBL", "PLSC", "HIST", "ANTH", "SOCY", "WGSS"], needCount: 2 },
    ],
  },
  {
    id: "energy-studies",
    name: "Energy Studies",
    department: "Energy Studies",
    description: "Multidisciplinary energy science, policy, and technology.",
    requirements: [
      { id: "core", label: "Energy studies core courses", codePrefix: ["EVST", "F&ES", "ENAS", "CHEM", "EEB"], needCount: 3 },
      { id: "elective", label: "2 approved electives", codePrefix: ["EVST", "F&ES", "ENAS", "ECON", "PLSC", "PHYS"], needCount: 2 },
    ],
  },
  {
    id: "entrepreneurship",
    name: "Entrepreneurship",
    department: "School of Management",
    description: "Innovation and venture coursework across Yale.",
    requirements: [
      { id: "gateway", label: "Entrepreneurship gateway", codePrefix: ["MGT", "ECON", "CPSC", "ENAS"], needCount: 1 },
      { id: "electives", label: "3 entrepreneurship electives (DUS approval)", codePrefix: ["MGT", "ECON", "CPSC", "ENAS", "BENG"], needCount: 3 },
    ],
  },
  {
    id: "education-studies",
    name: "Education Studies",
    department: "Education Studies",
    description: "Foundations in education policy, practice, and research.",
    requirements: [
      { id: "gateway", label: "Education studies gateway", codePrefix: ["EDST", "PSYC", "SOCY"], needCount: 1 },
      { id: "methods", label: "Methods or policy course", codePrefix: ["EDST", "SOCY", "ECON"], needCount: 1 },
      { id: "electives", label: "3 education electives (DUS approval)", codePrefix: ["EDST", "PSYC", "SOCY", "HIST", "PLSC"], needCount: 3 },
    ],
  },
];

export const CERTIFICATES_BY_ID: Record<string, Certificate> = Object.fromEntries(
  CERTIFICATES.map((c) => [c.id, c]),
);
