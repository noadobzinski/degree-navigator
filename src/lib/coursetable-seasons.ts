import { currentSeasonCode } from "@/lib/coursetable";
import { courseIdentityKey } from "@/lib/course-codes";

export type YaleTerm = "Fall" | "Spring" | "Summer";

export type CatalogSeason = {
  code: string;
  label: string;
  term: YaleTerm;
  calendarYear: number;
};

/** First fall semester for a Yale class (e.g. 2029 → Fall 2025). */
export function firstFallYearForClass(classYear: number): number {
  return classYear - 4;
}

export function fallSeasonCode(calendarYear: number): string {
  return `${calendarYear}03`;
}

export function springSeasonCode(calendarYear: number): string {
  return `${calendarYear}01`;
}

export function summerSeasonCode(calendarYear: number): string {
  return `${calendarYear}02`;
}

export function seasonToTermFields(code: string): { term: YaleTerm; year: number } {
  const calendarYear = parseInt(code.slice(0, 4), 10);
  const termNum = code.slice(4, 6);
  if (termNum === "03") return { term: "Fall", year: calendarYear };
  if (termNum === "01") return { term: "Spring", year: calendarYear };
  return { term: "Summer", year: calendarYear };
}

export function formatSeasonLabel(code: string): string {
  const { term, year } = seasonToTermFields(code);
  return `${term} ${year}`;
}

/** Compare Yale season codes chronologically (YYYY01/02/03). */
export function compareSeasonCodes(a: string, b: string): number {
  return a.localeCompare(b);
}

/**
 * Semesters from first fall through the current catalog season (inclusive).
 * Skips summer terms — CourseTable summer catalogs are sparse.
 */
export function catalogSeasonsForClassYear(classYear: number, now = new Date()): CatalogSeason[] {
  const firstFall = firstFallYearForClass(classYear);
  const current = currentSeasonCode(now);
  const codes: string[] = [];

  for (let y = firstFall; y <= classYear; y++) {
    codes.push(fallSeasonCode(y));
    const springYear = y + 1;
    if (springYear <= classYear) {
      codes.push(springSeasonCode(springYear));
    }
  }

  const seen = new Set<string>();
  const seasons: CatalogSeason[] = [];
  for (const code of codes) {
    if (seen.has(code) || compareSeasonCodes(code, current) > 0) continue;
    seen.add(code);
    const { term, year } = seasonToTermFields(code);
    seasons.push({ code, label: formatSeasonLabel(code), term, calendarYear: year });
  }

  return seasons.sort((a, b) => compareSeasonCodes(a.code, b.code));
}

function previousSeasonCode(code: string): string {
  const { term, year } = seasonToTermFields(code);
  if (term === "Fall") return springSeasonCode(year);
  if (term === "Spring") return fallSeasonCode(year - 1);
  return springSeasonCode(year);
}

/** Recent semesters for users without a class year set. */
export function recentCatalogSeasons(count = 8, now = new Date()): CatalogSeason[] {
  const codes: string[] = [];
  let code = currentSeasonCode(now);
  for (let i = 0; i < count; i++) {
    codes.push(code);
    code = previousSeasonCode(code);
  }
  return codes.reverse().map((c) => {
    const { term, year } = seasonToTermFields(c);
    return { code: c, label: formatSeasonLabel(c), term, calendarYear: year };
  });
}

export function courseTakenKey(
  courseCode: string,
  term: string | null,
  year: number | null,
): string {
  return `${courseIdentityKey(courseCode)}|${term ?? ""}|${year ?? ""}`;
}

export function termFieldsToSeasonCode(term: YaleTerm, calendarYear: number): string {
  if (term === "Fall") return fallSeasonCode(calendarYear);
  if (term === "Spring") return springSeasonCode(calendarYear);
  return summerSeasonCode(calendarYear);
}

/** Next semester after `code` (skips summer — sparse catalog). */
export function nextSeasonCode(code: string): string {
  const { term, year } = seasonToTermFields(code);
  if (term === "Fall") return springSeasonCode(year + 1);
  if (term === "Spring") return fallSeasonCode(year);
  return fallSeasonCode(year);
}

/**
 * Upcoming semesters from the current catalog season through graduation
 * (Spring of class year). Defaults to 8 terms when class year is unknown.
 */
export function futureSeasonsUntilGraduation(
  classYear: number | null,
  now = new Date(),
): CatalogSeason[] {
  const current = currentSeasonCode(now);
  const endCode = classYear ? springSeasonCode(classYear) : null;
  const codes: string[] = [];
  let code = current;

  for (let i = 0; i < 16; i++) {
    codes.push(code);
    if (endCode && compareSeasonCodes(code, endCode) >= 0) break;
    code = nextSeasonCode(code);
    if (!endCode && codes.length >= 8) break;
  }

  return codes.map((c) => {
    const { term, year } = seasonToTermFields(c);
    return { code: c, label: formatSeasonLabel(c), term, calendarYear: year };
  });
}
