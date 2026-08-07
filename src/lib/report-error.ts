// Central error reporting.
//
// Before this, every failure ended at `console.error` — which means nobody
// finds out. The failures that matter most here are silent by nature: a user
// pays $5, the Claude call fails, and the only trace is a log line in a
// dashboard nobody is watching.
//
// Two sinks, both optional-by-configuration and neither able to break the
// request:
//   1. Structured JSON to stderr. Always on. Any log aggregator (Vercel,
//      Datadog, CloudWatch) can index and alert on these without extra code.
//   2. A webhook POST, if ERROR_WEBHOOK_URL is set. Slack and Discord both
//      accept a `{ "text": "..." }` body, so either works with no adapter.
//      This is the part that actually pages someone.
//
// Deliberately not tied to Sentry: it would need an account, a DSN and
// build-time config to do anything at all, and would be dead weight until
// then. The `reportError` call sites are the contract — swapping in
// Sentry.captureException here later changes nothing else in the codebase.

export type Severity =
  /** A user paid or lost data and did not get what they paid for. Always alerts. */
  | "fatal"
  /** Something broke that shouldn't have. Alerts. */
  | "error"
  /** Degraded but handled. Logged, never alerts. */
  | "warning";

type ReportInput = {
  /** Stable, human-readable identifier, e.g. "analysis_failed". Groups alerts. */
  event: string;
  severity: Severity;
  error?: unknown;
  /** Ids and counts only — never report contents, emails, or tokens. */
  context?: Record<string, unknown>;
};

// Alert storms are their own outage: one failing dependency can produce
// thousands of identical errors. Each distinct event alerts at most once per
// window; everything is still logged in full.
const ALERT_THROTTLE_MS = 5 * 60 * 1000;
const lastAlertedAt = new Map<string, number>();

// Bounded so a pathological variety of event names can't grow this forever.
const MAX_TRACKED_EVENTS = 500;

function shouldAlert(event: string, now: number): boolean {
  const previous = lastAlertedAt.get(event);
  if (previous !== undefined && now - previous < ALERT_THROTTLE_MS) return false;

  if (lastAlertedAt.size >= MAX_TRACKED_EVENTS) {
    for (const [key, at] of lastAlertedAt) {
      if (now - at >= ALERT_THROTTLE_MS) lastAlertedAt.delete(key);
    }
    if (lastAlertedAt.size >= MAX_TRACKED_EVENTS) lastAlertedAt.clear();
  }

  lastAlertedAt.set(event, now);
  return true;
}

/**
 * Keys whose values must never leave the process. Provider errors and context
 * objects can carry credentials — a Supabase error can echo a connection
 * string, and a mis-set context key could carry an email or report contents.
 * Matching is on the key name, case-insensitive and substring-based, so
 * `stripe_secret_key` and `apiKey` are both caught.
 */
const REDACT_KEY_PATTERNS = [
  "key",
  "secret",
  "token",
  "password",
  "authorization",
  "cookie",
  "email",
  "raw_text",
  "content",
];

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[depth-limited]";
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));

  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
    const lower = key.toLowerCase();
    out[key] = REDACT_KEY_PATTERNS.some((p) => lower.includes(p))
      ? "[redacted]"
      : redact(v, depth + 1);
  }
  return out;
}

function describeError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  if (typeof error === "string") return { message: error };
  if (error && typeof error === "object" && "message" in error) {
    return { message: String((error as { message: unknown }).message) };
  }
  if (error === undefined) return { message: "(no error object)" };
  return { message: String(error) };
}

async function sendAlert(payload: {
  event: string;
  severity: Severity;
  message: string;
  context: Record<string, unknown>;
}): Promise<void> {
  const url = process.env.ERROR_WEBHOOK_URL;
  if (!url) return;

  const contextLine = Object.entries(payload.context)
    .map(([k, v]) => `${k}=${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(" ");

  const text = [
    `${payload.severity === "fatal" ? "🚨 FATAL" : "⚠️ ERROR"} · Credit Clarity`,
    `*${payload.event}*`,
    payload.message,
    contextLine ? `\`${contextLine}\`` : null,
  ]
    .filter(Boolean)
    .join("\n");

  // Never let alerting outlive or break the request that triggered it.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
  } catch (err) {
    console.error("[report-error] failed to deliver alert webhook:", err);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Records a failure. Never throws and never rejects — reporting a problem
 * must not create one. Most call sites do not await it.
 */
export async function reportError(input: ReportInput): Promise<void> {
  try {
    const { message, stack } = describeError(input.error);
    const context = (redact(input.context ?? {}) ?? {}) as Record<string, unknown>;

    // Single-line JSON so log aggregators can parse and alert on it directly.
    console.error(
      JSON.stringify({
        level: input.severity,
        event: input.event,
        message,
        ...(stack ? { stack } : {}),
        context,
        timestamp: new Date().toISOString(),
      }),
    );

    if (input.severity === "warning") return;
    if (!shouldAlert(input.event, Date.now())) return;

    await sendAlert({ event: input.event, severity: input.severity, message, context });
  } catch (err) {
    console.error("[report-error] reporter itself failed:", err);
  }
}

/** Test seam — resets throttle state between cases. */
export function __resetAlertThrottleForTests(): void {
  lastAlertedAt.clear();
}
