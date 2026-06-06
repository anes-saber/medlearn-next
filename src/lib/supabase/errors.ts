/** Human-friendly messages for common Supabase / PostgREST errors. */
export function formatSupabaseError(error: { message?: string }): string {
  const raw = (error.message ?? "Something went wrong.").trim();
  const m = raw.toLowerCase();

  if (m.includes("jwt") || m.includes("session")) {
    return "Your session has expired. Please sign in again.";
  }
  if (m.includes("row-level security") || m.includes("rls") || m.includes("policy")) {
    return "You do not have permission to perform this action. Make sure you are signed in.";
  }
  if (m.includes("duplicate") || m.includes("unique")) {
    return "This would create a duplicate record. Try a different value.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }

  return raw;
}
