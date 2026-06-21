"use server";

import { rateLimit, rateLimitHeaders } from "@/lib/rateLimit";

/**
 * Wraps a server action with rate limiting.
 * Returns { error, status } if rate limited, or null if allowed.
 * Usage in server actions:
 *   const blocked = await checkActionRateLimit("homework-submit", userId, 5, 300);
 *   if (blocked) return blocked;
 */
export async function checkActionRateLimit(
  action: string,
  identifier: string,
  limit: number = 30,
  windowSec: number = 60,
): Promise<{ error: string; status: number } | null> {
  const rl = await rateLimit(`action:${action}:${identifier}`, limit, windowSec);
  if (!rl.success) {
    return {
      error: "Too many requests. Please try again later.",
      status: 429,
    };
  }
  return null;
}

/** Rate limit configurations per action type. */
export const RATE_LIMITS = {
  "auth-login": { limit: 5, window: 300 },       // 5 per 5 min
  "auth-signup": { limit: 3, window: 3600 },      // 3 per hour
  "homework-submit": { limit: 10, window: 3600 },  // 10 per hour
  "quiz-attempt": { limit: 20, window: 3600 },     // 20 per hour
  "user-role-change": { limit: 5, window: 300 },    // 5 per 5 min
} as const;
