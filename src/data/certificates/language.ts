import { advLangCert } from "./helpers";
import type { Certificate } from "./types";

const NELC =
  "https://catalog.yale.edu/ycps/subjects-of-instruction/near-eastern-languages-civilizations/";
const CLASSICS = "https://catalog.yale.edu/ycps/subjects-of-instruction/classics/";
const EALL =
  "https://catalog.yale.edu/ycps/subjects-of-instruction/east-asian-languages-literatures/";
const AFST = "https://catalog.yale.edu/ycps/subjects-of-instruction/african-studies/";
const SAST = "https://catalog.yale.edu/ycps/subjects-of-instruction/south-asian-studies/";
const SEAS = "https://catalog.yale.edu/ycps/subjects-of-instruction/southeast-asia-studies/";

export const LANGUAGE_CERTIFICATES: Certificate[] = [
  advLangCert({
    id: "french",
    name: "French",
    department: "French",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/french/",
    prefix: "FREN",
    requirements: [
      {
        id: "advanced",
        label: "Advanced French beyond L4 (3 courses; ≥2 Yale L5)",
        codePrefix: ["FREN"],
        minLevel: 1500,
        needCount: 3,
      },
      {
        id: "literature",
        label: "FREN 2000–4999 literature or culture (1)",
        codePrefix: ["FREN"],
        minLevel: 2000,
        needCount: 1,
      },
    ],
  }),
  advLangCert({
    id: "german",
    name: "German",
    department: "Germanic Languages and Literatures",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/german-studies/",
    prefix: "GERM",
  }),
  advLangCert({
    id: "italian",
    name: "Italian",
    department: "Italian Studies",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/italian",
    prefix: "ITAL",
    description:
      "Four courses beyond L4; at least three Yale L5. Grade B or above; no Cr/D/F.",
  }),
  advLangCert({
    id: "spanish",
    name: "Spanish",
    department: "Spanish and Portuguese",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/spanish/",
    prefix: "SPAN",
    requirements: [
      {
        id: "advanced",
        label: "Advanced Spanish beyond L4 (3 courses; ≥2 Yale L5)",
        codePrefix: ["SPAN"],
        minLevel: 1500,
        needCount: 3,
      },
      {
        id: "seminar",
        label: "Yale 3000-level Spanish lecture or seminar (1)",
        codePrefix: ["SPAN"],
        minLevel: 3000,
        needCount: 1,
      },
    ],
  }),
  advLangCert({
    id: "portuguese",
    name: "Portuguese",
    department: "Spanish and Portuguese",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/portuguese/",
    prefix: "PORT",
  }),
  advLangCert({
    id: "russian",
    name: "Russian",
    department: "Slavic Languages and Literatures",
    catalogUrl: "https://catalog.yale.edu/ycps/subjects-of-instruction/slavic-languages-literatures/",
    prefix: "RUSS",
    description:
      "Four courses beyond L4 after RUSS 1510; ≥2 Yale L5 content courses. Grade B or above.",
  }),
  {
    id: "ancient-greek",
    name: "Ancient Greek",
    department: "Classics",
    category: "language",
    catalogUrl: CLASSICS,
    description: "Four L5 Greek courses (GREK 3000–4999) for non-majors. Grade B or above.",
    requirements: [
      {
        id: "advanced",
        label: "Advanced Greek (4 L5 courses, GREK 3000+)",
        codePrefix: ["GREK"],
        minLevel: 3000,
        needCount: 4,
      },
    ],
  },
  {
    id: "latin",
    name: "Latin",
    department: "Classics",
    category: "language",
    catalogUrl: CLASSICS,
    description: "Four L5 Latin courses (LATN 3000–4999) for non-majors. Grade B or above.",
    requirements: [
      {
        id: "advanced",
        label: "Advanced Latin (4 L5 courses, LATN 3000+)",
        codePrefix: ["LATN"],
        minLevel: 3000,
        needCount: 4,
      },
    ],
  },
  {
    id: "ancient-egyptian",
    name: "Ancient Egyptian",
    department: "Near Eastern Languages and Civilizations",
    category: "language",
    catalogUrl: NELC,
    description: "Four courses beyond L3; ≥2 Yale L5. Grade B or above.",
    requirements: [
      {
        id: "advanced",
        label: "Advanced Ancient Egyptian (4 courses beyond L3; ≥2 L5)",
        codePrefix: ["EGYP"],
        minLevel: 1300,
        needCount: 4,
      },
    ],
  },
  advLangCert({
    id: "modern-arabic",
    name: "Modern Arabic",
    department: "Near Eastern Languages and Civilizations",
    catalogUrl: NELC,
    prefix: "ARBC",
    description:
      "Four courses beyond L4; ≥2 Yale L5. Classical Arabic does not count. Grade B or above.",
  }),
  advLangCert({
    id: "modern-hebrew",
    name: "Modern Hebrew",
    department: "Near Eastern Languages and Civilizations",
    catalogUrl: NELC,
    prefix: "HEBR",
  }),
  advLangCert({
    id: "modern-turkish",
    name: "Modern Turkish",
    department: "Near Eastern Languages and Civilizations",
    catalogUrl: NELC,
    prefix: "TURK",
  }),
  advLangCert({
    id: "chinese",
    name: "Chinese",
    department: "East Asian Languages and Literatures",
    catalogUrl: EALL,
    prefix: "CHNS",
    description:
      "Four courses beyond L4; ≥2 Yale L5. Literary Chinese (CHNS 1700/1710) does not count toward the certificate.",
  }),
  advLangCert({
    id: "japanese",
    name: "Japanese",
    department: "East Asian Languages and Literatures",
    catalogUrl: EALL,
    prefix: "JAPN",
    description:
      "Four courses beyond L4; ≥2 Yale L5. Literary Japanese (JAPN 1700/1710) does not count toward the certificate.",
  }),
  advLangCert({
    id: "korean",
    name: "Korean",
    department: "East Asian Languages and Literatures",
    catalogUrl: EALL,
    prefix: "KREN",
    description:
      "Four courses beyond L4; ≥2 Yale L5. Hanja/intro literary courses (KREN 1700) do not count.",
  }),
  advLangCert({
    id: "hindi",
    name: "Hindi",
    department: "South Asian Studies",
    catalogUrl: SAST,
    prefix: "HNDI",
  }),
  {
    id: "sanskrit",
    name: "Sanskrit",
    department: "South Asian Studies",
    category: "language",
    catalogUrl: SAST,
    description:
      "Four courses beyond L3; ≥2 Yale L5. One may be SKRT 5570 or related Old/Middle Indic. Grade B or above.",
    requirements: [
      {
        id: "advanced",
        label: "Advanced Sanskrit (4 courses beyond L3; ≥2 L5)",
        codePrefix: ["SKRT"],
        minLevel: 1300,
        needCount: 4,
      },
    ],
  },
  advLangCert({
    id: "kiswahili",
    name: "Kiswahili",
    department: "African Studies",
    catalogUrl: AFST,
    prefix: "SWAH",
  }),
  advLangCert({
    id: "yoruba",
    name: "Yoruba",
    department: "African Studies",
    catalogUrl: AFST,
    prefix: "YORU",
  }),
  advLangCert({
    id: "isizulu",
    name: "isiZulu",
    department: "African Studies",
    catalogUrl: AFST,
    prefix: "ZULU",
  }),
  advLangCert({
    id: "indonesian",
    name: "Indonesian",
    department: "Southeast Asia Studies",
    catalogUrl: SEAS,
    prefix: "INDN",
    description:
      "Four courses beyond L4; ≥2 advanced Yale language courses (e.g. INDN 1500–1800). Grade B or above.",
  }),
  advLangCert({
    id: "vietnamese",
    name: "Vietnamese",
    department: "Southeast Asia Studies",
    catalogUrl: SEAS,
    prefix: "VIET",
    description:
      "Four courses beyond L4 (after VIET 1420); ≥2 Yale L5 (VIET 1500, 1600, 4600). Grade B or above.",
  }),
];
