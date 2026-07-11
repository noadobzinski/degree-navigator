import type { MajorConcentration, MajorRequirements, RequirementSlot } from "./types";
import { y } from "./course-codes";

/**
 * Molecular Biophysics & Biochemistry (MB&B) requirements, transcribed from the
 * 2026–2027 Yale College Programs of Study (YCPS) subjects-of-instruction page:
 * https://catalog.yale.edu/ycps/subjects-of-instruction/molecular-biophysics-biochemistry/
 *
 * The B.A. requires 9.5 credits (10 courses incl. senior); the B.S. requires
 * 12.5 credits (13 courses incl. senior). Introductory courses are tracked as
 * prerequisites and are not counted toward the degree total.
 *
 * MB&B offers six faculty-curated concentrations that appear on the official
 * transcript: Biochemistry; Biophysics and Structural Biology; Chemical Biology;
 * Computational Biology and Bioinformatics; Environment and Climate Change; and
 * Medicine. A concentration is a set of curated electives layered on top of the
 * standard major — electives that also satisfy a base requirement double-count,
 * so a concentration adds roughly zero to three extra credits.
 */

const MBB_INTRO_PREREQS: RequirementSlot[] = [
  {
    id: "bio_intro",
    label: "Biochemistry, Biophysics & Cell Biology (BIOL 1010 & 1020)",
    codes: y(["BIOL 101", "BIOL 102"]),
    needCount: 2,
  },
  {
    id: "gen_chem",
    label: "Two terms general chemistry with labs (CHEM 1610/1650 & 1340L/1360L)",
    codes: y(["CHEM 161", "CHEM 165", "CHEM 1340L", "CHEM 1360L"]),
    needCount: 2,
  },
  {
    id: "orgo",
    label: "One term organic chemistry with lab (CHEM 2200/1740 & 2220L)",
    codes: y(["CHEM 220", "CHEM 174", "CHEM 2220L"]),
    needCount: 1,
  },
  {
    id: "calc",
    label: "Two terms calculus (MATH 1120 & 1150, or MATH 1160)",
    codes: y(["MATH 112", "MATH 115", "MATH 116"]),
    needCount: 2,
  },
];

/** Standard B.A. — 9.5 credits (10 courses incl. senior), no concentration. */
function mbbBaBase(): MajorRequirements {
  return {
    totalCourses: 10,
    prerequisites: MBB_INTRO_PREREQS,
    core: [
      {
        id: "biophysics",
        label: "3 biophysics credits: MB&B 2750 or CHEM 3320, plus PHYS 1700 & 1710 (or higher)",
        codes: y(["MB&B 275", "CHEM 332", "PHYS 170", "PHYS 171"]),
        needCount: 3,
      },
      {
        id: "biochemistry",
        label:
          "3 biochemistry credits: MB&B 3000, MB&B 3010, and CHEM 1750 (or a 2000-level chem course)",
        codes: y(["MB&B 300", "MB&B 301", "CHEM 175"]),
        needCount: 3,
      },
      {
        id: "science_society",
        label: "Science & Society (0.5 credit): MB&B 2680 or DUS-approved alternative",
        codes: y([
          "MB&B 2680",
          "MB&B 1070",
          "BLST 1370",
          "HSHM 2060",
          "HSHM 4060",
          "HSHM 4240",
          "HSHM 4750",
          "HSHM 4810",
          "HIST 1779",
          "SOCY 1600",
          "SOCY 1601",
          "SOCY 3760",
          "MCDB 3750",
          "WGSS 2270",
          "WGSS 4457",
        ]),
        needCount: 1,
      },
      {
        id: "practical_skills",
        label:
          "1 practical skills credit (physics lab, biochem lab, or critical tools; ≥0.5 from MB&B)",
        codes: y([
          "MB&B 1210L",
          "MB&B 1220L",
          "MB&B 1230L",
          "MB&B 1240L",
          "MB&B 2510L",
          "MB&B 4350",
          "MB&B 4700",
          "PHYS 1650L",
          "PHYS 1660L",
          "CHEM 3550L",
          "S&DS 2380",
          "CPSC 1001",
        ]),
        codePrefix: ["MB&B"],
        needCount: 1,
      },
      {
        id: "mbb_elective",
        label: "1 MB&B elective (2000-level or higher lecture or seminar)",
        codePrefix: ["MB&B"],
        minLevel: 200,
        needCount: 1,
      },
    ],
    senior: [
      {
        id: "senior",
        label: "Senior essay (MB&B 4900 or MB&B 4910)",
        codes: y(["MB&B 4900", "MB&B 4910"]),
        needCount: 1,
      },
    ],
  };
}

/** Standard B.S. — 12.5 credits (13 courses incl. senior), no concentration. */
function mbbBsBase(): MajorRequirements {
  const ba = mbbBaBase();
  return {
    totalCourses: 13,
    prerequisites: MBB_INTRO_PREREQS,
    core: [
      {
        id: "biophysics",
        label:
          "4 biophysics credits: MB&B 2750 or CHEM 3320, PHYS 1700 & 1710 (or higher), plus one 3000-level physical science/math/stats/CS course",
        codes: y(["MB&B 275", "CHEM 332", "PHYS 170", "PHYS 171"]),
        codePrefix: ["PHYS", "CHEM", "MATH", "S&DS", "CPSC", "MB&B"],
        minLevel: 170,
        needCount: 4,
      },
      ba.core[1]!, // biochemistry (3 credits)
      ba.core[2]!, // science & society
      {
        id: "practical_skills",
        label:
          "2 practical skills credits (physics lab, biochem lab, or critical tools; ≥0.5 from MB&B)",
        codes: y([
          "MB&B 1210L",
          "MB&B 1220L",
          "MB&B 1230L",
          "MB&B 1240L",
          "MB&B 2510L",
          "MB&B 4350",
          "MB&B 4700",
          "PHYS 1650L",
          "PHYS 1660L",
          "CHEM 3550L",
          "S&DS 2380",
          "CPSC 1001",
        ]),
        codePrefix: ["MB&B"],
        needCount: 2,
      },
      {
        id: "mbb_elective",
        label: "1 MB&B elective (2000-level or higher lecture or seminar)",
        codePrefix: ["MB&B"],
        minLevel: 200,
        needCount: 1,
      },
      {
        id: "stem_elective",
        label: "1 additional 2000-level or higher STEM seminar or lecture course",
        codePrefix: ["MB&B", "MCDB", "CHEM", "PHYS", "BENG", "EEB", "S&DS", "CPSC", "MATH", "NSCI"],
        minLevel: 200,
        needCount: 1,
      },
    ],
    senior: [
      {
        id: "senior",
        label: "Senior essay (MB&B 4900 or MB&B 4910)",
        codes: y(["MB&B 4900", "MB&B 4910"]),
        needCount: 1,
      },
    ],
  };
}

export const MBB_BASE_REQUIREMENTS = {
  BA: mbbBaBase(),
  BS: mbbBsBase(),
};

type ConcParts = {
  /** Extra introductory courses (BIOL 1030/1040, etc.). */
  prereqs?: RequirementSlot[];
  /** Concentration-specific curated electives added to core. */
  core: RequirementSlot[];
  /** Extra degree credits this concentration adds beyond the base (0–3). */
  addedCredits?: number;
};

/**
 * Build a concentration variant. A concentration keeps the full base major
 * requirements and appends its curated slots; some slots may double-count with
 * base electives, so `addedCredits` reflects the net credits added to the total.
 */
function mbbConcentration(base: MajorRequirements, parts: ConcParts): MajorRequirements {
  return {
    ...base,
    totalCourses: base.totalCourses + (parts.addedCredits ?? 0),
    prerequisites: [...(base.prerequisites ?? []), ...(parts.prereqs ?? [])],
    core: [...base.core, ...parts.core],
  };
}

const BIOL_GEN_EVO: RequirementSlot = {
  id: "conc_biol_gen_evo",
  label: "Genetics & Development and Ecology & Evolution (BIOL 1030 & 1040)",
  codes: y(["BIOL 103", "BIOL 104"]),
  needCount: 2,
};

const BIOCHEMISTRY: MajorConcentration = {
  id: "biochemistry",
  label: "Biochemistry",
  description:
    "Structure and function of nucleic acids and proteins in life processes; strong preparation for PhD, MD, and MD/PhD programs.",
  requirements: {
    BA: mbbConcentration(MBB_BASE_REQUIREMENTS.BA, {
      prereqs: [BIOL_GEN_EVO],
      addedCredits: 2,
      core: [
        {
          id: "conc_mol_cell",
          label:
            "Molecular, Cellular, or Organismal Biology (MCDB 2050, MCDB 2020, or DUS-approved)",
          codes: y(["MCDB 205", "MCDB 202"]),
          needCount: 1,
        },
        {
          id: "conc_research",
          label: "Research in Biochemistry (MB&B 4700 or course-based undergraduate research)",
          codes: y(["MB&B 4700"]),
          needCount: 1,
        },
        {
          id: "conc_adv_chembio",
          label: "Advanced chemical biology lecture/seminar (MB&B 3650, 3310, 4450, 4490, or 4430)",
          codes: y(["MB&B 3650", "MB&B 331", "MB&B 4450", "MB&B 4490", "MB&B 4430"]),
          needCount: 1,
        },
      ],
    }),
    BS: mbbConcentration(MBB_BASE_REQUIREMENTS.BS, {
      prereqs: [BIOL_GEN_EVO],
      addedCredits: 3,
      core: [
        {
          id: "conc_mol_cell",
          label:
            "Molecular, Cellular, or Organismal Biology (MCDB 2050, MCDB 2020, or DUS-approved)",
          codes: y(["MCDB 205", "MCDB 202"]),
          needCount: 1,
        },
        {
          id: "conc_research",
          label: "Research in Biochemistry (MB&B 4700 or course-based undergraduate research)",
          codes: y(["MB&B 4700"]),
          needCount: 1,
        },
        {
          id: "conc_adv_chembio",
          label:
            "2 advanced chemical biology lectures/seminars (MB&B 3650, 3310, 4450, 4490, or 4430)",
          codes: y(["MB&B 3650", "MB&B 331", "MB&B 4450", "MB&B 4490", "MB&B 4430"]),
          needCount: 2,
        },
      ],
    }),
  },
};

const BIOPHYSICS_STRUCTURAL: MajorConcentration = {
  id: "biophysics-structural-biology",
  label: "Biophysics and Structural Biology",
  description:
    "Quantitative and physical tools — linear algebra, Fourier analysis, diffraction, imaging, spectroscopy — for atomic-resolution structure and biomolecular dynamics.",
  requirements: {
    BA: mbbConcentration(MBB_BASE_REQUIREMENTS.BA, {
      addedCredits: 2,
      core: [
        {
          id: "conc_cs_math_stats",
          label: "CS/Math/Statistics (MATH 1200, MATH 2250, S&DS 1000+, or CPSC 1001)",
          codes: y(["MATH 120", "MATH 225", "CPSC 1001"]),
          codePrefix: ["S&DS"],
          minLevel: 100,
          needCount: 1,
        },
        {
          id: "conc_research",
          label: "Research (MB&B 4700, CHEM 3550L, or course-based undergraduate research)",
          codes: y(["MB&B 4700", "CHEM 3550L"]),
          needCount: 1,
        },
        {
          id: "conc_adv_biophysics",
          label:
            "Advanced biophysics/structural biology lecture or seminar (MB&B 4200, MB&B 5200, or DUS-approved)",
          codes: y(["MB&B 4200", "MB&B 5200"]),
          needCount: 1,
        },
      ],
    }),
    BS: mbbConcentration(MBB_BASE_REQUIREMENTS.BS, {
      addedCredits: 3,
      core: [
        {
          id: "conc_cs_math_stats",
          label: "CS/Math/Statistics (MATH 1200, MATH 2250, S&DS 2380, or CPSC 1001)",
          codes: y(["MATH 120", "MATH 225", "S&DS 2380", "CPSC 1001"]),
          needCount: 1,
        },
        {
          id: "conc_biophys_chem",
          label:
            "Biophysical chemistry (CHEM 3320, or a 3000+ elective in thermodynamics, statistical mechanics, quantum mechanics, or spectroscopy)",
          codes: y(["CHEM 332"]),
          codePrefix: ["CHEM"],
          minLevel: 300,
          needCount: 1,
        },
        {
          id: "conc_tools",
          label:
            "Tools & quantitative analysis (2000+ course: MB&B 3300, 4200, 4350, CHEM 3330, 4060, 4920, or DUS-approved)",
          codes: y(["MB&B 3300", "MB&B 4200", "MB&B 4350", "CHEM 3330", "CHEM 4060", "CHEM 4920"]),
          needCount: 1,
        },
        {
          id: "conc_research",
          label: "Research (MB&B 4700, CHEM 3550L, or course-based undergraduate research)",
          codes: y(["MB&B 4700", "CHEM 3550L"]),
          needCount: 1,
        },
        {
          id: "conc_adv_biophysics",
          label:
            "Advanced biophysics/structural biology lecture or seminar (MB&B 4200, MB&B 5200, or DUS-approved)",
          codes: y(["MB&B 4200", "MB&B 5200"]),
          needCount: 1,
        },
      ],
    }),
  },
};

const CHEMICAL_BIOLOGY: MajorConcentration = {
  id: "chemical-biology",
  label: "Chemical Biology",
  description:
    "Tools and concepts of chemistry to understand and manipulate biological processes; preparation for chemical biology, drug development, and biotechnology.",
  requirements: {
    BA: mbbConcentration(MBB_BASE_REQUIREMENTS.BA, {
      addedCredits: 2,
      core: [
        {
          id: "conc_orgo2",
          label: "Second semester organic chemistry with half-credit lab (CHEM 2210 & 2220L)",
          codes: y(["CHEM 221", "CHEM 2220L"]),
          needCount: 1,
        },
        {
          id: "conc_cell_bio",
          label: "One 2000+ elective in cell-based biology",
          codePrefix: ["MCDB", "MB&B", "BENG"],
          minLevel: 200,
          needCount: 1,
        },
        {
          id: "conc_research",
          label:
            "Research in Chemical Biology (MB&B 4700, MB&B 3640, or course-based undergraduate research)",
          codes: y(["MB&B 4700", "MB&B 3640"]),
          needCount: 1,
        },
        {
          id: "conc_adv_chembio",
          label:
            "Advanced chemical biology lecture or seminar (MB&B 4430, CHEM 4190, or DUS-approved)",
          codes: y(["MB&B 4430", "CHEM 4190"]),
          needCount: 1,
        },
      ],
    }),
    BS: mbbConcentration(MBB_BASE_REQUIREMENTS.BS, {
      addedCredits: 3,
      core: [
        {
          id: "conc_orgo2",
          label: "Second semester organic chemistry with half-credit lab (CHEM 2210 & 2220L)",
          codes: y(["CHEM 221", "CHEM 2220L"]),
          needCount: 1,
        },
        {
          id: "conc_cell_chem",
          label:
            "Cell biology & chemistry: two 2000+ and one 3000+ electives in chemistry or cell biology (≥1 credit covering cell biology or chemistry)",
          codePrefix: ["CHEM", "MCDB", "MB&B"],
          minLevel: 200,
          needCount: 3,
        },
        {
          id: "conc_research",
          label:
            "Research in Chemical Biology (MB&B 4700, MB&B 3640, or course-based undergraduate research)",
          codes: y(["MB&B 4700", "MB&B 3640"]),
          needCount: 1,
        },
        {
          id: "conc_adv_chembio",
          label:
            "Advanced chemical biology lecture or seminar (MB&B 4430, CHEM 4190, or DUS-approved)",
          codes: y(["MB&B 4430", "CHEM 4190"]),
          needCount: 1,
        },
      ],
    }),
  },
};

const COMPUTATIONAL_BIO: MajorConcentration = {
  id: "computational-biology-bioinformatics",
  label: "Computational Biology and Bioinformatics",
  description:
    "Computer science, data science, statistics, and biology; preparation for computational biology, bioinformatics, medical informatics, or biotechnology.",
  requirements: {
    BA: mbbConcentration(MBB_BASE_REQUIREMENTS.BA, {
      prereqs: [
        {
          id: "conc_genetics_evo",
          label: "Genetics & Evolutionary Biology (BIOL 1030 & 1040)",
          codes: y(["BIOL 103", "BIOL 104"]),
          needCount: 2,
        },
      ],
      addedCredits: 3,
      core: [
        {
          id: "conc_cpsc",
          label: "Computer science (CPSC 2010)",
          codes: y(["CPSC 2010"]),
          needCount: 1,
        },
        {
          id: "conc_stats",
          label: "Statistics (one S&DS 1000+ course)",
          codePrefix: ["S&DS"],
          minLevel: 100,
          needCount: 1,
        },
        {
          id: "conc_adv_compbio",
          label:
            "Advanced computational biology & bioinformatics (MB&B 3520, CPSC 4530, or DUS-approved)",
          codes: y(["MB&B 3520", "CPSC 4530"]),
          needCount: 1,
        },
      ],
    }),
    BS: mbbConcentration(MBB_BASE_REQUIREMENTS.BS, {
      addedCredits: 3,
      core: [
        {
          id: "conc_genetics",
          label:
            "Genetics/evolutionary biology (one 2000+ elective: MCDB 2000, MCDB 2020, MCDB 3100, or MB&B 3310)",
          codes: y(["MCDB 200", "MCDB 202", "MCDB 310", "MB&B 331"]),
          needCount: 1,
        },
        {
          id: "conc_cpsc",
          label: "Computer science, math, statistics (CPSC 2230, CPSC 2010, and S&DS 2380)",
          codes: y(["CPSC 2230", "CPSC 2010", "S&DS 2380"]),
          needCount: 3,
        },
        {
          id: "conc_adv_compbio",
          label:
            "Advanced computational biology & bioinformatics (MB&B 3520, CPSC 4530, or DUS-approved)",
          codes: y(["MB&B 3520", "CPSC 4530"]),
          needCount: 1,
        },
      ],
    }),
  },
};

const ENVIRONMENT_CLIMATE: MajorConcentration = {
  id: "environment-climate-change",
  label: "Environment and Climate Change",
  description:
    "Life processes as they affect and are affected by the environment, human activity, and climate change.",
  requirements: {
    BA: mbbConcentration(MBB_BASE_REQUIREMENTS.BA, {
      addedCredits: 2,
      core: [
        {
          id: "conc_env_chem",
          label:
            "Environmental chemistry (2000+ course: EVST 3307, EPS 3100, CHEM 2520, or ENVE 4380)",
          codes: y(["EVST 3307", "EPS 3100", "CHEM 2520", "ENVE 4380"]),
          needCount: 1,
        },
        {
          id: "conc_quant",
          label: "Math/statistics/CS (MATH 1200, 1210, 2220+, S&DS 1000+, or CPSC 1001+)",
          codes: y(["MATH 120", "MATH 121", "MATH 222", "CPSC 1001"]),
          codePrefix: ["S&DS"],
          minLevel: 100,
          needCount: 1,
        },
        {
          id: "conc_ecology",
          label: "Ecology & evolution (BIOL 1040, EEB 2225, or ANTH 2667)",
          codes: y(["BIOL 104", "EEB 2225", "ANTH 2667"]),
          needCount: 1,
        },
        {
          id: "conc_env_sci",
          label: "Environmental sciences (CENG 1200, EVST 2200/2550, EPS 1010/1250/1400/2320/2610)",
          codes: y([
            "CENG 1200",
            "EVST 2200",
            "EVST 2550",
            "EPS 1010",
            "EPS 1250",
            "EPS 1400",
            "EPS 2320",
            "EPS 2610",
          ]),
          needCount: 1,
        },
        {
          id: "conc_adv_env",
          label:
            "Advanced environment lecture/seminar (MB&B 3650, ENVE 4640/4100/3600/4380, EVST 4005, EPS 3550/3230)",
          codes: y([
            "MB&B 3650",
            "ENVE 4640",
            "ENVE 4100",
            "ENVE 3600",
            "ENVE 4380",
            "EVST 4005",
            "EPS 3550",
            "EPS 3230",
          ]),
          needCount: 1,
        },
      ],
    }),
    BS: mbbConcentration(MBB_BASE_REQUIREMENTS.BS, {
      addedCredits: 3,
      core: [
        {
          id: "conc_phys_env_sci",
          label:
            "Physical environmental science (3000+ course: EVST 3620, EPS 3100/3230/3350, CHEM 3320, or CHEM 3330)",
          codes: y(["EVST 3620", "EPS 3100", "EPS 3230", "EPS 3350", "CHEM 332", "CHEM 3330"]),
          needCount: 1,
        },
        {
          id: "conc_env_chem",
          label:
            "Environmental chemistry (2000+ course: EVST 3307, EPS 3100, CHEM 2520, or ENVE 4380)",
          codes: y(["EVST 3307", "EPS 3100", "CHEM 2520", "ENVE 4380"]),
          needCount: 1,
        },
        {
          id: "conc_quant",
          label: "Math/statistics/CS (MATH 1200, 1210, 2220+, S&DS 1000+, or CPSC 1001+)",
          codes: y(["MATH 120", "MATH 121", "MATH 222", "CPSC 1001"]),
          codePrefix: ["S&DS"],
          minLevel: 100,
          needCount: 1,
        },
        {
          id: "conc_ecology",
          label: "Ecology & evolution (BIOL 1040, EEB 2225, or ANTH 2667)",
          codes: y(["BIOL 104", "EEB 2225", "ANTH 2667"]),
          needCount: 1,
        },
        {
          id: "conc_env_sci",
          label: "Environmental sciences (CENG 1200, EVST 2200/2550, EPS 1010/1250/1400/2320/2610)",
          codes: y([
            "CENG 1200",
            "EVST 2200",
            "EVST 2550",
            "EPS 1010",
            "EPS 1250",
            "EPS 1400",
            "EPS 2320",
            "EPS 2610",
          ]),
          needCount: 1,
        },
        {
          id: "conc_adv_env",
          label:
            "2 advanced environment lectures/seminars (MB&B 3650, ENVE 4640/4100/3600/4380, EVST 4005, EPS 3550/3230)",
          codes: y([
            "MB&B 3650",
            "ENVE 4640",
            "ENVE 4100",
            "ENVE 3600",
            "ENVE 4380",
            "EVST 4005",
            "EPS 3550",
            "EPS 3230",
          ]),
          needCount: 2,
        },
      ],
    }),
  },
};

const MEDICINE: MajorConcentration = {
  id: "medicine",
  label: "Medicine",
  description:
    "Molecular basis of physiology and disease; preparation for biomedical sciences, biotechnology, or medical school.",
  requirements: {
    BA: mbbConcentration(MBB_BASE_REQUIREMENTS.BA, {
      prereqs: [
        {
          id: "conc_genetics_dev",
          label: "Genetics & Development (BIOL 1030 & 1040)",
          codes: y(["BIOL 103", "BIOL 104"]),
          needCount: 2,
        },
      ],
      addedCredits: 4,
      core: [
        {
          id: "conc_orgo2",
          label: "Second term organic chemistry (CHEM 1750 or CHEM 2210)",
          codes: y(["CHEM 175", "CHEM 221"]),
          needCount: 1,
        },
        {
          id: "conc_stats",
          label:
            "Statistics (S&DS 1000+, or a 2000+ MATH course in linear algebra, probability, statistics, or stochastic processes)",
          codePrefix: ["S&DS", "MATH"],
          minLevel: 100,
          needCount: 1,
        },
        {
          id: "conc_psyc",
          label: "Psychology (PSYC 1100 or higher)",
          codes: y(["PSYC 110"]),
          codePrefix: ["PSYC"],
          minLevel: 110,
          needCount: 1,
        },
        {
          id: "conc_phys_lab",
          label: "Physics lab (MB&B 1210L/1240L, PHYS 1650L/1660L, MB&B 3640, or DUS-approved)",
          codes: y(["MB&B 1210L", "MB&B 1240L", "PHYS 1650L", "PHYS 1660L", "MB&B 3640"]),
          needCount: 1,
        },
        {
          id: "conc_research",
          label:
            "Biomedical research (MB&B 4700, MB&B 2510L, MCDB 2910L, or course-based undergraduate research)",
          codes: y(["MB&B 4700", "MB&B 2510L", "MCDB 2910L"]),
          needCount: 1,
        },
        {
          id: "conc_adv_seminar",
          label: "Advanced seminar (MB&B 4450, 3520, 4490, MCDB 3150, 4500, or DUS-approved)",
          codes: y(["MB&B 4450", "MB&B 3520", "MB&B 4490", "MCDB 3150", "MCDB 4500"]),
          needCount: 1,
        },
      ],
    }),
    BS: mbbConcentration(MBB_BASE_REQUIREMENTS.BS, {
      prereqs: [
        {
          id: "conc_genetics_dev",
          label: "Genetics & Development (BIOL 1030 & 1040)",
          codes: y(["BIOL 103", "BIOL 104"]),
          needCount: 2,
        },
      ],
      addedCredits: 3,
      core: [
        {
          id: "conc_orgo2",
          label: "Second term organic chemistry (CHEM 1750 or CHEM 2210)",
          codes: y(["CHEM 175", "CHEM 221"]),
          needCount: 1,
        },
        {
          id: "conc_stats",
          label:
            "Statistics (S&DS 1000+, or a 2000+ MATH course in linear algebra, probability, statistics, or stochastic processes)",
          codePrefix: ["S&DS", "MATH"],
          minLevel: 100,
          needCount: 1,
        },
        {
          id: "conc_psyc",
          label: "Psychology (PSYC 1100 or higher)",
          codes: y(["PSYC 110"]),
          codePrefix: ["PSYC"],
          minLevel: 110,
          needCount: 1,
        },
        {
          id: "conc_phys_lab",
          label: "Physics lab (MB&B 1210L/1240L, PHYS 1650L/1660L, MB&B 3640, or DUS-approved)",
          codes: y(["MB&B 1210L", "MB&B 1240L", "PHYS 1650L", "PHYS 1660L", "MB&B 3640"]),
          needCount: 1,
        },
        {
          id: "conc_research",
          label:
            "Biomedical research (MB&B 4700, MB&B 2510L, MCDB 2910L, or course-based undergraduate research)",
          codes: y(["MB&B 4700", "MB&B 2510L", "MCDB 2910L"]),
          needCount: 1,
        },
        {
          id: "conc_adv_seminar",
          label: "Advanced seminar (MB&B 4450, 3520, 4490, MCDB 3150, 4500, or DUS-approved)",
          codes: y(["MB&B 4450", "MB&B 3520", "MB&B 4490", "MCDB 3150", "MCDB 4500"]),
          needCount: 1,
        },
      ],
    }),
  },
};

export const MBB_CONCENTRATIONS: MajorConcentration[] = [
  BIOCHEMISTRY,
  BIOPHYSICS_STRUCTURAL,
  CHEMICAL_BIOLOGY,
  COMPUTATIONAL_BIO,
  ENVIRONMENT_CLIMATE,
  MEDICINE,
];
