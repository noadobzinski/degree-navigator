import type { CatalogCourse } from "@/data/courses";
import { resolveCatalogCredits } from "@/lib/course-credits";

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

function listingCodes(entry: CourseTableCourse): string[] {
  const seen = new Set<string>();
  const codes: string[] = [];
  for (const listing of entry.listings ?? []) {
    const code = listing.course_code?.replace(/\s+/g, " ").trim();
    if (!code) continue;
    const key = code.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    codes.push(code);
  }
  return codes;
}

export function normalizeCourseTableCourse(entry: CourseTableCourse): CatalogCourse | null {
  const codes = listingCodes(entry);
  if (!codes.length) return null;
  const primary = codes[0];
  const primaryListing = entry.listings!.find((l) => l.course_code?.replace(/\s+/g, " ").trim() === primary)!;
  const crosslistedCodes = codes.length > 1 ? codes.slice(1) : undefined;
  return {
    code: primary,
    crosslistedCodes,
    title: entry.title.trim(),
    credits: resolveCatalogCredits(entry.credits, primary),
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
    subject: primaryListing.subject,
  };
}

function mergeCatalogCourses(a: CatalogCourse, b: CatalogCourse): CatalogCourse {
  const allCodes = [...new Set([a.code, b.code, ...(a.crosslistedCodes ?? []), ...(b.crosslistedCodes ?? [])])];
  const primary = allCodes[0];
  const crosslistedCodes = allCodes.length > 1 ? allCodes.slice(1) : undefined;
  const credits = Math.min(a.credits, b.credits);
  return {
    code: primary,
    crosslistedCodes,
    title: a.title || b.title,
    credits,
    distributional: [...new Set([...a.distributional, ...b.distributional])] as CatalogCourse["distributional"],
    skills: [...new Set([...a.skills, ...b.skills])] as CatalogCourse["skills"],
    subject: a.subject || b.subject,
  };
}

export function dedupeCourseTableCourses(entries: CourseTableCourse[]): CatalogCourse[] {
  const byKey = new Map<string, CatalogCourse>();
  for (const entry of entries) {
    const normalized = normalizeCourseTableCourse(entry);
    if (!normalized) continue;
    const keys = [normalized.code, ...(normalized.crosslistedCodes ?? [])].map((c) => c.toUpperCase());
    let existing: CatalogCourse | undefined;
    for (const key of keys) {
      const hit = byKey.get(key);
      if (hit) {
        existing = hit;
        break;
      }
    }
    if (!existing) {
      for (const key of keys) byKey.set(key, normalized);
      continue;
    }
    const merged = mergeCatalogCourses(existing, normalized);
    for (const key of [merged.code, ...(merged.crosslistedCodes ?? [])].map((c) => c.toUpperCase())) {
      byKey.set(key, merged);
    }
  }
  const unique = new Map<string, CatalogCourse>();
  for (const c of byKey.values()) {
    unique.set(c.code.toUpperCase(), c);
  }
  return [...unique.values()].sort((a, b) => a.code.localeCompare(b.code));
}

/** Open CourseTable search for a course code (public, no auth required). */
export function courseTableSearchUrl(code: string): string {
  const q = encodeURIComponent(code.trim());
  return `https://coursetable.com/?q=${q}`;
}
