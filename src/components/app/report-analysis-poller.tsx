"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 4000;
const MAX_ATTEMPTS = 20; // ~80s — matches the "usually under a minute" promise with headroom.

/**
 * Silently polls a report's status while analysis is still running (webhook
 * -> runAnalysis is in-process and async from the browser's perspective) and
 * refreshes the current server-rendered page once it flips to a terminal
 * state, so the dashboard/report page updates without a manual reload.
 */
export function ReportAnalysisPoller({ reportId }: { reportId: string }) {
  const router = useRouter();
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const interval = setInterval(async () => {
      attemptsRef.current += 1;
      if (attemptsRef.current > MAX_ATTEMPTS) {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (!res.ok || cancelled) return;
        const body = await res.json();
        if (body?.report?.status === "analyzed" || body?.report?.status === "error") {
          clearInterval(interval);
          if (!cancelled) router.refresh();
        }
      } catch {
        // Transient network error — just try again on the next tick.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [reportId, router]);

  return null;
}
