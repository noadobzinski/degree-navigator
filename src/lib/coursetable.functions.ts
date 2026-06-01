import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { CatalogCourse } from "@/data/courses";
import {
  COURSETABLE_API,
  currentSeasonCode,
  dedupeCourseTableCourses,
  type CourseTableCourse,
} from "@/lib/coursetable";

type CatalogCache = {
  season: string;
  courses: CatalogCourse[];
  fetchedAt: number;
};

let catalogCache: CatalogCache | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

async function fetchSeasonCatalog(season: string): Promise<CatalogCourse[]> {
  if (
    catalogCache &&
    catalogCache.season === season &&
    Date.now() - catalogCache.fetchedAt < CACHE_TTL_MS
  ) {
    return catalogCache.courses;
  }

  const res = await fetch(`${COURSETABLE_API}/api/catalog/public/${season}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`CourseTable catalog unavailable (${res.status})`);
  }

  const raw = (await res.json()) as CourseTableCourse[];
  const courses = dedupeCourseTableCourses(raw);
  catalogCache = { season, courses, fetchedAt: Date.now() };
  return courses;
}

export const searchCourseTableCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
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

export const getCourseTableCatalogMeta = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
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
