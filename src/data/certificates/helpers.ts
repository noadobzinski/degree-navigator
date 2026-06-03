import type { RequirementSlot } from "../majors/types";
import type { Certificate } from "./types";

const ADV_LANG_BASE =
  "Certificate of Advanced Language Study for non-majors. Grade B or above; no Cr/D/F. Max 2 credits may overlap with major.";

/** YC course attributes from Yale Course Search / CourseTable (public catalog). */
export const YC = {
  quantumElective: ["YC Quantum Elective"],
  ethnographyElective: ["YC Ethnography Elective"],
  ethnographyMethods: ["YC Ethnography Methods"],
  climateBasic: ["YC Climate Basic Climate Sci"],
  climateAnthropogenic: ["YC Climate Anthropogenic"],
  climateSolutions: ["YC Climate Solutions"],
  climateSeminar: ["YC Climate Sci/Solutions Sem"],
  climateElective: [
    "YC Climate Basic Climate Sci",
    "YC Climate Anthropogenic",
    "YC Climate Solutions",
    "YC Climate Sci/Eng/Tech",
    "YC Climate Sci/Solutions Sem",
    "YC Climate Non-science",
  ],
  humanRightsDomestic: ["YC Human Rights Domestic"],
  humanRightsInternational: ["YC Human Rights International"],
  humanRightsAny: ["YC Human Rights Domestic", "YC Human Rights International"],
  glhthAny: [
    "YC GLHTH Bio & Env Influences",
    "YC GLHTH Health & Societies",
    "YC GLHTH Hist Approaches",
    "YC GLHTH Perf, Rep & Health",
    "YC GLHTH Polit Econ & Govern",
    "YC GLHTH Quantitative Data",
  ],
  foodConsumption: ["YC Food Consumption"],
  foodEnvironment: ["YC Food Environment"],
  foodProduction: ["YC Food Production"],
  islamicArt: ["YC Islamic Stud Art Arch Lit"],
  islamicHistory: ["YC Islamic Stud History"],
  islamicReligion: ["YC Islamic Stud Religion"],
  islamicAny: [
    "YC Islamic Stud Art Arch Lit",
    "YC Islamic Stud History",
    "YC Islamic Stud Religion",
    "YC NELC Foundations Course",
  ],
  mdvlAny: [
    "YC MDVL East & SE Asia",
    "YC MDVL Eur Russ & N Atlantic",
    "YC MDVL Nr East & N Africa",
    "YC MDVL Other MDVL Topics",
  ],
  naisAny: [
    "YC NAIS History Society & Law",
    "YC NAIS Language & Culture",
    "YC NAIS Literature & Arts",
    "YC NAIS Science & Education",
  ],
  persiaContent: ["YC Persia & Iran Content"],
  translationStudies: ["YC CPLT Translation Studies"],
} as const;

/** Standard modern-language cert: 4 courses beyond L4, ≥2 Yale L5 (approximated as L5+ / 1500-level). */
export function advLangCert(opts: {
  id: string;
  name: string;
  department: string;
  catalogUrl: string;
  prefix: string | string[];
  description?: string;
  minLevel?: number;
  requirements?: RequirementSlot[];
}): Certificate {
  const prefixes = Array.isArray(opts.prefix) ? opts.prefix : [opts.prefix];
  const minLevel = opts.minLevel ?? 1500;
  return {
    id: opts.id,
    name: opts.name,
    department: opts.department,
    category: "language",
    catalogUrl: opts.catalogUrl,
    description: opts.description ?? ADV_LANG_BASE,
    requirements: opts.requirements ?? [
      {
        id: "advanced",
        label: `Advanced ${opts.name} (4 courses beyond L4; at least 2 Yale L5)`,
        codePrefix: prefixes,
        minLevel,
        needCount: 4,
      },
    ],
  };
}

/** Elective bucket matched by YC course attribute(s) in CourseTable (not department prefix alone). */
export function attributeElectives(opts: {
  id: string;
  label: string;
  description?: string;
  needCount: number;
  requiredAttributes: string[];
}): RequirementSlot {
  return {
    id: opts.id,
    label: opts.label,
    description:
      opts.description ??
      `Courses must carry a matching YC attribute in Yale Course Search (${opts.requiredAttributes.join(" or ")}).`,
    requiredAttributes: opts.requiredAttributes,
    needCount: opts.needCount,
  };
}
