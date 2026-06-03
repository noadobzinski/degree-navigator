import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SECOND_DEGREE_COLUMN = "second_degree_type";
/** Stashed in track_id when the DB column is not migrated yet (only if no real track). */
const SECOND_DEGREE_TRACK_PREFIX = "__bp_sd:";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type ProfileUpdateInput = {
  full_name?: string | null;
  major_id?: string | null;
  second_major_id?: string | null;
  second_degree_type?: "BA" | "BS" | null;
  track_id?: string | null;
  degree_type?: "BA" | "BS" | null;
  class_year?: number | null;
};

function isMissingSecondDegreeColumn(message: string): boolean {
  return (
    message.includes(SECOND_DEGREE_COLUMN) ||
    (message.includes("schema cache") && message.includes(SECOND_DEGREE_COLUMN))
  );
}

function isStashedSecondDegreeTrack(trackId: string | null | undefined): boolean {
  return !!trackId?.startsWith(SECOND_DEGREE_TRACK_PREFIX);
}

function stashSecondDegreeInTrack(
  secondDegree: "BA" | "BS" | null | undefined,
  trackId: string | null | undefined,
): string | null | undefined {
  if (!secondDegree) return trackId;
  const realTrack = trackId && trackId !== "none" && !isStashedSecondDegreeTrack(trackId);
  if (realTrack) return trackId;
  return `${SECOND_DEGREE_TRACK_PREFIX}${secondDegree}`;
}

/** Decode profile row from DB (including track_id stash for second degree). */
export function decodeProfileFromDb(row: ProfileRow | null): ProfileRow | null {
  if (!row) return null;
  let track_id = row.track_id;
  let second_degree_type = row.second_degree_type as "BA" | "BS" | null;

  if (!second_degree_type && isStashedSecondDegreeTrack(track_id)) {
    const deg = track_id!.slice(SECOND_DEGREE_TRACK_PREFIX.length);
    if (deg === "BA" || deg === "BS") second_degree_type = deg;
    track_id = null;
  }

  return { ...row, track_id, second_degree_type };
}

function buildUpdatePayload(data: ProfileUpdateInput, omitSecondDegreeColumn: boolean): Record<string, unknown> {
  const { second_degree_type, track_id, second_major_id, ...rest } = data;
  const payload: Record<string, unknown> = { ...rest };

  if (second_major_id !== undefined) payload.second_major_id = second_major_id;

  const clearingDoubleMajor = second_major_id === null;
  const effectiveTrack =
    clearingDoubleMajor && (!track_id || isStashedSecondDegreeTrack(track_id))
      ? null
      : track_id;

  if (omitSecondDegreeColumn) {
    if (clearingDoubleMajor) {
      payload.track_id = effectiveTrack ?? null;
    } else {
      const stashedTrack = stashSecondDegreeInTrack(second_degree_type, effectiveTrack);
      if (stashedTrack !== undefined) payload.track_id = stashedTrack ?? null;
      else if (effectiveTrack !== undefined) payload.track_id = effectiveTrack;
    }
  } else {
    if (second_degree_type !== undefined) payload.second_degree_type = second_degree_type;
    if (effectiveTrack !== undefined) payload.track_id = effectiveTrack;
    else if (track_id !== undefined) payload.track_id = track_id;
  }

  return payload;
}

export async function updateProfileRow(
  supabase: SupabaseClient<Database>,
  userId: string,
  data: ProfileUpdateInput,
): Promise<void> {
  let payload = buildUpdatePayload(data, false);
  let { error } = await supabase.from("profiles").update(payload).eq("id", userId);

  if (error && isMissingSecondDegreeColumn(error.message)) {
    payload = buildUpdatePayload(data, true);
    ({ error } = await supabase.from("profiles").update(payload).eq("id", userId));
  }

  if (error) throw new Error(error.message);
}
