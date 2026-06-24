import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CATALOG_BY_CODE, type CatalogCourse } from "@/data/courses";
import { suggestRoadmap, type UserCourse } from "@/lib/audit";
import { COURSETABLE_API, currentSeasonCode } from "@/lib/coursetable";
import {
  buildMergedCatalog,
  ensureRenumberingRegistered,
  fetchSeasonCatalog,
  getAuditCatalogByCode,
  getCrosslistLookup,
  getRenumberingGroups,
} from "@/lib/catalog-cache";
import { buildCrosslistLookup, serializeCrosslistLookup } from "@/lib/crosslist";
import {
  getMajorExampleSections,
  getTrackExampleSections,
  seasonsForHistoricalCatalog,
  type SlotExamplesGroup,
} from "@/lib/requirement-examples";
import { buildDegreeSchedule } from "@/lib/schedule-planner";

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
        secondMajorId: z.string().nullable().optional(),
        secondDegree: z.enum(["BA", "BS"]).optional(),
        concentrationId: z.string().nullable().optional(),
        certificateIds: z.array(z.string()).optional(),
        trackId: z.string().nullable(),
        season: z
          .string()
          .regex(/^\d{6}$/)
          .optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const season = data.season ?? currentSeasonCode();
    await ensureRenumberingRegistered();
    const catalog = await fetchSeasonCatalog(season);
    const catalogByCode = buildMergedCatalog(catalog);
    const crosslistLookup = await getCrosslistLookup([season]);
    const suggestions = suggestRoadmap(
      data.courses as UserCourse[],
      data.majorId,
      data.degree,
      data.trackId,
      catalogByCode,
      data.secondMajorId ?? null,
      data.secondDegree,
      crosslistLookup,
      data.concentrationId ?? null,
      data.certificateIds ?? null,
    );
    return {
      season,
      catalogSize: catalog.length,
      suggestions,
      source: "coursetable" as const,
    };
  });

const scheduleInputSchema = z.object({
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
  majorId: z.string().min(1),
  degree: z.enum(["BA", "BS"]),
  secondMajorId: z.string().nullable().optional(),
  secondDegree: z.enum(["BA", "BS"]).optional(),
  concentrationId: z.string().nullable().optional(),
  certificateIds: z.array(z.string()).optional(),
  trackId: z.string().nullable().optional(),
  classYear: z.number().int().min(2020).max(2035).nullable().optional(),
  exploreMajorId: z.string().nullable().optional(),
  exploreMode: z.enum(["second-major", "switch-major"]).optional(),
  exploreTrackId: z.string().nullable().optional(),
  season: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});

export const getDegreeSchedule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => scheduleInputSchema.parse(d))
  .handler(async ({ data }) => {
    const season = data.season ?? currentSeasonCode();
    await ensureRenumberingRegistered();
    const catalog = await fetchSeasonCatalog(season);
    const catalogByCode = buildMergedCatalog(catalog);
    const crosslistLookup = await getCrosslistLookup([season]);

    const schedule = buildDegreeSchedule({
      courses: data.courses as UserCourse[],
      majorId: data.majorId,
      degree: data.degree,
      secondMajorId: data.secondMajorId ?? null,
      secondDegree: data.secondDegree,
      trackId: data.trackId ?? null,
      concentrationId: data.concentrationId ?? null,
      certificateIds: data.certificateIds ?? [],
      classYear: data.classYear ?? null,
      exploreMajorId: data.exploreMajorId ?? null,
      exploreMode: data.exploreMode ?? "second-major",
      exploreTrackId: data.exploreTrackId,
      catalogByCode,
      crosslistLookup,
    });

    return {
      season,
      catalogSize: catalog.length,
      schedule,
      source: "coursetable" as const,
    };
  });

export const searchCourseTableCatalog = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        query: z.string().max(200).optional(),
        season: z
          .string()
          .regex(/^\d{6}$/)
          .optional(),
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

    const filtered = catalog.filter((c) => {
      const haystack = [c.code, c.title, c.subject, ...(c.crosslistedCodes ?? [])]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    return { season, courses: filtered.slice(0, limit), total: filtered.length };
  });

export const getRequirementExamples = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        majorId: z.string().min(1),
        degree: z.enum(["BA", "BS"]),
        concentrationId: z.string().optional().nullable(),
        trackId: z.string().optional().nullable(),
        classYear: z.number().int().min(2020).max(2035).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const currentSeason = currentSeasonCode();
    const seasons = seasonsForHistoricalCatalog(data.classYear).slice(-8);
    const seasonByCode = new Map<string, string[]>();
    const catalogCourses: CatalogCourse[] = [];
    const seenCodes = new Set<string>();

    let seasonsLoaded = 0;
    await Promise.all(
      seasons.map(async (season) => {
        try {
          const courses = await fetchSeasonCatalog(season);
          seasonsLoaded += 1;
          for (const course of courses) {
            const keys = [course.code, ...(course.crosslistedCodes ?? [])].map((c) =>
              c.toUpperCase(),
            );
            for (const key of keys) {
              const list = seasonByCode.get(key) ?? [];
              if (!list.includes(season)) list.push(season);
              seasonByCode.set(key, list);
            }
            const primaryKey = course.code.toUpperCase();
            if (!seenCodes.has(primaryKey)) {
              seenCodes.add(primaryKey);
              catalogCourses.push(course);
            }
          }
        } catch {
          /* skip unavailable historical seasons */
        }
      }),
    );

    if (catalogCourses.length === 0) {
      try {
        const courses = await fetchSeasonCatalog(currentSeason);
        seasonsLoaded = 1;
        for (const course of courses) {
          const keys = [course.code, ...(course.crosslistedCodes ?? [])].map((c) =>
            c.toUpperCase(),
          );
          for (const key of keys) {
            const list = seasonByCode.get(key) ?? [];
            if (!list.includes(currentSeason)) list.push(currentSeason);
            seasonByCode.set(key, list);
          }
          const primaryKey = course.code.toUpperCase();
          if (!seenCodes.has(primaryKey)) {
            seenCodes.add(primaryKey);
            catalogCourses.push(course);
          }
        }
      } catch {
        /* CourseTable unavailable */
      }
    }

    const crosslistLookup = buildCrosslistLookup([
      ...Object.values(CATALOG_BY_CODE),
      ...catalogCourses,
    ]);

    const major = getMajorExampleSections(
      data.majorId,
      data.degree,
      catalogCourses,
      seasonByCode,
      currentSeason,
      crosslistLookup,
      data.concentrationId,
    );
    const track = getTrackExampleSections(
      data.trackId,
      catalogCourses,
      seasonByCode,
      currentSeason,
      crosslistLookup,
    );

    const bySlotId: Record<string, SlotExamplesGroup["examples"]> = {};
    for (const group of [...major, ...track]) {
      bySlotId[group.slotId] = group.examples;
    }

    return {
      currentSeason,
      seasonsSearched: seasonsLoaded,
      major,
      track,
      bySlotId,
    };
  });

export const getCrosslistMap = createServerFn({ method: "GET" }).handler(async () => {
  const seasons = seasonsForHistoricalCatalog(null).slice(-8);
  const lookup = await getCrosslistLookup(seasons);
  return serializeCrosslistLookup(lookup);
});

/** CourseTable-derived Yale renumbering groups (subject + title across semesters). */
export const getRenumberingMap = createServerFn({ method: "GET" }).handler(async () => {
  return getRenumberingGroups();
});

/** YC course attributes for certificate audits (CourseTable public catalog; no NetID). */
export const getAuditCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const seasons = seasonsForHistoricalCatalog(null).slice(-8);
  const catalogByCode = await getAuditCatalogByCode(seasons);
  return { seasons, catalogByCode };
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
