import type { CatalogCourse } from "@/data/courses";

export const COURSETABLE_API = "https://api.coursetable.com";

export type CourseTableListing = {
  course_code: string;
  crn: number;
  number: string;
  school: string;
  subject: string;
};

export type CourseTableCourse = {
  course_id: number;
  title: string;
  credits: number;
  areas: string[];
  skills: string[];
  season_code: string;
  listings: CourseTableListing[];
  same_course_id: number;
  description?: string;
};

export type CourseTableAuthCheck = {
  auth: boolean;
  netId: string | null;
  user: {
    netId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    hasEvals: boolean;
    year: number | null;
    school: string | null;
    major: string | null;
  } | null;
};

/** Yale season codes: YYYY01 = Spring, YYYY02 = Summer, YYYY03 = Fall */
export function currentSeasonCode(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  if (month >= 1 && month <= 5) return `${year}01`;
  // Jun–Dec: use Fall catalog (full course list; summer catalog is sparse)
  return `${year}03`;
}

export function casLoginUrl(redirectUrl: string): string {
  return `${COURSETABLE_API}/api/auth/cas?redirect=${encodeURIComponent(redirectUrl)}`;
}

const DIST_TAGS = new Set(["Hu", "So", "Sc"]);
const SKILL_TAGS = new Set(["QR", "WR", "L1", "L2", "L3", "L4", "L5"]);

function normalizeSkill(raw: string): CatalogCourse["skills"][number] | null {
  if (SKILL_TAGS.has(raw)) return raw as CatalogCourse["skills"][number];
  if (raw === "L") return "L1";
  return null;
}

export function normalizeCourseTableCourse(entry: CourseTableCourse): CatalogCourse | null {
  const listing = entry.listings?.[0];
  if (!listing?.course_code) return null;
  return {
    code: listing.course_code.replace(/\s+/g, " ").trim(),
    title: entry.title.trim(),
    credits: entry.credits || 1,
    distributional: entry.areas.filter((a): a is CatalogCourse["distributional"][number] =>
      DIST_TAGS.has(a),
    ),
    skills: [
      ...new Set(
        entry.skills
          .map(normalizeSkill)
          .filter((s): s is CatalogCourse["skills"][number] => s !== null),
      ),
    ],
    subject: listing.subject,
  };
}

export function dedupeCourseTableCourses(entries: CourseTableCourse[]): CatalogCourse[] {
  const byKey = new Map<string, CatalogCourse>();
  for (const entry of entries) {
    const normalized = normalizeCourseTableCourse(entry);
    if (!normalized) continue;
    const key = normalized.code.toUpperCase();
    if (!byKey.has(key)) byKey.set(key, normalized);
  }
  return [...byKey.values()].sort((a, b) => a.code.localeCompare(b.code));
}

/** Open CourseTable search for a course code (public, no auth required). */
export function courseTableSearchUrl(code: string): string {
  const q = encodeURIComponent(code.trim());
  return `https://coursetable.com/?q=${q}`;
}
