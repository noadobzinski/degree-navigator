/** Server-only Supabase env reads (no import.meta). */
export function readSupabaseEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (raw == null || raw === "") return undefined;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "");
  return cleaned || undefined;
}

export function getServerSupabaseConfig() {
  const url = readSupabaseEnv("SUPABASE_URL") ?? readSupabaseEnv("VITE_SUPABASE_URL");
  const key =
    readSupabaseEnv("SUPABASE_PUBLISHABLE_KEY") ?? readSupabaseEnv("VITE_SUPABASE_PUBLISHABLE_KEY");
  return { url, key };
}
