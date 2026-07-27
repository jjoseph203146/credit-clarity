"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const aiLabels = [
  "Reading your report",
  "Identifying important accounts",
  "Finding improvement opportunities",
  "Building your personalized roadmap",
  "Preparing your financial action plan",
];

export default function ProcessingPage() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setStep((prev) => {
        if (prev >= aiLabels.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setDone(true);
          return prev;
        }
        return prev + 1;
      });
    }, 950);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[linear-gradient(160deg,#081527,#0b1f3a_60%,#123a5c)] px-8 py-14">
      <div className="w-[480px] text-center text-white">
        <div className="mx-auto mb-[22px] flex h-[72px] w-[72px] animate-pulse items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#0e9f77,#2ee6a8)] shadow-[0_12px_40px_rgba(14,159,119,.4)]">
          <div className="h-[26px] w-[26px] rounded-full bg-white opacity-95" />
        </div>
        <div className="mb-2 text-[13px] font-bold tracking-[.12em] text-mint-light">
          MEET CLARITY AI
        </div>
        <h1 className="mb-[30px] text-[28px] tracking-[-.02em]">
          Building your personalized analysis
        </h1>
        <div className="flex flex-col gap-4 rounded-[18px] border border-white/10 bg-white/[.06] px-[30px] py-[26px] text-left">
          {aiLabels.map((label, i) => {
            const isDone = step > i;
            const active = step === i;
            return (
              <div
                key={label}
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
                <span className="text-[15px] font-medium">{label}</span>
              </div>
            );
          })}
        </div>
        {done ? (
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="text-[13px] text-[#8fa3ba]">
              Your analysis is ready.
            </div>
            <Link
              href="/"
              className="rounded-xl bg-teal px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#0b8663]"
            >
              Done — Return to Homepage
            </Link>
          </div>
        ) : (
          <div className="mt-5 text-[13px] text-[#8fa3ba]">
            Usually takes under a minute. Your report never leaves encrypted storage.
          </div>
        )}
      </div>
    </div>
  );
}
