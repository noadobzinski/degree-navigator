import {
  CERTIFICATES,
  resolveCertificateId,
  type Certificate,
} from "@/data/certificates";
import { MAJORS, YALE_DOUBLE_MAJOR_MAX_OVERLAP } from "@/data/majors";
import {
  auditMajor,
  auditOneCertificate,
  computeDoubleMajorOverlap,
  type UserCourse,
} from "@/lib/audit";
import type { CrosslistLookup } from "@/lib/crosslist";
import {
  flattenMajorAuditSections,
  progressFromSlotResults,
  slotResultsToRows,
  type CredentialRequirementRow,
  type RequirementProgress,
} from "@/lib/credential-progress";

export type CredentialSuggestionKind = "certificate" | "double_major";

export type CredentialSuggestion = {
  kind: CredentialSuggestionKind;
  id: string;
  name: string;
  department?: string;
  catalogUrl?: string;
  description?: string;
  progress: RequirementProgress;
  requirementRows: CredentialRequirementRow[];
  overlapCount?: number;
  overlapWithinLimit?: boolean;
  overlapCourseCodes?: string[];
  summary: string;
};

const CERT_MAX_REMAINING_COURSES = 3;
const CERT_MIN_PROGRESS_PCT = 50;
const DOUBLE_MAJOR_MAX_REMAINING_COURSES = 6;
const DOUBLE_MAJOR_MIN_PROGRESS_PCT = 35;
const DOUBLE_MAJOR_EASY_REMAINING = 3;

function isEasyCertificate(progress: RequirementProgress): boolean {
  if (progress.coursesFilled <= 0 || progress.coursesRequired <= 0) return false;
  if (progress.remainingCourses > CERT_MAX_REMAINING_COURSES) return false;
  return progress.remainingCourses <= 1 || progress.progressPct >= CERT_MIN_PROGRESS_PCT;
}

function isEasyDoubleMajor(
  progress: RequirementProgress,
  overlapWithinLimit: boolean,
): boolean {
  if (!overlapWithinLimit || progress.coursesFilled <= 0 || progress.coursesRequired <= 0) {
    return false;
  }
  if (progress.remainingCourses > DOUBLE_MAJOR_MAX_REMAINING_COURSES) return false;
  return (
    progress.remainingCourses <= DOUBLE_MAJOR_EASY_REMAINING ||
    progress.progressPct >= DOUBLE_MAJOR_MIN_PROGRESS_PCT
  );
}

function certSummary(cert: Certificate, progress: RequirementProgress): string {
  if (progress.remainingCourses === 0) {
    return `Your courses satisfy all tracked ${cert.name} requirements (${progress.coursesFilled}/${progress.coursesRequired} credits).`;
  }
  return `${progress.coursesFilled} of ${progress.coursesRequired} certificate credits met — about ${progress.remainingCourses} left per YCPS.`;
}

function doubleMajorSummary(
  name: string,
  progress: RequirementProgress,
  overlapCount: number,
): string {
  const overlapNote =
    overlapCount > 0
      ? ` ${overlapCount} course${overlapCount === 1 ? "" : "s"} overlap with your primary major (Yale allows ${YALE_DOUBLE_MAJOR_MAX_OVERLAP}).`
      : "";
  return `${progress.coursesFilled} of ${progress.coursesRequired} credits toward ${name} already covered.${overlapNote}`;
}

function buildCertSuggestion(
  cert: Certificate,
  courses: UserCourse[],
  crosslistLookup?: CrosslistLookup,
): CredentialSuggestion | null {
  const audit = auditOneCertificate(courses, cert.id, crosslistLookup);
  if (!audit) return null;

  const progress = progressFromSlotResults(audit.results);
  if (!isEasyCertificate(progress)) return null;

  const requirementRows = [
    ...(audit.prerequisiteResult
      ? slotResultsToRows([audit.prerequisiteResult], "prereq-")
      : []),
    ...slotResultsToRows(audit.results),
  ];

  return {
    kind: "certificate",
    id: cert.id,
    name: cert.name,
    department: cert.department,
    catalogUrl: cert.catalogUrl,
    description: cert.description,
    progress,
    requirementRows,
    summary: certSummary(cert, progress),
  };
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

  const activeCerts = new Set((certificateIds ?? []).map(resolveCertificateId));
  const suggestions: CredentialSuggestion[] = [];

  for (const cert of CERTIFICATES) {
    if (activeCerts.has(cert.id)) continue;
    const suggestion = buildCertSuggestion(cert, courses, crosslistLookup);
    if (suggestion) suggestions.push(suggestion);
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

      const requirementRows = flattenMajorAuditSections(secondaryAudit.sections);
      const progress = progressFromSlotResults(
        requirementRows.map((r) => ({
          slot: {
            id: r.id,
            label: r.label,
            description: r.description,
            needCount: r.needCount,
          },
          filled: r.filled,
          satisfied: r.satisfied,
          remaining: r.remaining,
        })),
      );

      const overlap = primaryAudit
        ? computeDoubleMajorOverlap(primaryAudit, secondaryAudit)
        : { count: 0, withinLimit: true, courses: [] };

      if (!isEasyDoubleMajor(progress, overlap.withinLimit)) continue;

      suggestions.push({
        kind: "double_major",
        id: candidate.id,
        name: candidate.name,
        department: candidate.department,
        progress,
        requirementRows,
        overlapCount: overlap.count,
        overlapWithinLimit: overlap.withinLimit,
        overlapCourseCodes: overlap.courses.map((c) => c.course_code),
        summary: doubleMajorSummary(candidate.name, progress, overlap.count),
      });
    }
  }

  suggestions.sort((a, b) => {
    if (a.progress.remainingCourses !== b.progress.remainingCourses) {
      return a.progress.remainingCourses - b.progress.remainingCourses;
    }
    return b.progress.progressPct - a.progress.progressPct;
  });

  return suggestions.slice(0, maxResults);
}
