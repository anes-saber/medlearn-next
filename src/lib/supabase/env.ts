const MISSING_SUPABASE_CONFIG = [
  "Supabase environment variables are missing or empty.",
  "Create .env.local (see .env.example) and set:",
  "  NEXT_PUBLIC_SUPABASE_URL",
  "  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
  "Use Project Settings → API in the Supabase dashboard.",
].join("\n");

/**
 * Public URL and client key for the Supabase project.
 * Accepts the newer publishable key or the legacy anon key env name.
 * @throws If either variable is unset or whitespace-only (empty `.env` lines count as unset).
 */
export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error(MISSING_SUPABASE_CONFIG);
  }
  return { url, anonKey };
}
