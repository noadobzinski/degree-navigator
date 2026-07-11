import {
  auditDistributional,
  auditMajor,
  auditTrack,
  graduationCredits,
  totalCredits,
  type UserCourse,
} from "@/lib/audit";
import type { CatalogCourse } from "@/data/courses";
import { MAJORS_BY_ID } from "@/data/majors";
import {
  activeImplicationNotes,
  impliedPrerequisiteCourses,
} from "@/lib/prerequisite-implications";
import { yearRestrictionViolation } from "@/lib/schedule-year-rules";
import { termFieldsToSeasonCode } from "@/lib/coursetable-seasons";
import type { CrosslistLookup } from "@/lib/crosslist";

export type PlanWarning = {
  courseId: string;
  courseCode: string;
  message: string;
  kind: "year" | "overload";
};

export type PlanAuditResult = {
  credits: number;
  graduationCredits: number;
  creditsSatisfied: boolean;
  distributional: ReturnType<typeof auditDistributional>;
  distributionalSatisfied: boolean;
  majorSatisfied: boolean;
  majorSummary: string;
  secondMajorSatisfied: boolean | null;
  secondMajorSummary: string | null;
  trackSatisfied: boolean | null;
  trackSummary: string | null;
  warnings: PlanWarning[];
  implicationNotes: string[];
  coursesForRequirements: UserCourse[];
};

export type PlanAuditInput = {
  courses: UserCourse[];
  majorId: string;
  degree: "BA" | "BS";
  secondMajorId?: string | null;
  secondDegree?: "BA" | "BS";
  trackId?: string | null;
  concentrationId?: string | null;
  certificateIds?: string[];
  classYear?: number | null;
  crosslistLookup?: CrosslistLookup;
  catalogByCode?: Record<string, CatalogCourse>;
};

function majorProgressLabel(
  audit: ReturnType<typeof auditMajor> | null,
  fallbackName: string,
): { satisfied: boolean; summary: string } {
  if (!audit) return { satisfied: false, summary: fallbackName };
  const satisfied = audit.satisfiedCount >= audit.totalCount;
  return {
    satisfied,
    summary: `${audit.satisfiedCount}/${audit.totalCount} requirements`,
  };
}

export function auditDegreePlan(input: PlanAuditInput): PlanAuditResult {
  const titleByCode: Record<string, string> = {};
  for (const c of input.courses) {
    titleByCode[c.course_code.toUpperCase()] = c.course_title ?? c.course_code;
  }
  if (input.catalogByCode) {
    for (const [code, cat] of Object.entries(input.catalogByCode)) {
      titleByCode[code.toUpperCase()] = cat.title;
    }
  }

  const implied = impliedPrerequisiteCourses(input.courses, titleByCode);
  const coursesForRequirements = [
    ...input.courses.filter((c) => !c.implied_prerequisite),
    ...implied,
  ];

  const credits = totalCredits(input.courses);
  const gradTotal = graduationCredits();
  const distributional = auditDistributional(coursesForRequirements);
  const distributionalSatisfied = distributional.every((d) => d.satisfied);

  const majorAudit = auditMajor(
    coursesForRequirements,
    input.majorId,
    input.degree,
    input.crosslistLookup,
    input.concentrationId,
  );
  const major = MAJORS_BY_ID[input.majorId];
  const majorProgress = majorProgressLabel(majorAudit, major?.name ?? "Major");

  let secondMajorSatisfied: boolean | null = null;
  let secondMajorSummary: string | null = null;
  if (input.secondMajorId && input.secondMajorId !== input.majorId) {
    const deg2 = input.secondDegree ?? input.degree;
    const secondAudit = auditMajor(
      coursesForRequirements,
      input.secondMajorId,
      deg2,
      input.crosslistLookup,
    );
    const second = MAJORS_BY_ID[input.secondMajorId];
    const p = majorProgressLabel(secondAudit, second?.name ?? "Second major");
    secondMajorSatisfied = p.satisfied;
    secondMajorSummary = p.summary;
  }

  let trackSatisfied: boolean | null = null;
  let trackSummary: string | null = null;
  if (input.trackId && input.trackId !== "none") {
    const trackAudit = auditTrack(coursesForRequirements, input.trackId, input.crosslistLookup);
    if (trackAudit) {
      trackSatisfied = trackAudit.satisfiedCount >= trackAudit.totalCount;
      trackSummary = `${trackAudit.satisfiedCount}/${trackAudit.totalCount} (${trackAudit.track.name})`;
    }
  }

  const warnings: PlanWarning[] = [];

  if (input.classYear) {
    const bySeason = new Map<string, UserCourse[]>();
    for (const c of input.courses.filter((x) => !x.implied_prerequisite)) {
      if (!c.term || c.year == null) continue;
      const season = termFieldsToSeasonCode(c.term as "Fall" | "Spring" | "Summer", c.year);
      const list = bySeason.get(season) ?? [];
      list.push(c);
      bySeason.set(season, list);

      const title = c.course_title ?? titleByCode[c.course_code.toUpperCase()] ?? c.course_code;
      const yearWarn = yearRestrictionViolation(title, input.classYear, season);
      if (yearWarn) {
        warnings.push({
          courseId: c.id,
          courseCode: c.course_code,
          message: yearWarn,
          kind: "year",
        });
      }
    }

    for (const [season, list] of bySeason) {
      const creditLoad = list.reduce((s, c) => s + (c.credits || 1), 0);
      if (list.length > 5 || creditLoad > 5.5) {
        warnings.push({
          courseId: `season:${season}`,
          courseCode: season,
          message: `${list.length} courses (~${creditLoad.toFixed(1)} credits) — Yale typically allows up to 5.5 credits per term.`,
          kind: "overload",
        });
      }
    }
  }

  return {
    credits,
    graduationCredits: gradTotal,
    creditsSatisfied: credits >= gradTotal,
    distributional,
    distributionalSatisfied,
    majorSatisfied: majorProgress.satisfied,
    majorSummary: majorProgress.summary,
    secondMajorSatisfied,
    secondMajorSummary,
    trackSatisfied,
    trackSummary,
    warnings,
    implicationNotes: activeImplicationNotes(input.courses),
    coursesForRequirements,
  };
}
