import {
  DISTRIBUTIONAL_REQUIREMENTS,
  type DistributionalCode,
} from "@/data/distributional";
import type { CatalogCourse } from "@/data/courses";
import type { UserCourse } from "@/lib/audit";
import { effectiveSkills, skillsForNewCourse, WR_OPTIONAL_SKILL } from "@/lib/course-codes";

function wrOffered(course: UserCourse): boolean {
  if (course.counts_as_wr != null) return true;
  const skills = course.skills ?? [];
  return skills.includes("WR") || skills.includes(WR_OPTIONAL_SKILL);
}

export type CreditBucketId = (typeof DISTRIBUTIONAL_REQUIREMENTS)[number]["id"];

export const CREDIT_ALLOC_SKILL_PREFIX = "_alloc:";

export type CreditBucketOption = {
  id: CreditBucketId;
  label: string;
};

const BUCKET_LABELS: Record<CreditBucketId, string> = Object.fromEntries(
  DISTRIBUTIONAL_REQUIREMENTS.map((r) => [r.id, r.label]),
) as Record<CreditBucketId, string>;

export function isCreditBucketId(value: string): value is CreditBucketId {
  return value in BUCKET_LABELS;
}

export function creditAllocationFromSkills(skills: string[]): CreditBucketId | null {
  const marker = skills.find((s) => s.startsWith(CREDIT_ALLOC_SKILL_PREFIX));
  if (!marker) return null;
  const id = marker.slice(CREDIT_ALLOC_SKILL_PREFIX.length);
  return isCreditBucketId(id) ? id : null;
}

export function stripAllocationMarkers(skills: string[]): string[] {
  return skills.filter((s) => !s.startsWith(CREDIT_ALLOC_SKILL_PREFIX));
}

/** Tags this course could count toward (student picks one). */
export function getEligibleCreditBuckets(course: UserCourse): CreditBucketId[] {
  const buckets: CreditBucketId[] = [];
  const dist = course.distributional ?? [];
  const skills = effectiveSkills(course);

  if (dist.includes("Hu")) buckets.push("hu");
  if (dist.includes("So")) buckets.push("so");
  if (dist.includes("Sc")) buckets.push("sc");
  if (skills.includes("QR")) buckets.push("qr");
  if (skills.includes("WR") || wrOffered(course)) buckets.push("wr");
  if ((course.skills ?? []).some((s) => ["L4", "L5"].includes(s))) buckets.push("lang");

  return buckets;
}

export function getEligibleCreditOptions(course: UserCourse): CreditBucketOption[] {
  return getEligibleCreditBuckets(course).map((id) => ({
    id,
    label: BUCKET_LABELS[id],
  }));
}

export function courseHasExclusiveCreditChoice(course: UserCourse): boolean {
  return getEligibleCreditBuckets(course).length > 1;
}

/** Build a UserCourse-shaped object from catalog data (for add-flow / browse UI). */
export function userCoursePreviewFromCatalog(
  course: CatalogCourse,
  overrides?: Partial<UserCourse>,
): UserCourse {
  const { skills, counts_as_wr } = skillsForNewCourse(course.skills, course.code);
  return {
    id: course.code,
    course_code: course.code,
    course_title: course.title,
    credits: course.credits,
    distributional: course.distributional ?? [],
    skills,
    counts_as_wr,
    status: "planned",
    term: null,
    year: null,
    ...overrides,
  };
}

export function catalogCourseHasCreditChoice(course: CatalogCourse): boolean {
  return courseHasExclusiveCreditChoice(userCoursePreviewFromCatalog(course));
}

function manualAllocationsFromCourses(courses: UserCourse[]): Map<string, CreditBucketId> {
  const manual = new Map<string, CreditBucketId>();
  for (const c of courses) {
    const fromCol = c.credit_allocation;
    if (fromCol && isCreditBucketId(fromCol)) {
      manual.set(c.id, fromCol);
      continue;
    }
    const fromSkills = creditAllocationFromSkills(c.skills ?? []);
    if (fromSkills) manual.set(c.id, fromSkills);
  }
  return manual;
}

/**
 * Assign each multi-tag course to at most one bucket; prioritize scarce requirements
 * to maximize satisfied distributional rows.
 */
export function optimizeDistributionalAllocation(
  courses: UserCourse[],
): Map<string, CreditBucketId> {
  const assignments = new Map<string, CreditBucketId>();
  const manual = manualAllocationsFromCourses(courses);
  const flexible: UserCourse[] = [];

  for (const c of courses) {
    const eligible = getEligibleCreditBuckets(c);
    if (eligible.length === 0) continue;

    const manualPick = manual.get(c.id);
    if (manualPick && eligible.includes(manualPick)) {
      assignments.set(c.id, manualPick);
      continue;
    }

    if (eligible.length === 1) {
      assignments.set(c.id, eligible[0]);
      continue;
    }

    flexible.push(c);
  }

  const needs: Record<CreditBucketId, number> = Object.fromEntries(
    DISTRIBUTIONAL_REQUIREMENTS.map((r) => [r.id, r.count]),
  ) as Record<CreditBucketId, number>;

  for (const bucket of assignments.values()) {
    if (needs[bucket] > 0) needs[bucket]--;
  }

  const poolSize = (id: CreditBucketId) =>
    flexible.filter((c) => getEligibleCreditBuckets(c).includes(id)).length;

  /** Skills (WR, QR) before distributional areas when competing for the same course. */
  const BUCKET_PRIORITY: Record<CreditBucketId, number> = {
    wr: 0,
    qr: 1,
    lang: 2,
    hu: 3,
    so: 4,
    sc: 5,
  };

  const reqsByScarcity = [...DISTRIBUTIONAL_REQUIREMENTS].sort((a, b) => {
    const prio = BUCKET_PRIORITY[a.id] - BUCKET_PRIORITY[b.id];
    if (prio !== 0) return prio;
    return poolSize(a.id) - poolSize(b.id);
  });

  const remaining = [...flexible];

  for (const req of reqsByScarcity) {
    const bucket = req.id;
    while (needs[bucket] > 0 && remaining.length > 0) {
      const candidates = remaining
        .map((c, index) => ({ c, index, eligible: getEligibleCreditBuckets(c) }))
        .filter((x) => x.eligible.includes(bucket))
        .sort((a, b) => a.eligible.length - b.eligible.length);

      if (candidates.length === 0) break;
      const pick = candidates[0];
      remaining.splice(pick.index, 1);
      assignments.set(pick.c.id, bucket);
      needs[bucket]--;
    }
  }

  for (const c of remaining) {
    const eligible = getEligibleCreditBuckets(c);
    if (eligible.length === 0) continue;
    let best = eligible[0];
    let bestNeed = needs[best] ?? 0;
    for (const b of eligible) {
      if ((needs[b] ?? 0) > bestNeed) {
        bestNeed = needs[b] ?? 0;
        best = b;
      }
    }
    assignments.set(c.id, best);
    if (needs[best] > 0) needs[best]--;
  }

  return assignments;
}

export function getEffectiveCreditAllocation(
  course: UserCourse,
  autoMap: Map<string, CreditBucketId>,
): CreditBucketId | null {
  const manual = course.credit_allocation;
  if (manual && isCreditBucketId(manual)) {
    const eligible = getEligibleCreditBuckets(course);
    if (eligible.includes(manual)) return manual;
  }
  const fromSkills = creditAllocationFromSkills(course.skills ?? []);
  if (fromSkills && getEligibleCreditBuckets(course).includes(fromSkills)) {
    return fromSkills;
  }
  return autoMap.get(course.id) ?? getEligibleCreditBuckets(course)[0] ?? null;
}

export function allocationLabel(
  course: UserCourse,
  autoMap: Map<string, CreditBucketId>,
): string {
  const bucket = getEffectiveCreditAllocation(course, autoMap);
  if (!bucket) return "—";
  const manual =
    (course.credit_allocation && isCreditBucketId(course.credit_allocation)) ||
    creditAllocationFromSkills(course.skills ?? []) != null;
  const base = BUCKET_LABELS[bucket];
  return manual ? base : `${base} (recommended)`;
}

/** Sync WR claim when student assigns WR bucket on an optional-WR course. */
export function countsAsWrForAllocation(
  course: UserCourse,
  allocation: CreditBucketId | null,
): boolean | null | undefined {
  if (allocation === "wr") return true;
  if (allocation && allocation !== "wr" && wrOffered(course)) return false;
  return undefined;
}

export type DistributionalAuditRow = {
  req: (typeof DISTRIBUTIONAL_REQUIREMENTS)[number];
  count: number;
  matched: UserCourse[];
  satisfied: boolean;
  remaining: number;
};

export function auditDistributionalWithAllocation(
  courses: UserCourse[],
  autoMap?: Map<string, CreditBucketId>,
): { rows: DistributionalAuditRow[]; allocations: Map<string, CreditBucketId> } {
  const allocations = autoMap ?? optimizeDistributionalAllocation(courses);

  const rows = DISTRIBUTIONAL_REQUIREMENTS.map((req) => {
    const matched = courses.filter(
      (c) => getEffectiveCreditAllocation(c, allocations) === req.id,
    );
    const count = matched.length;
    return {
      req,
      count,
      matched,
      satisfied: count >= req.count,
      remaining: Math.max(0, req.count - count),
    };
  });

  return { rows, allocations };
}
