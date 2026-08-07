import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __resetAlertThrottleForTests, reportError } from "./report-error";

type LoggedPayload = {
  level: string;
  event: string;
  message: string;
  // Values are intentionally loose: the point of the redaction tests is to
  // assert on whatever shape came back out.
  context: Record<string, any>;
};

type ConsoleErrorSpy = { mock: { calls: unknown[][] } };

// stderr is the always-on sink, so assertions read the JSON it emits.
// Non-JSON lines (the reporter's own internal failures) are skipped.
function loggedPayloads(spy: ConsoleErrorSpy): LoggedPayload[] {
  return spy.mock.calls
    .map((call) => call[0])
    .filter((arg): arg is string => typeof arg === "string")
    .flatMap((arg): LoggedPayload[] => {
      try {
        return [JSON.parse(arg) as LoggedPayload];
      } catch {
        return [];
      }
    });
}

describe("reportError", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    __resetAlertThrottleForTests();
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchSpy = vi.fn().mockResolvedValue(new Response("ok"));
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubEnv("ERROR_WEBHOOK_URL", "https://hooks.example.test/abc");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    consoleSpy.mockRestore();
  });

  it("logs structured JSON with level, event and message", async () => {
    await reportError({
      event: "analysis_failed",
      severity: "fatal",
      error: new Error("Claude timed out"),
    });

    const [payload] = loggedPayloads(consoleSpy);
    expect(payload.level).toBe("fatal");
    expect(payload.event).toBe("analysis_failed");
    expect(payload.message).toBe("Claude timed out");
  });

  it("redacts secret-ish and PII-ish context keys by name", async () => {
    await reportError({
      event: "test",
      severity: "error",
      error: "boom",
      context: {
        reportId: "r-1",
        stripe_secret_key: "sk_live_actual",
        userEmail: "person@example.com",
        nested: { apiKey: "k", safeCount: 3 },
      },
    });

    const [payload] = loggedPayloads(consoleSpy);
    expect(payload.context.reportId).toBe("r-1");
    expect(payload.context.stripe_secret_key).toBe("[redacted]");
    expect(payload.context.userEmail).toBe("[redacted]");
    expect(payload.context.nested.apiKey).toBe("[redacted]");
    expect(payload.context.nested.safeCount).toBe(3);
  });

  it("alerts on error and fatal", async () => {
    await reportError({ event: "a", severity: "error", error: "x" });
    await reportError({ event: "b", severity: "fatal", error: "y" });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("never alerts on warning, but still logs it", async () => {
    await reportError({ event: "noisy", severity: "warning", error: "x" });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(loggedPayloads(consoleSpy)).toHaveLength(1);
  });

  it("throttles repeat alerts for the same event but keeps logging them", async () => {
    for (let i = 0; i < 5; i++) {
      await reportError({ event: "flapping", severity: "error", error: "x" });
    }
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(loggedPayloads(consoleSpy)).toHaveLength(5);
  });

  it("throttles per event, so a different failure still gets through", async () => {
    await reportError({ event: "one", severity: "error", error: "x" });
    await reportError({ event: "one", severity: "error", error: "x" });
    await reportError({ event: "two", severity: "error", error: "x" });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("does not attempt a webhook when none is configured", async () => {
    vi.stubEnv("ERROR_WEBHOOK_URL", "");
    await reportError({ event: "no-hook", severity: "fatal", error: "x" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("resolves even when the webhook itself fails", async () => {
    fetchSpy.mockRejectedValue(new Error("network down"));
    await expect(
      reportError({ event: "hook-down", severity: "error", error: "x" }),
    ).resolves.toBeUndefined();
  });

  it("handles non-Error values without throwing", async () => {
    await expect(
      reportError({ event: "weird", severity: "error", error: { message: 42 } }),
    ).resolves.toBeUndefined();
    const [payload] = loggedPayloads(consoleSpy);
    expect(payload.message).toBe("42");
  });
});
