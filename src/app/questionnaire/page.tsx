"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const q1Options = [
  "Build my credit",
  "Recover from credit mistakes",
  "Pay down debt",
  "Prepare for a major purchase",
  "Understand my finances",
];
const q2Options = ["30 days", "90 days", "6 months", "Long term"];
const q3Options = [
  "Debt",
  "Missed payments",
  "Collections",
  "Low score",
  "Lack of understanding",
];

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
  const router = useRouter();
  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<string | null>(null);

  const quizDone = Boolean(q1 && q2 && q3);

  function submit() {
    if (!quizDone) return;
    router.push("/processing");
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
            {q1Options.map((o) => (
              <Chip key={o} label={o} selected={q1 === o} onClick={() => setQ1(o)} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[16.5px] font-bold">
            What timeline are you working with?
          </div>
          <div className="flex flex-wrap gap-2.5">
            {q2Options.map((o) => (
              <Chip key={o} label={o} selected={q2 === o} onClick={() => setQ2(o)} />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3.5 text-[16.5px] font-bold">
            What is your biggest challenge?
          </div>
          <div className="flex flex-wrap gap-2.5">
            {q3Options.map((o) => (
              <Chip key={o} label={o} selected={q3 === o} onClick={() => setQ3(o)} />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!quizDone}
          className={cn(
            "mt-1 rounded-xl py-[15px] text-base font-semibold transition-colors",
            quizDone
              ? "cursor-pointer bg-teal text-white shadow-[0_8px_24px_rgba(14,159,119,.3)] hover:bg-[#0b8663]"
              : "cursor-not-allowed bg-border text-[#8fa3ba]",
          )}
        >
          Build My Roadmap →
        </button>
      </div>
    </div>
  );
}
