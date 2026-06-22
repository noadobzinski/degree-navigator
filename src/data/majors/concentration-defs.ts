import type { MajorConcentration, MajorRequirements, RequirementSlot } from "./types";
import { y } from "./course-codes";

function mcdbConcCore(
  concCourse: string,
  concLabel: string,
  electiveCodes: string[],
  electiveLabel: string,
): RequirementSlot[] {
  return [
    {
      id: "conc_required",
      label: concLabel,
      codes: [concCourse],
      needCount: 1,
    },
    {
      id: "conc_elective",
      label: electiveLabel,
      codes: electiveCodes,
      needCount: 1,
    },
  ];
}

const MCDB_NEURO_ELECTIVES = y([
  "BENG 4410",
  "CPSC 4391",
  "CPSC 4750",
  "MCDB 2500",
  "MCDB 3100",
  "MCDB 3150",
  "MCDB 3290",
  "MCDB 3620",
  "MCDB 4150",
  "MCDB 4250",
  "MCDB 4300",
  "MCDB 4400",
]);

const MCDB_BIOTECH_ELECTIVES = y([
  "BENG 3600",
  "BENG 4350",
  "BENG 4475",
  "BENG 4611",
  "BENG 4690",
  "CENG 2100",
  "CENG 4110",
  "CHEM 3190",
  "CHEM 4210",
  "CHEM 4240",
  "CHEM 4920",
  "CHEM 5200",
  "MB&B 3520",
  "MB&B 4490",
]);

const MCDB_QUANT_ELECTIVES = y([
  "BENG 4630",
  "BENG 4767",
  "CPSC 4750",
  "MATH 2460",
  "MATH 2510",
  "MB&B 3520",
  "MB&B 4350",
  "MB&B 5230",
  "MCDB 3200",
  "MCDB 3620",
]);

function mcdbBaBase(): MajorRequirements {
  return {
    totalCourses: 11,
    prerequisites: [
      { id: "gen_chem", label: "General Chemistry I & II", codes: y(["CHEM 161", "CHEM 165"]), needCount: 2 },
    ],
    core: [
      {
        id: "bio_intro",
        label: "Intro Biology (2 of BIOL 101–104)",
        codes: y(["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"]),
        needCount: 2,
      },
      { id: "molbio", label: "Molecular Biology (MCDB 2000)", codes: y(["MCDB 200"]), needCount: 1 },
      { id: "genetics", label: "Genetics (MCDB 2020)", codes: y(["MCDB 202"]), needCount: 1 },
      { id: "cell", label: "Cellular & Developmental (MCDB 2050)", codes: y(["MCDB 205"]), needCount: 1 },
      {
        id: "mcdb_electives",
        label: "2 general MCDB electives (2500+) + 1 special elective (3500+); see YCPS",
        codePrefix: ["MCDB"],
        minLevel: 250,
        needCount: 2,
      },
      {
        id: "special_elective",
        label: "1 MCDB special elective (3500+)",
        codePrefix: ["MCDB"],
        minLevel: 350,
        needCount: 1,
      },
      {
        id: "bio_lab",
        label: "1 biology lab (MCDB, MB&B, BENG, or approved)",
        codePrefix: ["MCDB", "MB&B", "BENG", "EEB", "ANTH"],
        needCount: 1,
      },
    ],
  };
}

function mcdbBsBase(): MajorRequirements {
  return {
    totalCourses: 13,
    prerequisites: [
      { id: "gen_chem", label: "General Chemistry (CHEM 1610 & 1650)", codes: y(["CHEM 161", "CHEM 165"]), needCount: 2 },
      { id: "ochem", label: "Organic Chemistry (CHEM 2200 & 2210)", codes: y(["CHEM 220", "CHEM 221"]), needCount: 2 },
      {
        id: "math",
        label: "Calculus or Statistics",
        codes: y(["MATH 112", "MATH 115", "MATH 120", "S&DS 100", "EEB 225"]),
        needCount: 1,
      },
    ],
    core: [
      {
        id: "bio_intro",
        label: "Intro Biology (BIOL 101–104, 2 of)",
        codes: y(["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"]),
        needCount: 2,
      },
      { id: "molbio", label: "Molecular Biology (MCDB 2000)", codes: y(["MCDB 200"]), needCount: 1 },
      { id: "genetics", label: "Genetics (MCDB 2020)", codes: y(["MCDB 202"]), needCount: 1 },
      { id: "cell", label: "Cellular & Developmental (MCDB 2050)", codes: y(["MCDB 205"]), needCount: 1 },
      { id: "biochem", label: "Biochemistry (MCDB 3100)", codes: y(["MCDB 310"]), needCount: 1 },
      {
        id: "mcdb_electives",
        label: "2 general MCDB electives (2500+), or approved substitutions",
        codePrefix: ["MCDB"],
        minLevel: 250,
        needCount: 2,
      },
      {
        id: "special_elective",
        label: "1 MCDB special elective (3500+)",
        codePrefix: ["MCDB"],
        minLevel: 350,
        needCount: 1,
      },
      {
        id: "mcdb_labs",
        label: "2 MCDB half-credit labs",
        codePrefix: ["MCDB"],
        needCount: 2,
      },
    ],
    senior: [
      {
        id: "senior",
        label: "Senior research (MCDB 4850 & 4860) or intensive track",
        codes: y(["MCDB 4850", "MCDB 4860", "MCDB 4950", "MCDB 4960"]),
        needCount: 2,
      },
    ],
  };
}

function mcdbWithConcentration(
  concCourse: string,
  concName: string,
  electiveCodes: string[],
): { BA: MajorRequirements; BS: MajorRequirements } {
  const ba = mcdbBaBase();
  const bs = mcdbBsBase();
  const concSlots = mcdbConcCore(
    concCourse,
    `${concName} required course (${concCourse})`,
    electiveCodes,
    `${concName} concentration elective (approved list)`,
  );
  const stripElectives = (core: RequirementSlot[]) =>
    core.filter((s) => s.id !== "mcdb_electives" && s.id !== "special_elective");
  return {
    BA: {
      ...ba,
      core: [...stripElectives(ba.core), ...concSlots],
    },
    BS: {
      ...bs,
      core: [...stripElectives(bs.core), ...concSlots],
    },
  };
}

export const MCDB_BASE_REQUIREMENTS = {
  BA: mcdbBaBase(),
  BS: mcdbBsBase(),
};

export const MCDB_CONCENTRATIONS: MajorConcentration[] = [
  {
    id: "neurobiology",
    label: "Neurobiology",
    description: "MCDB 3200 (Neurobiology) plus one approved neurobiology elective.",
    requirements: mcdbWithConcentration(
      "MCDB 320",
      "Neurobiology",
      MCDB_NEURO_ELECTIVES,
    ),
  },
  {
    id: "biotechnology",
    label: "Biotechnology",
    description: "MCDB 3700 (Biotechnology) plus one approved biotechnology elective.",
    requirements: mcdbWithConcentration(
      "MCDB 370",
      "Biotechnology",
      MCDB_BIOTECH_ELECTIVES,
    ),
  },
  {
    id: "quantitative-biology",
    label: "Quantitative Biology",
    description: "MCDB 3310 (Modeling Biological Systems I) plus one approved quantitative elective.",
    requirements: mcdbWithConcentration(
      "MCDB 331",
      "Quantitative Biology",
      MCDB_QUANT_ELECTIVES,
    ),
  },
];

function eebBiodiversityReqs(degree: "BA" | "BS"): MajorRequirements {
  const concCore: RequirementSlot[] = [
    { id: "eeb2220", label: "EEB 2220", codes: y(["EEB 2220", "EEB 222"]), needCount: 1 },
    { id: "eeb2225", label: "EEB 2225", codes: y(["EEB 2225"]), needCount: 1 },
    {
      id: "organismal_div",
      label: "Organismal diversity lecture + lab (EEB 2246–2272 + lab, or EEB 3326/3327L)",
      codes: y(["EEB 3326", "EEB 3327L"]),
      codePrefix: ["EEB"],
      minLevel: 224,
      needCount: 1,
    },
  ];
  if (degree === "BA") {
    return {
      totalCourses: 14,
      prerequisites: [
        { id: "bio", label: "BIOL 1010–1040", codes: y(["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"]), needCount: 4 },
        { id: "chem", label: "General chemistry + labs", codes: y(["CHEM 161", "CHEM 165", "CHEM 174", "CHEM 175"]), needCount: 2 },
        { id: "math", label: "Math or statistics", codes: y(["MATH 115", "MATH 120", "S&DS 100", "S&DS 230"]), needCount: 1 },
      ],
      core: [
        ...concCore,
        {
          id: "eeb_electives",
          label: "2 EEB electives (≥1 lecture or seminar; DUS approval)",
          codePrefix: ["EEB"],
          minLevel: 200,
          needCount: 2,
        },
      ],
      senior: [
        {
          id: "senior",
          label: "Research or senior essay (EEB 4470/4475/4495)",
          codes: y(["EEB 4470", "EEB 4475", "EEB 4495"]),
          needCount: 1,
        },
      ],
    };
  }
  return {
    totalCourses: 14,
    prerequisites: [
      { id: "bio", label: "BIOL 1010–1040", codes: y(["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"]), needCount: 4 },
      { id: "chem", label: "General chemistry + labs", codes: y(["CHEM 161", "CHEM 165", "CHEM 1340L", "CHEM 1360L"]), needCount: 2 },
      { id: "math", label: "Math or statistics", codes: y(["MATH 115", "MATH 120", "S&DS 100", "S&DS 230"]), needCount: 1 },
    ],
    core: [
      ...concCore,
      {
        id: "eeb_electives",
        label: "2 EEB electives (≥1 lecture or seminar)",
        codePrefix: ["EEB", "MCDB", "MB&B"],
        minLevel: 200,
        needCount: 2,
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
  };
}

function eebOrganismalReqs(degree: "BA" | "BS"): MajorRequirements {
  const concCore: RequirementSlot[] = [
    { id: "eeb2290", label: "EEB 2290", codes: y(["EEB 2290", "EEB 229"]), needCount: 1 },
    {
      id: "physio",
      label: "EEB 2295 or BENG 3200",
      codes: y(["EEB 2295", "BENG 3200", "BENG 320"]),
      needCount: 1,
    },
    {
      id: "mol_cell",
      label: "MCDB 3000 or MB&B 3000",
      codes: y(["MCDB 300", "MB&B 300"]),
      needCount: 1,
    },
    { id: "eeb2291l", label: "EEB 2291L", codes: y(["EEB 2291L"]), needCount: 1 },
  ];
  if (degree === "BA") {
    return {
      totalCourses: 14,
      prerequisites: [
        { id: "bio", label: "BIOL 1010–1040", codes: y(["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"]), needCount: 4 },
        { id: "chem", label: "General chemistry + labs", codes: y(["CHEM 161", "CHEM 165", "CHEM 174", "CHEM 175"]), needCount: 2 },
        { id: "math", label: "Math or statistics", codes: y(["MATH 115", "MATH 120", "S&DS 100"]), needCount: 1 },
      ],
      core: [
        ...concCore,
        {
          id: "eeb_electives",
          label: "2 EEB electives (≥1 lecture or seminar)",
          codePrefix: ["EEB", "MCDB", "MB&B"],
          minLevel: 200,
          needCount: 2,
        },
      ],
      senior: [
        {
          id: "senior",
          label: "Research or senior essay",
          codes: y(["EEB 4470", "EEB 4475", "EEB 4495"]),
          needCount: 1,
        },
      ],
    };
  }
  return {
    totalCourses: 14,
    prerequisites: [
      { id: "bio", label: "BIOL 1010–1040", codes: y(["BIOL 101", "BIOL 102", "BIOL 103", "BIOL 104"]), needCount: 4 },
      { id: "chem", label: "General chemistry + labs", codes: y(["CHEM 161", "CHEM 165", "CHEM 1340L", "CHEM 1360L"]), needCount: 2 },
      { id: "math", label: "Math or statistics", codes: y(["MATH 115", "MATH 120", "S&DS 100"]), needCount: 1 },
    ],
    core: [
      ...concCore,
      {
        id: "eeb_electives",
        label: "2 EEB electives",
        codePrefix: ["EEB", "MCDB", "MB&B"],
        minLevel: 200,
        needCount: 2,
      },
    ],
    senior: [
      {
        id: "senior",
        label: "2-term research",
        codes: y(["EEB 4475", "EEB 4476", "EEB 4495", "EEB 4496"]),
        needCount: 2,
      },
    ],
  };
}

export const EEB_CONCENTRATIONS: MajorConcentration[] = [
  {
    id: "biodiversity-environment",
    label: "Biodiversity and the Environment",
    description: "Ecology, evolution, and environmental science track (EEB 2220, 2225, organismal diversity).",
    requirements: {
      BA: eebBiodiversityReqs("BA"),
      BS: eebBiodiversityReqs("BS"),
    },
  },
  {
    id: "organismal-biology",
    label: "Organismal Biology",
    description: "Physiology and pre-health track (EEB 2290, 2295/BENG 3200, MCDB/MB&B 3000, 2291L).",
    requirements: {
      BA: eebOrganismalReqs("BA"),
      BS: eebOrganismalReqs("BS"),
    },
  },
];

function evstConc(
  id: string,
  label: string,
  description: string,
  degree: "BA" | "BS",
): MajorRequirements {
  const baCore: RequirementSlot[] = [
    { id: "core_hu", label: "Core humanities", codePrefix: ["EVST", "HIST", "HUMS", "ENGL"], needCount: 1 },
    { id: "core_so", label: "Core social science", codePrefix: ["EVST", "ANTH", "PLSC", "SOCY"], needCount: 1 },
    { id: "core_ns", label: "Core natural sciences (3)", codePrefix: ["EVST", "EEB", "G&G", "CHEM", "PHYS"], needCount: 3 },
    {
      id: "concentration",
      label: `6 ${label} concentration courses (DUS-approved)`,
      description,
      codePrefix: ["EVST", "EEB", "F&ES", "ANTH", "HIST", "ECON", "PLSC", "G&G"],
      needCount: 6,
    },
  ];
  const bsCore: RequirementSlot[] = [
    { id: "core_hu", label: "Core humanities", codePrefix: ["EVST", "HIST"], needCount: 1 },
    { id: "core_so", label: "Core social science", codePrefix: ["EVST", "ANTH"], needCount: 1 },
    { id: "core_ns", label: "Core natural sciences (2)", codePrefix: ["EVST", "EEB", "G&G"], needCount: 2 },
    {
      id: "concentration",
      label: `6 ${label} concentration courses (3 SC, 2000+; DUS-approved)`,
      description,
      codePrefix: ["EVST", "EEB", "G&G"],
      minLevel: 200,
      needCount: 6,
    },
  ];
  if (degree === "BA") {
    return {
      totalCourses: 13,
      prerequisites: [
        { id: "quant", label: "Quantitative prereq", codes: y(["MATH 112", "PHYS 170", "S&DS 100"]), needCount: 1 },
        { id: "science", label: "BIOL or chemistry", codes: y(["BIOL 101", "CHEM 161"]), needCount: 1 },
      ],
      core: baCore,
      senior: [
        {
          id: "senior",
          label: "Senior essay & seminar (EVST 4960)",
          codes: y(["EVST 4960"]),
          needCount: 2,
        },
      ],
    };
  }
  return {
    totalCourses: 12,
    prerequisites: [
      { id: "quant", label: "Quantitative prereq", codes: y(["MATH 112", "S&DS 100"]), needCount: 1 },
      { id: "science", label: "BIOL or chemistry", codes: y(["BIOL 101", "CHEM 161"]), needCount: 1 },
      { id: "lab", label: "Natural science lab", codePrefix: ["EEB", "G&G", "CHEM", "PHYS"], needCount: 1 },
    ],
    core: bsCore,
    senior: [{ id: "senior", label: "Two-term senior project (EVST 4960)", codes: y(["EVST 4960"]), needCount: 2 }],
  };
}

const EVST_CONC_META = [
  { id: "biodiversity-conservation", label: "Biodiversity & Conservation", desc: "Species diversity, ecosystem dynamics, and conservation policy." },
  { id: "energy-climate", label: "Energy & Climate", desc: "Energy systems, climate change, and environmental quality." },
  { id: "environmental-humanities", label: "Environmental Humanities", desc: "History, literature, art, and culture in human–environment relations." },
  { id: "environmental-justice", label: "Environmental Justice", desc: "Disparities, human rights, and injustice in environmental quality." },
  { id: "environmental-policy", label: "Environmental Policy", desc: "Policy solutions for environmental and natural resource challenges." },
  { id: "food-agriculture", label: "Food and Agriculture", desc: "Food systems, agriculture, and environmental quality." },
  { id: "human-health-environment", label: "Human Health and Environment", desc: "Environmental causes of human illness." },
  { id: "sustainability-natural-resources", label: "Sustainability & Natural Resources", desc: "Natural resource management and conservation." },
  { id: "urban-environments", label: "Urban Environments", desc: "Urban environmental challenges and sustainable design." },
  { id: "customized", label: "Customized concentration", desc: "Student-defined area with DUS approval." },
] as const;

export const EVST_CONCENTRATIONS: MajorConcentration[] = EVST_CONC_META.map((c) => ({
  id: c.id,
  label: c.label,
  description: c.desc,
  requirements: {
    BA: evstConc(c.id, c.label, c.desc, "BA"),
    BS: evstConc(c.id, c.label, c.desc, "BS"),
  },
}));

const SOCY_SENIOR: RequirementSlot[] = [
  { id: "senior_sem", label: "3000-level Sociology seminar", codePrefix: ["SOCY"], minLevel: 300, needCount: 1 },
  { id: "senior", label: "Senior essay (SOCY 4100)", codes: y(["SOCY 4100", "SOCY 410"]), needCount: 1 },
];

export const SOCY_CONCENTRATIONS: MajorConcentration[] = [
  {
    id: "economy-society",
    label: "Economy and Society",
    description: "Markets, inequality, and economic sociology.",
    requirements: {
      BA: {
        totalCourses: 13,
        core: [
          { id: "theory", label: "SOCY 2001 or 2002", codes: y(["SOCY 2001", "SOCY 2002"]), needCount: 1 },
          { id: "methods_design", label: "SOCY 2100 (research design)", codes: y(["SOCY 2100"]), needCount: 1 },
          { id: "microecon", label: "Intermediate microeconomics (ECON 2121 or 2125)", codes: y(["ECON 2121", "ECON 2125", "ECON 121"]), needCount: 1 },
          { id: "methods", label: "Social science methods", codes: y(["S&DS 100", "S&DS 110", "S&DS 363", "GLBL 2121"]), needCount: 1 },
          {
            id: "inequality_econ",
            label: "2 intermediate/advanced inequality or economic sociology courses",
            codePrefix: ["SOCY", "ECON"],
            minLevel: 200,
            needCount: 2,
          },
          { id: "electives", label: "SOCY electives toward 13 courses", codePrefix: ["SOCY"], needCount: 5 },
        ],
        senior: SOCY_SENIOR,
      },
    },
  },
  {
    id: "health-society",
    label: "Health and Society",
    description: "Medical sociology, stratification, and public health foundations.",
    requirements: {
      BA: {
        totalCourses: 13,
        core: [
          { id: "gateway", label: "SOCY 1600 or 1601", codes: y(["SOCY 1600", "SOCY 1601"]), needCount: 1 },
          { id: "theory", label: "SOCY 2001 or 2002", codes: y(["SOCY 2001", "SOCY 2002"]), needCount: 1 },
          { id: "methods_design", label: "SOCY 2100", codes: y(["SOCY 2100"]), needCount: 1 },
          { id: "methods", label: "Social science methods", codes: y(["S&DS 100", "S&DS 110", "S&DS 363"]), needCount: 1 },
          {
            id: "health_socy",
            label: "2 intermediate/advanced Sociology courses on health",
            codePrefix: ["SOCY"],
            minLevel: 200,
            needCount: 2,
          },
          {
            id: "outside",
            label: "Up to 5 approved courses outside SOCY (e.g. BIOL, ECON, MATH)",
            codePrefix: ["BIOL", "ECON", "MATH", "EPHD", "HLTH"],
            needCount: 3,
          },
          { id: "electives", label: "Additional SOCY courses", codePrefix: ["SOCY"], needCount: 3 },
        ],
        senior: SOCY_SENIOR,
      },
    },
  },
  {
    id: "data-society",
    label: "Data and Society",
    description: "Computational sociology, statistics, and data-intensive methods.",
    requirements: {
      BA: {
        totalCourses: 13,
        core: [
          { id: "theory", label: "SOCY 2001 or 2002", codes: y(["SOCY 2001", "SOCY 2002"]), needCount: 1 },
          { id: "methods_design", label: "SOCY 2100", codes: y(["SOCY 2100"]), needCount: 1 },
          { id: "intro_stats", label: "Intro statistics", codes: y(["S&DS 100", "S&DS 110", "S&DS 363", "GLBL 2121"]), needCount: 1 },
          { id: "adv_stats", label: "Intermediate/advanced statistics", codePrefix: ["SOCY", "S&DS"], minLevel: 200, needCount: 1 },
          { id: "methods_extra", label: "2 additional methods courses", codePrefix: ["SOCY", "S&DS", "CPSC"], minLevel: 200, needCount: 2 },
          { id: "indep_study", label: "Independent study as research assistant", codePrefix: ["SOCY"], minLevel: 400, needCount: 1 },
          { id: "electives", label: "SOCY electives", codePrefix: ["SOCY"], needCount: 4 },
        ],
        senior: SOCY_SENIOR,
      },
    },
  },
  {
    id: "inequality-race-society",
    label: "Inequality, Race, and Society",
    description: "Race, ethnicity, discrimination, and social inequality.",
    requirements: {
      BA: {
        totalCourses: 13,
        core: [
          { id: "gateway", label: "SOCY 1700", codes: y(["SOCY 1700", "SOCY 170"]), needCount: 1 },
          { id: "theory", label: "SOCY 2001 or 2002", codes: y(["SOCY 2001", "SOCY 2002"]), needCount: 1 },
          { id: "methods_design", label: "SOCY 2100", codes: y(["SOCY 2100"]), needCount: 1 },
          { id: "methods", label: "Social science methods", codes: y(["S&DS 100", "S&DS 110", "S&DS 363"]), needCount: 1 },
          {
            id: "race_inequality",
            label: "5 courses on race or inequality (up to 2 outside SOCY)",
            codePrefix: ["SOCY", "AFST", "AMST", "ER&M", "WGSS", "HIST"],
            minLevel: 200,
            needCount: 5,
          },
          { id: "electives", label: "Additional SOCY courses", codePrefix: ["SOCY"], needCount: 2 },
        ],
        senior: SOCY_SENIOR,
      },
    },
  },
  {
    id: "student-designed",
    label: "Student-designed concentration",
    description: "Combine sociology with another discipline; requires DUS approval by junior year.",
    requirements: {
      BA: {
        totalCourses: 13,
        core: [
          { id: "theory", label: "SOCY 2001 and 2002", codes: y(["SOCY 2001", "SOCY 2002"]), needCount: 2 },
          { id: "methods_design", label: "SOCY 2100", codes: y(["SOCY 2100"]), needCount: 1 },
          { id: "methods", label: "Social science methods", codes: y(["S&DS 100", "S&DS 110", "S&DS 363"]), needCount: 1 },
          { id: "seminar", label: "1 intermediate/advanced SOCY seminar", codePrefix: ["SOCY"], minLevel: 200, needCount: 1 },
          {
            id: "outside",
            label: "Up to 4 approved courses outside SOCY forming a coherent unit",
            codePrefix: ["ECON", "HIST", "PLSC", "ANTH", "WGSS", "GLBL"],
            needCount: 4,
          },
          { id: "electives", label: "SOCY electives", codePrefix: ["SOCY"], needCount: 3 },
        ],
        senior: SOCY_SENIOR,
      },
    },
  },
];
