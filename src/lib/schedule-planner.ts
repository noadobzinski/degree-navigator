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
import {
  buildCompletedCourseIdentitySet,
  courseIdentityKey,
  lookupCatalogEntry,
} from "@/lib/course-codes";
import type { CrosslistLookup } from "@/lib/crosslist";
import {
  prerequisitesForCode,
  unmetPrerequisiteNote,
  unmetPrerequisites,
} from "@/lib/prerequisites";

export type ScheduledCourse = {
  code: string;
  title: string;
  reason: string;
  priority: "high" | "med" | "low";
  credits: number;
  source: "planned" | "suggested";
  /** Note shown when this course has prerequisites still to be satisfied. */
  prereqNote?: string;
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

/**
 * A user-supplied rough plan that the auto-planner works off of, instead of
 * imposing a fixed 4-courses-every-term grid. All fields are optional — an
 * empty skeleton reproduces the default behaviour.
 */
export type PlanSkeleton = {
  /** Default number of courses to schedule per term (clamped to 1–8). */
  coursesPerTerm?: number;
  /**
   * Per-term overrides keyed by season code (e.g. "202503"). A value of 0 marks
   * the term as "off" (study abroad / leave / light term) so the planner won't
   * add suggestions to it. Missing terms fall back to `coursesPerTerm`.
   */
  termTargets?: Record<string, number>;
};

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
  /** Optional rough plan the user sketched out; the planner fills in around it. */
  skeleton?: PlanSkeleton | null;
  catalogByCode: Record<string, CatalogCourse>;
  crosslistLookup?: CrosslistLookup;
};

const COURSES_PER_TERM = 4;
const MIN_COURSES_PER_TERM = 1;
const MAX_COURSES_PER_TERM = 8;
const SCHEDULE_SUGGESTION_LIMIT = 48;

function clampCourseLoad(value: number | undefined, fallback: number): number {
  if (value == null || !Number.isFinite(value)) return fallback;
  return Math.min(MAX_COURSES_PER_TERM, Math.max(MIN_COURSES_PER_TERM, Math.round(value)));
}

/** Target number of courses for a term given the user's skeleton (0 = term off). */
function termCapacity(
  seasonCode: string,
  defaultLoad: number,
  skeleton?: PlanSkeleton | null,
): number {
  const override = skeleton?.termTargets?.[seasonCode];
  if (override == null || !Number.isFinite(override)) return defaultLoad;
  if (override <= 0) return 0;
  return Math.min(MAX_COURSES_PER_TERM, Math.max(MIN_COURSES_PER_TERM, Math.round(override)));
}

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
    prereqNote: s.prereqNote,
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

/** Prerequisite course codes that should be auto-added so a needed advanced
 * course can actually be scheduled. Walks the prerequisite chain (capped). */
const MAX_INJECTED_PREREQS = 16;

function injectMissingPrerequisites(
  flex: ScheduledCourse[],
  terms: ScheduleTerm[],
  presentKeys: Set<string>,
  catalogByCode: Record<string, CatalogCourse>,
): ScheduledCourse[] {
  const present = new Set(presentKeys);
  for (const item of flex) present.add(courseIdentityKey(item.code));

  const result = [...flex];
  const queue: string[] = [
    ...flex.map((i) => i.code),
    ...terms.flatMap((t) => t.courses.map((c) => c.code)),
  ];
  let injected = 0;

  while (queue.length && injected < MAX_INJECTED_PREREQS) {
    const code = queue.shift()!;
    for (const group of prerequisitesForCode(code, catalogByCode)) {
      if (group.some((opt) => present.has(courseIdentityKey(opt)))) continue;
      const chosen = group.find((opt) => lookupCatalogEntry(opt, catalogByCode));
      if (!chosen) continue;
      const entry = lookupCatalogEntry(chosen, catalogByCode)!;
      const key = courseIdentityKey(entry.code);
      if (present.has(key)) continue;
      present.add(key);
      result.push({
        code: entry.code,
        title: entry.title,
        reason: `Prerequisite for ${code}`,
        priority: "high",
        credits: entry.credits || 1,
        source: "suggested",
      });
      queue.push(entry.code);
      injected += 1;
      if (injected >= MAX_INJECTED_PREREQS) break;
    }
  }

  return result;
}

/**
 * Earliest term index a course may be placed in so that every satisfiable
 * prerequisite group sits in a strictly earlier term. Returns `blocked` when a
 * prerequisite group has no option placed yet (so the caller defers it until a
 * later pass, after its prerequisite has been positioned).
 */
function earliestTermForPrereqs(
  code: string,
  placed: Map<string, number>,
  catalogByCode: Record<string, CatalogCourse>,
): { earliest: number; blocked: boolean } {
  let earliest = 0;
  for (const group of prerequisitesForCode(code, catalogByCode)) {
    const optionTerms = group
      .map((opt) => placed.get(courseIdentityKey(opt)))
      .filter((t): t is number => t !== undefined);
    if (optionTerms.length === 0) return { earliest, blocked: true };
    const minTerm = Math.min(...optionTerms);
    if (minTerm >= 0) earliest = Math.max(earliest, minTerm + 1);
  }
  return { earliest, blocked: false };
}

function firstTermWithCapacity(terms: ScheduleTerm[], from: number): number {
  for (let t = Math.max(0, from); t < terms.length; t++) {
    if (terms[t].courses.length < COURSES_PER_TERM) return t;
  }
  return -1;
}

function assignSuggestionsToTerms(
  suggestions: RoadmapSuggestion[],
  seasons: CatalogSeason[],
  plannedBySeason: Map<string, ScheduledCourse[]>,
  catalogByCode: Record<string, CatalogCourse>,
  completedKeys: Set<string>,
  skeleton?: PlanSkeleton | null,
): { terms: ScheduleTerm[]; unscheduled: ScheduledCourse[] } {
  const defaultLoad = clampCourseLoad(skeleton?.coursesPerTerm, COURSES_PER_TERM);

  const terms: ScheduleTerm[] = seasons.map((season) => {
    const courses = [...(plannedBySeason.get(season.code) ?? [])];
    const credits = courses.reduce((sum, c) => sum + c.credits, 0);
    return { seasonCode: season.code, label: season.label, courses, credits };
  });

  // Track where every known course sits: completed courses are available from
  // the start (-1); planned courses occupy their assigned term.
  const placed = new Map<string, number>();
  for (const key of completedKeys) placed.set(key, -1);
  terms.forEach((term, i) => {
    for (const c of term.courses) placed.set(courseIdentityKey(c.code), i);
  });
  // Per-term suggestion capacity from the skeleton. Planned (user-pinned)
  // courses always stay where the user put them, but they count against the
  // term's target so we don't overload a term the user wanted kept light.
  const capacityByCode = new Map<string, number>(
    terms.map((t) => [t.seasonCode, termCapacity(t.seasonCode, defaultLoad, skeleton)]),
  );

  const alreadyScheduled = new Set(
    terms.flatMap((t) => t.courses.map((c) => courseIdentityKey(c.code))),
  );

  const flexBase = suggestions
    .filter((s) => !placed.has(courseIdentityKey(s.code)))
    .map((s) => suggestionToScheduled(s, catalogByCode));

  const pending = injectMissingPrerequisites(
    flexBase,
    terms,
    new Set(placed.keys()),
    catalogByCode,
  ).sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);

  const unscheduled: ScheduledCourse[] = [];

  // Fixpoint placement: defer courses whose prerequisites are not yet placed so
  // they land in a later pass, after the prerequisite has a term.
  let progress = true;
  let guard = 0;
  while (progress && guard <= pending.length + 2) {
    progress = false;
    guard += 1;
    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      const key = courseIdentityKey(item.code);
      if (placed.has(key)) {
        pending.splice(i, 1);
        i--;
        continue;
      }
      const { earliest, blocked } = earliestTermForPrereqs(item.code, placed, catalogByCode);
      if (blocked) continue;
      const target = firstTermWithCapacity(terms, earliest);
      if (target < 0) {
        unscheduled.push(item);
        placed.set(key, terms.length);
        pending.splice(i, 1);
        i--;
        progress = true;
        continue;
      }
      terms[target].courses.push(item);
      terms[target].credits += item.credits;
      placed.set(key, target);
      pending.splice(i, 1);
      i--;
      progress = true;
    for (const term of terms) {
      const capacity = capacityByCode.get(term.seasonCode) ?? defaultLoad;
      if (term.courses.length >= capacity) continue;
      term.courses.push(course);
      term.credits += course.credits;
      placed = true;
      break;
    }
  }

  // Anything still pending is blocked by an unplaceable prerequisite or a cycle;
  // place it without the ordering constraint rather than dropping it.
  for (const item of pending) {
    const key = courseIdentityKey(item.code);
    if (placed.has(key)) continue;
    const target = firstTermWithCapacity(terms, 0);
    if (target < 0) {
      unscheduled.push(item);
      placed.set(key, terms.length);
    } else {
      terms[target].courses.push(item);
      terms[target].credits += item.credits;
      placed.set(key, target);
    }
  }

  annotatePrereqNotes(terms, unscheduled, completedKeys, catalogByCode);
  return { terms, unscheduled };
}

/**
 * Flag any course whose prerequisites are not satisfied by courses completed or
 * scheduled in a strictly earlier term. After ordering/injection this is only
 * hit when a prerequisite cannot be placed earlier (e.g. a course the student
 * manually planned too early, or a prerequisite missing from the catalog).
 */
function annotatePrereqNotes(
  terms: ScheduleTerm[],
  unscheduled: ScheduledCourse[],
  completedKeys: Set<string>,
  catalogByCode: Record<string, CatalogCourse>,
): void {
  const availableBefore = new Set(completedKeys);
  for (const term of terms) {
    const thisTermKeys: string[] = [];
    for (const course of term.courses) {
      const unmet = unmetPrerequisites(
        prerequisitesForCode(course.code, catalogByCode),
        availableBefore,
      );
      course.prereqNote = unmetPrerequisiteNote(unmet) ?? undefined;
      thisTermKeys.push(courseIdentityKey(course.code));
    }
    for (const key of thisTermKeys) availableBefore.add(key);
  }
  for (const course of unscheduled) {
    const unmet = unmetPrerequisites(
      prerequisitesForCode(course.code, catalogByCode),
      availableBefore,
    );
    course.prereqNote = unmetPrerequisiteNote(unmet) ?? undefined;
  }
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
  const completedKeys = buildCompletedCourseIdentitySet(
    input.courses.filter((c) => c.status === "completed"),
  );
  const { terms, unscheduled } = assignSuggestionsToTerms(
    suggestions,
    seasons,
    plannedBySeason,
    input.catalogByCode,
    completedKeys,
    input.skeleton,
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
