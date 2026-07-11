import { describe, it, expect } from "vitest";
import { formatSupabaseError } from "../supabase/errors";

describe("formatSupabaseError", () => {
  it("returns session expired message for JWT errors", () => {
    expect(formatSupabaseError({ message: "JWT expired" })).toBe(
      "Your session has expired. Please sign in again.",
    );
  });

  it("returns permission message for RLS errors", () => {
    expect(formatSupabaseError({ message: "new row violates row-level security policy" })).toBe(
      "You do not have permission to perform this action. Make sure you are signed in.",
    );
  });

  it("returns duplicate message for unique violations", () => {
    expect(formatSupabaseError({ message: "duplicate key value violates unique constraint" })).toBe(
      "This would create a duplicate record. Try a different value.",
    );
  });

  it("returns network message for fetch errors", () => {
    expect(formatSupabaseError({ message: "Failed to fetch" })).toBe(
      "Network error. Check your connection and try again.",
    );
  });

  it("returns raw message for unknown errors", () => {
    expect(formatSupabaseError({ message: "Something broke" })).toBe("Something broke");
  });
});