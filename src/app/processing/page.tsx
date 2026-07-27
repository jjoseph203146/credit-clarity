"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 2500;
const MAX_ATTEMPTS = 30; // ~75s before we give up waiting and offer a fallback.

const steps = [
  { key: "payment", label: "Payment received" },
  { key: "accounts", label: "Analyzing accounts & payment history" },
  { key: "collections", label: "Identifying collections & opportunities" },
  { key: "recommendations", label: "Generating recommendations" },
  { key: "roadmap", label: "Building your 90-day roadmap" },
];

type PollState = "waiting" | "done" | "error" | "timeout";

export default function ProcessingPage() {
  return (
    <Suspense fallback={null}>
      <ProcessingPageInner />
    </Suspense>
  );
}

function ProcessingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  const [state, setState] = useState<PollState>("waiting");
  // Cosmetic step cycling — we don't have granular real substep signal (the
  // AI analysis is one call), so this animates through the steps but never
  // claims completion ahead of the real poll confirming status === "analyzed".
  const [cosmeticStep, setCosmeticStep] = useState(1);
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!reportId) return;

    const cosmeticInterval = setInterval(() => {
      setCosmeticStep((s) => Math.min(steps.length - 1, s + 1));
    }, 1400);

    let cancelled = false;
    const pollInterval = setInterval(async () => {
      attemptsRef.current += 1;
      if (attemptsRef.current > MAX_ATTEMPTS) {
        clearInterval(pollInterval);
        clearInterval(cosmeticInterval);
        if (!cancelled) setState("timeout");
        return;
      }

      try {
        const res = await fetch(`/api/reports/${reportId}`);
        if (!res.ok || cancelled) return;
        const body = await res.json();
        const status = body?.report?.status;

        if (status === "analyzed") {
          clearInterval(pollInterval);
          clearInterval(cosmeticInterval);
          if (!cancelled) {
            setCosmeticStep(steps.length);
            setState("done");
            setTimeout(() => {
              if (!cancelled) router.push(`/reports/${reportId}`);
            }, 700);
          }
        } else if (status === "error") {
          clearInterval(pollInterval);
          clearInterval(cosmeticInterval);
          if (!cancelled) setState("error");
        }
      } catch {
        // Transient network error — try again on the next tick.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
      clearInterval(cosmeticInterval);
    };
  }, [reportId, router]);

  if (!reportId) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-[linear-gradient(160deg,#081527,#0b1f3a_60%,#123a5c)] px-8 py-14">
        <div className="w-[420px] rounded-[18px] border border-white/10 bg-white/[.06] p-8 text-center text-white">
          <div className="mb-2 text-lg font-bold">We couldn&apos;t find your report</div>
          <div className="mb-5 text-[13.5px] text-[#b9c8da]">
            Please start over from the upload page.
          </div>
          <Link
            href="/upload"
            className="inline-block rounded-xl bg-teal px-6 py-3 text-[15px] font-semibold text-white hover:bg-[#0b8663]"
          >
            Back to Upload
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[linear-gradient(160deg,#081527,#0b1f3a_60%,#123a5c)] px-8 py-14">
      <div className="w-[480px] text-center text-white">
        <div className="mx-auto mb-[18px] inline-flex items-center gap-2 rounded-full bg-[#e6f5ef]/10 px-3 py-[6px] text-[12.5px] font-bold text-mint-light">
          ✓ Payment received
        </div>
        <div className="mx-auto mb-[22px] flex h-[72px] w-[72px] animate-pulse items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#0e9f77,#2ee6a8)] shadow-[0_12px_40px_rgba(14,159,119,.4)]">
          <div className="h-[26px] w-[26px] rounded-full bg-white opacity-95" />
        </div>
        <div className="mb-2 text-[13px] font-bold tracking-[.12em] text-mint-light">
          MEET CLARITY AI
        </div>
        <h1 className="mb-[30px] text-[28px] tracking-[-.02em]">
          {state === "error"
            ? "We hit a snag analyzing your report"
            : state === "timeout"
              ? "Still working on it"
              : "Building your personalized report"}
        </h1>

        {state === "error" ? (
          <div className="rounded-[18px] border border-white/10 bg-white/[.06] px-[30px] py-[26px] text-left text-[14.5px] leading-relaxed text-[#d6e1ee]">
            Something went wrong while Clarity AI was analyzing your report. Your payment was
            received and your data is safe — you can check your dashboard, or reach out if this
            keeps happening.
          </div>
        ) : state === "timeout" ? (
          <div className="rounded-[18px] border border-white/10 bg-white/[.06] px-[30px] py-[26px] text-left text-[14.5px] leading-relaxed text-[#d6e1ee]">
            This is taking longer than usual. We&apos;ll keep working on it in the background —
            check your dashboard in a minute, or head there now and we&apos;ll update it
            automatically once it&apos;s ready.
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-[18px] border border-white/10 bg-white/[.06] px-[30px] py-[26px] text-left">
            {steps.map((step, i) => {
              const isDone = i === 0 || cosmeticStep > i || state === "done";
              const active = !isDone && cosmeticStep === i;
              return (
                <div
                  key={step.key}
                  className={cn(
                    "flex items-center gap-3.5 transition-colors",
                    isDone ? "text-white" : active ? "text-[#d6e1ee]" : "text-[#5b6f89]",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-bold",
                      isDone
                        ? "bg-teal text-white"
                        : active
                          ? "animate-pulse border-2 border-mint"
                          : "border-2 border-[#2c405a]",
                    )}
                  >
                    {isDone ? "✓" : ""}
                  </div>
                  <span className="text-[15px] font-medium">{step.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {(state === "error" || state === "timeout") && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-teal px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#0b8663]"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {state === "waiting" && (
          <div className="mt-5 text-[13px] text-[#8fa3ba]">
            This usually takes less than one minute. Your report never leaves encrypted storage.
          </div>
        )}
      </div>
    </div>
  );
}
