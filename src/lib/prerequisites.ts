import type { CatalogCourse } from "@/data/courses";
import { canonicalCourseCode, courseIdentityKey, lookupCatalogEntry } from "@/lib/course-codes";

/**
 * A prerequisite expressed as a list of AND-groups. Each group holds OR
 * alternatives, so the prerequisite is satisfied when, for every group, at
 * least one of its course codes has been taken/planned.
 *
 * Example: "ASTR 320, MATH 120, 222 or 225, and 246" parses to
 *   [["ASTR 320"], ["MATH 120"], ["MATH 222", "MATH 225"], ["MATH 246"]]
 */
export type PrereqGroup = string[];

const COURSE_CODE_RE = /([A-Z&]{2,5})\s+(\d{3,4}[A-Z]?)|(\d{3,4}[A-Z]?)/g;

/**
 * Phrases that follow the listed course codes but are not themselves hard
 * course prerequisites (instructor permission, equivalents, placement exams,
 * etc.). We truncate the prerequisite clause at the first such phrase so we
 * only enforce concrete course requirements and avoid false positives like
 * "placement into MATH 1150" naming the course's own code.
 */
const SOFT_STOP_RE =
  /\b(permission|equivalent|equivalents|placement|concurrent|corequisite|instructor|department|director|recommended|score|exam|test|approval|consent)\b/i;

/** Find the prerequisite clause inside a requirements/description string. */
function prerequisiteClause(text: string): string | null {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return null;

  // "Recommended preparation" is advisory, not a hard prerequisite.
  if (/^recommended\b/i.test(normalized)) return null;

  let start = -1;
  const prereqMatch = normalized.match(/prerequisites?:?\s*/i);
  if (prereqMatch && prereqMatch.index != null) {
    start = prereqMatch.index + prereqMatch[0].length;
  } else if (/^after\s+/i.test(normalized)) {
    start = normalized.match(/^after\s+/i)![0].length;
  } else {
    return null;
  }

  let clause = normalized.slice(start);

  // Stop at the end of the sentence.
  const periodIdx = clause.search(/\.(\s|$)/);
  if (periodIdx >= 0) clause = clause.slice(0, periodIdx);

  // Stop at the first soft/advisory phrase.
  const softMatch = clause.match(SOFT_STOP_RE);
  if (softMatch && softMatch.index != null) clause = clause.slice(0, softMatch.index);

  return clause.trim() || null;
}

/**
 * Parse a CourseTable `requirements` (or description) string into structured
 * prerequisite groups. Conservative by design: only concrete course codes are
 * captured, advisory escape hatches ("or permission of instructor") are
 * dropped, and ambiguous prose simply yields fewer groups rather than wrong
 * ones.
 */
export function parsePrerequisites(text: string | null | undefined): PrereqGroup[] {
  if (!text) return [];
  const clause = prerequisiteClause(text);
  if (!clause) return [];

  type Conn = "and" | "or" | "comma";
  type Token = { code: string; connector: Conn | null };
  const tokens: Token[] = [];
  let lastSubject: string | null = null;
  let prevEnd = -1;

  const classify = (raw: string): Conn => {
    const hasAnd = /\band\b/i.test(raw) || raw.includes(";");
    const hasOr = /\bor\b/i.test(raw) || raw.includes("/");
    // "/" cross-listings ("PSYC 160/NSCI 160") and "or" are alternatives; a
    // semicolon separates independent requirements (treated as "and").
    if (hasOr && !hasAnd) return "or";
    if (hasAnd) return "and";
    return "comma";
  };

  COURSE_CODE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = COURSE_CODE_RE.exec(clause))) {
    let subject: string | null;
    let num: string;
    if (match[1]) {
      subject = match[1];
      num = match[2];
      lastSubject = subject;
    } else {
      subject = lastSubject;
      num = match[3];
    }
    // A bare number before any subject is seen (e.g. a stray year) is ignored.
    if (!subject) {
      prevEnd = match.index + match[0].length;
      continue;
    }
    const connector = prevEnd >= 0 ? classify(clause.slice(prevEnd, match.index)) : null;
    tokens.push({ code: `${subject} ${num}`, connector });
    prevEnd = match.index + match[0].length;
  }

  // A plain comma inherits the list's terminal conjunction, so "A, B, or C"
  // reads as three alternatives while "A, B, and C" reads as three requirements.
  const listConj: Conn =
    [...tokens].reverse().find((t) => t.connector === "and" || t.connector === "or")?.connector ??
    "and";

  const groups: PrereqGroup[] = [];
  for (const token of tokens) {
    const conn = token.connector === "comma" ? listConj : token.connector;
    if (conn === "or" && groups.length > 0) {
      groups[groups.length - 1].push(token.code);
    } else {
      groups.push([token.code]);
    }
  }

  // De-duplicate alternatives within each group by canonical code.
  return groups.map((group) => {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const code of group) {
      const key = canonicalCourseCode(code);
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(code);
    }
    return unique;
  });
}

/**
 * Remove a course's own code from its parsed prerequisites and drop any group
 * left empty. Used when normalizing the catalog so a course never lists itself
 * as its own prerequisite (e.g. "placement into MATH 1150").
 */
export function cleanPrerequisites(groups: PrereqGroup[], ownCode: string): PrereqGroup[] {
  const ownKey = courseIdentityKey(ownCode);
  return groups
    .map((group) => group.filter((code) => courseIdentityKey(code) !== ownKey))
    .filter((group) => group.length > 0);
}

/** Identity keys for everything a student has taken, is taking, or has planned. */
export function buildHaveCourseKeySet(
  courses: Iterable<{ course_code: string; crosslisted_codes?: string[] | null }>,
): Set<string> {
  const set = new Set<string>();
  for (const course of courses) {
    set.add(courseIdentityKey(course.course_code));
    for (const code of course.crosslisted_codes ?? []) {
      set.add(courseIdentityKey(code));
    }
  }
  return set;
}

function prereqGroupSatisfied(group: PrereqGroup, haveKeys: Set<string>): boolean {
  return group.some((code) => haveKeys.has(courseIdentityKey(code)));
}

/** Prerequisite groups for a course that are not yet satisfied by `haveKeys`. */
export function unmetPrerequisites(
  groups: PrereqGroup[] | undefined,
  haveKeys: Set<string>,
): PrereqGroup[] {
  if (!groups?.length) return [];
  return groups.filter((group) => !prereqGroupSatisfied(group, haveKeys));
}

/** Look up a course's prerequisite groups from a merged catalog. */
export function prerequisitesForCode(
  code: string,
  catalogByCode: Record<string, CatalogCourse>,
): PrereqGroup[] {
  return lookupCatalogEntry(code, catalogByCode)?.prerequisites ?? [];
}

/** Human-readable note describing unmet prerequisite groups (or null if met). */
export function unmetPrerequisiteNote(unmet: PrereqGroup[]): string | null {
  if (!unmet.length) return null;
  const parts = unmet.map((group) => group.join(" or "));
  return `Requires ${parts.join(" and ")} first`;
}

/** Human-readable summary of all prerequisite groups (e.g. "CPSC 201, MATH 120 or 225"). */
export function describePrerequisites(groups: PrereqGroup[] | undefined): string {
  if (!groups?.length) return "";
  return groups.map((group) => group.join(" or ")).join(", ");
}
