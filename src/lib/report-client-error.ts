"use client";

// Ships an error caught by a client-side error boundary to the server, where
// it can actually be seen. console.error in a browser reaches nobody.
//
// Fire-and-forget by design: this runs inside an error boundary that is
// already rendering a failure state, so it must never throw, never block the
// render, and never turn one error into two. Uses keepalive so the request
// survives the user immediately navigating away or reloading — which is
// exactly what people do when they see an error screen.
export function reportClientError(
  error: Error & { digest?: string },
  boundary: string,
): void {
  try {
    void fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        message: error.message,
        digest: error.digest,
        boundary,
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
      }),
    }).catch(() => {
      // Reporting failed. There is nothing useful left to do — surfacing this
      // would replace the real error with a reporting error.
    });
  } catch {
    // Ignore: same reasoning.
  }
}
