"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Static demo data mirroring the Goal Engine + Simulator screens from the
// design prototype. Both are combined here since this repo's route map
// groups them under a single "Goals & Simulator" screen.
type GoalKey = "house" | "car" | "biz" | "general";

const GOALS: Record<
  GoalKey,
  { icon: string; title: string; blurb: string; recs: { n: string; title: string; why: string }[] }
> = {
  house: {
    icon: "⌂",
    title: "Buy a House",
    blurb: "Mortgage-ready credit: strict thresholds, paper trails.",
    recs: [
      {
        n: "1",
        title: "Resolve open collections before applying",
        why: "Many mortgage lenders may require certain collections or derogatory accounts to be addressed before approval — requirements vary by loan type, lender, and underwriting system. Start validation now — timeline: 60-90 days.",
      },
      { n: "2", title: "Push utilization under 10%", why: "Stricter than the usual 30% — mortgage pricing tiers reward very low utilization." },
      { n: "3", title: "Freeze new credit for 12 months", why: "No new cards or loans before application; inquiries and new accounts hurt DTI review." },
      { n: "4", title: "Document everything", why: "Keep letters and payment records — underwriters often ask for paper trails on resolved accounts." },
    ],
  },
  car: {
    icon: "⊙",
    title: "Buy a Car",
    blurb: "Rate-tier sprint: fast wins in 90 days.",
    recs: [
      { n: "1", title: "90-day utilization sprint", why: "Auto lenders are typically more forgiving than mortgage lenders — under 30% is often enough to change your rate tier." },
      { n: "2", title: "Validate open collections, but don't wait on them", why: "You can shop for a loan while validation runs; auto approval is often possible even with a collection pending." },
      { n: "3", title: "Rate-shop in a short window", why: "Multiple auto inquiries within a short window (commonly 14 days) are often counted as one for scoring purposes." },
      { n: "4", title: "Get pre-approved by a credit union first", why: "A pre-approval can anchor your negotiation at the dealership." },
    ],
  },
  biz: {
    icon: "▤",
    title: "Business Loan",
    blurb: "Personal + business credit in parallel.",
    recs: [
      { n: "1", title: "Your personal score is often the gate", why: "SBA and many lenders check personal credit for smaller loan amounts — a 670+ threshold is a common reference point." },
      { n: "2", title: "Keep old accounts open", why: "Depth of history often weighs heavily in manual underwriting." },
      { n: "3", title: "Separate business credit early", why: "An EIN, business bank account, and a starter business card help build a parallel file." },
      { n: "4", title: "Bank where you'll borrow", why: "A longer deposit history with a lender can improve approval odds." },
    ],
  },
  general: {
    icon: "↗",
    title: "Improve My Credit",
    blurb: "No specific purchase in mind — prioritize what's most likely to help overall.",
    recs: [
      { n: "1", title: "Address high-impact negatives first", why: "Collections and derogatory marks typically weigh more heavily than any single positive habit." },
      { n: "2", title: "Get utilization under 30%", why: "One of the fastest-moving levers for most profiles." },
      { n: "3", title: "Never miss a payment going forward", why: "Payment history is the single largest factor in most scoring models over time." },
      { n: "4", title: "Let old accounts age", why: "Length of credit history builds passively — avoid closing your oldest accounts." },
    ],
  },
};

const fmt = (n: number) => `$${n.toLocaleString()}`;

export interface CurrentGoalInfo {
  goalLabel: string | null;
  timelineLabel: string | null;
  challengeLabel: string | null;
}

export interface RevolvingAccount {
  name: string;
  balance: number;
  creditLimit: number;
}

export interface ReadinessInputs {
  utilization: number | null;
  hasCollections: boolean;
  hasLatePayment: boolean;
  oldestAccountYears: number | null;
}

interface GoalsSimulatorProps {
  currentGoal: CurrentGoalInfo;
  revolvingAccounts: RevolvingAccount[];
  readiness: ReadinessInputs | null;
}

// Per-goal weighting for the readiness heuristic — an explicit, transparent
// scoring rubric (not a black-box number), similar in spirit to the
// simulator's existing "directional estimate" framing below.
function computeReadiness(goal: GoalKey, r: ReadinessInputs) {
  const strengths: string[] = [];
  const focusAreas: string[] = [];
  let score = 100;

  const utilTarget = goal === "house" ? 10 : goal === "general" ? 30 : 30;
  if (r.utilization == null) {
    score -= 10;
  } else if (r.utilization > utilTarget) {
    const penalty = goal === "house" ? 30 : 20;
    score -= penalty;
    focusAreas.push(`Utilization is ${r.utilization}% — above the ${utilTarget}% target for this goal`);
  } else {
    strengths.push(`Utilization (${r.utilization}%) is within target for this goal`);
  }

  if (r.hasCollections) {
    const penalty = goal === "house" ? 30 : goal === "car" ? 15 : 20;
    score -= penalty;
    focusAreas.push("Open collection account(s) on file");
  } else {
    strengths.push("No open collections found");
  }

  if (r.hasLatePayment) {
    score -= 20;
    focusAreas.push("A late payment was found on your report");
  } else {
    strengths.push("No late payments found");
  }

  if (r.oldestAccountYears != null && r.oldestAccountYears >= 5) {
    strengths.push(`Long credit history (${r.oldestAccountYears.toFixed(0)} years)`);
  } else if (r.oldestAccountYears != null) {
    score -= 5;
    focusAreas.push("Credit history is still relatively short");
  }

  return { score: Math.max(0, Math.round(score)), strengths, focusAreas };
}

export function GoalsSimulator({ currentGoal, revolvingAccounts, readiness }: GoalsSimulatorProps) {
  const [goal, setGoal] = useState<GoalKey>("house");
  const [simPay, setSimPay] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const active = GOALS[goal];
  const hasRevolvingData = revolvingAccounts.length > 0;
  const totalBalance = revolvingAccounts.reduce((s, a) => s + a.balance, 0);
  const totalLimit = revolvingAccounts.reduce((s, a) => s + a.creditLimit, 0);
  const startingUtil = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
  const maxSlider = Math.max(500, Math.ceil(totalBalance / 100) * 100);

  const sim = useMemo(() => {
    let remaining = simPay;
    const applied: { name: string; amount: number }[] = [];
    for (const acc of revolvingAccounts) {
      const pay = Math.min(remaining, acc.balance);
      applied.push({ name: acc.name, amount: pay });
      remaining -= pay;
      if (remaining <= 0) break;
    }
    const newBalance = Math.max(0, totalBalance - simPay);
    const newUtil = totalLimit > 0 ? Math.max(0, Math.round((newBalance / totalLimit) * 100)) : 0;
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
    return { applied, newUtil, verdict, why };
  }, [simPay, revolvingAccounts, totalBalance, totalLimit]);

  const hasCurrentGoal = Boolean(currentGoal.goalLabel);
  const readinessResult = readiness ? computeReadiness(goal, readiness) : null;

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

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      {readinessResult && (
        <div className="mb-5 rounded-[18px] border border-[var(--border)] bg-white p-6">
          <div className="mb-1 text-[11px] font-bold tracking-[.08em] text-[var(--muted)]">
            {active.title.toUpperCase()} READINESS — DIRECTIONAL ESTIMATE, NOT A CREDIT SCORE
          </div>
          <div className="mb-3 flex items-baseline gap-2">
            <span className="font-mono text-[38px] font-semibold text-[var(--navy)]">
              {readinessResult.score}
            </span>
            <span className="text-[15px] text-[var(--muted)]">/ 100</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 text-[12px] font-bold text-[#0b7d5e]">STRENGTHS</div>
              <div className="flex flex-col gap-1 text-[13px]">
                {readinessResult.strengths.length > 0 ? (
                  readinessResult.strengths.map((s) => <span key={s}>✓ {s}</span>)
                ) : (
                  <span className="text-[var(--muted)]">None identified yet.</span>
                )}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[12px] font-bold text-[#9a6314]">FOCUS AREAS</div>
              <div className="flex flex-col gap-1 text-[13px]">
                {readinessResult.focusAreas.length > 0 ? (
                  readinessResult.focusAreas.map((s) => <span key={s}>⚠ {s}</span>)
                ) : (
                  <span className="text-[var(--muted)]">None identified — nice work.</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-3 text-[11.5px] text-[var(--muted)]">
            A simple, transparent estimate based on your uploaded report — not a lender&apos;s
            actual decision criteria, and not affiliated with FICO® or VantageScore®.
          </div>
        </div>
      )}

      <div className="mb-5 rounded-[18px] border border-[var(--border)] bg-white p-6">
        <div className="mb-3.5 flex items-center gap-2">
          <div className="h-[22px] w-[22px] rounded-[7px] bg-gradient-to-br from-[var(--teal)] to-[var(--mint)]" />
          <span className="text-[11px] font-bold tracking-[.08em] text-[var(--teal)]">
            HOW YOUR ROADMAP CHANGES — {active.title.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {active.recs.map((r) => {
            const key = `${goal}-${r.n}`;
            const isOpen = expanded === key;
            return (
              <div key={key} className="rounded-[13px] bg-[#f8fafc] p-3.5">
                <div className="flex gap-3">
                  <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-[9px] bg-[var(--navy)] text-xs font-bold text-[var(--mint-light)]">
                    {r.n}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-semibold">{r.title}</div>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : key)}
                      className="mt-1 text-[12px] font-semibold text-[var(--teal)]"
                    >
                      {isOpen ? "▼" : "▶"} Why this matters
                    </button>
                    {isOpen && (
                      <div className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
                        {r.why}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Button className="mt-4 bg-[var(--teal)] hover:bg-[var(--teal-deep)]">
          Apply to My Plan
        </Button>
      </div>

      <h2 className="mb-1 text-xl font-semibold tracking-[-.02em]">What happens if…</h2>
      <p className="mb-1 text-[13px] text-[var(--muted)]">
        Directional estimates only — not a score prediction. Payments apply to your
        highest-utilization cards first.
      </p>
      <p className="mb-4 text-[12px] text-[#8fa3ba]">
        Based on the revolving account balances and credit limits from your uploaded report.
      </p>

      {!hasRevolvingData ? (
        <div className="rounded-[18px] border border-dashed border-[#c7d2df] bg-white p-8 text-center text-[13.5px] text-[var(--muted)]">
          No revolving (credit card) accounts with balance and limit data were found on your
          report, so a utilization simulation isn&apos;t available.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[18px] border border-[var(--border)] bg-white p-6">
            <div className="mb-1 text-base font-semibold">I pay down my cards by…</div>
            <div className="my-2.5 font-mono text-[38px] font-semibold text-[var(--teal)]">
              {fmt(simPay)}
            </div>
            <input
              type="range"
              min={0}
              max={maxSlider}
              step={50}
              value={simPay}
              onChange={(e) => setSimPay(Number(e.target.value))}
              className="w-full accent-[var(--teal)]"
            />
            <div className="mb-[18px] mt-2 flex justify-between font-mono text-[11.5px] text-[#8fa3ba]">
              <span>$0</span>
              <span>{fmt(Math.round(maxSlider / 2))}</span>
              <span>{fmt(maxSlider)}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {revolvingAccounts.map((acc) => {
                const applied = sim.applied.find((a) => a.name === acc.name)?.amount ?? 0;
                const util = Math.round((acc.balance / acc.creditLimit) * 100);
                return (
                  <div key={acc.name} className="flex justify-between text-[13.5px]">
                    <span className="text-[var(--muted)]">
                      Applied to {acc.name} ({util}%)
                    </span>
                    <span className="font-mono font-semibold">{fmt(applied)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-[18px] bg-gradient-to-br from-[var(--navy)] to-[var(--blue)] p-6 text-white">
            <div className="mb-3.5 text-[11px] font-bold tracking-[.08em] text-[var(--mint-light)]">
              ESTIMATED RESULT
            </div>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[13.5px] text-[#b9c8da]">Overall utilization</span>
              <span className="font-mono text-2xl font-semibold">
                {startingUtil}% → <span className="text-[var(--mint)]">{sim.newUtil}%</span>
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
      )}
    </div>
  );
}
