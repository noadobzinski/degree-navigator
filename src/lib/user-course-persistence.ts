import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  CREDIT_ALLOC_SKILL_PREFIX,
  creditAllocationFromSkills,
  isCreditBucketId,
  stripAllocationMarkers,
} from "@/lib/credit-allocation";
import {
  isMandatoryWritingCourse,
  isOptionalWritingOffered,
  skillsForNewCourse,
  WR_OPTIONAL_SKILL,
} from "@/lib/course-codes";

const SCHEMA_CACHE_WR_ERROR = "counts_as_wr";
const SCHEMA_CACHE_ALLOC_ERROR = "credit_allocation";

export type CourseWriteInput = {
  course_code: string;
  course_title?: string | null;
  credits?: number;
  distributional?: string[];
  skills?: string[];
  counts_as_wr?: boolean | null;
  credit_allocation?: string | null;
  term?: string | null;
  year?: number | null;
  status?: string;
  grade?: string | null;
};

function isMissingColumnError(message: string, column: string): boolean {
  return message.includes(column) || (message.includes("schema cache") && message.includes(column));
}

function isMissingWrColumnError(message: string): boolean {
  return isMissingColumnError(message, SCHEMA_CACHE_WR_ERROR);
}

function isMissingAllocColumnError(message: string): boolean {
  return isMissingColumnError(message, SCHEMA_CACHE_ALLOC_ERROR);
}

/** Encode WR preference in skills when DB column is not migrated yet. */
export function encodeCourseForDb(data: CourseWriteInput): CourseWriteInput {
  let skills = stripAllocationMarkers([...(data.skills ?? [])]).filter((s) => s !== WR_OPTIONAL_SKILL);
  const code = data.course_code;

  if (data.credit_allocation && isCreditBucketId(data.credit_allocation)) {
    skills.push(`${CREDIT_ALLOC_SKILL_PREFIX}${data.credit_allocation}`);
  }

  if (data.counts_as_wr === true) {
    if (!skills.includes("WR")) skills.push("WR");
  } else if (data.counts_as_wr === false) {
    const withoutWr = skills.filter((s) => s !== "WR");
    if (isOptionalWritingOffered([...withoutWr, "WR"], code)) {
      withoutWr.push(WR_OPTIONAL_SKILL);
    }
    return { ...data, skills: withoutWr };
  }

  return { ...data, skills };
}

export function decodeCourseFromDb<T extends CourseWriteInput>(
  row: T,
): T & { counts_as_wr: boolean | null; credit_allocation: string | null } {
  const rawSkills = row.skills ?? [];
  const code = row.course_code ?? "";
  let counts_as_wr = row.counts_as_wr ?? null;
  let credit_allocation = row.credit_allocation ?? creditAllocationFromSkills(rawSkills) ?? null;

  if (counts_as_wr == null) {
    if (rawSkills.includes("WR")) counts_as_wr = true;
    else if (rawSkills.includes(WR_OPTIONAL_SKILL)) counts_as_wr = false;
    else if (isMandatoryWritingCourse(code)) counts_as_wr = true;
  }

  return {
    ...row,
    skills: stripAllocationMarkers(rawSkills).filter((s) => s !== WR_OPTIONAL_SKILL),
    counts_as_wr,
    credit_allocation,
  };
}

export async function insertUserCourse(
  supabase: SupabaseClient<Database>,
  row: CourseWriteInput & { user_id: string },
): Promise<void> {
  const fromNew = skillsForNewCourse(row.skills ?? [], row.course_code);
  const merged = encodeCourseForDb({
    ...row,
    skills: fromNew.skills,
    counts_as_wr: row.counts_as_wr ?? fromNew.counts_as_wr,
  });

  let insertRow: Record<string, unknown> = { ...merged };
  let { error } = await supabase.from("user_courses").insert(insertRow);
  if (error && (isMissingWrColumnError(error.message) || isMissingAllocColumnError(error.message))) {
    const { counts_as_wr: _w, credit_allocation: _a, ...fallback } = insertRow;
    insertRow = encodeCourseForDb(fallback as CourseWriteInput);
    insertRow.user_id = row.user_id;
    ({ error } = await supabase.from("user_courses").insert(insertRow));
  }
  if (error) throw new Error(error.message);
}

export async function updateUserCourse(
  supabase: SupabaseClient<Database>,
  id: string,
  userId: string,
  patch: Partial<CourseWriteInput>,
  existing: CourseWriteInput,
): Promise<void> {
  const merged = encodeCourseForDb({
    ...existing,
    ...patch,
    course_code: existing.course_code,
  });

  let updatePayload: Record<string, unknown> = { ...patch };
  if (patch.counts_as_wr !== undefined || patch.credit_allocation !== undefined) {
    updatePayload = {
      ...updatePayload,
      skills: merged.skills,
      counts_as_wr: merged.counts_as_wr,
      credit_allocation: merged.credit_allocation,
    };
  }

  let { error } = await supabase.from("user_courses").update(updatePayload).eq("id", id).eq("user_id", userId);
  if (error && (isMissingWrColumnError(error.message) || isMissingAllocColumnError(error.message))) {
    const { counts_as_wr: _w, credit_allocation: _a, ...withoutCol } = updatePayload;
    const fallback = encodeCourseForDb({
      ...existing,
      ...withoutCol,
      course_code: existing.course_code,
    } as CourseWriteInput);
    ({ error } = await supabase
      .from("user_courses")
      .update(fallback)
      .eq("id", id)
      .eq("user_id", userId));
  }
  if (error) throw new Error(error.message);
}
