import env from "@/lib/env";

type Bucket = {
  lastRequestAt: number;
  hourly: { windowStart: number; count: number };
};

const buckets = new Map<string, Bucket>();

function bucketFor(key: string): Bucket {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = {
      lastRequestAt: 0,
      hourly: { windowStart: Date.now(), count: 0 },
    };
    buckets.set(key, bucket);
  }
  return bucket;
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; reason: "interval"; retryAfterMs: number }
  | { ok: false; reason: "hourly"; retryAfterMs: number };

export function checkClientRateLimit(clientKey: string): RateLimitResult {
  const now = Date.now();
  const bucket = bucketFor(clientKey);
  const minGap = env.minRequestIntervalMs;

  if (bucket.lastRequestAt > 0 && now - bucket.lastRequestAt < minGap) {
    return {
      ok: false,
      reason: "interval",
      retryAfterMs: minGap - (now - bucket.lastRequestAt),
    };
  }

  if (now - bucket.hourly.windowStart >= 60 * 60 * 1000) {
    bucket.hourly = { windowStart: now, count: 0 };
  }

  if (bucket.hourly.count >= env.rateLimitPerHour) {
    const retryAfterMs = bucket.hourly.windowStart + 60 * 60 * 1000 - now;
    return { ok: false, reason: "hourly", retryAfterMs };
  }

  bucket.lastRequestAt = now;
  bucket.hourly.count += 1;
  return { ok: true };
}
