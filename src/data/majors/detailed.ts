import type { Major } from "./types";
import { MCDB_BASE_REQUIREMENTS, MCDB_CONCENTRATIONS } from "./concentration-defs";

/** Majors with detailed slot-level requirements aligned to Yale roadmaps. */
export const DETAILED_MAJORS: Major[] = [
  {
    id: "cpsc",
    roadmapCode: "CPSC",
    name: "Computer Science",
    department: "Computer Science",
    degrees: ["BA", "BS"],
    defaultDegree: "BS",
    notes: "The B.S. requires more depth in math and CS; the B.A. is more flexible.",
    requirements: {
      BA: {
        totalCourses: 10,
        prerequisites: [
          { id: "math", label: "Calculus (MATH 112+)", codes: ["MATH 112", "MATH 115", "MATH 120"], needCount: 1 },
        ],
        core: [
          { id: "intro", label: "Intro: CPSC 201", codes: ["CPSC 201"], needCount: 1 },
          { id: "tools", label: "Discrete math: CPSC 202 or MATH 244", codes: ["CPSC 202", "MATH 244"], needCount: 1 },
          { id: "ds", label: "Data Structures: CPSC 223", codes: ["CPSC 223"], needCount: 1 },
          { id: "systems", label: "Systems: CPSC 323", codes: ["CPSC 323"], needCount: 1 },
          { id: "algo", label: "Algorithms: CPSC 365 or 366", codes: ["CPSC 365", "CPSC 366"], needCount: 1 },
          {
            id: "cs_electives",
            label: "3 intermediate or advanced CPSC courses (4 if CPSC 323 taken)",
            codePrefix: ["CPSC"],
            minLevel: 200,
            needCount: 3,
          },
        ],
        senior: [
          { id: "senior", label: "Senior project (CPSC 490)", codes: ["CPSC 490"], needCount: 1 },
        ],
      },
      BS: {
        totalCourses: 12,
        prerequisites: [
          { id: "calc", label: "Calculus (MATH 115 or 120)", codes: ["MATH 115", "MATH 120"], needCount: 1 },
          { id: "lin", label: "Linear algebra (MATH 222/225/230)", codes: ["MATH 222", "MATH 225", "MATH 230"], needCount: 1 },
        ],
        core: [
          { id: "intro", label: "Intro: CPSC 201", codes: ["CPSC 201"], needCount: 1 },
          { id: "tools", label: "Discrete math: CPSC 202 or MATH 244", codes: ["CPSC 202", "MATH 244"], needCount: 1 },
          { id: "ds", label: "Data Structures: CPSC 223", codes: ["CPSC 223"], needCount: 1 },
          { id: "systems", label: "Systems: CPSC 323", codes: ["CPSC 323"], needCount: 1 },
          { id: "algo", label: "Algorithms: CPSC 365 or 366", codes: ["CPSC 365", "CPSC 366"], needCount: 1 },
          {
            id: "cs_electives",
            label: "5 intermediate or advanced CPSC courses (6 if CPSC 323 taken)",
            codePrefix: ["CPSC"],
            minLevel: 200,
            needCount: 5,
          },
          { id: "stats", label: "Probability/Statistics", codes: ["S&DS 241", "S&DS 220", "S&DS 230"], needCount: 1 },
        ],
        senior: [
          { id: "senior", label: "Senior project (CPSC 490)", codes: ["CPSC 490"], needCount: 1 },
        ],
      },
    },
  },
  {
    id: "mcdb",
    roadmapCode: "MCDB",
    name: "Molecular, Cellular & Developmental Biology",
    department: "MCDB",
    degrees: ["BA", "BS"],
    defaultDegree: "BS",
    notes:
      "Optional concentrations in Biotechnology, Neurobiology, or Quantitative Biology replace general electives with a required course plus one approved concentration elective.",
    requirements: MCDB_BASE_REQUIREMENTS,
    concentrations: MCDB_CONCENTRATIONS,
  },
  {
    id: "econ",
    roadmapCode: "ECON",
    name: "Economics",
    department: "Economics",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        prerequisites: [
          { id: "intro_micro", label: "Intro micro (ECON 1108/1110/1115)", codes: ["ECON 110", "ECON 108", "ECON 1115"], needCount: 1 },
          { id: "intro_macro", label: "Intro macro (ECON 1111/1116)", codes: ["ECON 111", "ECON 1116"], needCount: 1 },
          { id: "calc", label: "Math (MATH 1180/1200 preferred, or 1120+)", codes: ["MATH 112", "MATH 115", "MATH 118", "MATH 120"], needCount: 1 },
        ],
        core: [
          { id: "micro", label: "Intermediate micro (ECON 2121 or 2125)", codes: ["ECON 121", "ECON 2121", "ECON 2125"], needCount: 1 },
          { id: "macro", label: "Intermediate macro (ECON 2122 or 2126)", codes: ["ECON 122", "ECON 2122", "ECON 2126"], needCount: 1 },
          {
            id: "metrics",
            label: "Econometrics (ECON 1117, 2123, or 2136)",
            codes: ["ECON 131", "ECON 132", "ECON 1117", "ECON 2123", "ECON 2136"],
            needCount: 1,
          },
          {
            id: "econ_electives",
            label: "4 ECON electives numbered 2000+ (not applied to core above)",
            codePrefix: ["ECON"],
            minLevel: 200,
            needCount: 4,
          },
        ],
        senior: [
          {
            id: "senior",
            label: "2 ECON 4400–4491 (at least 1 in senior year)",
            codePrefix: ["ECON"],
            minLevel: 440,
            maxLevel: 449,
            needCount: 2,
          },
        ],
      },
    },
  },
  {
    id: "plsc",
    roadmapCode: "PLSC",
    name: "Political Science",
    department: "Political Science",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "intro", label: "2 introductory PLSC courses", codePrefix: ["PLSC"], maxLevel: 1999, needCount: 2 },
          { id: "lectures", label: "2 non-intro core lecture courses", codePrefix: ["PLSC"], minLevel: 200, needCount: 2 },
          { id: "methods", label: "1 methodology and formal theory course", codePrefix: ["PLSC"], needCount: 1 },
          { id: "subfields", label: "2 courses each in 2 of 4 subfields", codePrefix: ["PLSC"], needCount: 4 },
          { id: "seminars", label: "2 departmental seminars (1 in senior year)", codePrefix: ["PLSC"], minLevel: 300, needCount: 2 },
          { id: "outside", label: "2 courses in other departments (DUS approval)", codePrefix: ["PLSC", "ECON", "HIST", "PHIL", "SOCY", "GLBL"], needCount: 2 },
        ],
        senior: [{ id: "senior", label: "Senior essay (seminar or PLSC 4900)", codePrefix: ["PLSC"], minLevel: 490, needCount: 1 }],
      },
    },
    concentrations: [
      {
        id: "intensive",
        label: "Intensive major",
        requirements: {
          BA: {
            totalCourses: 15,
            core: [
              { id: "intro", label: "2 introductory PLSC courses", codePrefix: ["PLSC"], maxLevel: 1999, needCount: 2 },
              { id: "lectures", label: "2 non-intro core lecture courses", codePrefix: ["PLSC"], minLevel: 200, needCount: 2 },
              { id: "methods", label: "1 methodology and formal theory course", codePrefix: ["PLSC"], needCount: 1 },
              { id: "subfields", label: "2 courses each in 2 of 4 subfields", codePrefix: ["PLSC"], needCount: 4 },
              { id: "concentration", label: "7 courses relating to chosen concentration", codePrefix: ["PLSC"], needCount: 7 },
              { id: "seminars", label: "2 departmental seminars (1 in senior year)", codePrefix: ["PLSC"], minLevel: 300, needCount: 2 },
            ],
            senior: [{ id: "senior", label: "PLSC 4900 junior year + senior essay", codePrefix: ["PLSC"], minLevel: 490, needCount: 1 }],
          },
        },
      },
      {
        id: "interdisciplinary",
        label: "Interdisciplinary major",
        requirements: {
          BA: {
            totalCourses: 12,
            core: [
              { id: "intro", label: "2 introductory PLSC courses", codePrefix: ["PLSC"], maxLevel: 1999, needCount: 2 },
              { id: "lectures", label: "2 non-intro core lecture courses", codePrefix: ["PLSC"], minLevel: 200, needCount: 2 },
              { id: "methods", label: "1 methodology and formal theory course", codePrefix: ["PLSC"], needCount: 1 },
              { id: "subfields", label: "2 courses each in 2 of 4 subfields", codePrefix: ["PLSC"], needCount: 4 },
              { id: "outside", label: "3 courses from other departments (DUS approval)", codePrefix: ["ECON", "HIST", "PHIL", "SOCY", "GLBL", "ANTH"], needCount: 3 },
              { id: "seminars", label: "2 departmental seminars", codePrefix: ["PLSC"], minLevel: 300, needCount: 2 },
            ],
            senior: [{ id: "senior", label: "Two-term essay (PLSC 4901/4903)", codePrefix: ["PLSC"], minLevel: 490, needCount: 2 }],
          },
        },
      },
    ],
  },
  {
    id: "engl",
    roadmapCode: "ENGL",
    name: "English Language and Literature",
    department: "English",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 14,
        core: [
          {
            id: "foundational",
            label: "3 foundational courses (ENGL 1025–1028)",
            codes: ["ENGL 1025", "ENGL 1026", "ENGL 1027", "ENGL 1028"],
            needCount: 3,
          },
          { id: "junior_sem", label: "1 junior seminar", codePrefix: ["ENGL"], minLevel: 300, needCount: 1 },
          {
            id: "periods",
            label: "1 advanced course in each of 4 historical periods",
            codePrefix: ["ENGL"],
            minLevel: 300,
            needCount: 4,
          },
          {
            id: "literature",
            label: "Literature courses toward 11 total (incl. foundational & period work)",
            codePrefix: ["ENGL"],
            needCount: 5,
          },
        ],
        senior: [
          {
            id: "senior",
            label: "Senior seminar or essay (ENGL 4100/4101)",
            codes: ["ENGL 4100", "ENGL 4101"],
            needCount: 1,
          },
        ],
      },
    },
    concentrations: [
      {
        id: "creative-writing",
        label: "Creative Writing concentration",
        requirements: {
          BA: {
            totalCourses: 15,
            core: [
              { id: "foundational", label: "3 foundational courses (ENGL 1025–1028)", codes: ["ENGL 1025", "ENGL 1026", "ENGL 1027", "ENGL 1028"], needCount: 3 },
              { id: "cw", label: "4 creative writing courses (2 advanced 4000+)", codePrefix: ["ENGL"], minLevel: 400, needCount: 4 },
              { id: "literature", label: "At least 11 literature courses total", codePrefix: ["ENGL"], needCount: 7 },
            ],
            senior: [
              { id: "senior_sem", label: "2 senior seminars or ENGL 4100/4101", codePrefix: ["ENGL"], minLevel: 400, needCount: 2 },
              { id: "cw_project", label: "Creative writing senior project (ENGL 4400)", codes: ["ENGL 4400"], needCount: 1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "math",
    roadmapCode: "MATH",
    name: "Mathematics",
    department: "Mathematics",
    degrees: ["BA", "BS"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 10,
        prerequisites: [
          { id: "calc", label: "Introductory sequence (MATH 1150/1200, 2250/2260, 2550/2560, 3020/1200)", codes: ["MATH 115", "MATH 120", "MATH 225", "MATH 226", "MATH 255", "MATH 256", "MATH 302"], needCount: 4 },
        ],
        core: [
          { id: "linalg", label: "Linear Algebra (MATH 222/225/230)", codes: ["MATH 222", "MATH 225", "MATH 230"], needCount: 1 },
          { id: "analysis", label: "Real Analysis (MATH 3050)", codes: ["MATH 305"], needCount: 1 },
          { id: "algebra", label: "Abstract Algebra (MATH 3500)", codes: ["MATH 350"], needCount: 1 },
          {
            id: "math_electives",
            label: "MATH electives numbered 2250–5999 (to total 10 courses)",
            codePrefix: ["MATH"],
            minLevel: 225,
            needCount: 4,
          },
        ],
        senior: [
          { id: "senior", label: "Senior seminar (MATH 4800–4890) or essay (MATH 4750)", codePrefix: ["MATH"], minLevel: 475, needCount: 1 },
        ],
      },
      BS: {
        totalCourses: 12,
        prerequisites: [
          { id: "calc", label: "Introductory sequence", codes: ["MATH 115", "MATH 120", "MATH 225", "MATH 226", "MATH 255", "MATH 256"], needCount: 4 },
        ],
        core: [
          { id: "linalg", label: "Linear Algebra (MATH 225/230)", codes: ["MATH 225", "MATH 230"], needCount: 1 },
          { id: "analysis", label: "Real Analysis (MATH 3050)", codes: ["MATH 305"], needCount: 1 },
          { id: "algebra", label: "Abstract Algebra (MATH 3500)", codes: ["MATH 350"], needCount: 1 },
          {
            id: "math_electives",
            label: "MATH electives numbered 2250–5999 (to total 12 courses)",
            codePrefix: ["MATH"],
            minLevel: 225,
            needCount: 5,
          },
          { id: "outside", label: "2 advanced courses in physical science", codePrefix: ["PHYS", "CPSC", "CHEM"], minLevel: 200, needCount: 2 },
        ],
        senior: [
          { id: "senior", label: "Senior seminar or essay", codePrefix: ["MATH"], minLevel: 475, needCount: 1 },
        ],
      },
    },
  },
  {
    id: "chem",
    roadmapCode: "CHEM",
    name: "Chemistry",
    department: "Chemistry",
    degrees: ["BA", "BS"],
    defaultDegree: "BS",
    requirements: {
      BS: {
        totalCourses: 13,
        prerequisites: [
          { id: "math", label: "Calculus through MATH 120", codes: ["MATH 115", "MATH 120"], needCount: 2 },
          { id: "phys", label: "University Physics I & II", codes: ["PHYS 180", "PHYS 181", "PHYS 200", "PHYS 201"], needCount: 2 },
        ],
        core: [
          { id: "gchem", label: "General Chemistry I & II", codes: ["CHEM 161", "CHEM 165"], needCount: 2 },
          { id: "ochem", label: "Organic Chemistry I & II", codes: ["CHEM 220", "CHEM 221"], needCount: 2 },
          { id: "pchem", label: "Physical Chemistry (CHEM 332)", codes: ["CHEM 332"], needCount: 1 },
          { id: "labs", label: "Lab work (CHEM 174/175/222)", codes: ["CHEM 174", "CHEM 175", "CHEM 222"], needCount: 2 },
          {
            id: "chem_electives",
            label: "5 additional advanced course credits (incl. lectures; B.S. roadmap)",
            codePrefix: ["CHEM"],
            minLevel: 300,
            needCount: 2,
          },
        ],
      },
      BA: {
        totalCourses: 10,
        core: [
          { id: "gchem", label: "General Chemistry I & II", codes: ["CHEM 161", "CHEM 165"], needCount: 2 },
          { id: "ochem", label: "Organic Chemistry I & II", codes: ["CHEM 220", "CHEM 221"], needCount: 2 },
          {
            id: "chem_electives",
            label: "Additional CHEM courses toward degree total",
            codePrefix: ["CHEM"],
            minLevel: 200,
            needCount: 4,
          },
        ],
      },
    },
  },
  {
    id: "hist",
    roadmapCode: "HIST",
    name: "History",
    department: "History",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "preindustrial", label: "2 course credits in preindustrial history", codePrefix: ["HIST"], needCount: 2 },
          { id: "seminars", label: "2 departmental seminars (3000-level)", codePrefix: ["HIST"], minLevel: 300, needCount: 2 },
          {
            id: "regions",
            label: "5 regional courses (1 credit in 5 of 6 geographical regions)",
            codePrefix: ["HIST"],
            needCount: 5,
          },
          {
            id: "additional",
            label: "Additional HIST courses (incl. 2 term courses in History)",
            codePrefix: ["HIST"],
            needCount: 2,
          },
        ],
        senior: [
          { id: "senior", label: "Senior essay (HIST 4995–4997)", codePrefix: ["HIST"], minLevel: 490, needCount: 1 },
        ],
      },
    },
  },
  {
    id: "psyc",
    roadmapCode: "PSYC",
    name: "Psychology",
    department: "Psychology",
    degrees: ["BA", "BS"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        prerequisites: [
          { id: "intro", label: "Intro Psychology (PSYC 1100)", codes: ["PSYC 110"], needCount: 1 },
          { id: "stats", label: "Statistics (S&DS 1000 or 2300)", codes: ["S&DS 100", "S&DS 230"], needCount: 1 },
        ],
        core: [
          {
            id: "social",
            label: "2 social science courses in Psychology (incl. 1 social core)",
            codePrefix: ["PSYC"],
            needCount: 2,
          },
          {
            id: "natural",
            label: "2 natural science courses in Psychology (incl. 1 natural core)",
            codePrefix: ["PSYC"],
            needCount: 2,
          },
          {
            id: "methods",
            label: "Research methods (PSYC 2000–2999 or approved substitute)",
            codePrefix: ["PSYC"],
            minLevel: 200,
            maxLevel: 299,
            needCount: 1,
          },
          {
            id: "psyc_electives",
            label: "PSYC electives toward 12 courses beyond prereqs",
            codePrefix: ["PSYC"],
            needCount: 4,
          },
        ],
        senior: [
          { id: "senior", label: "Senior requirement", codePrefix: ["PSYC"], minLevel: 400, needCount: 1 },
        ],
      },
      BS: {
        totalCourses: 15,
        prerequisites: [
          { id: "intro", label: "Intro Psychology (PSYC 110)", codes: ["PSYC 110"], needCount: 1 },
          { id: "stats", label: "Statistics (PSYC 200 or S&DS)", codes: ["PSYC 200", "S&DS 100"], needCount: 1 },
        ],
        core: [
          { id: "social", label: "2 social science courses in Psychology", codePrefix: ["PSYC"], needCount: 2 },
          { id: "natural", label: "2 natural science courses in Psychology", codePrefix: ["PSYC"], needCount: 2 },
          { id: "methods", label: "Data-collection/research methods course", codePrefix: ["PSYC"], minLevel: 200, needCount: 1 },
          { id: "advanced_sci", label: "2 advanced science courses", codePrefix: ["PSYC", "BIOL", "MCDB", "NSCI"], minLevel: 200, needCount: 2 },
          { id: "psyc_electives", label: "2 PSYC electives", codePrefix: ["PSYC"], needCount: 2 },
        ],
        senior: [
          { id: "senior", label: "Senior research (PSYC 499)", codePrefix: ["PSYC"], minLevel: 490, needCount: 1 },
        ],
      },
    },
  },
];
