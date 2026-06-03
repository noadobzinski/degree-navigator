import type { Major, RequirementSlot } from "./types";

/** Expand Yale roadmap codes to include CourseTable 4-digit variants. */
function y(codes: string[]): string[] {
  const out = new Set<string>();
  for (const code of codes) {
    out.add(code);
    const m = code.match(/^([A-Z&]+)\s+(\d{3})$/);
    if (m) out.add(`${m[1]} ${m[2]}0`);
    const m4 = code.match(/^([A-Z&]+)\s+(\d{4})$/);
    if (m4) out.add(`${m4[1]} ${m4[2].slice(0, 3)}`);
  }
  return [...out];
}

const CGSC_SUBFIELDS: RequirementSlot[] = [
  {
    id: "subfield_cs",
    label: "Computer Science (CPSC 2010)",
    codes: y(["CPSC 201"]),
    needCount: 1,
  },
  {
    id: "subfield_econ",
    label: "Economics & decision (ECON 2259)",
    codes: y(["ECON 2259"]),
    needCount: 1,
  },
  {
    id: "subfield_ling",
    label: "Linguistics (LING 1100, 1160, 1300, 1179, 2320, 2530)",
    codes: y(["LING 110", "LING 116", "LING 130", "LING 1179", "LING 232", "LING 253"]),
    needCount: 1,
  },
  {
    id: "subfield_neuro",
    label: "Neuroscience (MCDB 3200, NSCI 3400, PSYC 1600/2670)",
    codes: y(["MCDB 320", "NSCI 340", "PSYC 160", "PSYC 267"]),
    needCount: 1,
  },
  {
    id: "subfield_phil",
    label: "Philosophy (PHIL 1126, 1182, 2269–2271)",
    codes: y(["PHIL 1126", "PHIL 1182", "PHIL 2269", "PHIL 2270", "PHIL 2271"]),
    needCount: 1,
  },
  {
    id: "subfield_psyc",
    label: "Psychology (PSYC 1100, 1390, 1400)",
    codes: y(["PSYC 110", "PSYC 139", "PSYC 140"]),
    needCount: 1,
  },
  {
    id: "subfield_anth",
    label: "Anthropology (ANTH 1482)",
    codes: y(["ANTH 1482"]),
    needCount: 1,
  },
];

const cgscSharedCore: RequirementSlot[] = [
  ...CGSC_SUBFIELDS,
  {
    id: "concentration",
    label: "6 concentration courses (3000+, 2+ subfields)",
    codePrefix: ["CGSC", "CPSC", "ECON", "LING", "MCDB", "NSCI", "PHIL", "PSYC", "ANTH", "S&DS"],
    minLevel: 300,
    needCount: 6,
  },
  {
    id: "skills",
    label: "Skills course",
    codes: y([
      "CPSC 100",
      "CPSC 202",
      "LING 2249",
      "PSYC 267",
      "PSYC 210",
      "S&DS 100",
      "S&DS 220",
      "S&DS 230",
    ]),
    needCount: 1,
  },
];

const cgscSenior: RequirementSlot[] = [
  {
    id: "senior",
    label: "Senior essay (CGSC 4800–4810 non-empirical or 4900–4910 empirical)",
    codes: y(["CGSC 4800", "CGSC 4810", "CGSC 4900", "CGSC 4910"]),
    needCount: 2,
  },
];

/** Majors aligned to Yale College Major Roadmaps (April–May 2026 PDF). */
export const ROADMAP_MAJORS: Major[] = [
  {
    id: "cgsc",
    roadmapCode: "CGSC",
    name: "Cognitive Science",
    department: "Cognitive Science",
    degrees: ["BA", "BS"],
    defaultDegree: "BA",
    notes:
      "Interdisciplinary: complete any 4 of the 7 subfield rows (ECON 2259, LING courses, etc.) — not CGSC-only electives.",
    requirements: {
      BA: {
        totalCourses: 15,
        prerequisites: [
          { id: "intro", label: "CGSC 1100", codes: y(["CGSC 110"]), needCount: 1 },
          { id: "junior_colloq", label: "Junior colloquium (CGSC 3950)", codes: y(["CGSC 3950"]), needCount: 1 },
        ],
        core: cgscSharedCore,
        senior: cgscSenior,
      },
      BS: {
        totalCourses: 15,
        prerequisites: [
          { id: "intro", label: "CGSC 1100", codes: y(["CGSC 110"]), needCount: 1 },
          { id: "junior_colloq", label: "Junior colloquium (CGSC 3950)", codes: y(["CGSC 3950"]), needCount: 1 },
        ],
        core: [
          ...cgscSharedCore.filter((s) => s.id !== "skills"),
          {
            id: "skills",
            label: "Skills course (PSYC 2100 preferred for B.S.)",
            codes: y([
              "CPSC 100",
              "CPSC 202",
              "LING 2249",
              "PSYC 267",
              "PSYC 210",
              "S&DS 100",
              "S&DS 220",
              "S&DS 230",
            ]),
            needCount: 1,
          },
        ],
        senior: cgscSenior,
      },
    },
  },
  {
    id: "afst",
    roadmapCode: "AFST",
    name: "African Studies",
    department: "African Studies",
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: "Includes African language, humanities, social sciences, and area-of-focus courses.",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "afst_hu", label: "AFST humanities course", codePrefix: ["AFST"], needCount: 1 },
          { id: "afst_so", label: "AFST social science course", codePrefix: ["AFST"], needCount: 1 },
          { id: "language", label: "African language courses", codePrefix: ["AFST"], needCount: 4 },
          { id: "focus", label: "Area of focus", codePrefix: ["AFST"], needCount: 4 },
          {
            id: "methods",
            label: "Research methods (AFST 5505 or approved)",
            codes: y(["AFST 5505"]),
            needCount: 1,
          },
        ],
        senior: [{ id: "senior", label: "Senior essay (AFST 4491)", codes: y(["AFST 4491"]), needCount: 1 }],
      },
    },
  },
  {
    id: "amst",
    roadmapCode: "AMST",
    name: "American Studies",
    department: "American Studies",
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: "Gateway courses, area of concentration, and electives — not only AMST-prefix courses.",
    requirements: {
      BA: {
        totalCourses: 14,
        core: [
          {
            id: "gateways",
            label: "4 gateway courses (AMST 1000–2999)",
            codePrefix: ["AMST"],
            maxLevel: 2999,
            needCount: 4,
          },
          {
            id: "concentration",
            label: "5 courses in area of concentration",
            codePrefix: ["AMST", "HIST", "ENGL", "FILM", "HUMS"],
            needCount: 5,
          },
          { id: "electives", label: "2 AMST electives", codePrefix: ["AMST"], needCount: 2 },
        ],
        senior: [
          {
            id: "senior",
            label: "Senior seminar or essay (AMST 4000+ / 4491)",
            codePrefix: ["AMST"],
            minLevel: 400,
            needCount: 1,
          },
        ],
      },
    },
  },
  {
    id: "anth",
    roadmapCode: "ANTH",
    name: "Anthropology",
    department: "Anthropology",
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: "At least 9 ANTH courses; up to 3 cognate courses in other departments with DUS approval.",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          {
            id: "subfields",
            label: "Intro/intermediate in each of 3 subfields",
            codePrefix: ["ANTH"],
            maxLevel: 2999,
            needCount: 3,
          },
          { id: "anth_electives", label: "2 ANTH electives", codePrefix: ["ANTH"], needCount: 2 },
          {
            id: "advanced",
            label: "3 advanced ANTH courses (3000+)",
            codePrefix: ["ANTH"],
            minLevel: 300,
            needCount: 3,
          },
          {
            id: "cognates",
            label: "Cognate courses (other depts, DUS approval)",
            codePrefix: ["ANTH", "EVST", "HIST", "SOCY", "WGSS"],
            needCount: 2,
          },
        ],
        senior: [
          {
            id: "senior",
            label: "Senior essay (seminar, ANTH 4071/4091, or 2-term)",
            codes: y(["ANTH 4071", "ANTH 4091"]),
            needCount: 1,
          },
        ],
      },
    },
  },
  {
    id: "amth",
    roadmapCode: "AMTH",
    name: "Applied Mathematics",
    department: "Applied Mathematics",
    degrees: ["BA", "BS"],
    defaultDegree: "BS",
    notes: "Requires differential equations, probability, data analysis, and discrete mathematics.",
    requirements: {
      BA: {
        totalCourses: 11,
        prerequisites: [
          { id: "calc", label: "MATH 1200 or ENAS 1510", codes: y(["MATH 120", "ENAS 1510"]), needCount: 1 },
          { id: "linalg", label: "Linear algebra", codes: y(["MATH 222", "MATH 225", "MATH 226"]), needCount: 1 },
          { id: "disc", label: "Discrete math (AMTH 2440 or CPSC 2020)", codes: y(["AMTH 244", "CPSC 202"]), needCount: 1 },
        ],
        core: [
          { id: "de", label: "Differential equations", codes: y(["ENAS 194", "MATH 246"]), needCount: 1 },
          { id: "prob", label: "Probability", codes: y(["S&DS 241", "S&DS 238"]), needCount: 1 },
          { id: "data", label: "Data analysis", codes: y(["S&DS 361", "S&DS 230"]), needCount: 1 },
          {
            id: "concentration",
            label: "3 advanced courses in concentration area",
            codePrefix: ["AMTH", "CPSC", "S&DS", "MATH", "ECON"],
            minLevel: 300,
            needCount: 3,
          },
        ],
        senior: [{ id: "senior", label: "Senior thesis (AMTH 4910)", codes: y(["AMTH 4910"]), needCount: 1 }],
      },
      BS: {
        totalCourses: 14,
        prerequisites: [
          { id: "calc", label: "MATH 1200 or ENAS 1510", codes: y(["MATH 120", "ENAS 1510"]), needCount: 1 },
          { id: "linalg", label: "Linear algebra", codes: y(["MATH 222", "MATH 225", "MATH 226"]), needCount: 1 },
          { id: "engr", label: "ENAS 1300", codes: y(["ENAS 1300", "CPSC 100"]), needCount: 1 },
          { id: "disc", label: "Discrete math (AMTH 2440 or CPSC 2020)", codes: y(["AMTH 244", "CPSC 202"]), needCount: 1 },
        ],
        core: [
          { id: "de", label: "Differential equations", codes: y(["ENAS 194", "MATH 246"]), needCount: 1 },
          { id: "prob", label: "Probability", codes: y(["S&DS 241", "S&DS 238"]), needCount: 1 },
          { id: "data", label: "Data analysis", codes: y(["S&DS 361", "S&DS 230"]), needCount: 1 },
          { id: "vector", label: "Vector analysis course", codePrefix: ["AMTH", "MATH"], minLevel: 300, needCount: 1 },
          {
            id: "concentration",
            label: "4 advanced courses in concentration area",
            codePrefix: ["AMTH", "CPSC", "S&DS", "MATH"],
            minLevel: 300,
            needCount: 4,
          },
        ],
        senior: [{ id: "senior", label: "Senior thesis (AMTH 4910)", codes: y(["AMTH 4910"]), needCount: 1 }],
      },
    },
  },
  {
    id: "aphy",
    roadmapCode: "APHY",
    name: "Applied Physics",
    department: "Applied Physics",
    degrees: ["BS"],
    defaultDegree: "BS",
    notes: "B.S. only. Advanced electives in physical/mathematical sciences with DUS approval.",
    requirements: {
      BS: {
        totalCourses: 8,
        prerequisites: [
          {
            id: "phys",
            label: "Intro physics with lab",
            codes: y(["PHYS 180", "PHYS 181", "PHYS 200", "PHYS 201", "PHYS 260", "PHYS 261"]),
            needCount: 1,
          },
          { id: "math", label: "APHY 1510 or MATH 1200", codes: y(["APHY 151", "MATH 120"]), needCount: 1 },
          {
            id: "upper_phys",
            label: "PHYS 4000 or APHY 1940 + linear algebra",
            codes: y(["PHYS 400", "APHY 194", "MATH 222", "MATH 225", "MATH 226"]),
            needCount: 1,
          },
        ],
        core: [
          { id: "aphy322", label: "APHY 3220", codes: y(["APHY 322"]), needCount: 1 },
          { id: "aphy439", label: "APHY 4390 or PHYS 4400", codes: y(["APHY 439", "PHYS 440"]), needCount: 1 },
          { id: "aphy420", label: "APHY 4200", codes: y(["APHY 420"]), needCount: 1 },
          {
            id: "focus_electives",
            label: "3 advanced electives in area of focus (DUS approval)",
            codePrefix: ["APHY", "PHYS", "MATH", "ENAS", "CPSC"],
            minLevel: 300,
            needCount: 3,
          },
        ],
        senior: [
          {
            id: "senior",
            label: "Senior project (APHY 4710 & 4720)",
            codes: y(["APHY 471", "APHY 472"]),
            needCount: 2,
          },
        ],
      },
    },
  },
  {
    id: "arcg",
    roadmapCode: "ARCG",
    name: "Archaeological Studies",
    department: "Archaeological Studies",
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: "Includes summer field experience and DUS-approved electives.",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "survey", label: "Introductory survey", codePrefix: ["ARCG"], needCount: 1 },
          { id: "lab", label: "Introductory laboratory (ARCG 3116L)", codes: y(["ARCG 3116L"]), needCount: 1 },
          { id: "theory", label: "Theory course", codePrefix: ["ARCG"], needCount: 1 },
          { id: "electives", label: "7 electives (DUS approval)", codePrefix: ["ARCG", "ANTH", "CLSS", "HIST"], needCount: 7 },
        ],
        senior: [{ id: "senior", label: "Senior research (ARCG 4491)", codes: y(["ARCG 4491"]), needCount: 1 }],
      },
    },
  },
  {
    id: "blst",
    roadmapCode: "BLST",
    name: "Black Studies",
    department: "African American Studies",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          { id: "blst116", label: "BLST 1160 & 1162", codes: y(["BLST 1160", "BLST 1162"]), needCount: 2 },
          { id: "hu", label: "Humanities course in Black Studies", codePrefix: ["BLST", "AFST", "ENGL"], needCount: 1 },
          { id: "so", label: "Social science course in Black Studies", codePrefix: ["BLST", "AFST", "HIST", "SOCY"], needCount: 1 },
          { id: "focus", label: "5 courses in area of focus", codePrefix: ["BLST"], needCount: 5 },
        ],
        senior: [
          { id: "junior_sem", label: "Junior seminar (BLST 4310)", codes: y(["BLST 4310"]), needCount: 1 },
          { id: "senior", label: "Senior colloquium & essay", codes: y(["BLST 4380", "BLST 4391"]), needCount: 2 },
        ],
      },
    },
  },
  {
    id: "epe",
    roadmapCode: "EP&E",
    name: "Ethics, Politics and Economics",
    department: "Ethics, Politics & Economics",
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: "Interdisciplinary major with intro requirements across ethics, politics, and economics.",
    requirements: {
      BA: {
        totalCourses: 15,
        core: [
          { id: "ethics", label: "Ethics & political philosophy", codePrefix: ["PHIL", "EP&E", "PLSC"], needCount: 3 },
          { id: "econ_core", label: "Economics core", codePrefix: ["ECON"], needCount: 4 },
          { id: "polisci", label: "Political science", codePrefix: ["PLSC"], needCount: 2 },
          { id: "seminars", label: "EP&E core seminars", codePrefix: ["EP&E"], minLevel: 300, needCount: 3 },
        ],
        electives: [
          { id: "concentration", label: "Area of concentration", codePrefix: ["EP&E", "ECON", "PLSC", "PHIL"], needCount: 2 },
        ],
        senior: [{ id: "senior", label: "Senior essay", codePrefix: ["EP&E"], minLevel: 490, needCount: 1 }],
      },
    },
  },
  {
    id: "eeb",
    roadmapCode: "EEB",
    name: "Ecology and Evolutionary Biology",
    department: "Ecology & Evolutionary Biology",
    degrees: ["BA", "BS"],
    defaultDegree: "BS",
    notes: "Choose Biodiversity or Organismal concentration; cognates with DUS approval.",
    requirements: {
      BA: {
        totalCourses: 14,
        prerequisites: [
          { id: "bio", label: "BIOL 1010–1040", codes: y(["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"]), needCount: 4 },
          { id: "chem", label: "General chemistry + labs", codes: y(["CHEM 161", "CHEM 165", "CHEM 174", "CHEM 175"]), needCount: 2 },
          { id: "math", label: "Math or statistics", codes: y(["MATH 115", "MATH 120", "S&DS 100", "S&DS 230"]), needCount: 1 },
        ],
        core: [
          { id: "eeb_electives", label: "EEB electives (concentration)", codePrefix: ["EEB"], minLevel: 200, needCount: 4 },
        ],
        senior: [
          {
            id: "senior",
            label: "Research or senior essay (EEB 4470/4475/4495)",
            codes: y(["EEB 4470", "EEB 4475", "EEB 4476", "EEB 4495", "EEB 4496"]),
            needCount: 1,
          },
        ],
      },
      BS: {
        totalCourses: 14,
        prerequisites: [
          { id: "bio", label: "BIOL 1010–1040", codes: y(["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"]), needCount: 4 },
          { id: "chem", label: "General chemistry + labs", codes: y(["CHEM 161", "CHEM 165", "CHEM 1340L", "CHEM 1360L"]), needCount: 2 },
          { id: "math", label: "Math or statistics", codes: y(["MATH 115", "MATH 120", "S&DS 100", "S&DS 230"]), needCount: 1 },
        ],
        core: [
          {
            id: "concentration",
            label: "Concentration courses (Biodiversity or Organismal track)",
            codePrefix: ["EEB", "MCDB", "MB&B", "BENG"],
            needCount: 4,
          },
        ],
        senior: [
          {
            id: "senior",
            label: "2-term research (EEB 4475/4476 or 4495/4496)",
            codes: y(["EEB 4475", "EEB 4476", "EEB 4495", "EEB 4496"]),
            needCount: 2,
          },
        ],
      },
    },
  },
  {
    id: "evst",
    roadmapCode: "EVST",
    name: "Environmental Studies",
    department: "Environmental Studies",
    degrees: ["BA", "BS"],
    defaultDegree: "BA",
    notes: "Interdisciplinary core across humanities, social sciences, and natural sciences.",
    requirements: {
      BA: {
        totalCourses: 13,
        prerequisites: [
          { id: "quant", label: "Quantitative prereq (MATH 1120+, PHYS 1700+, or S&DS 1000+)", codes: y(["MATH 112", "PHYS 170", "S&DS 100"]), needCount: 1 },
          { id: "science", label: "BIOL 1010–1040 or chemistry sequence", codes: y(["BIOL 101", "CHEM 161"]), needCount: 1 },
        ],
        core: [
          { id: "core_hu", label: "Core humanities", codePrefix: ["EVST", "HIST", "HUMS", "ENGL"], needCount: 1 },
          { id: "core_so", label: "Core social science", codePrefix: ["EVST", "ANTH", "PLSC", "SOCY"], needCount: 1 },
          { id: "core_ns", label: "Core natural sciences (3)", codePrefix: ["EVST", "EEB", "G&G", "CHEM", "PHYS"], needCount: 3 },
          { id: "concentration", label: "6 courses in concentration", codePrefix: ["EVST", "EEB", "F&ES", "ANTH"], needCount: 6 },
        ],
        senior: [
          {
            id: "senior",
            label: "Senior essay & seminar (EVST 4960)",
            codes: y(["EVST 4960"]),
            needCount: 2,
          },
        ],
      },
      BS: {
        totalCourses: 12,
        prerequisites: [
          { id: "quant", label: "Quantitative prereq", codes: y(["MATH 112", "S&DS 100"]), needCount: 1 },
          { id: "science", label: "BIOL or chemistry", codes: y(["BIOL 101", "CHEM 161"]), needCount: 1 },
          { id: "lab", label: "Natural science lab", codePrefix: ["EEB", "G&G", "CHEM", "PHYS"], needCount: 1 },
        ],
        core: [
          { id: "core_hu", label: "Core humanities", codePrefix: ["EVST", "HIST"], needCount: 1 },
          { id: "core_so", label: "Core social science", codePrefix: ["EVST", "ANTH"], needCount: 1 },
          { id: "core_ns", label: "Core natural sciences (2)", codePrefix: ["EVST", "EEB", "G&G"], needCount: 2 },
          { id: "concentration", label: "6 courses in concentration (3 SC, 2000+)", codePrefix: ["EVST", "EEB", "G&G"], minLevel: 200, needCount: 6 },
        ],
        senior: [{ id: "senior", label: "Two-term senior project (EVST 4960)", codes: y(["EVST 4960"]), needCount: 2 }],
      },
    },
  },
  {
    id: "glbl",
    roadmapCode: "GLBL",
    name: "Global Affairs",
    department: "Global Affairs",
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: "Requires ECON, PLSC, History, and GLBL electives — plus L4 language ability.",
    requirements: {
      BA: {
        totalCourses: 14,
        core: [
          { id: "glbl_core", label: "GLBL 2121, 2122, 3101", codes: y(["GLBL 2121", "GLBL 2122", "GLBL 3101"]), needCount: 3 },
          { id: "econ_micro", label: "Intro micro (ECON 1108/1110/1115)", codes: y(["ECON 110", "ECON 108", "ECON 1115"]), needCount: 1 },
          { id: "econ_macro", label: "Intro macro (ECON 1111/1116)", codes: y(["ECON 111", "ECON 1116"]), needCount: 1 },
          {
            id: "plsc",
            label: "2 PLSC from different subfields",
            codePrefix: ["PLSC", "PHIL"],
            needCount: 2,
          },
          {
            id: "methods",
            label: "Methods (ECON 2121/2122, GLBL 2159, or qual methods)",
            codes: y(["ECON 2121", "ECON 2122", "GLBL 2159"]),
            needCount: 1,
          },
          { id: "history", label: "2 History courses", codePrefix: ["HIST"], needCount: 2 },
          { id: "glbl_electives", label: "3 GLBL electives (DUS approval)", codePrefix: ["GLBL"], needCount: 3 },
        ],
        senior: [
          {
            id: "senior",
            label: "Senior project (GLBL 4499/4500 or seminar)",
            codes: y(["GLBL 4499", "GLBL 4500"]),
            needCount: 1,
          },
        ],
      },
    },
  },
  {
    id: "hshm",
    roadmapCode: "HSHM",
    name: "History of Science, Medicine, and Public Health",
    department: "History of Science",
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: "7 courses in concentration including electives from any department with adviser approval.",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          {
            id: "concentration",
            label: "7 concentration courses (2 HSHM, seminar, 3 related electives, 1 science)",
            codePrefix: ["HSHM", "HIST", "MB&B", "MCDB", "PHIL", "SOCY"],
            needCount: 7,
          },
          {
            id: "hshm_electives",
            label: "3 additional HSHM electives (1 seminar, 1 outside concentration)",
            codePrefix: ["HSHM"],
            needCount: 3,
          },
        ],
        senior: [
          {
            id: "senior",
            label: "Yearlong senior project (HSHM 4900 & 4910)",
            codes: y(["HSHM 4900", "HSHM 4910"]),
            needCount: 2,
          },
        ],
      },
    },
  },
  {
    id: "hums",
    roadmapCode: "HUMS",
    name: "Humanities",
    department: "Humanities",
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: "Core seminars and courses across literature, arts, science-in-humanities, and intellectual history.",
    requirements: {
      BA: {
        totalCourses: 14,
        core: [
          { id: "modernities", label: "2 Modernities seminars", codePrefix: ["HUMS"], needCount: 2 },
          { id: "interpretations", label: "2 Interpretations seminars", codePrefix: ["HUMS"], needCount: 2 },
          { id: "traditions", label: "2 Traditions lectures/seminars", codePrefix: ["HUMS"], needCount: 2 },
          {
            id: "areas",
            label: "1 course in each of 4 areas (lit, arts, sci-in-hum, intellectual history)",
            codePrefix: ["HUMS", "ENGL", "HIST", "PHIL", "HSAR"],
            needCount: 4,
          },
        ],
        senior: [{ id: "senior", label: "Senior essay (HUMS 4910)", codes: y(["HUMS 4910"]), needCount: 1 }],
      },
    },
  },
  {
    id: "ling",
    roadmapCode: "LING",
    name: "Linguistics",
    department: "Linguistics",
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: "Breadth across subfields; electives may include related courses in other departments with DUS permission.",
    requirements: {
      BA: {
        totalCourses: 12,
        core: [
          {
            id: "breadth",
            label: "5 breadth courses (from approved LING list)",
            codes: y([
              "LING 1179",
              "LING 212",
              "LING 220",
              "LING 227",
              "LING 232",
              "LING 253",
              "LING 263",
              "LING 275",
              "LING 279",
              "LING 361",
              "LING 110",
              "LING 116",
            ]),
            needCount: 5,
          },
          { id: "depth", label: "2 depth courses in one area", codePrefix: ["LING"], minLevel: 200, needCount: 2 },
          { id: "electives", label: "3 LING electives (1 at 2000+)", codePrefix: ["LING", "PSYC", "CPSC", "PHIL"], needCount: 3 },
          { id: "research", label: "Research (LING 4900)", codes: y(["LING 4900"]), needCount: 1 },
        ],
        senior: [{ id: "senior", label: "Senior essay (LING 4910)", codes: y(["LING 4910"]), needCount: 1 }],
      },
    },
  },
  {
    id: "nsci",
    roadmapCode: "NSCI",
    name: "Neuroscience",
    department: "Neuroscience",
    degrees: ["BA", "BS"],
    defaultDegree: "BA",
    notes: "Highly interdisciplinary — core courses from NSCI, PSYC, BIOL, CPSC, and allied departments.",
    requirements: {
      BA: {
        totalCourses: 19,
        prerequisites: [
          { id: "bio", label: "BIOL 1010–1040", codes: y(["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"]), needCount: 4 },
          { id: "stats", label: "S&DS 1000, 2200, 2300, or 2380", codes: y(["S&DS 100", "S&DS 220", "S&DS 230", "S&DS 238"]), needCount: 1 },
          { id: "intro", label: "NSCI 1600", codes: y(["NSCI 160"]), needCount: 1 },
          { id: "core320", label: "NSCI 3200", codes: y(["NSCI 320"]), needCount: 1 },
          { id: "lab", label: "Lab course", codes: y(["NSCI 2280L", "NSCI 2290L", "PSYC 2538"]), needCount: 1 },
        ],
        core: [
          { id: "systems", label: "2 systems/circuits/behavior core", codePrefix: ["NSCI", "PSYC"], needCount: 2 },
          { id: "molecular", label: "2 molecular/cellular core", codePrefix: ["NSCI", "MCDB", "MB&B"], needCount: 2 },
          { id: "quant", label: "1 quantitative core", codePrefix: ["NSCI", "S&DS", "CPSC", "MATH"], needCount: 1 },
          { id: "comp", label: "1 computational core", codePrefix: ["NSCI", "CPSC"], needCount: 1 },
          { id: "allied", label: "1–3 allied core courses", codePrefix: ["NSCI", "PSYC", "MCDB", "PHYS"], needCount: 2 },
        ],
        electives: [{ id: "electives", label: "NSCI electives", codePrefix: ["NSCI", "PSYC", "MCDB"], needCount: 6 }],
        senior: [
          {
            id: "senior",
            label: "Senior research (NSCI 4800–4810 or 4900–4910)",
            codes: y(["NSCI 4800", "NSCI 4810", "NSCI 4900", "NSCI 4910"]),
            needCount: 2,
          },
        ],
      },
      BS: {
        totalCourses: 21,
        prerequisites: [
          { id: "bio", label: "BIOL 1010–1040", codes: y(["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"]), needCount: 4 },
          { id: "stats", label: "Statistics", codes: y(["S&DS 100", "S&DS 220", "S&DS 230"]), needCount: 1 },
          { id: "intro", label: "NSCI 1600 & 3200", codes: y(["NSCI 160", "NSCI 320"]), needCount: 2 },
          { id: "lab", label: "Lab course", codes: y(["NSCI 2280L", "NSCI 3210L", "PSYC 2538"]), needCount: 1 },
        ],
        core: [
          { id: "systems", label: "2 systems/circuits/behavior core", codePrefix: ["NSCI", "PSYC"], needCount: 2 },
          { id: "molecular", label: "2 molecular/cellular core", codePrefix: ["NSCI", "MCDB"], needCount: 2 },
          { id: "quant", label: "1 quantitative core", codePrefix: ["NSCI", "S&DS", "MATH"], needCount: 1 },
          { id: "comp", label: "1 computational core", codePrefix: ["NSCI", "CPSC"], needCount: 1 },
          { id: "allied", label: "Allied core courses", codePrefix: ["NSCI", "PSYC", "PHYS"], needCount: 2 },
        ],
        electives: [{ id: "electives", label: "NSCI electives", codePrefix: ["NSCI", "PSYC"], needCount: 8 }],
        senior: [
          {
            id: "senior",
            label: "Empirical senior research (NSCI 4900 & 4910)",
            codes: y(["NSCI 4900", "NSCI 4910"]),
            needCount: 2,
          },
        ],
      },
    },
  },
  {
    id: "film",
    roadmapCode: "FILM",
    name: "Film and Media Studies",
    department: "Film & Media Studies",
    degrees: ["BA"],
    defaultDegree: "BA",
    requirements: {
      BA: {
        totalCourses: 12,
        prerequisites: [
          { id: "film1501", label: "FILM 1501", codes: y(["FILM 1501"]), needCount: 1 },
          { id: "film1601", label: "FILM 1601", codes: y(["FILM 1601"]), needCount: 1 },
          { id: "film3201", label: "FILM 3201", codes: y(["FILM 3201"]), needCount: 1 },
        ],
        core: [
          { id: "intl", label: "International/world cinema (upper level)", codePrefix: ["FILM"], minLevel: 200, needCount: 1 },
          { id: "critical", label: "Critical studies (upper level)", codePrefix: ["FILM"], minLevel: 200, needCount: 1 },
          { id: "production", label: "Production course", codePrefix: ["FILM"], needCount: 1 },
          { id: "electives", label: "4 electives", codePrefix: ["FILM"], needCount: 4 },
        ],
        senior: [{ id: "senior", label: "Senior essay or production project", codePrefix: ["FILM"], minLevel: 400, needCount: 1 }],
      },
    },
  },
  {
    id: "socy",
    roadmapCode: "SOCY",
    name: "Sociology",
    department: "Sociology",
    degrees: ["BA"],
    defaultDegree: "BA",
    notes: "Standard major; optional concentrations (Economy & Society, Health & Society, etc.) have alternate requirements.",
    requirements: {
      BA: {
        totalCourses: 13,
        core: [
          { id: "intro", label: "Intro SOCY course", codePrefix: ["SOCY"], maxLevel: 1999, needCount: 1 },
          { id: "theory", label: "SOCY 2001 & 2002", codes: y(["SOCY 2001", "SOCY 2002"]), needCount: 2 },
          { id: "methods_socy", label: "SOCY 2100", codes: y(["SOCY 2100"]), needCount: 1 },
          { id: "methods", label: "Social science methods course", codePrefix: ["SOCY", "S&DS", "PLSC"], needCount: 1 },
          { id: "electives", label: "6 electives", codePrefix: ["SOCY", "ECON", "ANTH"], needCount: 6 },
        ],
        senior: [{ id: "senior", label: "Senior requirement", codePrefix: ["SOCY"], minLevel: 400, needCount: 1 }],
      },
    },
  },
  {
    id: "sds",
    roadmapCode: "S&DS",
    name: "Statistics and Data Science",
    department: "Statistics & Data Science",
    degrees: ["BA", "BS"],
    defaultDegree: "BS",
    notes: "Structured methods, computation, and theory requirements — electives from many departments with DUS approval.",
    requirements: {
      BA: {
        totalCourses: 11,
        prerequisites: [
          { id: "calc", label: "MATH 1200 or equivalent", codes: y(["MATH 120", "ENAS 1510", "MATH 302"]), needCount: 1 },
          { id: "linalg", label: "Linear algebra", codes: y(["MATH 222", "MATH 225", "MATH 226"]), needCount: 1 },
        ],
        core: [
          { id: "comp", label: "2 computational skills courses", codePrefix: ["S&DS", "CPSC"], needCount: 2 },
          { id: "methods", label: "3 methods of data science courses", codePrefix: ["S&DS"], needCount: 3 },
          { id: "theory", label: "1 mathematical foundations course", codePrefix: ["MATH", "S&DS"], needCount: 1 },
          { id: "prob", label: "2 core probability & statistics", codePrefix: ["S&DS"], needCount: 2 },
        ],
        senior: [{ id: "senior", label: "Senior project (S&DS 4910/4920)", codes: y(["S&DS 4910", "S&DS 4920"]), needCount: 1 }],
      },
      BS: {
        totalCourses: 14,
        prerequisites: [
          { id: "calc", label: "MATH 1200 or equivalent", codes: y(["MATH 120", "ENAS 1510"]), needCount: 1 },
          { id: "linalg", label: "Linear algebra", codes: y(["MATH 222", "MATH 225", "MATH 226"]), needCount: 1 },
        ],
        core: [
          { id: "comp", label: "2 computational skills courses", codePrefix: ["S&DS", "CPSC"], needCount: 2 },
          { id: "methods", label: "2 methods courses (incl. S&DS 3650)", codes: y(["S&DS 365"]), needCount: 2 },
          { id: "theory", label: "Mathematical foundations", codePrefix: ["MATH", "S&DS"], needCount: 1 },
          { id: "prob", label: "2 core probability & statistics (incl. S&DS 2420)", codes: y(["S&DS 242", "S&DS 241"]), needCount: 2 },
          { id: "electives", label: "3 additional electives (DUS approval)", codePrefix: ["S&DS", "ECON", "CPSC", "MATH"], needCount: 3 },
        ],
        senior: [{ id: "senior", label: "Senior project (S&DS 4910/4920)", codes: y(["S&DS 4910", "S&DS 4920"]), needCount: 1 }],
      },
    },
  },
];
