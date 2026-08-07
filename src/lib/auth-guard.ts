// Pure helper for route protection, used by proxy.ts. Kept dependency-free
// (no next/server imports) so it can be unit tested in isolation.

// Top-level segments of the authenticated app — everything nested under these
// paths requires a logged-in user (see BUILD.md sitemap / Credit Clarity App).
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/reports",
  "/plan",
  "/progress",
  "/chat",
  "/learn",
  "/goals",
  "/notifications",
  "/settings",
] as const;

/**
 * Returns true if `pathname` falls under one of the authenticated-app routes
 * and therefore requires a signed-in user.
 *
 * Matches the route itself and any nested path (`/reports`, `/reports/123`),
 * but not unrelated paths that merely share a prefix (`/reports-archive`).
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
