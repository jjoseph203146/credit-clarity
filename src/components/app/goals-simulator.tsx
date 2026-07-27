"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Static demo data mirroring the Goal Engine + Simulator screens from the
// design prototype. Both are combined here since this repo's route map
// groups them under a single "Goals & Simulator" screen.
type GoalKey = "house" | "car" | "biz";

const GOALS: Record<GoalKey, { icon: string; title: string; blurb: string; recs: { n: string; title: string; desc: string }[] }> = {
  house: {
    icon: "⌂",
    title: "Buy a House",
    blurb: "Mortgage-ready credit: strict thresholds, paper trails.",
    recs: [
      { n: "1", title: "Resolve the collection before applying", desc: "Most mortgage underwriters require collections paid or resolved. Start validation now — timeline: 60-90 days." },
      { n: "2", title: "Push utilization under 10%", desc: "Stricter than the usual 30% — mortgage pricing tiers reward very low utilization." },
      { n: "3", title: "Freeze new credit for 12 months", desc: "No new cards or loans before application; inquiries and new accounts hurt DTI review." },
      { n: "4", title: "Document everything", desc: "Keep letters and payment records — underwriters ask for paper trails on resolved accounts." },
    ],
  },
  car: {
    icon: "⊙",
    title: "Buy a Car",
    blurb: "Rate-tier sprint: fast wins in 90 days.",
    recs: [
      { n: "1", title: "90-day utilization sprint", desc: "Auto lenders are more forgiving than mortgage — under 30% is enough to change your rate tier." },
      { n: "2", title: "Validate the collection, but don't wait on it", desc: "You can shop for a loan while validation runs; auto approval is likely even with it pending." },
      { n: "3", title: "Rate-shop in a 14-day window", desc: "Multiple auto inquiries within 14 days count as one." },
      { n: "4", title: "Get pre-approved by a credit union first", desc: "A CU pre-approval anchors your negotiation at the dealership." },
    ],
  },
  biz: {
    icon: "▤",
    title: "Business Loan",
    blurb: "Personal + business credit in parallel.",
    recs: [
      { n: "1", title: "Your personal score is the gate", desc: "SBA and most lenders check personal credit under ~$150k. The 670 threshold matters most." },
      { n: "2", title: "Keep old accounts open", desc: "Depth of history weighs heavily in manual underwriting." },
      { n: "3", title: "Separate business credit early", desc: "EIN, business bank account, and a starter business card build a parallel file." },
      { n: "4", title: "Bank where you'll borrow", desc: "6+ months of deposit history with a lender materially improves approval odds." },
    ],
  },
};

// Simulator constants mirror the prototype: two revolving balances paid down
// in order (Chase first, then Capital One), against an $11,500 combined limit.
const CHASE_BALANCE = 2860;
const CAP_ONE_BALANCE = 4320;
const TOTAL_BALANCE = CHASE_BALANCE + CAP_ONE_BALANCE; // 7,190 — matches prototype's 7,590 rounding baseline
const TOTAL_LIMIT = 11500;
const fmt = (n: number) => `$${n.toLocaleString()}`;

export interface CurrentGoalInfo {
  goalLabel: string | null;
  timelineLabel: string | null;
  challengeLabel: string | null;
}

interface GoalsSimulatorProps {
  currentGoal: CurrentGoalInfo;
}

export function GoalsSimulator({ currentGoal }: GoalsSimulatorProps) {
  const [goal, setGoal] = useState<GoalKey>("house");
  const [simPay, setSimPay] = useState(1200);

  const active = GOALS[goal];

  const sim = useMemo(() => {
    const chasePaid = Math.min(simPay, CHASE_BALANCE);
    const capPaid = Math.min(Math.max(simPay - CHASE_BALANCE, 0), CAP_ONE_BALANCE);
    const newBalance = TOTAL_BALANCE - chasePaid - capPaid;
    const newUtil = Math.max(0, Math.round((newBalance / TOTAL_LIMIT) * 100));
    const verdict =
      newUtil <= 10
        ? "Strong lift likely"
        : newUtil <= 30
          ? "Meaningful lift likely"
          : newUtil <= 50
            ? "Moderate improvement"
            : "Small improvement";
    const why =
      newUtil <= 30
        ? "Crossing under the 30% threshold is where profiles like yours historically see the largest utilization-driven gains."
        : "Still above the 30% threshold — improvement is real but the biggest gains arrive once you cross 30%.";
    return { chasePaid, capPaid, newUtil, verdict, why };
  }, [simPay]);

  const hasCurrentGoal = Boolean(currentGoal.goalLabel);

  return (
    <div className="max-w-[940px] px-9 pb-[72px] pt-7">
      <h1 className="mb-1 text-2xl font-semibold tracking-[-.02em]">Your Goal</h1>
      <p className="mb-5 text-[13px] text-[var(--muted)]">
        Your roadmap re-prioritizes around what you&apos;re working toward.
      </p>

      <div className="mb-5 rounded-2xl border border-[var(--border)] bg-white p-5">
        <div className="mb-2 text-[11px] font-bold tracking-[.08em] text-[var(--muted)]">
          YOUR CURRENT GOAL
        </div>
        {hasCurrentGoal ? (
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13.5px]">
            <div>
              <span className="text-[var(--muted)]">Goal: </span>
              <span className="font-semibold">{currentGoal.goalLabel}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Timeline: </span>
              <span className="font-semibold">{currentGoal.timelineLabel ?? "Not set"}</span>
            </div>
            <div>
              <span className="text-[var(--muted)]">Biggest challenge: </span>
              <span className="font-semibold">{currentGoal.challengeLabel ?? "Not set"}</span>
            </div>
          </div>
        ) : (
          <div className="text-[13.5px] text-[var(--muted)]">
            You haven&apos;t set a goal yet. Pick one below to build a roadmap around it.
          </div>
        )}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(Object.keys(GOALS) as GoalKey[]).map((key) => {
          const g = GOALS[key];
          const isActive = goal === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setGoal(key)}
              className={cn(
                "rounded-2xl border-[1.5px] p-5 text-left transition-colors",
                isActive
                  ? "border-[var(--teal)] bg-gradient-to-br from-[var(--navy)] to-[var(--blue)] text-white"
                  : "border-[var(--border)] bg-white",
              )}
            >
              <div className="mb-2 text-2xl">{g.icon}</div>
              <div className="mb-1 text-[15.5px] font-semibold">{g.title}</div>
              <div className={cn("text-[12.5px] leading-relaxed", isActive ? "opacity-85" : "text-[var(--muted)]")}>
                {g.blurb}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mb-5 rounded-[18px] border border-[var(--border)] bg-white p-6">
        <div className="mb-3.5 flex items-center gap-2">
          <div className="h-[22px] w-[22px] rounded-[7px] bg-gradient-to-br from-[var(--teal)] to-[var(--mint)]" />
          <span className="text-[11px] font-bold tracking-[.08em] text-[var(--teal)]">
            HOW YOUR ROADMAP CHANGES — {active.title.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {active.recs.map((r) => (
            <div key={r.n} className="flex gap-3 rounded-[13px] bg-[#f8fafc] p-3.5">
              <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-[9px] bg-[var(--navy)] text-xs font-bold text-[var(--mint-light)]">
                {r.n}
              </div>
              <div>
                <div className="text-[13.5px] font-semibold">{r.title}</div>
                <div className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
                  {r.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button className="mt-4 bg-[var(--teal)] hover:bg-[var(--teal-deep)]">
          Apply to My Plan
        </Button>
      </div>

      <h2 className="mb-1 text-xl font-semibold tracking-[-.02em]">What happens if…</h2>
      <p className="mb-4 text-[13px] text-[var(--muted)]">
        Directional estimates only — not a score prediction. Payments apply to your
        highest-utilization cards first.
      </p>
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-[18px] border border-[var(--border)] bg-white p-6">
          <div className="mb-1 text-base font-semibold">I pay down my cards by…</div>
          <div className="my-2.5 font-mono text-[38px] font-semibold text-[var(--teal)]">
            {fmt(simPay)}
          </div>
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={simPay}
            onChange={(e) => setSimPay(Number(e.target.value))}
            className="w-full accent-[var(--teal)]"
          />
          <div className="mb-[18px] mt-2 flex justify-between font-mono text-[11.5px] text-[#8fa3ba]">
            <span>$0</span>
            <span>$2,500</span>
            <span>$5,000</span>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between text-[13.5px]">
              <span className="text-[var(--muted)]">Applied to Chase Freedom (82%)</span>
              <span className="font-mono font-semibold">{fmt(sim.chasePaid)}</span>
            </div>
            <div className="flex justify-between text-[13.5px]">
              <span className="text-[var(--muted)]">Applied to Capital One (72%)</span>
              <span className="font-mono font-semibold">{fmt(sim.capPaid)}</span>
            </div>
          </div>
        </div>
        <div className="rounded-[18px] bg-gradient-to-br from-[var(--navy)] to-[var(--blue)] p-6 text-white">
          <div className="mb-3.5 text-[11px] font-bold tracking-[.08em] text-[var(--mint-light)]">
            ESTIMATED RESULT
          </div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[13.5px] text-[#b9c8da]">Overall utilization</span>
            <span className="font-mono text-2xl font-semibold">
              72% → <span className="text-[var(--mint)]">{sim.newUtil}%</span>
            </span>
          </div>
          <div className="mb-[18px] h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--teal)] to-[var(--mint)] transition-all"
              style={{ width: `${sim.newUtil}%` }}
            />
          </div>
          <div className="rounded-[13px] border border-white/10 bg-white/[.07] p-4">
            <div className="mb-1 text-xs font-bold text-[var(--mint-light)]">LIKELY DIRECTION</div>
            <div className="mb-1 text-[17px] font-semibold">{sim.verdict}</div>
            <div className="text-[12.5px] leading-relaxed text-[#b9c8da]">{sim.why}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
