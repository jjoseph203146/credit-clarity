"use client";

import { useEffect } from "react";

// Root-level error boundary. Only triggers when an error escapes the root
// layout itself (very rare — normally src/app/(app)/error.tsx or a
// route-level boundary catches first). Per Next.js convention this must
// render its own <html>/<body> since it replaces the root layout.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#0b1f3a",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            textAlign: "center",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,.12)",
            background: "#081527",
            padding: 36,
          }}
        >
          <div
            style={{
              margin: "0 auto 16px",
              width: 48,
              height: 48,
              borderRadius: "999px",
              background: "rgba(255,255,255,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            !
          </div>
          <h1 style={{ marginBottom: 8, fontSize: 20, fontWeight: 700, letterSpacing: "-.02em" }}>
            Something went wrong
          </h1>
          <p style={{ marginBottom: 24, fontSize: 14, lineHeight: 1.6, color: "#8fa3ba" }}>
            Credit Clarity hit an unexpected error. Your data is safe — try reloading the
            page.
          </p>
          <button
            onClick={reset}
            style={{
              borderRadius: 11,
              background: "#0e9f77",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
