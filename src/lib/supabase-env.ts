function cleanEnv(val: unknown): string | undefined {
  if (typeof val !== "string" || val === "") return undefined;
  const cleaned = val.trim().replace(/^["']|["']$/g, "");
  return cleaned || undefined;
}

/** Client + SSR: reads VITE_* (build-time) with server fallbacks. */
export function getSupabaseConfig() {
  const url = cleanEnv(import.meta.env.VITE_SUPABASE_URL) ?? cleanEnv(process.env.SUPABASE_URL);
  const key =
    cleanEnv(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ??
    cleanEnv(process.env.SUPABASE_PUBLISHABLE_KEY);
  return { url, key };
}
