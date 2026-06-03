import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CATALOG_BY_CODE, type CatalogCourse } from "@/data/courses";
import { suggestRoadmap, type UserCourse } from "@/lib/audit";
import {
  COURSETABLE_API,
  currentSeasonCode,
  dedupeCourseTableCourses,
  type CourseTableCourse,
} from "@/lib/coursetable";

type CatalogCacheEntry = {
  courses: CatalogCourse[];
  fetchedAt: number;
};

const catalogCacheBySeason = new Map<string, CatalogCacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchSeasonCatalog(season: string): Promise<CatalogCourse[]> {
  const cached = catalogCacheBySeason.get(season);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.courses;
  }

  const res = await fetch(`${COURSETABLE_API}/api/catalog/public/${season}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`CourseTable catalog unavailable (${res.status})`);
  }

  const raw = (await res.json()) as CourseTableCourse[];
  const courses = dedupeCourseTableCourses(raw);
  catalogCacheBySeason.set(season, { courses, fetchedAt: Date.now() });
  return courses;
}

export function buildMergedCatalog(courses: CatalogCourse[]): Record<string, CatalogCourse> {
  const merged: Record<string, CatalogCourse> = { ...CATALOG_BY_CODE };
  for (const c of courses) {
    merged[c.code.toUpperCase()] = c;
  }
  return merged;
}

export const getRoadmapSuggestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        courses: z.array(
          z.object({
            id: z.string(),
            course_code: z.string(),
            course_title: z.string().nullable(),
            credits: z.number(),
            distributional: z.array(z.string()),
            skills: z.array(z.string()),
            status: z.enum(["planned", "in_progress", "completed"]),
            term: z.string().nullable(),
            year: z.number().nullable(),
          }),
        ),
        majorId: z.string().nullable(),
        degree: z.enum(["BA", "BS"]),
        trackId: z.string().nullable(),
        season: z.string().regex(/^\d{6}$/).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const season = data.season ?? currentSeasonCode();
    const catalog = await fetchSeasonCatalog(season);
    const catalogByCode = buildMergedCatalog(catalog);
    const suggestions = suggestRoadmap(
      data.courses as UserCourse[],
      data.majorId,
      data.degree,
      data.trackId,
      catalogByCode,
    );
    return {
      season,
      catalogSize: catalog.length,
      suggestions,
      source: "coursetable" as const,
    };
  });

export const searchCourseTableCatalog = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        query: z.string().max(200).optional(),
        season: z.string().regex(/^\d{6}$/).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const season = data.season ?? currentSeasonCode();
    const limit = data.limit ?? 50;
    const q = data.query?.trim().toLowerCase() ?? "";

    const catalog = await fetchSeasonCatalog(season);

    if (!q) return { season, courses: catalog.slice(0, limit), total: catalog.length };

    const filtered = catalog.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q),
    );

    return { season, courses: filtered.slice(0, limit), total: filtered.length };
  });

export const getCourseTableCatalogMeta = createServerFn({ method: "GET" }).handler(async () => {
    const res = await fetch(`${COURSETABLE_API}/api/catalog/metadata`);
    if (!res.ok) throw new Error("Could not reach CourseTable");
    const meta = (await res.json()) as { last_update: string };
    const season = currentSeasonCode();
    let courseCount = 0;
    try {
      courseCount = (await fetchSeasonCatalog(season)).length;
    } catch {
      /* catalog count optional */
    }
    return { lastUpdate: meta.last_update, season, courseCount };
  });

export const linkCourseTableNetId = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        netId: z.string().min(2).max(20),
        email: z.string().email().optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({
        coursetable_netid: data.netId.toLowerCase(),
        coursetable_connected_at: new Date().toISOString(),
        ...(data.email ? { email: data.email } : {}),
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unlinkCourseTable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update({
        coursetable_netid: null,
        coursetable_connected_at: null,
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
