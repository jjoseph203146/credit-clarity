import { describe, expect, it } from "vitest";
import { isProtectedPath, PROTECTED_ROUTES } from "./auth-guard";

describe("isProtectedPath", () => {
  it("protects the route root for every authenticated-app route", () => {
    for (const route of PROTECTED_ROUTES) {
      expect(isProtectedPath(route)).toBe(true);
    }
  });

  it("protects nested paths under a protected route", () => {
    expect(isProtectedPath("/reports/123")).toBe(true);
    expect(isProtectedPath("/settings/billing")).toBe(true);
    expect(isProtectedPath("/reports/compare")).toBe(true);
  });

  it("does not protect unrelated marketing/public routes", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/pricing")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/signup")).toBe(false);
    expect(isProtectedPath("/upload")).toBe(false);
  });

  it("does not treat a route as protected merely by prefix match", () => {
    // "/reports-archive" shares a prefix with "/reports" but is a distinct path
    expect(isProtectedPath("/reports-archive")).toBe(false);
    expect(isProtectedPath("/settings-page")).toBe(false);
  });

  it("does not protect the api routes even though pages share a name", () => {
    // /api/reports is a route handler, not the (app) reports page — the
    // protected-path list intentionally lists only the app-page prefixes.
    expect(isProtectedPath("/api/reports")).toBe(false);
  });
});
