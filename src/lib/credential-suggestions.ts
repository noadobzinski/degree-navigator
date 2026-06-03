import { CERTIFICATES, CERTIFICATES_BY_ID } from "@/data/certificates";
import { MAJORS, MAJORS_BY_ID, YALE_DOUBLE_MAJOR_MAX_OVERLAP } from "@/data/majors";
import {
  auditCertificates,
  auditMajor,
  computeDoubleMajorOverlap,
  type UserCourse,
} from "@/lib/audit";
import type { CrosslistLookup } from "@/lib/crosslist";

export type CredentialSuggestionKind = "certificate" | "double_major";

export type CredentialSuggestion = {
  kind: CredentialSuggestionKind;
  id: string;
  name: string;
  department?: string;
  satisfiedCount: number;
  totalCount: number;
  remainingCount: number;
  progressPct: number;
  /** Double major only: courses already counting toward both majors. */
  overlapCount?: number;
  overlapWithinLimit?: boolean;
  summary: string;
};

const CERT_MAX_REMAINING = 3;
const CERT_MIN_PROGRESS_PCT = 50;
const DOUBLE_MAJOR_MAX_REMAINING = 6;
const DOUBLE_MAJOR_MIN_PROGRESS_PCT = 35;
const DOUBLE_MAJOR_EASY_REMAINING = 3;

function progressPct(satisfied: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((satisfied / total) * 100);
}

function isEasyCertificate(satisfied: number, total: number, remaining: number): boolean {
  if (satisfied <= 0 || total <= 0) return false;
  if (remaining > CERT_MAX_REMAINING) return false;
  const pct = progressPct(satisfied, total);
  return remaining <= 1 || pct >= CERT_MIN_PROGRESS_PCT;
}

function isEasyDoubleMajor(
  satisfied: number,
  total: number,
  remaining: number,
  overlapWithinLimit: boolean,
): boolean {
  if (!overlapWithinLimit || satisfied <= 0 || total <= 0) return false;
  if (remaining > DOUBLE_MAJOR_MAX_REMAINING) return false;
  const pct = progressPct(satisfied, total);
  return remaining <= DOUBLE_MAJOR_EASY_REMAINING || pct >= DOUBLE_MAJOR_MIN_PROGRESS_PCT;
}

function certSummary(name: string, satisfied: number, total: number, remaining: number): string {
  if (remaining === 0) {
    return `Your courses already satisfy all ${total} tracked requirements for the ${name} certificate.`;
  }
  if (remaining === 1) {
    return `You've met ${satisfied} of ${total} requirements — about one course left for ${name}.`;
  }
  return `You've met ${satisfied} of ${total} requirements — about ${remaining} courses left for ${name}.`;
}

function doubleMajorSummary(
  name: string,
  satisfied: number,
  total: number,
  remaining: number,
  overlapCount: number,
): string {
  const overlapNote =
    overlapCount > 0
      ? ` (${overlapCount} ${overlapCount === 1 ? "course overlaps" : "courses overlap"} with your primary major, within Yale's ${YALE_DOUBLE_MAJOR_MAX_OVERLAP}-course limit)`
      : "";
  if (remaining <= DOUBLE_MAJOR_EASY_REMAINING) {
    return `${satisfied} of ${total} ${name} requirements already covered${overlapNote} — a feasible second major.`;
  }
  return `${satisfied} of ${total} ${name} slots already met${overlapNote} — you could finish this second major with roughly ${remaining} more courses.`;
}

export function suggestReachableCredentials(opts: {
  courses: UserCourse[];
  primaryMajorId: string;
  primaryDegree: "BA" | "BS";
  primaryConcentrationId?: string | null;
  secondMajorId?: string | null;
  certificateIds?: string[] | null;
  crosslistLookup?: CrosslistLookup;
  maxResults?: number;
}): CredentialSuggestion[] {
  const {
    courses,
    primaryMajorId,
    primaryDegree,
    primaryConcentrationId,
    secondMajorId,
    certificateIds = [],
    crosslistLookup,
    maxResults = 6,
  } = opts;

  const activeCerts = new Set(certificateIds ?? []);
  const suggestions: CredentialSuggestion[] = [];

  for (const cert of CERTIFICATES) {
    if (activeCerts.has(cert.id)) continue;
    const [audit] = auditCertificates(courses, [cert.id], crosslistLookup);
    if (!audit) continue;
    const { satisfiedCount, totalCount } = audit;
    const remainingCount = Math.max(0, totalCount - satisfiedCount);
    if (!isEasyCertificate(satisfiedCount, totalCount, remainingCount)) continue;
    suggestions.push({
      kind: "certificate",
      id: cert.id,
      name: cert.name,
      department: cert.department,
      satisfiedCount,
      totalCount,
      remainingCount,
      progressPct: progressPct(satisfiedCount, totalCount),
      summary: certSummary(cert.name, satisfiedCount, totalCount, remainingCount),
    });
  }

  if (!secondMajorId) {
    const primaryAudit = auditMajor(
      courses,
      primaryMajorId,
      primaryDegree,
      crosslistLookup,
      primaryConcentrationId,
    );

    for (const candidate of MAJORS) {
      if (candidate.id === primaryMajorId) continue;
      const degree = candidate.degrees.includes(primaryDegree)
        ? primaryDegree
        : candidate.defaultDegree;
      if (!candidate.requirements[degree]) continue;

      const secondaryAudit = auditMajor(courses, candidate.id, degree, crosslistLookup);
      if (!secondaryAudit) continue;

      const { satisfiedCount, totalCount } = secondaryAudit;
      const remainingCount = Math.max(0, totalCount - satisfiedCount);
      const overlap = primaryAudit
        ? computeDoubleMajorOverlap(primaryAudit, secondaryAudit)
        : { count: 0, withinLimit: true };

      if (
        !isEasyDoubleMajor(
          satisfiedCount,
          totalCount,
          remainingCount,
          overlap.withinLimit,
        )
      ) {
        continue;
      }

      suggestions.push({
        kind: "double_major",
        id: candidate.id,
        name: candidate.name,
        department: candidate.department,
        satisfiedCount,
        totalCount,
        remainingCount,
        progressPct: progressPct(satisfiedCount, totalCount),
        overlapCount: overlap.count,
        overlapWithinLimit: overlap.withinLimit,
        summary: doubleMajorSummary(
          candidate.name,
          satisfiedCount,
          totalCount,
          remainingCount,
          overlap.count,
        ),
      });
    }
  }

  suggestions.sort((a, b) => {
    if (a.remainingCount !== b.remainingCount) return a.remainingCount - b.remainingCount;
    return b.progressPct - a.progressPct;
  });

  return suggestions.slice(0, maxResults);
}

/** Audit a single certificate by id (for previews). */
export function previewCertificateProgress(
  courses: UserCourse[],
  certificateId: string,
  crosslistLookup?: CrosslistLookup,
) {
  const cert = CERTIFICATES_BY_ID[certificateId];
  if (!cert) return null;
  const [audit] = auditCertificates(courses, [certificateId], crosslistLookup);
  return audit;
}
