import { INTERDISCIPLINARY_CERTIFICATES } from "./interdisciplinary";
import { LANGUAGE_CERTIFICATES } from "./language";
import { SKILLS_CERTIFICATES } from "./skills";
import type { Certificate, CertificateCategory } from "./types";

export type { Certificate, CertificateCategory };
export { YCPS_CERTIFICATES_URL } from "./types";

/**
 * Yale College certificates per YCPS 2026–2027.
 * @see https://catalog.yale.edu/ycps/programs_certificates/
 */
export const CERTIFICATES: Certificate[] = [
  ...LANGUAGE_CERTIFICATES,
  ...INTERDISCIPLINARY_CERTIFICATES,
  ...SKILLS_CERTIFICATES,
].sort((a, b) => a.name.localeCompare(b.name));

export const CERTIFICATE_CATEGORIES: { id: CertificateCategory; label: string }[] = [
  { id: "language", label: "Advanced language" },
  { id: "interdisciplinary", label: "Interdisciplinary" },
  { id: "skills", label: "Skills-based" },
];

/** Legacy id aliases used before YCPS renames or removals. */
export const CERTIFICATE_ID_ALIASES: Record<string, string> = {
  cs: "programming",
};

export function resolveCertificateId(id: string): string {
  return CERTIFICATE_ID_ALIASES[id] ?? id;
}

export const CERTIFICATES_BY_ID: Record<string, Certificate> = Object.fromEntries(
  CERTIFICATES.map((c) => [c.id, c]),
);

export function resolveCertificate(id: string): Certificate | undefined {
  return CERTIFICATES_BY_ID[resolveCertificateId(id)];
}

export function certificatesByCategory(category: CertificateCategory): Certificate[] {
  return CERTIFICATES.filter((c) => c.category === category);
}
