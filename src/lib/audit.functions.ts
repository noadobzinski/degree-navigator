import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        full_name: z.string().max(200).optional().nullable(),
        major_id: z.string().max(50).optional().nullable(),
        second_major_id: z.string().max(50).optional().nullable(),
        track_id: z.string().max(50).optional().nullable(),
        degree_type: z.enum(["BA", "BS"]).optional().nullable(),
        class_year: z.number().int().min(2020).max(2035).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyCourses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_courses")
      .select("*")
      .eq("user_id", userId)
      .order("year", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        course_code: z.string().min(1).max(20),
        course_title: z.string().max(200).optional().nullable(),
        credits: z.number().min(0).max(2).default(1),
        distributional: z.array(z.string()).default([]),
        skills: z.array(z.string()).default([]),
        term: z.string().max(20).optional().nullable(),
        year: z.number().int().min(2020).max(2035).optional().nullable(),
        status: z.enum(["planned", "in_progress", "completed"]).default("planned"),
        grade: z.string().max(5).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("user_courses").insert({ ...data, user_id: userId });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["planned", "in_progress", "completed"]).optional(),
        term: z.string().max(20).optional().nullable(),
        year: z.number().int().min(2020).max(2035).optional().nullable(),
        grade: z.string().max(5).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { id, ...patch } = data;
    const { error } = await supabase.from("user_courses").update(patch).eq("id", id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("user_courses").delete().eq("id", data.id).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
