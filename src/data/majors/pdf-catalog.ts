import type { Major, MajorConcentration, MajorRequirements } from "./types";
import { y } from "./course-codes";

function senior(prefix: string, label?: string): MajorRequirements["senior"] {
  return [{ id: "senior", label: label ?? "Senior requirement", codePrefix: [prefix], minLevel: 490, needCount: 1 }];
}

function bengConcentration(id: string, label: string, concLabel: string, codes: string[]): MajorConcentration {
  return {
    id,
    label,
    requirements: {
      BS: {
        totalCourses: 13,
        core: [
          { id: "beng_core", label: "BENG core courses (roadmap)", codePrefix: ["BENG"], needCount: 8 },
          { id: "conc", label: concLabel, codes: y(codes), needCount: 3 },
        ],
        senior: [{ id: "senior", label: "Senior project (BENG 4973/4974)", codes: y(["BENG 4973", "BENG 4974"]), needCount: 1 }],
      },
    },
  };
}

const philStandardBa: MajorRequirements = {
  totalCourses: 12,
  core: [
    { id: "intro", label: "2 introductory or intermediate PHIL courses", codePrefix: ["PHIL"], maxLevel: 299, needCount: 2 },
    { id: "mne", label: "2 metaphysics & epistemology courses", codePrefix: ["PHIL"], needCount: 2 },
    { id: "history", label: "3 history of philosophy (incl. PHIL 1125 & 1126 or DRST)", codes: y(["PHIL 1125", "PHIL 1126", "DRST 0003", "DRST 0004"]), needCount: 3 },
    { id: "ethics", label: "2 ethics & value theory courses", codePrefix: ["PHIL"], needCount: 2 },
    { id: "logic", label: "1 logic course (PHIL 1115 suggested)", codePrefix: ["PHIL"], needCount: 1 },
    { id: "seminars", label: "2 PHIL seminars (3000+)", codePrefix: ["PHIL"], minLevel: 300, needCount: 2 },
    { id: "outside", label: "2 related courses in other departments (DUS approval)", codePrefix: ["PHIL", "PLSC", "HIST", "ECON"], needCount: 2 },
  ],
  senior: [{ id: "senior", label: "Third PHIL seminar or PHIL 4490/4491", codePrefix: ["PHIL"], minLevel: 300, needCount: 1 }],
};

const philPsychBa: MajorRequirements = {
  totalCourses: 12,
  core: [
    { id: "intro", label: "2 introductory or intermediate PHIL courses", codePrefix: ["PHIL"], maxLevel: 299, needCount: 2 },
    { id: "psych", label: "5 psychology courses (incl. PSYC 1100)", codes: y(["PSYC 110"]), codePrefix: ["PSYC"], needCount: 5 },
    { id: "phil", label: "7 philosophy courses", codePrefix: ["PHIL"], needCount: 7 },
    { id: "history", label: "2 history of philosophy (PHIL 1125/1126 or DRST)", codes: y(["PHIL 1125", "PHIL 1126"]), needCount: 2 },
    { id: "ethics", label: "2 ethics & value theory courses", codePrefix: ["PHIL"], needCount: 2 },
    { id: "logic", label: "1 logic course", codePrefix: ["PHIL"], needCount: 1 },
    {
      id: "intersection",
      label: "2 intermediate/advanced PHIL–PSYC intersection (1 PHIL seminar)",
      codePrefix: ["PHIL", "PSYC"],
      minLevel: 200,
      needCount: 2,
    },
    { id: "outside", label: "2 related courses in other departments (DUS approval)", codePrefix: ["PHIL", "PSYC", "CPSC"], needCount: 2 },
  ],
  senior: [{ id: "senior", label: "Third PHIL seminar or PHIL 4490/4491", codePrefix: ["PHIL"], minLevel: 300, needCount: 1 }],
};

const physStandardBs: MajorRequirements = {
  totalCourses: 9,
  prerequisites: [
    { id: "intro_phys", label: "Intro physics with labs", codes: y(["PHYS 170", "PHYS 171", "PHYS 180", "PHYS 181"]), needCount: 2 },
    { id: "math", label: "Calculus & advanced math (PHYS 4000+)", codes: y(["MATH 120", "MATH 222", "PHYS 400"]), needCount: 2 },
  ],
  core: [
    { id: "core_seq", label: "PHYS 4010, 4020, 4100, 4300, 4390/4400, 4500 sequence", codePrefix: ["PHYS"], minLevel: 400, needCount: 6 },
    { id: "advanced_elective", label: "1 advanced elective (3000+, DUS approval)", codePrefix: ["PHYS"], minLevel: 300, needCount: 1 },
  ],
  senior: [{ id: "senior", label: "PHYS 4710 or 4720", codes: y(["PHYS 4710", "PHYS 4720"]), needCount: 1 }],
};

const physIntensiveBs: MajorRequirements = {
  totalCourses: 11,
  prerequisites: [
    { id: "intro_phys", label: "Intro physics with labs", codes: y(["PHYS 170", "PHYS 171"]), needCount: 2 },
    { id: "math", label: "Advanced math core", codes: y(["MATH 120", "PHYS 400", "PHYS 401"]), needCount: 2 },
  ],
  core: [
    { id: "core_seq", label: "Core upper-level physics sequence", codePrefix: ["PHYS"], minLevel: 400, needCount: 7 },
    { id: "advanced_electives", label: "3 advanced electives (3000+, DUS approval)", codePrefix: ["PHYS"], minLevel: 300, needCount: 3 },
  ],
  senior: [{ id: "senior", label: "Two terms PHYS 4710 or 4720", codes: y(["PHYS 4710", "PHYS 4720"]), needCount: 2 }],
};

/** Yale College majors from official roadmaps (replaces generic templates). */
export const PDF_CATALOG_MAJORS: Major[] = [
  {
    id: "beng",
    roadmapCode: "BENG",
    name: "Biomedical Engineering",
    department: "Biomedical Engineering",
    degrees: ["BS"],
    defaultDegree: "BS",
    notes: "B.S. only. Pick one concentration; fulfill its 3-course set plus BENG core and senior project.",
    requirements: {
      BS: {
        totalCourses: 13,
        prerequisites: [
          { id: "bio", label: "BIOL 1010 & 1020 (or higher MCDB/MB&B)", codes: y(["BIOL 101", "BIOL 102"]), needCount: 2 },
          { id: "chem", label: "CHEM 1610 or higher", codes: y(["CHEM 161"]), needCount: 1 },
          { id: "math", label: "MATH 1150/1160, 1200, ENAS 1510", codes: y(["MATH 115", "MATH 120", "ENAS 151"]), needCount: 2 },
          { id: "phys", label: "PHYS 1800/1810 with labs", codes: y(["PHYS 180", "PHYS 181", "PHYS 2050L", "PHYS 2060L"]), needCount: 2 },
        ],
        core: [
          { id: "beng_core", label: "BENG core (2080, 2800, 3100–3600, 4080, etc.)", codePrefix: ["BENG"], needCount: 8 },
          { id: "conc_placeholder", label: "3 courses in chosen concentration (set in Settings)", codePrefix: ["BENG", "MENG"], needCount: 3 },
        ],
        senior: [{ id: "senior", label: "Senior project (BENG 4973/4974)", codes: y(["BENG 4973", "BENG 4974"]), needCount: 1 }],
      },
    },
    concentrations: [
      bengConcentration("bioimaging", "Bioimaging", "3 bioimaging concentration courses", ["BENG 4104", "BENG 4410", "BENG 4440"]),
      bengConcentration("biomechanics", "Biomechanics and Mechanobiology", "3 biomechanics concentration courses", ["MENG 1105", "MENG 3422", "BENG 4410"]),
      bengConcentration("biomolecular", "Biomolecular Engineering", "3 biomolecular concentration courses", ["BENG 4410", "BENG 4611", "BENG 4630"]),
      bengConcentration("systems", "Systems Biology", "3 systems biology concentration courses", ["BENG 4410", "BENG 4767", "MENG 3422"]),
    ],
  },
  {
    id: "cplt",
    roadmapCode: "CPLT",
    name: "Comparative Literature",
    department: "Comparative Literature",
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: "Period, in-language, and theory requirements; Film concentration adds FILM courses.",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "periods", label: "1 course in 3 of 5 historical periods", codePrefix: ["CPLT", "LITR"], needCount: 3 },
          { id: "in_lang", label: "2–3 in-language literature courses (L4/L5)", codePrefix: ["CPLT", "FREN", "GMAN", "ITAL", "SPAN", "RUSS"], needCount: 2 },
          { id: "theory", label: "1 literary or cultural theory course", codePrefix: ["CPLT", "ENGL", "FILM"], needCount: 1 },
          { id: "electives", label: "Comparative literature electives toward 12 courses", codePrefix: ["CPLT"], needCount: 5 },
        ],
        senior: [{ id: "senior", label: "Senior essay (CPLT 4910 or 4920/4930)", codes: y(["CPLT 4910", "CPLT 4920", "CPLT 4930"]), needCount: 1 }],
      },
    },
    concentrations: [
      {
        id: "film",
        label: "Film concentration",
        requirements: {
          BA: {
            totalCourses: 12,
            core: [
              { id: "periods", label: "1 course in 3 of 5 historical periods", codePrefix: ["CPLT"], needCount: 3 },
              { id: "film_theory", label: "1 FILM theory course", codePrefix: ["FILM"], needCount: 1 },
              { id: "film_electives", label: "3 electives from Film and Media Studies", codePrefix: ["FILM"], needCount: 3 },
              { id: "cplt", label: "Additional CPLT courses", codePrefix: ["CPLT"], needCount: 4 },
            ],
            senior: [{ id: "senior", label: "Senior essay (CPLT 4910+)", codes: y(["CPLT 4910"]), needCount: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "cpsc-math",
    roadmapCode: "CPSC & MATH",
    name: "Computer Science and Mathematics",
    department: "Computer Science",
    degrees: ["BS"],
    defaultDegree: "BS",
    requirements: {
      BS: {
        totalCourses: 14,
        core: [
          { id: "cpsc_core", label: "CPSC 2010, 2230, 3230, 3650/3660", codes: y(["CPSC 201", "CPSC 223", "CPSC 323", "CPSC 365", "CPSC 366"]), needCount: 4 },
          { id: "cpsc_adv", label: "2 advanced CPSC (1 math-heavy, 1 other)", codePrefix: ["CPSC"], minLevel: 300, needCount: 2 },
          { id: "math120", label: "MATH 1200", codes: y(["MATH 120"]), needCount: 1 },
          { id: "math225", label: "MATH 2250 or 2260", codes: y(["MATH 225", "MATH 226"]), needCount: 1 },
          { id: "math244", label: "MATH 2440", codes: y(["MATH 244"]), needCount: 1 },
          { id: "math_electives", label: "5 MATH courses 2250–4690", codePrefix: ["MATH"], minLevel: 225, maxLevel: 469, needCount: 5 },
        ],
        senior: [{ id: "senior", label: "CPSC 4900 or MATH 4750", codes: y(["CPSC 490", "MATH 475"]), needCount: 1 }],
      },
    },
  },
  {
    id: "east",
    roadmapCode: "EAST",
    name: "East Asian Studies",
    department: "East Asian Studies",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 13,
        prerequisites: [{ id: "lang_l2", label: "L2 East Asian language", codePrefix: ["CHNS", "JAPN", "KORE"], needCount: 1 }],
        core: [
          { id: "lang", label: "6 East Asian language courses (2 at L5)", codePrefix: ["CHNS", "JAPN", "KORE"], needCount: 6 },
          { id: "outside_focus", label: "1 East Asia course outside area of focus", codePrefix: ["EAST", "HIST", "ANTH"], needCount: 1 },
          {
            id: "focus",
            label: "6 credits in country/area of focus (1 premodern, 2 seminars)",
            codePrefix: ["EAST", "HIST", "ANTH"],
            minLevel: 200,
            needCount: 6,
          },
        ],
        senior: [{ id: "senior", label: "Senior seminar, EAST 4900, or EAST 4910/4920", codes: y(["EAST 4900", "EAST 4910", "EAST 4920"]), needCount: 1 }],
      },
    },
  },
  {
    id: "econ-math",
    roadmapCode: "ECON & MATH",
    name: "Economics and Mathematics",
    department: "Economics",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        prerequisites: [
          { id: "econ_intro", label: "ECON 1110/1115 & 1111/1116", codes: y(["ECON 110", "ECON 111", "ECON 1115", "ECON 1116"]), needCount: 2 },
          { id: "math120", label: "MATH 1200", codes: y(["MATH 120"]), needCount: 1 },
        ],
        core: [
          { id: "econ_core", label: "ECON 2125/2121, 2126/2122, 2135 & 2136", codes: y(["ECON 2121", "ECON 2125", "ECON 2122", "ECON 2126", "ECON 2135", "ECON 2136"]), needCount: 4 },
          { id: "econ_adv", label: "ECON 3351/4425, 3350/4433, +1 ECON 2000+", codePrefix: ["ECON"], minLevel: 200, needCount: 3 },
          { id: "math225", label: "MATH 2250/2260 & 2550/2560", codes: y(["MATH 225", "MATH 226", "MATH 255", "MATH 256"]), needCount: 2 },
          { id: "math_electives", label: "3 MATH courses above 2250", codePrefix: ["MATH"], minLevel: 225, needCount: 3 },
        ],
        senior: [{ id: "senior", label: "MATH 4800/4810 or ECON theory seminar", codes: y(["MATH 4800", "MATH 4810"]), needCount: 1 }],
      },
    },
  },
  {
    id: "erm",
    roadmapCode: "ER&M",
    name: "Ethnicity, Race, and Migration",
    department: "Ethnicity, Race & Migration",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "gateway", label: "ER&M 2000 & 3000", codes: y(["ER&M 2000", "ER&M 3000"]), needCount: 2 },
          { id: "area", label: "6 courses in area of interest (1 methods course)", codePrefix: ["ER&M", "AFST", "AMST", "HIST", "SOCY", "ANTH"], needCount: 6 },
          { id: "electives", label: "2 electives (DUS approval)", codePrefix: ["ER&M", "AFST", "AMST", "HIST", "SOCY", "WGSS"], needCount: 2 },
        ],
        senior: [
          {
            id: "senior",
            label: "Senior colloquium & essay (ER&M 4091/4092) or seminar route",
            codes: y(["ER&M 4091", "ER&M 4092"]),
            needCount: 2,
          },
        ],
      },
    },
  },
  {
    id: "fren",
    roadmapCode: "FREN",
    name: "French",
    department: "French",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 10,
        core: [
          { id: "lang", label: "FREN 1500 or placement equivalent", codes: y(["FREN 1500"]), needCount: 1 },
          { id: "upper", label: "FREN courses 1600+ toward major", codePrefix: ["FREN"], minLevel: 160, needCount: 7 },
          { id: "outside", label: "2 related courses (DUS approval)", codePrefix: ["FREN", "CPLT", "HIST", "LITR"], needCount: 2 },
        ],
        senior: senior("FREN", "Senior essay (FREN 4491)"),
      },
    },
  },
  {
    id: "gman",
    roadmapCode: "GMAN",
    name: "German Studies",
    department: "German Studies",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 10,
        core: [
          { id: "lang", label: "German language through advanced level", codePrefix: ["GMAN"], minLevel: 130, needCount: 4 },
          { id: "culture", label: "German studies courses (literature/culture)", codePrefix: ["GMAN", "LITR"], minLevel: 150, needCount: 4 },
          { id: "outside", label: "2 electives (DUS approval)", codePrefix: ["GMAN", "HIST", "PHIL", "FILM"], needCount: 2 },
        ],
        senior: senior("GMAN"),
      },
    },
  },
  {
    id: "hsar",
    roadmapCode: "HSAR",
    name: "History of Art",
    department: "History of Art",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "intro", label: "2 courses at 1000 level", codePrefix: ["HSAR"], maxLevel: 1999, needCount: 2 },
          { id: "dist", label: "6 courses above 2000 (2 seminars, 4 geo/chrono categories)", codePrefix: ["HSAR"], minLevel: 200, needCount: 6 },
          { id: "related", label: "2 electives from related departments (DUS approval)", codePrefix: ["HSAR", "HIST", "ARCH"], needCount: 2 },
        ],
        senior: [{ id: "senior", label: "HSAR 4499", codes: y(["HSAR 4499"]), needCount: 1 }],
      },
    },
  },
  {
    id: "ital",
    roadmapCode: "ITAL",
    name: "Italian Studies",
    department: "Italian Studies",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 11,
        core: [
          { id: "lang_core", label: "ITAL 1400, 1500/1510, 1310, 4162/4172", codes: y(["ITAL 1400", "ITAL 1500", "ITAL 1510", "ITAL 1310", "ITAL 4162", "ITAL 4172"]), needCount: 4 },
          { id: "ital_electives", label: "4 Italian electives (5 if ITAL 1400 waived)", codePrefix: ["ITAL"], needCount: 4 },
          { id: "outside", label: "2 electives in langs, HA, history, etc. (DUS approval)", codePrefix: ["ITAL", "HIST", "HSAR", "FILM"], needCount: 2 },
        ],
        senior: [{ id: "senior", label: "ITAL 4491 senior essay", codes: y(["ITAL 4491"]), needCount: 1 }],
      },
    },
  },
  {
    id: "mbb",
    roadmapCode: "MB&B",
    name: "Molecular Biophysics and Biochemistry",
    department: "MB&B",
    degrees: ["BA", "BS"],
    defaultDegree: "BS",
    notes: "Optional concentrations in Biochemistry, Biophysics, Chemical Biology, etc. (YCPS).",
    requirements: {
      BA: {
        totalCourses: 10,
        prerequisites: [
          { id: "chem", label: "General & organic chemistry with labs", codes: y(["CHEM 161", "CHEM 165", "CHEM 220"]), needCount: 3 },
          { id: "math", label: "Calculus (MATH 1120+)", codes: y(["MATH 112", "MATH 115"]), needCount: 1 },
        ],
        core: [
          { id: "phys", label: "PHYS 1700+ & MB&B 2750 or CHEM 3320", codes: y(["PHYS 170", "MB&B 275", "CHEM 332"]), needCount: 2 },
          { id: "mbb_core", label: "MB&B 3000 & 3010", codes: y(["MB&B 300", "MB&B 301"]), needCount: 2 },
          { id: "practical", label: "Practical skills (≥0.5 MB&B)", codePrefix: ["MB&B"], needCount: 1 },
          { id: "mbb_electives", label: "MB&B electives 2000+", codePrefix: ["MB&B"], minLevel: 200, needCount: 2 },
        ],
        senior: [{ id: "senior", label: "Senior project (MB&B 4900/4910)", codes: y(["MB&B 4900", "MB&B 4910"]), needCount: 1 }],
      },
      BS: {
        totalCourses: 13,
        prerequisites: [
          { id: "chem", label: "General & organic chemistry with labs", codes: y(["CHEM 161", "CHEM 165", "CHEM 220", "CHEM 174"]), needCount: 4 },
          { id: "math", label: "Calculus", codes: y(["MATH 112", "MATH 115"]), needCount: 1 },
        ],
        core: [
          { id: "phys", label: "PHYS 1700+ sequence", codePrefix: ["PHYS"], minLevel: 170, needCount: 2 },
          { id: "mbb_core", label: "MB&B 3000, 3010, CHEM 1750+", codes: y(["MB&B 300", "MB&B 301", "CHEM 175"]), needCount: 3 },
          { id: "practical", label: "Practical skills (≥0.5 MB&B)", codePrefix: ["MB&B"], needCount: 2 },
          { id: "mbb_electives", label: "MB&B electives & STEM lecture", codePrefix: ["MB&B", "MCDB", "CHEM"], minLevel: 200, needCount: 3 },
        ],
        senior: [{ id: "senior", label: "Senior project (MB&B 4900/4910)", codes: y(["MB&B 4900", "MB&B 4910"]), needCount: 1 }],
      },
    },
    concentrations: [
      {
        id: "biochemistry",
        label: "Biochemistry concentration",
        degrees: ["BS"],
        requirements: {
          BS: {
            totalCourses: 13,
            core: [
              { id: "mbb_core", label: "MB&B 3000, 3010, CHEM 1750+", codes: y(["MB&B 300", "MB&B 301", "CHEM 175"]), needCount: 3 },
              { id: "conc", label: "Concentration electives (YCPS Biochemistry tab)", codePrefix: ["MB&B", "CHEM"], minLevel: 200, needCount: 4 },
            ],
            senior: [{ id: "senior", label: "Senior project", codePrefix: ["MB&B"], minLevel: 490, needCount: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "meng",
    roadmapCode: "MENG",
    name: "Mechanical Engineering",
    department: "Mechanical Engineering",
    degrees: ["BS"],
    defaultDegree: "BS",
    requirements: {
      BS: {
        totalCourses: 12,
        prerequisites: [
          { id: "math", label: "MATH 1120 & 1150", codes: y(["MATH 112", "MATH 115"]), needCount: 2 },
          { id: "phys", label: "PHYS 1800/1810 with labs", codes: y(["PHYS 180", "PHYS 181"]), needCount: 2 },
        ],
        core: [
          { id: "core", label: "MENG core (1105, 2511, 2311, 2615, 3125, 3422, etc.)", codes: y(["MENG 1105", "MENG 2511", "MENG 2311", "MENG 3125", "MENG 3422"]), needCount: 8 },
          { id: "tech_electives", label: "3 technical electives (DUS approval)", codePrefix: ["MENG", "ENAS"], minLevel: 300, needCount: 3 },
        ],
        senior: [{ id: "senior", label: "MENG 4137L/4138L or 4154/4991", codes: y(["MENG 4137L", "MENG 4154", "MENG 4991"]), needCount: 1 }],
      },
    },
  },
  {
    id: "phil",
    roadmapCode: "PHIL",
    name: "Philosophy",
    department: "Philosophy",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: { BA: philStandardBa },
    concentrations: [
      { id: "standard", label: "Standard major", requirements: { BA: philStandardBa } },
      { id: "psych", label: "Psychology concentration", requirements: { BA: philPsychBa } },
    ],
  },
  {
    id: "phys",
    roadmapCode: "PHYS",
    name: "Physics",
    department: "Physics",
    degrees: ["BS"],
    defaultDegree: "BS",
    requirements: { BS: physStandardBs },
    concentrations: [
      { id: "standard", label: "Standard B.S.", requirements: { BS: physStandardBs } },
      { id: "intensive", label: "Intensive B.S.", requirements: { BS: physIntensiveBs } },
    ],
  },
  {
    id: "rsee",
    roadmapCode: "RSEE",
    name: "Russian, East European, and Eurasian Studies",
    department: "Russian & East European Studies",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "lang", label: "Language study in Russian or regional language", codePrefix: ["RUSS", "RSEE"], needCount: 4 },
          { id: "area", label: "Courses in concentration region", codePrefix: ["RSEE", "HIST", "PLSC", "SLAV"], needCount: 6 },
        ],
        senior: senior("RSEE"),
      },
    },
    concentrations: [
      { id: "russian", label: "Russian Studies", requirements: { BA: { totalCourses: 12, core: [{ id: "area", label: "Russian Studies courses", codePrefix: ["RUSS", "RSEE", "HIST"], needCount: 8 }], senior: senior("RSEE") } } },
      { id: "east-europe", label: "East European Studies", requirements: { BA: { totalCourses: 12, core: [{ id: "area", label: "East European Studies courses", codePrefix: ["RSEE", "HIST", "PLSC"], needCount: 8 }], senior: senior("RSEE") } } },
    ],
  },
  {
    id: "russ",
    roadmapCode: "RUSS",
    name: "Russian",
    department: "Slavic Languages & Literatures",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 11,
        core: [
          { id: "lang", label: "Russian language sequence through 1600+", codePrefix: ["RUSS"], minLevel: 110, needCount: 5 },
          { id: "lit", label: "Literature & culture courses", codePrefix: ["RUSS", "LITR"], minLevel: 150, needCount: 4 },
        ],
        senior: senior("RUSS"),
      },
    },
  },
  {
    id: "span",
    roadmapCode: "SPAN",
    name: "Spanish",
    department: "Spanish & Portuguese",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 10,
        core: [
          { id: "lang", label: "SPAN 1400+ or placement", codePrefix: ["SPAN"], minLevel: 140, needCount: 6 },
          { id: "outside", label: "Related courses (DUS approval)", codePrefix: ["SPAN", "CPLT", "HIST"], needCount: 3 },
        ],
        senior: senior("SPAN"),
      },
    },
    concentrations: [
      {
        id: "intensive",
        label: "Intensive major (12 credits)",
        requirements: {
          BA: {
            totalCourses: 12,
            core: [
              { id: "span220", label: "SPAN 2200", codes: y(["SPAN 2200"]), needCount: 1 },
              { id: "upper", label: "5 SPAN courses 3000+", codePrefix: ["SPAN"], minLevel: 300, needCount: 5 },
              { id: "other", label: "Additional Spanish major courses", codePrefix: ["SPAN"], needCount: 5 },
            ],
            senior: senior("SPAN"),
          },
        },
      },
    ],
  },
  {
    id: "tdps",
    roadmapCode: "TDPS",
    name: "Theater, Dance, and Performance Studies",
    department: "Theater Studies",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 10,
        core: [
          { id: "practice", label: "Artistic practice courses", codePrefix: ["TDPS", "THST"], needCount: 3 },
          { id: "theory", label: "Performance theory", codePrefix: ["TDPS", "THST"], needCount: 2 },
          { id: "history", label: "Histories / interarts", codePrefix: ["TDPS", "THST", "FILM"], needCount: 2 },
          { id: "electives", label: "TDPS electives", codePrefix: ["TDPS", "THST"], needCount: 2 },
        ],
        senior: senior("TDPS"),
      },
    },
  },
  {
    id: "wgss",
    roadmapCode: "WGSS",
    name: "Women's, Gender, and Sexuality Studies",
    department: "Women's, Gender & Sexuality Studies",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "intro", label: "2 introductory WGSS courses", codePrefix: ["WGSS"], maxLevel: 1999, needCount: 2 },
          { id: "intermediate", label: "2 intermediate WGSS courses", codePrefix: ["WGSS"], minLevel: 200, maxLevel: 299, needCount: 2 },
          { id: "methods", label: "1 methodology course", codePrefix: ["WGSS", "SOCY", "ANTH"], needCount: 1 },
          { id: "focus", label: "4 courses in area of focus", codePrefix: ["WGSS", "SOCY", "ANTH", "HIST", "ENGL"], needCount: 4 },
          { id: "electives", label: "2 WGSS electives", codePrefix: ["WGSS"], needCount: 2 },
        ],
        senior: senior("WGSS", "Senior essay"),
      },
    },
  },
];
