// Major requirements. Modeled on Yale's degree structure.
// Each requirement is a "slot" the audit engine tries to fill from the student's courses.

export type RequirementSlot = {
  id: string;
  label: string;
  description?: string;
  // matches if the course code is in this list OR starts with one of these prefixes
  codes?: string[];
  codePrefix?: string[];
  // numeric level filters (e.g., 300+ level)
  minLevel?: number;
  maxLevel?: number;
  // how many courses needed
  needCount: number;
  // optional: courses already required by another slot should NOT double-count here
  exclusive?: boolean;
};

export type MajorRequirements = {
  totalCourses: number; // minimum number of courses for the major
  prerequisites?: RequirementSlot[];
  core: RequirementSlot[];
  electives?: RequirementSlot[];
  senior?: RequirementSlot[];
};

export type Major = {
  id: string;
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

export const MAJORS: Major[] = [
  {
    id: "cpsc",
    name: "Computer Science",
    department: "Computer Science",
    degrees: ["BA", "BS"],
    defaultDegree: "BS",
    notes: "The B.S. requires more depth in math and CS; the B.A. is more flexible.",
    requirements: {
      BA: {
        totalCourses: 12,
        prerequisites: [
          { id: "math", label: "Calculus (MATH 112+)", codes: ["MATH 112", "MATH 115", "MATH 120"], needCount: 1 },
        ],
        core: [
          { id: "intro", label: "Intro: CPSC 201", codes: ["CPSC 201"], needCount: 1 },
          { id: "tools", label: "Discrete math: CPSC 202 or MATH 244", codes: ["CPSC 202", "MATH 244"], needCount: 1 },
          { id: "ds", label: "Data Structures: CPSC 223", codes: ["CPSC 223"], needCount: 1 },
          { id: "systems", label: "Systems: CPSC 323", codes: ["CPSC 323"], needCount: 1 },
          { id: "algo", label: "Algorithms: CPSC 365", codes: ["CPSC 365"], needCount: 1 },
        ],
        electives: [
          { id: "cs_electives", label: "5 CS electives (CPSC 300+)", codePrefix: ["CPSC"], minLevel: 300, needCount: 5 },
        ],
        senior: [
          { id: "senior", label: "Senior project (CPSC 490)", codes: ["CPSC 490"], needCount: 1 },
        ],
      },
      BS: {
        totalCourses: 14,
        prerequisites: [
          { id: "calc", label: "Calculus (MATH 115 or 120)", codes: ["MATH 115", "MATH 120"], needCount: 1 },
          { id: "lin", label: "Linear algebra (MATH 222/225/230)", codes: ["MATH 222", "MATH 225", "MATH 230"], needCount: 1 },
        ],
        core: [
          { id: "intro", label: "Intro: CPSC 201", codes: ["CPSC 201"], needCount: 1 },
          { id: "tools", label: "Discrete math: CPSC 202 or MATH 244", codes: ["CPSC 202", "MATH 244"], needCount: 1 },
          { id: "ds", label: "Data Structures: CPSC 223", codes: ["CPSC 223"], needCount: 1 },
          { id: "systems", label: "Systems: CPSC 323", codes: ["CPSC 323"], needCount: 1 },
          { id: "algo", label: "Algorithms: CPSC 365", codes: ["CPSC 365"], needCount: 1 },
        ],
        electives: [
          { id: "cs_electives", label: "6 CS electives (CPSC 300+)", codePrefix: ["CPSC"], minLevel: 300, needCount: 6 },
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
    name: "Molecular, Cellular & Developmental Biology",
    department: "MCDB",
    degrees: ["BA", "BS"],
    defaultDegree: "BS",
    requirements: {
      BS: {
        totalCourses: 13,
        prerequisites: [
          { id: "gen_chem", label: "General Chemistry (CHEM 161 & 165)", codes: ["CHEM 161", "CHEM 165"], needCount: 2 },
          { id: "ochem", label: "Organic Chemistry (CHEM 220 & 221)", codes: ["CHEM 220", "CHEM 221"], needCount: 2 },
          { id: "math", label: "Calculus or Statistics", codes: ["MATH 112", "MATH 115", "MATH 120", "S&DS 100", "EEB 225"], needCount: 1 },
        ],
        core: [
          { id: "bio_intro", label: "Intro Biology (BIOL 101–104, 2 of)", codes: ["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"], needCount: 2 },
          { id: "molbio", label: "Molecular Biology (MCDB 200)", codes: ["MCDB 200"], needCount: 1 },
          { id: "genetics", label: "Genetics (MCDB 202)", codes: ["MCDB 202"], needCount: 1 },
          { id: "cell", label: "Cellular & Developmental (MCDB 205)", codes: ["MCDB 205"], needCount: 1 },
          { id: "biochem", label: "Biochemistry (MCDB 310)", codes: ["MCDB 310"], needCount: 1 },
        ],
        electives: [
          { id: "mcdb_electives", label: "2 advanced MCDB electives (300+)", codePrefix: ["MCDB"], minLevel: 300, needCount: 2 },
        ],
      },
      BA: {
        totalCourses: 11,
        prerequisites: [
          { id: "gen_chem", label: "General Chemistry I & II", codes: ["CHEM 161", "CHEM 165"], needCount: 2 },
        ],
        core: [
          { id: "bio_intro", label: "Intro Biology (2 of BIOL 101–104)", codes: ["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"], needCount: 2 },
          { id: "molbio", label: "Molecular Biology (MCDB 200)", codes: ["MCDB 200"], needCount: 1 },
          { id: "genetics", label: "Genetics (MCDB 202)", codes: ["MCDB 202"], needCount: 1 },
          { id: "cell", label: "Cellular & Developmental (MCDB 205)", codes: ["MCDB 205"], needCount: 1 },
        ],
        electives: [
          { id: "mcdb_electives", label: "3 MCDB or related electives", codePrefix: ["MCDB", "EEB", "BIOL"], minLevel: 200, needCount: 3 },
        ],
      },
    },
  },
  {
    id: "econ",
    name: "Economics",
    department: "Economics",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        prerequisites: [
          { id: "intro", label: "Intro micro & macro (ECON 110, 111)", codes: ["ECON 110", "ECON 111", "ECON 108"], needCount: 2 },
          { id: "calc", label: "Calculus (MATH 112+)", codes: ["MATH 112", "MATH 115", "MATH 120"], needCount: 1 },
        ],
        core: [
          { id: "micro", label: "Intermediate Microeconomics (ECON 121)", codes: ["ECON 121"], needCount: 1 },
          { id: "macro", label: "Intermediate Macroeconomics (ECON 122)", codes: ["ECON 122"], needCount: 1 },
          { id: "metrics", label: "Econometrics (ECON 131 & 132)", codes: ["ECON 131", "ECON 132"], needCount: 2 },
        ],
        electives: [
          { id: "econ_electives", label: "5 ECON electives (300+)", codePrefix: ["ECON"], minLevel: 300, needCount: 5 },
        ],
        senior: [
          { id: "senior", label: "Senior essay (ECON 467)", codes: ["ECON 467"], needCount: 1 },
        ],
      },
    },
  },
  {
    id: "plsc",
    name: "Political Science",
    department: "Political Science",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "intro", label: "1 intro course (PLSC 113/114/118/121)", codes: ["PLSC 113", "PLSC 114", "PLSC 118", "PLSC 121"], needCount: 1 },
          { id: "subfields", label: "3 courses across 3 subfields", codePrefix: ["PLSC"], needCount: 3 },
        ],
        electives: [
          { id: "plsc_electives", label: "7 PLSC electives", codePrefix: ["PLSC"], needCount: 7 },
        ],
        senior: [
          { id: "senior", label: "Senior essay", codePrefix: ["PLSC"], minLevel: 490, needCount: 1 },
        ],
      },
    },
  },
  {
    id: "engl",
    name: "English Language and Literature",
    department: "English",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "writing", label: "Writing seminar (ENGL 114/115)", codes: ["ENGL 114", "ENGL 115"], needCount: 1 },
          { id: "poets", label: "Major English Poets (2 terms)", codes: ["ENGL 125", "ENGL 126"], needCount: 2 },
          { id: "shakespeare", label: "Shakespeare (ENGL 200)", codes: ["ENGL 200"], needCount: 1 },
        ],
        electives: [
          { id: "engl_electives", label: "7 English electives", codePrefix: ["ENGL"], needCount: 7 },
        ],
        senior: [
          { id: "senior", label: "Senior essay (ENGL 491)", codes: ["ENGL 491"], needCount: 1 },
        ],
      },
    },
  },
  {
    id: "math",
    name: "Mathematics",
    department: "Mathematics",
    degrees: ["BA", "BS"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 10,
        prerequisites: [
          { id: "calc", label: "Calculus sequence", codes: ["MATH 115", "MATH 120"], needCount: 2 },
        ],
        core: [
          { id: "linalg", label: "Linear Algebra (MATH 222/225/230)", codes: ["MATH 222", "MATH 225", "MATH 230"], needCount: 1 },
          { id: "analysis", label: "Real Analysis (MATH 305)", codes: ["MATH 305"], needCount: 1 },
          { id: "algebra", label: "Abstract Algebra (MATH 350)", codes: ["MATH 350"], needCount: 1 },
        ],
        electives: [
          { id: "math_electives", label: "5 MATH electives (200+)", codePrefix: ["MATH"], minLevel: 200, needCount: 5 },
        ],
      },
      BS: {
        totalCourses: 12,
        prerequisites: [
          { id: "calc", label: "Calculus sequence", codes: ["MATH 115", "MATH 120"], needCount: 2 },
        ],
        core: [
          { id: "linalg", label: "Linear Algebra (MATH 225/230)", codes: ["MATH 225", "MATH 230"], needCount: 1 },
          { id: "analysis", label: "Real Analysis (MATH 305)", codes: ["MATH 305"], needCount: 1 },
          { id: "algebra", label: "Abstract Algebra (MATH 350)", codes: ["MATH 350"], needCount: 1 },
        ],
        electives: [
          { id: "math_electives", label: "6 MATH electives (300+)", codePrefix: ["MATH"], minLevel: 300, needCount: 6 },
          { id: "outside", label: "1 science course outside MATH", codePrefix: ["CPSC", "PHYS", "S&DS"], needCount: 1 },
        ],
      },
    },
  },
  {
    id: "chem",
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
        ],
        electives: [
          { id: "chem_electives", label: "2 CHEM electives (300+)", codePrefix: ["CHEM"], minLevel: 300, needCount: 2 },
        ],
      },
      BA: {
        totalCourses: 10,
        core: [
          { id: "gchem", label: "General Chemistry I & II", codes: ["CHEM 161", "CHEM 165"], needCount: 2 },
          { id: "ochem", label: "Organic Chemistry I & II", codes: ["CHEM 220", "CHEM 221"], needCount: 2 },
        ],
        electives: [
          { id: "chem_electives", label: "4 CHEM electives (200+)", codePrefix: ["CHEM"], minLevel: 200, needCount: 4 },
        ],
      },
    },
  },
  {
    id: "hist",
    name: "History",
    department: "History",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "geo", label: "Courses across 3 geographical regions", codePrefix: ["HIST"], needCount: 3 },
          { id: "pre1800", label: "1 pre-1800 course", codePrefix: ["HIST"], needCount: 1 },
        ],
        electives: [
          { id: "hist_electives", label: "7 HIST electives", codePrefix: ["HIST"], needCount: 7 },
        ],
        senior: [
          { id: "senior", label: "Senior essay", codePrefix: ["HIST"], minLevel: 490, needCount: 1 },
        ],
      },
    },
  },
  {
    id: "psyc",
    name: "Psychology",
    department: "Psychology",
    degrees: ["BA", "BS"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 10,
        core: [
          { id: "intro", label: "Intro Psychology (PSYC 110)", codes: ["PSYC 110"], needCount: 1 },
          { id: "stats", label: "Statistics (PSYC 200 or S&DS 100)", codes: ["PSYC 200", "S&DS 100"], needCount: 1 },
        ],
        electives: [
          { id: "psyc_electives", label: "8 PSYC electives across areas", codePrefix: ["PSYC"], needCount: 8 },
        ],
      },
      BS: {
        totalCourses: 13,
        core: [
          { id: "intro", label: "Intro Psychology (PSYC 110)", codes: ["PSYC 110"], needCount: 1 },
          { id: "stats", label: "Statistics (PSYC 200)", codes: ["PSYC 200"], needCount: 1 },
          { id: "neuro", label: "Neuroscience (PSYC 158 or 258)", codes: ["PSYC 158", "PSYC 258"], needCount: 1 },
        ],
        electives: [
          { id: "psyc_electives", label: "8 PSYC electives", codePrefix: ["PSYC"], needCount: 8 },
          { id: "science", label: "2 additional science courses", codePrefix: ["BIOL", "MCDB", "CHEM"], needCount: 2 },
        ],
      },
    },
  },
];

export const MAJORS_BY_ID: Record<string, Major> = Object.fromEntries(
  MAJORS.map((m) => [m.id, m]),
);
