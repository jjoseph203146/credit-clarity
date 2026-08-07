"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CHALLENGE_OPTIONS,
  GOAL_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/questionnaire";
import type { Challenge, Goal, Timeline } from "@/lib/supabase/types";

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border-[1.5px] px-[18px] py-2.5 text-sm font-semibold transition-colors",
        selected
          ? "border-teal bg-[#e6f5ef] text-teal-deep"
          : "border-[#dbe3ec] bg-white text-[#3d5068]",
      )}
    >
      {label}
    </button>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={null}>
      <QuestionnairePageInner />
    </Suspense>
  );
}

// Sits between the free preview and checkout. It has to run before payment,
// not after signup: the Stripe webhook kicks off the AI analysis the moment
// the payment succeeds, which in the anonymous flow is before any account
// exists — so answers collected later would arrive after the plan they are
// meant to personalize had already been generated.
function QuestionnairePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  const [goal, setGoal] = useState<Goal | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const complete = Boolean(goal && timeline && challenge);

  async function submit() {
    if (!complete || !reportId || saving) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${reportId}/questionnaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, timeline, challenge }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "We couldn't save your answers.");
      }

      router.push(`/checkout?reportId=${reportId}`);
    } catch (err) {
      setSaving(false);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't save your answers. Please try again.",
      );
    }
  }

  if (!reportId) {
    return (
      <div className="mx-auto max-w-[640px] px-8 pb-24 pt-16 text-center">
        <h1 className="mb-2 text-[24px] tracking-[-.02em]">
          We couldn&apos;t find your report
        </h1>
        <p className="mb-6 text-[15px] text-muted">
          Please start over from the upload page.
        </p>
        <Link
          href="/upload"
          className="inline-block rounded-[11px] bg-navy px-[22px] py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#123152]"
        >
          Back to Upload
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[640px] px-8 pb-24 pt-16">
      <div className="mb-2.5 text-[13px] font-semibold text-teal">
        PERSONALIZE YOUR PLAN
      </div>
      <h1 className="mb-1.5 text-[30px] tracking-[-.025em]">Three quick questions</h1>
      <p className="mb-9 text-[15px] text-muted">
        Clarity AI uses these to shape your roadmap — not to sell you anything.
      </p>

      <div className="flex flex-col gap-8">
        <div>
          <div className="mb-3.5 text-[16.5px] font-bold">
            What is your main financial goal?
          </div>
          <div className="flex flex-wrap gap-2.5">
            {GOAL_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                selected={goal === o.value}
                onClick={() => setGoal(o.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[16.5px] font-bold">
            What timeline are you working with?
          </div>
          <div className="flex flex-wrap gap-2.5">
            {TIMELINE_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                selected={timeline === o.value}
                onClick={() => setTimeline(o.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[16.5px] font-bold">
            What is your biggest challenge?
          </div>
          <div className="flex flex-wrap gap-2.5">
            {CHALLENGE_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                selected={challenge === o.value}
                onClick={() => setChallenge(o.value)}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-[10px] bg-[#fbecec] px-3.5 py-3 text-[13px] font-medium text-[#a33232]">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!complete || saving}
          className={cn(
            "mt-1 rounded-xl py-[15px] text-base font-semibold transition-colors",
            complete && !saving
              ? "cursor-pointer bg-teal text-white shadow-[0_8px_24px_rgba(14,159,119,.3)] hover:bg-[#0b8663]"
              : "cursor-not-allowed bg-border text-[#8fa3ba]",
          )}
        >
          {saving ? "Saving…" : "Continue to Checkout →"}
        </button>

        <Link
          href={`/checkout?reportId=${reportId}`}
          className="text-center text-[13.5px] font-medium text-muted underline underline-offset-4 hover:text-ink"
        >
          Skip — my plan doesn&apos;t need to be personalized
        </Link>
      </div>
    </div>
  );
}
