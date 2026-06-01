import { CATALOG_BY_CODE, type CatalogCourse } from "@/data/courses";
import { DISTRIBUTIONAL_REQUIREMENTS, GRADUATION_CREDITS } from "@/data/distributional";
import { MAJORS_BY_ID, type RequirementSlot, type MajorRequirements } from "@/data/majors";
import { TRACKS_BY_ID } from "@/data/tracks";

export type UserCourse = {
  id: string;
  course_code: string;
  course_title: string | null;
  credits: number;
  distributional: string[];
  skills: string[];
  status: "planned" | "in_progress" | "completed";
  term: string | null;
  year: number | null;
};

export type SlotResult = {
  slot: RequirementSlot;
  filled: UserCourse[];
  satisfied: boolean;
  remaining: number;
};

function matchesSlot(course: UserCourse, slot: RequirementSlot): boolean {
  const code = course.course_code.toUpperCase();
  if (slot.codes?.some((c) => c.toUpperCase() === code)) return true;
  if (slot.codePrefix?.some((p) => code.startsWith(p.toUpperCase()))) {
    const numMatch = code.match(/(\d{3,4})/);
    const num = numMatch ? parseInt(numMatch[1], 10) : 0;
    if (slot.minLevel && num < slot.minLevel) return false;
    if (slot.maxLevel && num > slot.maxLevel) return false;
    return true;
  }
  return false;
}

function matchesCatalogCourse(course: CatalogCourse, slot: RequirementSlot): boolean {
  return matchesSlot(
    {
      id: course.code,
      course_code: course.code,
      course_title: course.title,
      credits: course.credits,
      distributional: course.distributional,
      skills: course.skills,
      status: "planned",
      term: null,
      year: null,
    },
    slot,
  );
}

function lookupCatalog(code: string, catalogByCode: Record<string, CatalogCourse>): CatalogCourse | undefined {
  return catalogByCode[code] ?? catalogByCode[code.toUpperCase()];
}

function fillSlots(
  slots: RequirementSlot[],
  courses: UserCourse[],
  consumed: Set<string>,
): SlotResult[] {
  return slots.map((slot) => {
    const filled: UserCourse[] = [];
    for (const c of courses) {
      if (filled.length >= slot.needCount) break;
      if (consumed.has(c.id)) continue;
      if (matchesSlot(c, slot)) {
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

export type MajorAuditSection = { title: string; results: SlotResult[] };

export function auditMajor(courses: UserCourse[], majorId: string, degree: "BA" | "BS") {
  const major = MAJORS_BY_ID[majorId];
  if (!major) return null;
  const reqs = major.requirements[degree] ?? Object.values(major.requirements)[0];
  if (!reqs) return null;
  const consumed = new Set<string>();
  const sections: MajorAuditSection[] = [];
  if (reqs.prerequisites?.length) sections.push({ title: "Prerequisites", results: fillSlots(reqs.prerequisites, courses, consumed) });
  sections.push({ title: "Core requirements", results: fillSlots(reqs.core, courses, consumed) });
  if (reqs.electives?.length) sections.push({ title: "Electives", results: fillSlots(reqs.electives, courses, consumed) });
  if (reqs.senior?.length) sections.push({ title: "Senior requirement", results: fillSlots(reqs.senior, courses, consumed) });

  const allResults = sections.flatMap((s) => s.results);
  const satisfiedCount = allResults.filter((r) => r.satisfied).length;
  const totalCount = allResults.length;
  return { major, degree, reqs, sections, satisfiedCount, totalCount };
}

export function auditTrack(courses: UserCourse[], trackId: string | null) {
  if (!trackId || trackId === "none") return null;
  const track = TRACKS_BY_ID[trackId];
  if (!track) return null;
  const consumed = new Set<string>();
  const results = fillSlots(track.requirements, courses, consumed);
  return { track, results, satisfiedCount: results.filter((r) => r.satisfied).length, totalCount: results.length };
}

export function auditDistributional(courses: UserCourse[]) {
  return DISTRIBUTIONAL_REQUIREMENTS.map((req) => {
    let count = 0;
    const matched: UserCourse[] = [];
    for (const c of courses) {
      if (req.tag === "L_ANY") {
        if (c.skills.some((s) => ["L4", "L5"].includes(s))) {
          count++; matched.push(c); break;
        }
      } else if (
        c.distributional.includes(req.tag as "Hu" | "So" | "Sc") ||
        c.skills.includes(req.tag as "QR" | "WR")
      ) {
        count++; matched.push(c);
      }
    }
    return { req, count, matched, satisfied: count >= req.count, remaining: Math.max(0, req.count - count) };
  });
}

export function totalCredits(courses: UserCourse[]) {
  return courses.reduce((sum, c) => sum + (c.credits || 1), 0);
}

export function graduationCredits() {
  return GRADUATION_CREDITS;
}

export function suggestRoadmap(
  courses: UserCourse[],
  majorId: string | null,
  degree: "BA" | "BS",
  trackId: string | null,
  catalogByCode: Record<string, CatalogCourse> = CATALOG_BY_CODE,
): { priority: "high" | "med" | "low"; code: string; title: string; reason: string }[] {
  const completedCodes = new Set(courses.map((c) => c.course_code.toUpperCase()));
  const suggestions: { priority: "high" | "med" | "low"; code: string; title: string; reason: string }[] = [];
  const seen = new Set<string>();
  const pushIf = (code: string, reason: string, priority: "high" | "med" | "low") => {
    const c = lookupCatalog(code, catalogByCode);
    if (!c) return;
    if (completedCodes.has(code.toUpperCase())) return;
    if (seen.has(code)) return;
    seen.add(code);
    suggestions.push({ code, title: c.title, reason, priority });
  };

  const suggestForSlot = (slot: RequirementSlot, remaining: number, reason: string, priority: "high" | "med" | "low") => {
    if (remaining <= 0) return;
    (slot.codes ?? []).slice(0, remaining).forEach((code) => pushIf(code, reason, priority));
    const explicitCount = Math.min(remaining, slot.codes?.length ?? 0);
    const prefixNeed = remaining - explicitCount;
    if (prefixNeed > 0 && slot.codePrefix?.length) {
      let added = 0;
      for (const c of Object.values(catalogByCode)) {
        if (added >= prefixNeed) break;
        if (!matchesCatalogCourse(c, slot)) continue;
        const key = c.code.toUpperCase();
        if (completedCodes.has(key) || seen.has(c.code)) continue;
        pushIf(c.code, reason, priority);
        added++;
      }
    }
  };

  if (majorId) {
    const audit = auditMajor(
      courses.map((c) => ({ ...c })),
      majorId,
      degree,
    );
    if (audit) {
      for (const s of audit.sections) {
        for (const r of s.results) {
          if (r.satisfied) continue;
          suggestForSlot(r.slot, r.remaining, `Major: ${r.slot.label}`, "high");
        }
      }
    }
  }

  if (trackId && trackId !== "none") {
    const t = auditTrack(courses, trackId);
    if (t) {
      for (const r of t.results) {
        if (r.satisfied) continue;
        suggestForSlot(r.slot, r.remaining, `${t.track.name}: ${r.slot.label}`, "high");
      }
    }
  }

  const dist = auditDistributional(courses);
  for (const d of dist) {
    if (d.satisfied) continue;
    for (const c of Object.values(catalogByCode)) {
      if (completedCodes.has(c.code.toUpperCase())) continue;
      const matches =
        d.req.tag === "L_ANY"
          ? c.skills.some((s) => ["L4", "L5"].includes(s))
          : c.distributional.includes(d.req.tag as never) || c.skills.includes(d.req.tag as never);
      if (matches) {
        pushIf(c.code, `Distributional: ${d.req.label}`, "med");
        if (suggestions.filter((s) => s.reason.startsWith("Distributional")).length >= 6) break;
      }
    }
  }

  return suggestions.slice(0, 18);
}
