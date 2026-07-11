import { CATALOG_BY_CODE, type CatalogCourse } from "@/data/courses";
import { DISTRIBUTIONAL_REQUIREMENTS, GRADUATION_CREDITS } from "@/data/distributional";
import { resolveCertificate, type Certificate } from "@/data/certificates";
import { progressFromSlotResults, type RequirementProgress } from "@/lib/credential-progress";
import {
  MAJORS_BY_ID,
  mergeElectivesIntoCore,
  resolveMajorRequirements,
  YALE_DOUBLE_MAJOR_MAX_OVERLAP,
  type RequirementGroup,
  type RequirementSlot,
  type MajorRequirements,
  type MajorConcentration,
} from "@/data/majors";
import { TRACKS_BY_ID } from "@/data/tracks";
import {
  auditDistributionalWithAllocation,
  getEligibleCreditBuckets,
} from "@/lib/credit-allocation";
import {
  effectiveSkills,
  WR_OPTIONAL_SKILL,
  buildCompletedCourseIdentitySet,
  courseIdentityKey,
  hasCompletedCourseCode,
  lookupCatalogEntry,
} from "@/lib/course-codes";
import {
  codesForRequirementMatch,
  courseMatchesSlotCodes,
  type CrosslistLookup,
} from "@/lib/crosslist";

export type UserCourse = {
  id: string;
  course_code: string;
  course_title: string | null;
  credits: number;
  distributional: string[];
  skills: string[];
  counts_as_wr?: boolean | null;
  /** Manual distributional/skill bucket (hu, so, sc, qr, wr, lang); null = auto-optimize */
  credit_allocation?: string | null;
  /** Other Yale codes for this offering (from CourseTable cross-listings). */
  crosslisted_codes?: string[] | null;
  status: "planned" | "in_progress" | "completed";
  term: string | null;
  year: number | null;
  /** Synthetic row: satisfies reqs but adds no credits (e.g. MATH 1120 implied by MATH 1200). */
  implied_prerequisite?: boolean;
};

export function wrCreditOffered(course: UserCourse): boolean {
  if (course.counts_as_wr != null) return true;
  const skills = course.skills ?? [];
  return skills.includes("WR") || skills.includes(WR_OPTIONAL_SKILL);
}

export type SlotResult = {
  slot: RequirementSlot;
  filled: UserCourse[];
  satisfied: boolean;
  remaining: number;
};

export type GroupResult = {
  group: RequirementGroup;
  slotResults: SlotResult[];
  /** Subfields (or options) satisfied within the group */
  satisfiedCount: number;
  pickCount: number;
  satisfied: boolean;
  remaining: number;
};

export type MajorAuditSection = {
  title: string;
  results: SlotResult[];
  groups?: GroupResult[];
};

function matchesSlot(
  course: UserCourse,
  slot: RequirementSlot,
  crosslistLookup?: CrosslistLookup,
  catalogByCode?: Record<string, { ycAttributes?: string[] }>,
): boolean {
  const skills = effectiveSkills(course);
  const needsSkills = slot.requiredSkills?.length;
  if (needsSkills && !slot.requiredSkills!.every((s) => skills.includes(s))) {
    return false;
  }

  const codesToCheck = codesForRequirementMatch(
    course.course_code,
    course.crosslisted_codes,
    crosslistLookup,
  );
  const codeMatch = courseMatchesSlotCodes(codesToCheck, slot, catalogByCode);

  if (codeMatch) return true;
  if (
    needsSkills &&
    !slot.codes?.length &&
    !slot.codePrefix?.length &&
    !slot.requiredAttributes?.length
  ) {
    return true;
  }
  return false;
}

export function catalogMatchesSlot(
  course: CatalogCourse,
  slot: RequirementSlot,
  crosslistLookup?: CrosslistLookup,
  catalogByCode?: Record<string, { ycAttributes?: string[] }>,
): boolean {
  const attrs = course.ycAttributes ?? [];
  const enriched: Record<string, { ycAttributes?: string[] }> = { ...catalogByCode };
  const entry = {
    ycAttributes: attrs.length ? attrs : catalogByCode?.[course.code.toUpperCase()]?.ycAttributes,
  };
  enriched[course.code.toUpperCase()] = entry;
  for (const code of course.crosslistedCodes ?? []) {
    enriched[code.toUpperCase()] = entry;
  }
  return matchesSlot(
    {
      id: course.code,
      course_code: course.code,
      course_title: course.title,
      credits: course.credits,
      distributional: course.distributional,
      skills: course.skills,
      crosslisted_codes: course.crosslistedCodes,
      status: "planned",
      term: null,
      year: null,
    },
    slot,
    crosslistLookup,
    enriched,
  );
}

function lookupCatalog(
  code: string,
  catalogByCode: Record<string, CatalogCourse>,
): CatalogCourse | undefined {
  return lookupCatalogEntry(code, catalogByCode);
}

function fillSlots(
  slots: RequirementSlot[],
  courses: UserCourse[],
  consumed: Set<string>,
  crosslistLookup?: CrosslistLookup,
  catalogByCode?: Record<string, { ycAttributes?: string[] }>,
): SlotResult[] {
  return slots.map((slot) => {
    const filled: UserCourse[] = [];
    for (const c of courses) {
      if (filled.length >= slot.needCount) break;
      if (consumed.has(c.id)) continue;
      if (matchesSlot(c, slot, crosslistLookup, catalogByCode)) {
        filled.push(c);
        consumed.add(c.id);
      }
    }
    return {
      slot,
      filled,
      satisfied: filled.length >= slot.needCount,
      remaining: Math.max(0, slot.needCount - filled.length),
    };
  });
}

function fillGroups(
  groups: RequirementGroup[],
  courses: UserCourse[],
  consumed: Set<string>,
  crosslistLookup?: CrosslistLookup,
  catalogByCode?: Record<string, { ycAttributes?: string[] }>,
): GroupResult[] {
  return groups.map((group) => {
    const slotResults = fillSlots(group.slots, courses, consumed, crosslistLookup, catalogByCode);
    const satisfiedCount = slotResults.filter((r) => r.satisfied).length;
    const pickCount = group.pickCount;
    return {
      group,
      slotResults,
      satisfiedCount,
      pickCount,
      satisfied: satisfiedCount >= pickCount,
      remaining: Math.max(0, pickCount - satisfiedCount),
    };
  });
}

function auditRequirementSections(
  reqs: MajorRequirements,
  courses: UserCourse[],
  consumed: Set<string>,
  crosslistLookup?: CrosslistLookup,
  catalogByCode?: Record<string, { ycAttributes?: string[] }>,
): MajorAuditSection[] {
  const sections: MajorAuditSection[] = [];
  if (reqs.prerequisites?.length || reqs.prerequisiteGroups?.length) {
    const prereqSection: MajorAuditSection = { title: "Prerequisites", results: [] };
    if (reqs.prerequisiteGroups?.length) {
      prereqSection.groups = fillGroups(
        reqs.prerequisiteGroups,
        courses,
        consumed,
        crosslistLookup,
        catalogByCode,
      );
    }
    prereqSection.results = fillSlots(
      reqs.prerequisites ?? [],
      courses,
      consumed,
      crosslistLookup,
      catalogByCode,
    );
    sections.push(prereqSection);
  }
  sections.push({
    title: "Core requirements",
    // Breadth groups (e.g. 4 of 7 subfields) before broad prefix slots that could absorb the same courses.
    results: [],
    groups: undefined,
  });
  const coreSection = sections[sections.length - 1]!;
  if (reqs.coreGroups?.length) {
    coreSection.groups = fillGroups(
      reqs.coreGroups,
      courses,
      consumed,
      crosslistLookup,
      catalogByCode,
    );
  }
  coreSection.results = fillSlots(reqs.core, courses, consumed, crosslistLookup, catalogByCode);
  if (reqs.senior?.length || reqs.seniorGroups?.length) {
    const seniorSection: MajorAuditSection = { title: "Senior requirement", results: [] };
    if (reqs.seniorGroups?.length) {
      seniorSection.groups = fillGroups(
        reqs.seniorGroups,
        courses,
        consumed,
        crosslistLookup,
        catalogByCode,
      );
    }
    seniorSection.results = fillSlots(
      reqs.senior ?? [],
      courses,
      consumed,
      crosslistLookup,
      catalogByCode,
    );
    sections.push(seniorSection);
  }
  return sections;
}

export function countMajorAuditUnits(sections: MajorAuditSection[]): {
  satisfiedCount: number;
  totalCount: number;
} {
  let satisfiedCount = 0;
  let totalCount = 0;
  for (const s of sections) {
    for (const r of s.results) {
      totalCount++;
      if (r.satisfied) satisfiedCount++;
    }
    for (const g of s.groups ?? []) {
      totalCount++;
      if (g.satisfied) satisfiedCount++;
    }
  }
  return { satisfiedCount, totalCount };
}

/** Course instances assigned to any slot in this major audit. */
export function coursesUsedInMajorAudit(sections: MajorAuditSection[]): UserCourse[] {
  const byId = new Map<string, UserCourse>();
  for (const s of sections) {
    for (const r of s.results) {
      for (const c of r.filled) byId.set(c.id, c);
    }
    for (const g of s.groups ?? []) {
      for (const r of g.slotResults) {
        for (const c of r.filled) byId.set(c.id, c);
      }
    }
  }
  return [...byId.values()];
}

export type MajorAudit = {
  major: (typeof MAJORS_BY_ID)[string];
  degree: "BA" | "BS";
  concentration?: MajorConcentration;
  reqs: MajorRequirements;
  sections: MajorAuditSection[];
  satisfiedCount: number;
  totalCount: number;
};

export function auditMajor(
  courses: UserCourse[],
  majorId: string,
  degree: "BA" | "BS",
  crosslistLookup?: CrosslistLookup,
  concentrationId?: string | null,
): MajorAudit | null {
  const major = MAJORS_BY_ID[majorId];
  if (!major) return null;
  const rawReqs = resolveMajorRequirements(major, degree, concentrationId);
  if (!rawReqs) return null;
  const reqs = mergeElectivesIntoCore(rawReqs);
  const concentration = concentrationId
    ? major.concentrations?.find((c) => c.id === concentrationId)
    : undefined;
  const consumed = new Set<string>();
  const sections = auditRequirementSections(reqs, courses, consumed, crosslistLookup);
  const { satisfiedCount, totalCount } = countMajorAuditUnits(sections);
  return { major, degree, concentration, reqs, sections, satisfiedCount, totalCount };
}

export type CertificateAudit = {
  certificate: Certificate;
  prerequisiteResult?: SlotResult;
  results: SlotResult[];
  progress: RequirementProgress;
};

export function auditOneCertificate(
  courses: UserCourse[],
  certificateId: string,
  crosslistLookup?: CrosslistLookup,
  catalogByCode?: Record<string, { ycAttributes?: string[] }>,
): CertificateAudit | null {
  const certificate = resolveCertificate(certificateId);
  if (!certificate) return null;
  const consumed = new Set<string>();
  let prerequisiteResult: SlotResult | undefined;
  if (certificate.prerequisite) {
    const prereqResults = fillSlots(
      [certificate.prerequisite],
      courses,
      consumed,
      crosslistLookup,
      catalogByCode,
    );
    prerequisiteResult = prereqResults[0];
  }
  const results = fillSlots(
    certificate.requirements,
    courses,
    consumed,
    crosslistLookup,
    catalogByCode,
  );
  return {
    certificate,
    prerequisiteResult,
    results,
    progress: progressFromSlotResults(results),
  };
}

export function auditCertificates(
  courses: UserCourse[],
  certificateIds: string[] | null | undefined,
  crosslistLookup?: CrosslistLookup,
  catalogByCode?: Record<string, { ycAttributes?: string[] }>,
): CertificateAudit[] {
  if (!certificateIds?.length) return [];
  const audits: CertificateAudit[] = [];
  for (const rawId of certificateIds) {
    const audit = auditOneCertificate(courses, rawId, crosslistLookup, catalogByCode);
    if (audit) audits.push(audit);
  }
  return audits;
}

export type DoubleMajorOverlap = {
  courses: UserCourse[];
  count: number;
  maxAllowed: number;
  withinLimit: boolean;
};

export function computeDoubleMajorOverlap(
  primary: MajorAudit,
  secondary: MajorAudit,
): DoubleMajorOverlap {
  const primaryIds = new Set(coursesUsedInMajorAudit(primary.sections).map((c) => c.id));
  const overlap = coursesUsedInMajorAudit(secondary.sections).filter((c) => primaryIds.has(c.id));
  const count = overlap.length;
  return {
    courses: overlap,
    count,
    maxAllowed: YALE_DOUBLE_MAJOR_MAX_OVERLAP,
    withinLimit: count <= YALE_DOUBLE_MAJOR_MAX_OVERLAP,
  };
}

export function auditTrack(
  courses: UserCourse[],
  trackId: string | null,
  crosslistLookup?: CrosslistLookup,
) {
  if (!trackId || trackId === "none") return null;
  const track = TRACKS_BY_ID[trackId];
  if (!track) return null;
  const consumed = new Set<string>();
  const results = fillSlots(track.requirements, courses, consumed, crosslistLookup);
  return {
    track,
    results,
    satisfiedCount: results.filter((r) => r.satisfied).length,
    totalCount: results.length,
  };
}

export function auditDistributional(courses: UserCourse[]) {
  return auditDistributionalWithAllocation(courses).rows;
}

export function totalCredits(courses: UserCourse[]) {
  return courses
    .filter((c) => !c.implied_prerequisite)
    .reduce((sum, c) => sum + (c.credits || 1), 0);
}

export function graduationCredits() {
  return GRADUATION_CREDITS;
}

function suggestForSlot(
  slot: RequirementSlot,
  remaining: number,
  reason: string,
  priority: "high" | "med" | "low",
  completedCodes: Set<string>,
  seen: Set<string>,
  suggestions: { priority: "high" | "med" | "low"; code: string; title: string; reason: string }[],
  catalogByCode: Record<string, CatalogCourse>,
  pushIf: (code: string, reason: string, priority: "high" | "med" | "low") => void,
  crosslistLookup?: CrosslistLookup,
) {
  if (remaining <= 0) return;
  (slot.codes ?? []).slice(0, remaining).forEach((code) => pushIf(code, reason, priority));
  const explicitCount = Math.min(remaining, slot.codes?.length ?? 0);
  const browseNeed = remaining - explicitCount;
  if (browseNeed > 0 && (slot.codePrefix?.length || slot.requiredAttributes?.length)) {
    let added = 0;
    for (const c of Object.values(catalogByCode)) {
      if (added >= browseNeed) break;
      if (!catalogMatchesSlot(c, slot, crosslistLookup, catalogByCode)) continue;
      const key = courseIdentityKey(c.code);
      if (completedCodes.has(key) || seen.has(key)) continue;
      pushIf(c.code, reason, priority);
      added++;
    }
  }
}

function suggestFromMajorAudit(
  audit: MajorAudit,
  label: string,
  completedCodes: Set<string>,
  seen: Set<string>,
  suggestions: { priority: "high" | "med" | "low"; code: string; title: string; reason: string }[],
  catalogByCode: Record<string, CatalogCourse>,
  pushIf: (code: string, reason: string, priority: "high" | "med" | "low") => void,
  crosslistLookup?: CrosslistLookup,
) {
  for (const s of audit.sections) {
    for (const r of s.results) {
      if (r.satisfied) continue;
      suggestForSlot(
        r.slot,
        r.remaining,
        `${label}: ${r.slot.label}`,
        "high",
        completedCodes,
        seen,
        suggestions,
        catalogByCode,
        pushIf,
        crosslistLookup,
      );
    }
    for (const g of s.groups ?? []) {
      if (g.satisfied) continue;
      const need = g.remaining;
      const unsatisfied = g.slotResults.filter((r) => !r.satisfied);
      for (const r of unsatisfied.slice(0, need)) {
        suggestForSlot(
          r.slot,
          r.remaining,
          `${label}: ${g.group.label} — ${r.slot.label}`,
          "high",
          completedCodes,
          seen,
          suggestions,
          catalogByCode,
          pushIf,
          crosslistLookup,
        );
      }
    }
  }
}

export function suggestRoadmap(
  courses: UserCourse[],
  majorId: string | null,
  degree: "BA" | "BS",
  trackId: string | null,
  catalogByCode: Record<string, CatalogCourse> = CATALOG_BY_CODE,
  secondMajorId?: string | null,
  secondDegree?: "BA" | "BS",
  crosslistLookup?: CrosslistLookup,
  concentrationId?: string | null,
  certificateIds?: string[] | null,
  maxSuggestions = 18,
): { priority: "high" | "med" | "low"; code: string; title: string; reason: string }[] {
  const completedCodes = buildCompletedCourseIdentitySet(courses);
  const suggestions: {
    priority: "high" | "med" | "low";
    code: string;
    title: string;
    reason: string;
  }[] = [];
  const seen = new Set<string>();
  const pushIf = (code: string, reason: string, priority: "high" | "med" | "low") => {
    const c = lookupCatalog(code, catalogByCode);
    if (!c) return;
    if (hasCompletedCourseCode(code, completedCodes)) return;
    const key = courseIdentityKey(code);
    if (seen.has(key)) return;
    seen.add(key);
    suggestions.push({ code, title: c.title, reason, priority });
  };

  if (majorId) {
    const audit = auditMajor(
      courses.map((c) => ({ ...c })),
      majorId,
      degree,
      crosslistLookup,
      concentrationId,
    );
    if (audit) {
      const label = audit.concentration ? `Major (${audit.concentration.label})` : "Major";
      suggestFromMajorAudit(
        audit,
        label,
        completedCodes,
        seen,
        suggestions,
        catalogByCode,
        pushIf,
        crosslistLookup,
      );
    }
  }

  if (secondMajorId && secondMajorId !== majorId) {
    const deg2 = secondDegree ?? degree;
    const audit2 = auditMajor(
      courses.map((c) => ({ ...c })),
      secondMajorId,
      deg2,
      crosslistLookup,
    );
    if (audit2) {
      const name = audit2.major.name;
      suggestFromMajorAudit(
        audit2,
        `Second major (${name})`,
        completedCodes,
        seen,
        suggestions,
        catalogByCode,
        pushIf,
        crosslistLookup,
      );
    }
  }

  if (trackId && trackId !== "none") {
    const t = auditTrack(courses, trackId, crosslistLookup);
    if (t) {
      for (const r of t.results) {
        if (r.satisfied) continue;
        suggestForSlot(
          r.slot,
          r.remaining,
          `${t.track.name}: ${r.slot.label}`,
          "high",
          completedCodes,
          seen,
          suggestions,
          catalogByCode,
          pushIf,
          crosslistLookup,
        );
      }
    }
  }

  for (const certAudit of auditCertificates(
    courses,
    certificateIds,
    crosslistLookup,
    catalogByCode,
  )) {
    for (const r of certAudit.results) {
      if (r.satisfied) continue;
      suggestForSlot(
        r.slot,
        r.remaining,
        `${certAudit.certificate.name}: ${r.slot.label}`,
        "med",
        completedCodes,
        seen,
        suggestions,
        catalogByCode,
        pushIf,
        crosslistLookup,
      );
    }
  }

  const { rows: dist } = auditDistributionalWithAllocation(courses);
  for (const d of dist) {
    if (d.satisfied) continue;
    for (const c of Object.values(catalogByCode)) {
      if (hasCompletedCourseCode(c.code, completedCodes)) continue;
      const pseudo = {
        id: c.code,
        course_code: c.code,
        course_title: c.title,
        credits: c.credits,
        distributional: c.distributional,
        skills: c.skills,
        status: "planned" as const,
        term: null,
        year: null,
      };
      if (getEligibleCreditBuckets(pseudo).includes(d.req.id)) {
        pushIf(c.code, `Distributional: ${d.req.label}`, "med");
        if (suggestions.filter((s) => s.reason.startsWith("Distributional")).length >= 6) break;
      }
    }
  }

  return suggestions.slice(0, maxSuggestions);
}

export type RoadmapSuggestion = {
  priority: "high" | "med" | "low";
  code: string;
  title: string;
  reason: string;
};
