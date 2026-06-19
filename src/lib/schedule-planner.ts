import type { CatalogCourse } from "@/data/courses";
import { MAJORS_BY_ID } from "@/data/majors";
import {
  suggestRoadmap,
  type RoadmapSuggestion,
  type UserCourse,
} from "@/lib/audit";
import {
  compareSeasonCodes,
  futureSeasonsUntilGraduation,
  termFieldsToSeasonCode,
  type CatalogSeason,
  type YaleTerm,
} from "@/lib/coursetable-seasons";
import { currentSeasonCode } from "@/lib/coursetable";
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
  /** Hypothetical second major for what-if planning (does not mutate saved profile). */
  exploreMajorId?: string | null;
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
  return catalogByCode[code.toUpperCase()]?.credits ?? catalogByCode[code]?.credits ?? 1;
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
    title: course.course_title ?? catalogByCode[course.course_code.toUpperCase()]?.title ?? course.course_code,
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

function resolveSecondMajor(input: SchedulePlannerInput): {
  secondMajorId: string | null;
  secondDegree: "BA" | "BS";
  scenarioLabel: string;
} {
  const primary = MAJORS_BY_ID[input.majorId];
  const primaryName = primary?.name ?? "your major";

  if (input.exploreMajorId && input.exploreMajorId !== input.majorId) {
    const explore = MAJORS_BY_ID[input.exploreMajorId];
    const exploreName = explore?.name ?? input.exploreMajorId;
    const exploreDegree = explore?.defaultDegree ?? input.degree;

    if (!input.secondMajorId) {
      return {
        secondMajorId: input.exploreMajorId,
        secondDegree: exploreDegree,
        scenarioLabel: `If you added ${exploreName} as a second major alongside ${primaryName}`,
      };
    }

    if (input.secondMajorId === input.exploreMajorId) {
      const second = MAJORS_BY_ID[input.secondMajorId];
      return {
        secondMajorId: input.secondMajorId,
        secondDegree: input.secondDegree ?? input.degree,
        scenarioLabel: `Your current plan (${primaryName} + ${second?.name ?? "second major"})`,
      };
    }

    const currentSecond = MAJORS_BY_ID[input.secondMajorId];
    return {
      secondMajorId: input.exploreMajorId,
      secondDegree: exploreDegree,
      scenarioLabel: `If your second major were ${exploreName} instead of ${currentSecond?.name ?? "your current second major"}`,
    };
  }

  if (input.secondMajorId) {
    const second = MAJORS_BY_ID[input.secondMajorId];
    return {
      secondMajorId: input.secondMajorId,
      secondDegree: input.secondDegree ?? input.degree,
      scenarioLabel: `${primaryName} + ${second?.name ?? "second major"}`,
    };
  }

  return {
    secondMajorId: null,
    secondDegree: input.degree,
    scenarioLabel: primaryName,
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

    const key = course.course_code.toUpperCase();
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
    terms.flatMap((t) => t.courses.map((c) => c.code.toUpperCase())),
  );

  const sorted = [...suggestions]
    .filter((s) => !alreadyScheduled.has(s.code.toUpperCase()))
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
  const { secondMajorId, secondDegree, scenarioLabel } = resolveSecondMajor(input);

  const suggestions = suggestRoadmap(
    input.courses,
    input.majorId,
    input.degree,
    input.trackId ?? null,
    input.catalogByCode,
    secondMajorId,
    secondDegree,
    input.crosslistLookup,
    input.concentrationId ?? null,
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
    terms: nonEmptyTerms.length > 0 ? terms : seasons.slice(0, 1).map((s) => ({
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
    [...a.terms.flatMap((t) => t.courses), ...a.unscheduled].map((c) => c.code.toUpperCase()),
  );
  return [...b.terms.flatMap((t) => t.courses), ...b.unscheduled]
    .filter((c) => !codesA.has(c.code.toUpperCase()))
    .map((c) => c.code);
}
