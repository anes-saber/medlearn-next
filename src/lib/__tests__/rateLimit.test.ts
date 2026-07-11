import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimitHeaders } from "../rateLimit";

// We test the pure function that returns headers.
// The rateLimit function itself depends on Upstash env vars and fetch,
// but its fallback behavior is testable.
import { rateLimit } from "../rateLimit";

describe("rateLimitHeaders", () => {
  it("returns remaining header", () => {
    const headers = rateLimitHeaders({ success: true, remaining: 5 });
    expect(headers["X-RateLimit-Remaining"]).toBe("5");
  });

  it("returns retry-after 0 on success", () => {
    const headers = rateLimitHeaders({ success: true, remaining: 5 });
    expect(headers["Retry-After"]).toBe("0");
  });

  it("returns retry-after 60 on failure", () => {
    const headers = rateLimitHeaders({ success: false, remaining: 0 });
    expect(headers["Retry-After"]).toBe("60");
  });
});

describe("rateLimit", () => {
  const origEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...origEnv };
  });

  afterEach(() => {
    process.env = origEnv;
  });

  it("returns success when Upstash env vars are missing", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const result = await rateLimit("test-user");
    expect(result).toEqual({ success: true, remaining: Infinity });
  });
});