import { describe, expect, it } from "vitest";
import { clientIp, hit } from "./rate-limit";

// `hit` accepts an injectable `now` so windows can be advanced without
// fake timers. Each test uses a unique key so the shared module-level map
// doesn't leak state between cases.
describe("hit", () => {
  it("allows requests up to the limit", () => {
    const results = [1, 2, 3].map(() => hit("allow", 3, 60_000, 0));
    expect(results.every((r) => r.ok)).toBe(true);
  });

  it("rejects the request that exceeds the limit", () => {
    for (let i = 0; i < 3; i++) hit("reject", 3, 60_000, 0);
    expect(hit("reject", 3, 60_000, 0).ok).toBe(false);
  });

  it("reports the seconds remaining until the window resets", () => {
    for (let i = 0; i < 3; i++) hit("retry-after", 3, 60_000, 0);
    // 10s into a 60s window, 50s remain.
    expect(hit("retry-after", 3, 60_000, 10_000).retryAfterSeconds).toBe(50);
  });

  it("starts a fresh window once the previous one expires", () => {
    for (let i = 0; i < 3; i++) hit("expiry", 3, 60_000, 0);
    expect(hit("expiry", 3, 60_000, 0).ok).toBe(false);
    expect(hit("expiry", 3, 60_000, 60_001).ok).toBe(true);
  });

  it("tracks each key independently", () => {
    for (let i = 0; i < 3; i++) hit("key-a", 3, 60_000, 0);
    expect(hit("key-a", 3, 60_000, 0).ok).toBe(false);
    expect(hit("key-b", 3, 60_000, 0).ok).toBe(true);
  });
});

describe("clientIp", () => {
  function req(headers: Record<string, string>) {
    return new Request("https://example.test/api/upload", { headers });
  }

  it("takes the first entry of x-forwarded-for (the client, not the proxies)", () => {
    expect(clientIp(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIp(req({ "x-real-ip": "9.8.7.6" }))).toBe("9.8.7.6");
  });

  it("buckets header-less requests together rather than skipping the limit", () => {
    expect(clientIp(req({}))).toBe("unknown");
  });
});
