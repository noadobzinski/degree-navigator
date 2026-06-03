import type { SlotResult, MajorAuditSection, UserCourse } from "@/lib/audit";

export type CredentialRequirementRow = {
  id: string;
  label: string;
  description?: string;
  needCount: number;
  filled: UserCourse[];
  satisfied: boolean;
  remaining: number;
};

export type RequirementProgress = {
  /** Course credits matched toward requirements (capped per slot). */
  coursesFilled: number;
  coursesRequired: number;
  slotsSatisfied: number;
  totalSlots: number;
  progressPct: number;
  remainingCourses: number;
};

export function progressFromSlotResults(results: SlotResult[]): RequirementProgress {
  let coursesFilled = 0;
  let coursesRequired = 0;
  let slotsSatisfied = 0;
  for (const r of results) {
    coursesRequired += r.slot.needCount;
    coursesFilled += Math.min(r.filled.length, r.slot.needCount);
    if (r.satisfied) slotsSatisfied++;
  }
  const remainingCourses = Math.max(0, coursesRequired - coursesFilled);
  const progressPct =
    coursesRequired > 0 ? Math.round((coursesFilled / coursesRequired) * 100) : 0;
  return {
    coursesFilled,
    coursesRequired,
    slotsSatisfied,
    totalSlots: results.length,
    progressPct,
    remainingCourses,
  };
}

export function slotResultsToRows(results: SlotResult[], idPrefix = ""): CredentialRequirementRow[] {
  return results.map((r) => ({
    id: `${idPrefix}${r.slot.id}`,
    label: r.slot.label,
    description: r.slot.description,
    needCount: r.slot.needCount,
    filled: r.filled,
    satisfied: r.satisfied,
    remaining: r.remaining,
  }));
}

export function flattenMajorAuditSections(sections: MajorAuditSection[]): CredentialRequirementRow[] {
  const rows: CredentialRequirementRow[] = [];
  for (const section of sections) {
    for (const r of section.results) {
      rows.push({
        id: `${section.title}-${r.slot.id}`,
        label: r.slot.label,
        description: r.slot.description,
        needCount: r.slot.needCount,
        filled: r.filled,
        satisfied: r.satisfied,
        remaining: r.remaining,
      });
    }
    for (const g of section.groups ?? []) {
      for (const r of g.slotResults) {
        rows.push({
          id: `${g.group.id}-${r.slot.id}`,
          label: `${g.group.label}: ${r.slot.label}`,
          description: g.group.description,
          needCount: r.slot.needCount,
          filled: r.filled,
          satisfied: r.satisfied,
          remaining: r.remaining,
        });
      }
    }
  }
  return rows;
}

export function allSlotResultsFromSections(sections: MajorAuditSection[]): SlotResult[] {
  const out: SlotResult[] = [];
  for (const section of sections) {
    out.push(...section.results);
    for (const g of section.groups ?? []) {
      out.push(...g.slotResults);
    }
  }
  return out;
}
