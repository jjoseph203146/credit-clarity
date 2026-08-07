"use client";

import { useEffect } from "react";

// Next.js App Router error boundary for everything under the (app) group
// (dashboard, reports, plan, progress, chat, learn, goals, notifications,
// settings). Catches render/data errors in that subtree without taking down
// the whole app.
export default function AppError({
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
    <div className="flex min-h-[70vh] items-center justify-center px-8">
      <div className="w-full max-w-[440px] rounded-2xl border border-border bg-white p-9 text-center shadow-[0_12px_40px_rgba(10,25,50,.08)]">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fbecec] text-2xl">
          !
        </div>
        <h1 className="mb-2 text-xl font-bold tracking-[-.02em] text-[var(--ink)]">
          Something went wrong
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted">
          We hit an unexpected error loading this page. Your data is safe — try again, or
          head back to your dashboard.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-[11px] bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#123152]"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="rounded-[11px] border border-border px-5 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--bg)]"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
