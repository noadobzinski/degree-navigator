import type { CatalogCourse } from "@/data/courses";
import { CATALOG_BY_CODE } from "@/data/courses";
import type { RequirementSlot } from "@/data/majors";
import { MAJORS_BY_ID, type MajorRequirements } from "@/data/majors";
import { TRACKS_BY_ID } from "@/data/tracks";
import { catalogMatchesSlot } from "@/lib/audit";
import { canonicalCourseCode } from "@/lib/course-codes";
import { currentSeasonCode } from "@/lib/coursetable";
import { recentCatalogSeasons, formatSeasonLabel } from "@/lib/coursetable-seasons";

export type CourseExample = {
  code: string;
  title: string;
  credits: number;
  offeredNow: boolean;
  /** Recent semesters this course appeared in the catalog (newest first). */
  recentSeasons: string[];
};

export type SlotExamplesGroup = {
  section: string;
  slotId: string;
  label: string;
  examples: CourseExample[];
};

const DEFAULT_LIMIT = 8;

function sortExamples(a: CourseExample, b: CourseExample, slot: RequirementSlot): number {
  if (a.offeredNow !== b.offeredNow) return a.offeredNow ? -1 : 1;
  const aExplicit = slot.codes?.some((c) => canonicalCourseCode(c) === canonicalCourseCode(a.code)) ? 0 : 1;
  const bExplicit = slot.codes?.some((c) => canonicalCourseCode(c) === canonicalCourseCode(b.code)) ? 0 : 1;
  if (aExplicit !== bExplicit) return aExplicit - bExplicit;
  return a.code.localeCompare(b.code);
}

function pushGroupSlots(
  out: { section: string; slot: RequirementSlot }[],
  section: string,
  groups: { slots: RequirementSlot[] }[] | undefined,
) {
  if (!groups?.length) return;
  for (const group of groups) {
    for (const slot of group.slots) out.push({ section, slot });
  }
}

export function collectSlotsFromRequirements(
  reqs: MajorRequirements,
): { section: string; slot: RequirementSlot }[] {
  const groups: { section: string; slot: RequirementSlot }[] = [];
  if (reqs.prerequisites?.length) {
    for (const slot of reqs.prerequisites) groups.push({ section: "Prerequisites", slot });
  }
  pushGroupSlots(groups, "Prerequisites", reqs.prerequisiteGroups);
  for (const slot of reqs.core) groups.push({ section: "Core requirements", slot });
  pushGroupSlots(groups, "Core requirements", reqs.coreGroups);
  if (reqs.electives?.length) {
    for (const slot of reqs.electives) groups.push({ section: "Electives", slot });
  }
  pushGroupSlots(groups, "Electives", reqs.electiveGroups);
  if (reqs.senior?.length) {
    for (const slot of reqs.senior) groups.push({ section: "Senior requirement", slot });
  }
  pushGroupSlots(groups, "Senior requirement", reqs.seniorGroups);
  return groups;
}

export function examplesForSlot(
  slot: RequirementSlot,
  catalogCourses: CatalogCourse[],
  seasonByCode: Map<string, string[]>,
  currentSeason: string,
  limit = DEFAULT_LIMIT,
): CourseExample[] {
  const seen = new Set<string>();
  const examples: CourseExample[] = [];

  for (const course of catalogCourses) {
    if (!catalogMatchesSlot(course, slot)) continue;
    const key = canonicalCourseCode(course.code);
    if (seen.has(key)) continue;
    seen.add(key);
    const seasons = seasonByCode.get(course.code.toUpperCase()) ?? seasonByCode.get(key) ?? [];
    examples.push({
      code: course.code,
      title: course.title,
      credits: course.credits,
      offeredNow: seasons.includes(currentSeason),
      recentSeasons: [...seasons]
        .sort((a, b) => b.localeCompare(a))
        .slice(0, 3)
        .map(formatSeasonLabel),
    });
  }

  if (slot.codes?.length) {
    for (const code of slot.codes) {
      const key = canonicalCourseCode(code);
      if (seen.has(key)) continue;
      const staticCourse = CATALOG_BY_CODE[code] ?? CATALOG_BY_CODE[key];
      if (staticCourse && catalogMatchesSlot(staticCourse, slot)) {
        seen.add(key);
        examples.push({
          code: staticCourse.code,
          title: staticCourse.title,
          credits: staticCourse.credits,
          offeredNow: false,
          recentSeasons: [],
        });
      }
    }
  }

  examples.sort((a, b) => sortExamples(a, b, slot));
  return examples.slice(0, limit);
}

export function seasonsForHistoricalCatalog(_classYear?: number | null): string[] {
  return recentCatalogSeasons(8).map((s) => s.code);
}

export function buildSlotExampleGroups(
  sections: { section: string; slot: RequirementSlot }[],
  catalogCourses: CatalogCourse[],
  seasonByCode: Map<string, string[]>,
  currentSeason: string,
): SlotExamplesGroup[] {
  return sections.map(({ section, slot }) => ({
    section,
    slotId: slot.id,
    label: slot.label,
    examples: examplesForSlot(slot, catalogCourses, seasonByCode, currentSeason),
  }));
}

export function getMajorExampleSections(
  majorId: string,
  degree: "BA" | "BS",
  catalogCourses: CatalogCourse[],
  seasonByCode: Map<string, string[]>,
  currentSeason: string,
): SlotExamplesGroup[] {
  const major = MAJORS_BY_ID[majorId];
  if (!major) return [];
  const reqs = major.requirements[degree] ?? Object.values(major.requirements)[0];
  if (!reqs) return [];
  return buildSlotExampleGroups(collectSlotsFromRequirements(reqs), catalogCourses, seasonByCode, currentSeason);
}

export function getTrackExampleSections(
  trackId: string | null | undefined,
  catalogCourses: CatalogCourse[],
  seasonByCode: Map<string, string[]>,
  currentSeason: string,
): SlotExamplesGroup[] {
  if (!trackId || trackId === "none") return [];
  const track = TRACKS_BY_ID[trackId];
  if (!track) return [];
  const sections = track.requirements.map((slot) => ({ section: track.name, slot }));
  return buildSlotExampleGroups(sections, catalogCourses, seasonByCode, currentSeason);
}
