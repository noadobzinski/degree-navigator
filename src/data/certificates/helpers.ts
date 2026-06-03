import type { RequirementSlot } from "../majors/types";
import type { Certificate } from "./types";

const ADV_LANG_BASE =
  "Certificate of Advanced Language Study for non-majors. Grade B or above; no Cr/D/F. Max 2 credits may overlap with major.";

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

/** Attribute-tagged elective bucket (YCPS courses searchable in YCS by attribute). */
export function attributeElectives(opts: {
  id: string;
  label: string;
  description: string;
  needCount: number;
  codePrefix: string[];
  minLevel?: number;
}): RequirementSlot {
  return {
    id: opts.id,
    label: opts.label,
    description: opts.description,
    codePrefix: opts.codePrefix,
    minLevel: opts.minLevel,
    needCount: opts.needCount,
  };
}
