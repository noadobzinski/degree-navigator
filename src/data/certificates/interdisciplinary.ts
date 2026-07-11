import { y } from "../majors/course-codes";
import { attributeElectives, YC } from "./helpers";
import type { Certificate } from "./types";

export const INTERDISCIPLINARY_CERTIFICATES: Certificate[] = [
  {
    id: "computing-culture-society",
    name: "Computing, Culture & Society",
    department: "Computer Science",
    category: "interdisciplinary",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/critical-computing/",
    description:
      "Five credits incl. CPSC 2265/AMST 2265. Non-CS majors take one intro computing + one from each of categories 2–4; CS majors take 4 from categories 2–4.",
    requirements: [
      {
        id: "survey",
        label: "Topics in Critical Computing (CPSC 2265 / AMST 2265)",
        codes: y(["CPSC 2265", "AMST 2265"]),
        needCount: 1,
      },
      {
        id: "intro_computing",
        label: "Introduction to computing (non-CS majors; 1)",
        codes: y(["CPSC 100", "CPSC 110", "CPSC 201"]),
        needCount: 1,
      },
      {
        id: "social",
        label: "Social research, politics, law & economics (1; YC CSOC attribute)",
        codePrefix: ["CPSC", "AMST", "PLSC", "ECON", "SOCY", "LAW", "GLBL"],
        minLevel: 200,
        needCount: 1,
      },
      {
        id: "history_media",
        label: "History, digital media & culture (1; YC CSOC attribute)",
        codePrefix: ["CPSC", "AMST", "FILM", "HIST", "ENGL", "THST"],
        minLevel: 200,
        needCount: 1,
      },
      {
        id: "intersections",
        label: "Science, technology & society intersections (1; YC CSOC attribute)",
        codePrefix: ["CPSC", "AMST", "HIST", "SOCY", "ANTH", "EVST", "HSHM"],
        minLevel: 200,
        needCount: 1,
      },
    ],
  },
  {
    id: "climate-science-and-solutions",
    name: "Climate Science and Solutions",
    department: "Earth & Planetary Sciences",
    category: "interdisciplinary",
    catalogUrl:
      "https://catalog.yale.edu/ycps/subjects-of-instruction/climate-science-and-solutions/",
    description:
      "Six courses: one in each of three pillars (Basic Climate Sci, Anthropogenic Climate, Climate Solutions), plus 3 electives incl. one climate seminar; 3 must be SET focus. Max 2 overlap with major.",
    requirements: [
      attributeElectives({
        id: "basic_climate",
        label: "Basic climate science (1)",
        needCount: 1,
        requiredAttributes: [...YC.climateBasic],
      }),
      attributeElectives({
        id: "anthropogenic",
        label: "Anthropogenic climate change (1)",
        needCount: 1,
        requiredAttributes: [...YC.climateAnthropogenic],
      }),
      attributeElectives({
        id: "solutions",
        label: "Climate solutions (1)",
        needCount: 1,
        requiredAttributes: [...YC.climateSolutions],
      }),
      attributeElectives({
        id: "electives",
        label: "Additional climate courses (2)",
        needCount: 2,
        requiredAttributes: [...YC.climateElective],
      }),
      attributeElectives({
        id: "seminar",
        label: "Climate science & solutions seminar (1)",
        needCount: 1,
        requiredAttributes: [...YC.climateSeminar],
      }),
    ],
  },
  {
    id: "education-studies",
    name: "Education Studies",
    department: "Education Studies",
    category: "interdisciplinary",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/education-studies/",
    description:
      "Five courses: EDST 1110, theory & research, policy or pedagogy, and two electives. Max 2 credits may overlap with major.",
    requirements: [
      {
        id: "gateway",
        label: "Foundations (EDST 1110)",
        codes: y(["EDST 1110", "EDST 111"]),
        needCount: 1,
      },
      {
        id: "theory",
        label: "Theory & research (1 approved EDST course)",
        codePrefix: ["EDST"],
        minLevel: 100,
        needCount: 1,
      },
      {
        id: "policy_or_pedagogy",
        label: "Policy or pedagogy (1 approved course)",
        codePrefix: ["EDST", "SOCY", "ECON", "PLSC", "PSYC"],
        minLevel: 100,
        needCount: 1,
      },
      {
        id: "electives",
        label: "Education Studies electives (2)",
        codePrefix: ["EDST"],
        needCount: 2,
      },
    ],
  },
  {
    id: "education-studies-scholars-intensive",
    name: "Education Studies Scholars Intensive",
    department: "Education Studies",
    category: "interdisciplinary",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/education-studies/",
    description:
      "Selective cohort program: EDST 1110, EDST 1261, policy/pedagogy, field experience, and capstone (EDST 4400 + 4410/4490). Apply sophomore fall.",
    requiresApplication: true,
    requirements: [
      {
        id: "gateway",
        label: "Foundations (EDST 1110)",
        codes: y(["EDST 1110", "EDST 111"]),
        needCount: 1,
      },
      {
        id: "theory",
        label: "Theory & research (EDST 1261)",
        codes: y(["EDST 1261", "EDST 126"]),
        needCount: 1,
      },
      {
        id: "policy_or_pedagogy",
        label: "Policy or pedagogy (1 approved course)",
        codePrefix: ["EDST", "SOCY", "ECON", "PLSC", "PSYC"],
        minLevel: 100,
        needCount: 1,
      },
      {
        id: "capstone_1",
        label: "Capstone seminar (EDST 4400)",
        codes: y(["EDST 4400", "EDST 440"]),
        needCount: 1,
      },
      {
        id: "capstone_2",
        label: "Capstone project (EDST 4410 or EDST 4490)",
        codes: y(["EDST 4410", "EDST 4490", "EDST 441", "EDST 449"]),
        needCount: 1,
      },
    ],
  },
  {
    id: "energy-studies",
    name: "Energy Studies",
    department: "Energy Studies",
    category: "interdisciplinary",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/energy-studies/",
    description:
      "Six credits across three tracks (2 each). ENRG 3000 required (Energy & Society). Max 2 credits may overlap with major.",
    requirements: [
      {
        id: "science_tech",
        label: "Energy Science & Technology (2 courses)",
        codePrefix: ["ENRG", "ENAS", "PHYS", "CHEM", "EEB", "CENG"],
        needCount: 2,
      },
      {
        id: "environment",
        label: "Energy & Environment (2 courses)",
        codePrefix: ["ENRG", "EVST", "EEB", "G&G", "F&ES"],
        needCount: 2,
      },
      {
        id: "society",
        label: "Energy & Society (2 courses, incl. ENRG 3000)",
        codes: y(["ENRG 3000", "ENRG 300"]),
        codePrefix: ["ENRG", "EVST", "ECON", "PLSC", "HIST"],
        needCount: 2,
      },
    ],
  },
  {
    id: "food-agriculture-climate-change",
    name: "Food, Agriculture, and Climate Change",
    department: "Yale Sustainable Food Program",
    category: "interdisciplinary",
    catalogUrl:
      "https://catalog.yale.edu/ycps/subjects-of-instruction/food_agriculture_climate_change/",
    description:
      "Five courses: 2 consumption (YC Food Consumption), 1 environment (YC Food Environment), 2 production (YC Food Production). Plus co-curricular summary.",
    requirements: [
      attributeElectives({
        id: "consumption",
        label: "Consumption / food (2)",
        needCount: 2,
        requiredAttributes: [...YC.foodConsumption],
      }),
      attributeElectives({
        id: "environment",
        label: "Environment / climate change (1)",
        needCount: 1,
        requiredAttributes: [...YC.foodEnvironment],
      }),
      attributeElectives({
        id: "production",
        label: "Production / agriculture (2)",
        needCount: 2,
        requiredAttributes: [...YC.foodProduction],
      }),
    ],
  },
  {
    id: "global-health-studies",
    name: "Global Health Studies",
    department: "Global Health Studies",
    category: "interdisciplinary",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/global-health-studies/",
    description:
      "Six courses for Global Health Scholars: HLTH 2300, four competency electives, HLTH 4900 senior colloquium. Apply sophomore fall.",
    requiresApplication: true,
    requirements: [
      {
        id: "intro",
        label: "Global health introductory lecture (HLTH 2300)",
        codes: y(["HLTH 2300", "HLTH 230"]),
        needCount: 1,
      },
      attributeElectives({
        id: "competency_1",
        label: "Global health competency elective (1 of 6 areas)",
        needCount: 1,
        requiredAttributes: [...YC.glhthAny],
      }),
      attributeElectives({
        id: "competency_2",
        label: "Global health competency elective (2 of 6 areas)",
        needCount: 1,
        requiredAttributes: [...YC.glhthAny],
      }),
      attributeElectives({
        id: "competency_3",
        label: "Global health competency elective (3 of 6 areas)",
        needCount: 1,
        requiredAttributes: [...YC.glhthAny],
      }),
      attributeElectives({
        id: "competency_4",
        label: "Global health competency elective (4 of 6 areas)",
        needCount: 1,
        requiredAttributes: [...YC.glhthAny],
      }),
      {
        id: "colloquium",
        label: "Senior colloquium (HLTH 4900)",
        codes: y(["HLTH 4900", "HLTH 490"]),
        needCount: 1,
      },
    ],
  },
  {
    id: "human-rights",
    name: "Human Rights Studies",
    department: "Jackson School of Global Affairs",
    category: "interdisciplinary",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/human-rights/",
    description:
      "Gateway GLBL 3102/3103 plus 4 electives with at least one Domestic and one International (YC Human Rights course attributes).",
    requirements: [
      {
        id: "gateway",
        label: "Gateway (GLBL 3102 or GLBL 3103)",
        codes: y(["GLBL 3102", "GLBL 3103"]),
        needCount: 1,
      },
      attributeElectives({
        id: "domestic",
        label: "Domestic human rights elective (1)",
        needCount: 1,
        requiredAttributes: [...YC.humanRightsDomestic],
      }),
      attributeElectives({
        id: "international",
        label: "International human rights elective (1)",
        needCount: 1,
        requiredAttributes: [...YC.humanRightsInternational],
      }),
      attributeElectives({
        id: "electives",
        label: "Additional human rights electives (2)",
        needCount: 2,
        requiredAttributes: [...YC.humanRightsAny],
      }),
    ],
  },
  {
    id: "human-rights-intensive",
    name: "Human Rights Studies Intensive",
    department: "Jackson School of Global Affairs",
    category: "interdisciplinary",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/human-rights/",
    description:
      "Selective cohort: GLBL 3102/3103, five electives (≥1 domestic + ≥1 international), senior colloquium. Apply sophomore spring.",
    requiresApplication: true,
    requirements: [
      {
        id: "gateway",
        label: "Gateway (GLBL 3102 or GLBL 3103)",
        codes: y(["GLBL 3102", "GLBL 3103"]),
        needCount: 1,
      },
      attributeElectives({
        id: "domestic",
        label: "Domestic human rights elective (1)",
        needCount: 1,
        requiredAttributes: [...YC.humanRightsDomestic],
      }),
      attributeElectives({
        id: "international",
        label: "International human rights elective (1)",
        needCount: 1,
        requiredAttributes: [...YC.humanRightsInternational],
      }),
      attributeElectives({
        id: "electives",
        label: "Additional human rights electives (3)",
        needCount: 3,
        requiredAttributes: [...YC.humanRightsAny],
      }),
    ],
  },
  {
    id: "islamic-studies",
    name: "Islamic Studies",
    department: "Near Eastern Languages and Civilizations",
    category: "interdisciplinary",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/islamic-studies/",
    description:
      "Five courses: one in each of four areas (Art/Architecture/Literature, History, Religion, Society) plus one elective. Max 2 overlap with major.",
    requirements: [
      attributeElectives({
        id: "art_lit",
        label: "Islamic art, architecture, or literature (1)",
        needCount: 1,
        requiredAttributes: [...YC.islamicArt],
      }),
      attributeElectives({
        id: "history",
        label: "Islamic history (1)",
        needCount: 1,
        requiredAttributes: [...YC.islamicHistory],
      }),
      attributeElectives({
        id: "religion",
        label: "Islamic religion (1)",
        needCount: 1,
        requiredAttributes: [...YC.islamicReligion],
      }),
      attributeElectives({
        id: "society",
        label: "Islamic society (1)",
        needCount: 1,
        requiredAttributes: [...YC.islamicAny],
        description:
          "Courses with an Islamic Studies area attribute (art/history/religion) or NELC foundations.",
      }),
      attributeElectives({
        id: "elective",
        label: "Islamic Studies elective (any area)",
        needCount: 1,
        requiredAttributes: [...YC.islamicAny],
      }),
    ],
  },
  {
    id: "medieval-studies",
    name: "Medieval Studies",
    department: "Medieval Studies",
    category: "interdisciplinary",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/medieval_studies/",
    description:
      "Five medieval-topic courses; max 3 from one geographic zone (East/SE Asia, S/C Asia, Near East/N Africa, Europe/Russia/N Atlantic). Plus 3 lecture write-ups.",
    requirements: [
      attributeElectives({
        id: "medieval_courses",
        label: "Medieval topic courses (5; max 3 per geographic zone)",
        needCount: 5,
        requiredAttributes: [...YC.mdvlAny],
        description:
          "Courses must carry a YC MDVL attribute. Zone limits (max 3 per region) are not enforced here — confirm with the Medieval Studies director.",
      }),
    ],
  },
  {
    id: "native-american-indigenous-studies",
    name: "Native American and Indigenous Studies",
    department: "Native American Cultural Center",
    category: "interdisciplinary",
    catalogUrl:
      "https://catalog.yale.edu/ycps/subjects-of-instruction/native-american-indigenous-studies/",
    description:
      "Five Indigenous-topic courses from ≥3 of 5 focus areas (max 2 per area). Optional capstone. Apply by junior year.",
    requirements: [
      attributeElectives({
        id: "indigenous_courses",
        label: "Indigenous topic courses (5 from ≥3 of 5 focus areas; max 2 per area)",
        needCount: 5,
        requiredAttributes: [...YC.naisAny],
        description:
          "Courses must carry a YC NAIS attribute. Focus-area and per-area limits are not enforced here — confirm with NAIS.",
      }),
    ],
  },
  {
    id: "persian-iranian-studies",
    name: "Persian and Iranian Studies",
    department: "Near Eastern Languages and Civilizations",
    category: "interdisciplinary",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/persian-and-iranian/",
    description:
      "Five courses: 3 content (YC Persia & Iran Content; max 2 from same dept) + 2 Persian language (L1–L5). Grade B minimum.",
    requirements: [
      attributeElectives({
        id: "content",
        label: "Persia & Iran content courses (3; max 2 from same dept)",
        needCount: 3,
        requiredAttributes: [...YC.persiaContent],
      }),
      {
        id: "language",
        label: "Persian language courses (2; L1–L5)",
        codePrefix: ["PERS"],
        minLevel: 1100,
        needCount: 2,
      },
    ],
  },
  {
    id: "translation-studies",
    name: "Translation Studies",
    department: "Slavic Languages and Literatures",
    category: "interdisciplinary",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/translation_studies/",
    description:
      "Five translation-themed courses (max 3 from same department). Plus 3 Translation Initiative events with write-ups.",
    requirements: [
      {
        id: "translation_courses",
        label: "Translation-themed courses (5; approved list on Translation Initiative website)",
        codePrefix: [
          "SLAV",
          "RUSS",
          "CPLT",
          "ENGL",
          "FILM",
          "FREN",
          "GERM",
          "ITAL",
          "SPAN",
          "PORT",
          "EALL",
          "NELC",
        ],
        minLevel: 100,
        needCount: 5,
      },
    ],
  },
];
