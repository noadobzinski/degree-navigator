import { y } from "../majors/course-codes";
import { attributeElectives, YC } from "./helpers";
import type { Certificate } from "./types";

export const SKILLS_CERTIFICATES: Certificate[] = [
  {
    id: "data-science",
    name: "Data Science",
    department: "Statistics & Data Science",
    category: "skills",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/statistics/",
    description:
      "Five courses in four areas for non–S&DS majors. No course may count for both major and certificate, or for two certificate areas. B– minimum.",
    prerequisite: {
      id: "prereq",
      label: "Suggested prerequisite: intro data science (S&DS 1000, 1080, 1090, or 1230)",
      codes: y(["S&DS 100", "S&DS 108", "S&DS 109", "S&DS 123"]),
      needCount: 1,
    },
    requirements: [
      {
        id: "probability",
        label: "Probability & statistical theory (1)",
        codes: y([
          "S&DS 238",
          "S&DS 240",
          "S&DS 241",
          "S&DS 242",
          "S&DS 351",
          "S&DS 364",
          "ECE 431",
        ]),
        needCount: 1,
      },
      {
        id: "methodology",
        label: "Statistical methodology & data analysis (2; not both S&DS 2200 and 2300)",
        codes: y([
          "S&DS 220",
          "S&DS 230",
          "S&DS 242",
          "S&DS 312",
          "S&DS 361",
          "S&DS 363",
          "PLSC 2501",
          "ECON 2136",
        ]),
        needCount: 2,
      },
      {
        id: "computation",
        label: "Computation & machine learning (1)",
        codes: y([
          "S&DS 262",
          "S&DS 265",
          "S&DS 317",
          "S&DS 365",
          "CPSC 223",
          "CPSC 323",
          "CPSC 381",
          "CPSC 477",
          "PHYS 378",
          "PLSC 506",
        ]),
        needCount: 1,
      },
      {
        id: "discipline",
        label: "Data analysis in a discipline area (1; approved list on S&DS website)",
        codePrefix: ["S&DS", "ECON", "PLSC", "CPSC", "PHYS"],
        minLevel: 200,
        needCount: 1,
      },
    ],
  },
  {
    id: "programming",
    name: "Programming",
    department: "Computer Science",
    category: "skills",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/computer-science/",
    description:
      "Five courses for non–CPSC majors. CPSC joint majors may not pursue this certificate. No course may satisfy major and certificate.",
    prerequisite: {
      id: "prereq",
      label: "Prerequisite: CPSC 1100, 1001, S115, or AP Computer Science",
      codes: y(["CPSC 110", "CPSC 100", "CPSC 115"]),
      needCount: 1,
    },
    requirements: [
      {
        id: "programming",
        label: "Programming (CPSC 2010 or CPSC 2000)",
        codes: y(["CPSC 201", "CPSC 200"]),
        needCount: 1,
      },
      {
        id: "data_structures",
        label: "Data structures (CPSC 2230)",
        codes: y(["CPSC 223"]),
        needCount: 1,
      },
      {
        id: "advanced_programming",
        label: "Advanced programming (CPSC 3270 or CPSC 3230)",
        codes: y(["CPSC 327", "CPSC 323"]),
        needCount: 1,
      },
      {
        id: "programming_elective",
        label: "Programming elective (CPSC 2230+ prerequisite; e.g. 4180, 4210, 4230, 4240)",
        codePrefix: ["CPSC"],
        minLevel: 300,
        needCount: 1,
      },
      {
        id: "applications",
        label: "Applications or algorithms elective (e.g. CPSC 3650/3660, 3340, 3760, 4770)",
        codes: y([
          "CPSC 365",
          "CPSC 366",
          "CPSC 334",
          "CPSC 376",
          "CPSC 477",
          "CPSC 479",
          "LING 380",
        ]),
        needCount: 1,
      },
    ],
  },
  {
    id: "ethnography",
    name: "Ethnography",
    department: "Anthropology",
    category: "skills",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/ethnography/",
    description:
      "Six courses: ≥4 at 3000+; ≥2 with substantial methods/practical ethnographic component (≥1 at 3000+). YC Ethnography Elective / Methods attributes. Grade C minimum.",
    requirements: [
      attributeElectives({
        id: "upper_level",
        label: "Upper-level ethnography electives (4 at 3000+)",
        needCount: 4,
        requiredAttributes: [...YC.ethnographyElective],
      }),
      attributeElectives({
        id: "methods",
        label: "Methods courses with ethnographic component (2; ≥1 at 3000+)",
        needCount: 2,
        requiredAttributes: [...YC.ethnographyMethods],
      }),
    ],
  },
  {
    id: "quantum-science-engineering",
    name: "Quantum Science and Engineering",
    department: "Applied Physics",
    category: "skills",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/quantum-science/",
    description:
      "Five courses: PHYS 3450 or CPSC 4470 plus four YC Quantum Elective courses. Grade C minimum; max 2 overlap with major.",
    requirements: [
      {
        id: "core",
        label: "Core (PHYS 3450 or CPSC 4470)",
        codes: y(["PHYS 345", "CPSC 447"]),
        needCount: 1,
      },
      attributeElectives({
        id: "electives",
        label: "Quantum electives (4)",
        needCount: 4,
        requiredAttributes: [...YC.quantumElective],
      }),
    ],
  },
  {
    id: "collections-objects-research-society",
    name: "Collections: Objects, Research, Society",
    department: "Beinecke Library",
    category: "skills",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/collections/",
    description:
      "Five courses: COSM 1001, COSM 4900 capstone, 2 in one area + 1 in another (Research / Society / Engagement). Grade C minimum.",
    requirements: [
      {
        id: "intro",
        label: "Introductory seminar (COSM 1001)",
        codes: y(["COSM 1001", "COSM 100"]),
        needCount: 1,
      },
      {
        id: "primary_area",
        label: "Primary area — Research, Society, or Engagement (2; YC Collections attribute)",
        codePrefix: ["COSM", "HIST", "ENGL", "HSHM", "FILM", "AMST", "HSAR", "MUSI", "LAW"],
        minLevel: 100,
        needCount: 2,
      },
      {
        id: "secondary_area",
        label: "Secondary area — different from primary (1; YC Collections attribute)",
        codePrefix: ["COSM", "HIST", "ENGL", "HSHM", "FILM", "AMST", "HSAR", "MUSI", "LAW"],
        minLevel: 100,
        needCount: 1,
      },
      {
        id: "capstone",
        label: "Capstone (COSM 4900)",
        codes: y(["COSM 4900", "COSM 490"]),
        needCount: 1,
      },
    ],
  },
];
