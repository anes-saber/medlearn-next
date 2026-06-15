const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

type RateLimitResult = {
  success: boolean;
  remaining: number;
};

export async function rateLimit(
  identifier: string,
  limit: number = 10,
  window: number = 60,
): Promise<RateLimitResult> {
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    return { success: true, remaining: Infinity };
  }

  try {
    const res = await fetch(`${UPSTASH_REDIS_REST_URL}/lua`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        script: `local key = KEYS[1] local limit = tonumber(ARGV[1]) local window = tonumber(ARGV[2]) local current = redis.call('INCR', key) if current == 1 then redis.call('EXPIRE', key, window) end return {current, limit}`,
        keys: [`ratelimit:${identifier}`],
        args: [String(limit), String(window)],
      }),
    });

    if (!res.ok) return { success: true, remaining: Infinity };

    const [current, max] = (await res.json()) as [number, number];
    return {
      success: current <= max,
      remaining: Math.max(0, max - current),
    };
  } catch {
    return { success: true, remaining: Infinity };
  }
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "Retry-After": result.success ? "0" : "60",
  };
}
