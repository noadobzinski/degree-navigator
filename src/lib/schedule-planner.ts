import type { CatalogCourse } from "@/data/courses";
import { MAJORS_BY_ID } from "@/data/majors";
import { TRACKS_BY_ID } from "@/data/tracks";
import { suggestRoadmap, type RoadmapSuggestion, type UserCourse } from "@/lib/audit";
import {
  compareSeasonCodes,
  futureSeasonsUntilGraduation,
  termFieldsToSeasonCode,
  type CatalogSeason,
  type YaleTerm,
} from "@/lib/coursetable-seasons";
import { currentSeasonCode } from "@/lib/coursetable";
import { courseIdentityKey, lookupCatalogEntry } from "@/lib/course-codes";
import type { CrosslistLookup } from "@/lib/crosslist";

export type ScheduledCourse = {
  code: string;
  title: string;
  reason: string;
  priority: "high" | "med" | "low";
  credits: number;
  source: "planned" | "suggested";
};

export type ScheduleTerm = {
  seasonCode: string;
  label: string;
  courses: ScheduledCourse[];
  credits: number;
};

export type DegreeSchedule = {
  terms: ScheduleTerm[];
  unscheduled: ScheduledCourse[];
  summary: {
    suggestedCount: number;
    plannedCount: number;
    termsRemaining: number;
    graduationYear: number | null;
  };
  scenarioLabel: string;
};

/**
 * How a hypothetical "explore" major is folded into the what-if schedule:
 * - `second-major`: add it alongside the current major(s) (default, legacy behavior).
 * - `switch-major`: replace the current primary major entirely with it.
 */
export type ExploreMode = "second-major" | "switch-major";

export type SchedulePlannerInput = {
  courses: UserCourse[];
  majorId: string;
  degree: "BA" | "BS";
  secondMajorId?: string | null;
  secondDegree?: "BA" | "BS";
  trackId?: string | null;
  concentrationId?: string | null;
  certificateIds?: string[];
  classYear?: number | null;
  /** Hypothetical major for what-if planning (does not mutate saved profile). */
  exploreMajorId?: string | null;
  /** Whether the explore major is added as a second major or swapped in as the primary. */
  exploreMode?: ExploreMode;
  /**
   * Hypothetical career track (premed/prelaw/etc.) for what-if planning.
   * `undefined` keeps the saved track; a string (including `"none"`) previews
   * that track instead. Does not mutate the saved profile.
   */
  exploreTrackId?: string | null;
  catalogByCode: Record<string, CatalogCourse>;
  crosslistLookup?: CrosslistLookup;
};

const COURSES_PER_TERM = 4;
const SCHEDULE_SUGGESTION_LIMIT = 48;

const PRIORITY_RANK: Record<RoadmapSuggestion["priority"], number> = {
  high: 0,
  med: 1,
  low: 2,
};

function catalogCredits(code: string, catalogByCode: Record<string, CatalogCourse>): number {
  return lookupCatalogEntry(code, catalogByCode)?.credits ?? 1;
}

function toScheduled(
  course: UserCourse,
  source: "planned" | "suggested",
  catalogByCode: Record<string, CatalogCourse>,
  reason = "Already on your course list",
  priority: RoadmapSuggestion["priority"] = "high",
): ScheduledCourse {
  return {
    code: course.course_code,
    title:
      course.course_title ??
      lookupCatalogEntry(course.course_code, catalogByCode)?.title ??
      course.course_code,
    reason,
    priority,
    credits: course.credits || catalogCredits(course.course_code, catalogByCode),
    source,
  };
}

function suggestionToScheduled(
  s: RoadmapSuggestion,
  catalogByCode: Record<string, CatalogCourse>,
): ScheduledCourse {
  return {
    code: s.code,
    title: s.title,
    reason: s.reason,
    priority: s.priority,
    credits: catalogCredits(s.code, catalogByCode),
    source: "suggested",
  };
}

/** Effective major configuration after applying a what-if explore scenario. */
type ResolvedScenario = {
  majorId: string;
  degree: "BA" | "BS";
  trackId: string | null;
  concentrationId: string | null;
  secondMajorId: string | null;
  secondDegree: "BA" | "BS";
  scenarioLabel: string;
};

/** Normalize a track id: treat empty/`"none"` as "no track". */
function normalizeTrackId(id: string | null | undefined): string | null {
  return !id || id === "none" ? null : id;
}

function trackName(id: string | null): string {
  if (!id) return "no track";
  return TRACKS_BY_ID[id]?.name ?? id;
}

/** Resolution of just the major portion of a scenario (track applied separately). */
type MajorScenario = {
  majorId: string;
  degree: "BA" | "BS";
  concentrationId: string | null;
  secondMajorId: string | null;
  secondDegree: "BA" | "BS";
  majorLabel: string;
  majorChanged: boolean;
};

function resolveMajorScenario(input: SchedulePlannerInput): MajorScenario {
  const primary = MAJORS_BY_ID[input.majorId];
  const primaryName = primary?.name ?? "your major";
  const baseConcentrationId = input.concentrationId ?? null;
  const baseSecondDegree = input.secondDegree ?? input.degree;

  const baseline: MajorScenario = {
    majorId: input.majorId,
    degree: input.degree,
    concentrationId: baseConcentrationId,
    secondMajorId: input.secondMajorId ?? null,
    secondDegree: baseSecondDegree,
    majorLabel: input.secondMajorId
      ? `${primaryName} + ${MAJORS_BY_ID[input.secondMajorId]?.name ?? "second major"}`
      : primaryName,
    majorChanged: false,
  };

  const exploreId =
    input.exploreMajorId && input.exploreMajorId !== input.majorId ? input.exploreMajorId : null;
  if (!exploreId) return baseline;

  const explore = MAJORS_BY_ID[exploreId];
  const exploreName = explore?.name ?? exploreId;
  const exploreDegree = explore?.defaultDegree ?? input.degree;
  const mode: ExploreMode = input.exploreMode ?? "second-major";

  // Switch the primary major entirely. The concentration belongs to the old
  // major, so drop it. An existing, distinct second major is kept. (Career
  // tracks like premed are not tied to a major, so they're handled separately.)
  if (mode === "switch-major") {
    const keepSecondId =
      input.secondMajorId && input.secondMajorId !== exploreId ? input.secondMajorId : null;
    const keepSecond = keepSecondId ? MAJORS_BY_ID[keepSecondId] : null;
    return {
      majorId: exploreId,
      degree: exploreDegree,
      concentrationId: null,
      secondMajorId: keepSecondId,
      secondDegree: keepSecondId ? baseSecondDegree : exploreDegree,
      majorLabel: keepSecond
        ? `If you switched your major to ${exploreName} (keeping ${keepSecond.name})`
        : `If you switched your major to ${exploreName} instead of ${primaryName}`,
      majorChanged: true,
    };
  }

  // Add the explore major as a second major alongside the current primary.
  if (!input.secondMajorId) {
    return {
      ...baseline,
      secondMajorId: exploreId,
      secondDegree: exploreDegree,
      majorLabel: `If you added ${exploreName} as a second major alongside ${primaryName}`,
      majorChanged: true,
    };
  }

  if (input.secondMajorId === exploreId) {
    const second = MAJORS_BY_ID[input.secondMajorId];
    return {
      ...baseline,
      majorLabel: `Your current plan (${primaryName} + ${second?.name ?? "second major"})`,
    };
  }

  const currentSecond = MAJORS_BY_ID[input.secondMajorId];
  return {
    ...baseline,
    secondMajorId: exploreId,
    secondDegree: exploreDegree,
    majorLabel: `If your second major were ${exploreName} instead of ${currentSecond?.name ?? "your current second major"}`,
    majorChanged: true,
  };
}

function buildScenarioLabel(
  major: MajorScenario,
  baseTrackId: string | null,
  effectiveTrackId: string | null,
  trackChanged: boolean,
): string {
  if (!trackChanged) return major.majorLabel;

  const fromName = trackName(baseTrackId);
  const toName = trackName(effectiveTrackId);

  if (!major.majorChanged) {
    if (!baseTrackId) return `If you followed the ${toName} track`;
    if (!effectiveTrackId) return `If you dropped the ${fromName} track`;
    return `If you switched from the ${fromName} track to the ${toName} track`;
  }

  const clause = !effectiveTrackId
    ? `dropping the ${fromName} track`
    : !baseTrackId
      ? `adding the ${toName} track`
      : `switching to the ${toName} track`;
  return `${major.majorLabel}, ${clause}`;
}

function resolveScenario(input: SchedulePlannerInput): ResolvedScenario {
  const major = resolveMajorScenario(input);

  // Career tracks (premed/prelaw/etc.) are independent of the chosen major, so
  // they're resolved on top of the major scenario. `exploreTrackId === undefined`
  // means "keep the saved track"; any string (including "none") previews it.
  const baseTrackId = normalizeTrackId(input.trackId);
  const exploringTrack = input.exploreTrackId !== undefined;
  const effectiveTrackId = exploringTrack ? normalizeTrackId(input.exploreTrackId) : baseTrackId;
  const trackChanged = effectiveTrackId !== baseTrackId;

  return {
    majorId: major.majorId,
    degree: major.degree,
    trackId: effectiveTrackId,
    concentrationId: major.concentrationId,
    secondMajorId: major.secondMajorId,
    secondDegree: major.secondDegree,
    scenarioLabel: buildScenarioLabel(major, baseTrackId, effectiveTrackId, trackChanged),
  };
}

function plannedCoursesBySeason(
  courses: UserCourse[],
  seasons: CatalogSeason[],
  currentSeason: string,
  catalogByCode: Record<string, CatalogCourse>,
): Map<string, ScheduledCourse[]> {
  const seasonSet = new Set(seasons.map((s) => s.code));
  const bySeason = new Map<string, ScheduledCourse[]>();
  const seenCodes = new Set<string>();

  for (const course of courses) {
    if (course.status === "completed") continue;

    let season: string | null = null;
    if (course.term && course.year != null) {
      season = termFieldsToSeasonCode(course.term as YaleTerm, course.year);
    } else if (course.status === "in_progress") {
      season = currentSeason;
    }

    if (!season || !seasonSet.has(season)) continue;

    const key = courseIdentityKey(course.course_code);
    if (seenCodes.has(key)) continue;
    seenCodes.add(key);

    const list = bySeason.get(season) ?? [];
    list.push(toScheduled(course, "planned", catalogByCode));
    bySeason.set(season, list);
  }

  return bySeason;
}

function assignSuggestionsToTerms(
  suggestions: RoadmapSuggestion[],
  seasons: CatalogSeason[],
  plannedBySeason: Map<string, ScheduledCourse[]>,
  catalogByCode: Record<string, CatalogCourse>,
): { terms: ScheduleTerm[]; unscheduled: ScheduledCourse[] } {
  const terms: ScheduleTerm[] = seasons.map((season) => {
    const courses = [...(plannedBySeason.get(season.code) ?? [])];
    const credits = courses.reduce((sum, c) => sum + c.credits, 0);
    return { seasonCode: season.code, label: season.label, courses, credits };
  });

  const alreadyScheduled = new Set(
    terms.flatMap((t) => t.courses.map((c) => courseIdentityKey(c.code))),
  );

  const sorted = [...suggestions]
    .filter((s) => !alreadyScheduled.has(courseIdentityKey(s.code)))
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);

  const unscheduled: ScheduledCourse[] = [];

  for (const suggestion of sorted) {
    const course = suggestionToScheduled(suggestion, catalogByCode);
    let placed = false;

    for (const term of terms) {
      if (term.courses.length >= COURSES_PER_TERM) continue;
      term.courses.push(course);
      term.credits += course.credits;
      placed = true;
      break;
    }

    if (!placed) unscheduled.push(course);
  }

  return { terms, unscheduled };
}

export function buildDegreeSchedule(input: SchedulePlannerInput): DegreeSchedule {
  const currentSeason = currentSeasonCode();
  const seasons = futureSeasonsUntilGraduation(input.classYear ?? null);
  const { majorId, degree, trackId, concentrationId, secondMajorId, secondDegree, scenarioLabel } =
    resolveScenario(input);

  const suggestions = suggestRoadmap(
    input.courses,
    majorId,
    degree,
    trackId,
    input.catalogByCode,
    secondMajorId,
    secondDegree,
    input.crosslistLookup,
    concentrationId,
    input.certificateIds ?? null,
    SCHEDULE_SUGGESTION_LIMIT,
  );

  const plannedBySeason = plannedCoursesBySeason(
    input.courses,
    seasons,
    currentSeason,
    input.catalogByCode,
  );

  const plannedCount = [...plannedBySeason.values()].reduce((n, list) => n + list.length, 0);
  const { terms, unscheduled } = assignSuggestionsToTerms(
    suggestions,
    seasons,
    plannedBySeason,
    input.catalogByCode,
  );

  const nonEmptyTerms = terms.filter((t) => t.courses.length > 0);
  const lastSeason = seasons.at(-1)?.code ?? currentSeason;

  return {
    terms:
      nonEmptyTerms.length > 0
        ? terms
        : seasons.slice(0, 1).map((s) => ({
            seasonCode: s.code,
            label: s.label,
            courses: [],
            credits: 0,
          })),
    unscheduled,
    summary: {
      suggestedCount: suggestions.length,
      plannedCount,
      termsRemaining: seasons.filter((s) => compareSeasonCodes(s.code, lastSeason) <= 0).length,
      graduationYear: input.classYear ?? null,
    },
    scenarioLabel,
  };
}

/** Course codes present in `b` but not in `a` (by code, case-insensitive). */
export function scheduleDiffCodes(a: DegreeSchedule, b: DegreeSchedule): string[] {
  const codesA = new Set(
    [...a.terms.flatMap((t) => t.courses), ...a.unscheduled].map((c) => courseIdentityKey(c.code)),
  );
  return [...b.terms.flatMap((t) => t.courses), ...b.unscheduled]
    .filter((c) => !codesA.has(courseIdentityKey(c.code)))
    .map((c) => c.code);
}
