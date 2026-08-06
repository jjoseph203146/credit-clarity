// Fixed-window, per-IP rate limiter for the unauthenticated public routes
// (/api/upload, /api/parse, /api/checkout). Without this, anyone can spam
// unlimited report rows, signed Storage upload URLs, CPU-heavy pdf-parse
// jobs, and Stripe Checkout Sessions.
//
// DEPLOYMENT CAVEAT: state lives in the module scope of a single server
// instance. On a multi-instance / serverless deployment each instance keeps
// its own counters, so the effective limit is (limit x instances) and a cold
// start resets the window. That is a real weakening, not a rounding error —
// this is a meaningful first barrier against casual abuse, NOT a hard
// guarantee. Swap `hit()` for a shared store (Upstash Redis, or a Postgres
// table) when traffic justifies it; every call site already treats the
// return value as the only contract.

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

// Bound the map so a flood of unique IPs can't grow it without limit. When
// the cap is hit we drop already-expired entries first, and only if that
// frees nothing do we clear wholesale (which briefly resets limits — still
// preferable to unbounded memory growth).
const MAX_TRACKED_KEYS = 10_000;

function evictIfNeeded(now: number) {
  if (windows.size < MAX_TRACKED_KEYS) return;

  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }

  if (windows.size >= MAX_TRACKED_KEYS) windows.clear();
}

export type RateLimitResult = {
  ok: boolean;
  /** Seconds until the current window resets — surfaced as Retry-After. */
  retryAfterSeconds: number;
};

/**
 * Records a hit for `key` and reports whether it is within `limit` requests
 * per `windowMs`. Callers should reject with 429 when `ok` is false.
 */
export function hit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): RateLimitResult {
  evictIfNeeded(now);

  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { ok: true, retryAfterSeconds: 0 };
}

/**
 * Best-effort client IP. Behind Vercel/most proxies `x-forwarded-for` is the
 * client-to-edge chain, so the FIRST entry is the caller. This header is
 * trivially spoofable if the app is ever exposed without a proxy in front —
 * acceptable here because the limiter is a speed bump, not an auth boundary.
 * Falls back to a shared bucket so a missing header still gets limited
 * (fail-closed-ish) rather than bypassing the check entirely.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Standard 429 body + Retry-After header shared by all limited routes. */
export function tooManyRequests(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please wait a moment and try again.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSeconds),
      },
    },
  );
}
