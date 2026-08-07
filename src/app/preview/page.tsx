"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import {
  bureauLabel,
  deriveClarityScore,
  deriveScoreFactors,
  formatDate,
  overallUtilization,
  utilizationTone,
} from "@/lib/report-derivations";
import type {
  Report,
  ReportAccount,
  ReportCollection,
  ReportInquiry,
} from "@/lib/supabase/types";

const MONO = "font-[family-name:var(--font-jetbrains-mono)]";

// Drawn rather than an emoji: 🔒 renders inconsistently across platforms and
// disappears entirely where no emoji font is installed.
function LockIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function scoreTier(score: number): { label: string; className: string } {
  if (score >= 800) return { label: "Excellent range", className: "text-teal-deep" };
  if (score >= 740) return { label: "Very good range", className: "text-teal-deep" };
  if (score >= 670) return { label: "Good range", className: "text-[#2c7a4b]" };
  if (score >= 580) return { label: "Fair range", className: "text-[#c2731a]" };
  return { label: "Poor range", className: "text-[#c23e3e]" };
}

type ReportData = {
  report: Report;
  accounts: ReportAccount[];
  collections: ReportCollection[];
  inquiries: ReportInquiry[];
};

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewPageInner />
    </Suspense>
  );
}

function PreviewPageInner() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setError("We couldn't find your report. Please start over from the upload page.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/reports/${reportId}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.error ?? "We couldn't find your report.");
        }
        return body as ReportData;
      })
      .then((body) => {
        if (!cancelled) setData(body);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "We couldn't find your report. Please start over from the upload page.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reportId]);

  if (loading) {
    return (
      <div>
        <MarketingNav />
        <div className="mx-auto max-w-[980px] px-8 pb-24 pt-14 text-center">
          <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-[3px] border-border border-t-teal" />
          <div className="text-[15px] text-muted">Loading your credit snapshot…</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <MarketingNav />
        <div className="mx-auto max-w-[680px] px-8 pb-24 pt-16 text-center">
          <div className="rounded-[20px] border border-[#f0d4d4] bg-white p-9">
            <div className="mb-3.5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fbecec] text-xl font-bold text-[#c23e3e]">
              ✕
            </div>
            <div className="mb-1.5 text-[17px] font-bold">We couldn&apos;t load your preview</div>
            <div className="mx-auto mb-5 max-w-[400px] text-sm text-muted">
              {error ?? "We couldn't find your report. Please start over from the upload page."}
            </div>
            <Link
              href="/upload"
              className="inline-block rounded-[11px] bg-navy px-[22px] py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#123152]"
            >
              Back to Upload
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { report, accounts, collections } = data;

  const score = report.credit_score;
  const bureauName = bureauLabel(report.bureau);

  const openAccounts = accounts.filter((a) => a.status === "open").length;
  const collectionCount = collections.length;
  const revolvingCount = accounts.filter(
    (a) => a.type === "credit_card" || a.type === "retail_card",
  ).length;
  const recommendationsCount = accounts.length + collections.length;

  const oldestAccount = [...accounts]
    .filter((a) => a.opened_date)
    .sort((a, b) => new Date(a.opened_date!).getTime() - new Date(b.opened_date!).getTime())[0];
  const creditHistoryYears = oldestAccount
    ? Math.max(
        0,
        (Date.now() - new Date(oldestAccount.opened_date!).getTime()) /
          (365.25 * 24 * 3600 * 1000),
      )
    : null;

  const lateAccounts = accounts.filter(
    (a) => a.payment_history && /late/i.test(a.payment_history),
  ).length;

  const utilization = overallUtilization(accounts);
  const uTone = utilizationTone(utilization);
  const utilizationLabelClass: Record<string, string> = {
    good: "text-[#2c7a4b]",
    warn: "text-[#c2731a]",
    bad: "text-[#c23e3e]",
    neutral: "text-muted",
  };

  const factors = deriveScoreFactors(accounts, collections);
  // Drawn dots rather than 🟢🟡🔴 — the emoji vary by platform and vanish
  // where no emoji font is installed.
  const toneDotClass: Record<string, string> = {
    good: "bg-[#2c7a4b]",
    warn: "bg-[#c2731a]",
    bad: "bg-[#c23e3e]",
    neutral: "bg-[#8fa3ba]",
  };

  const clarity = deriveClarityScore(accounts, collections);
  const clarityVerdict =
    clarity.needsAttention === 0
      ? "Your credit profile is in good shape across every area we could read."
      : `Your credit profile has strengths, but ${clarity.needsAttention} area${
          clarity.needsAttention === 1 ? "" : "s"
        } need${clarity.needsAttention === 1 ? "s" : ""} attention.`;

  const includedInFull = [
    "Account-by-account explanations",
    "Ranked priorities",
    "Personalized 90-day roadmap",
    "Collection strategy",
    "Communication templates",
    "Professional PDF report",
    "Ask Clarity AI questions",
  ];

  // Name the specific fields we couldn't read, rather than grading the whole
  // parse with a vague "Medium confidence" — a hedge on the result reads as
  // "the AI isn't sure about your report," which is not what it meant.
  const missingFields = [
    score == null ? "Credit score unavailable in this report." : null,
    accounts.length === 0 ? "No individual accounts could be read from this report." : null,
  ].filter(Boolean) as string[];

  const lockedCards = [
    {
      t: "See which accounts deserve your attention first",
      d: "Every account ranked by impact with personalized recommendations.",
    },
    {
      t: "Your 90-Day Credit Roadmap",
      d: "Exactly what to do first, second, and third.",
    },
    { t: "Debt Payoff Strategy", d: "Which balances to prioritize and why." },
    {
      t: "Items Worth Reviewing",
      d: "We'll identify accounts and details that may deserve closer review for accuracy.",
    },
    {
      t: "Communication Toolkit",
      d: "Letters and scripts tailored to your report.",
    },
  ];

  const reportMeta = [
    bureauName === "Unknown bureau" ? "Credit report" : `${bureauName} report`,
    report.report_date ? formatDate(report.report_date) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <MarketingNav />
      <div className="mx-auto max-w-[980px] px-8 pb-24 pt-14">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="rounded-full bg-[#e6f5ef] px-3 py-[5px] text-xs font-bold text-teal-deep">
            FREE PREVIEW
          </div>
          <div className="text-[13px] text-[#8fa3ba]">{reportMeta}</div>
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-teal-deep">
            <span aria-hidden>✓</span> Report analyzed successfully
          </div>
        </div>
        <h1 className="mb-4 text-[32px] tracking-[-.025em]">Here&apos;s your credit snapshot</h1>

        {missingFields.length > 0 && (
          <div className="mb-6 rounded-xl border border-[#e8dcc4] bg-[#fdf6ec] px-4 py-3 text-[13px] leading-relaxed text-[#7d5a1d]">
            {missingFields.map((m) => (
              <div key={m}>{m}</div>
            ))}
            <div className="mt-0.5 text-[#9a6314]">
              Everything else below was read from your report as normal.
            </div>
          </div>
        )}

        {/* Step tracker: frames the preview as a finished analysis waiting to be revealed. */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-muted">
          <span className="flex items-center gap-1.5 text-teal-deep">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-deep text-[9px] text-white">✓</span>
            Report uploaded
          </span>
          <span className="h-px w-6 bg-border" />
          <span className="flex items-center gap-1.5 text-teal-deep">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-deep text-[9px] text-white">✓</span>
            Credit data extracted
          </span>
          <span className="h-px w-6 bg-border" />
          <span className="flex items-center gap-1.5 text-teal-deep">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-deep text-[9px] text-white">✓</span>
            Preview generated
          </span>
          <span className="h-px w-6 bg-border" />
          {/* The one incomplete step is also the next action, so it links. */}
          <Link
            href={`/checkout?reportId=${report.id}`}
            className="flex items-center gap-1.5 rounded-full transition-colors duration-150 hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border">
              <LockIcon className="h-2.5 w-2.5" />
            </span>
            Unlock full report
          </Link>
        </div>

        {/* Clarity Score: a personalized read, not another extracted fact.
            Derived from parsed rows only — no AI call, no paywall. */}
        <div className="mb-4 grid grid-cols-[300px_1fr] gap-3.5 overflow-hidden rounded-2xl border border-border bg-white max-md:grid-cols-1">
          <div className="flex flex-col justify-center border-r border-border bg-[#f8fafc] p-7 max-md:border-b max-md:border-r-0">
            <div className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-teal-deep">
              Clarity Score
            </div>
            <div className={`mt-1 text-[56px] font-semibold leading-none ${MONO}`}>
              {clarity.score}
              <span className="text-[24px] text-[#8fa3ba]">/100</span>
            </div>
            <div className="mt-2 text-[12px] leading-snug text-muted">
              Credit Clarity&apos;s own educational rating — not a FICO® or VantageScore® credit
              score.
            </div>
          </div>
          <div className="flex flex-col justify-center p-7">
            <div className="text-[17px] font-bold leading-snug tracking-[-.01em]">
              {clarityVerdict}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {clarity.areas.map((a) => (
                <span
                  key={a.label}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12.5px] font-semibold ${
                    a.ok ? "bg-[#e6f5ef] text-teal-deep" : "bg-[#fdf6ec] text-[#9a6314]"
                  }`}
                >
                  <span aria-hidden>{a.ok ? "✓" : "!"}</span>
                  {a.label}
                </span>
              ))}
            </div>
            <Link
              href={`/checkout?reportId=${report.id}`}
              className="mt-4 inline-flex items-center gap-2 self-start rounded text-[13px] text-muted transition-colors duration-150 hover:text-teal-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
            >
              <LockIcon />
              Unlock to see how each area was scored and what moves it.
            </Link>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-3.5 max-md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-[22px]">
            <div className="text-[12.5px] font-medium text-muted">Credit Score</div>
            {score != null ? (
              <>
                <div className={`mt-1.5 text-[40px] font-semibold ${MONO}`}>{score}</div>
                <div
                  className={`mt-0.5 text-[12.5px] font-semibold ${scoreTier(score).className}`}
                >
                  {scoreTier(score).label}
                </div>
              </>
            ) : (
              <>
                <div className="mt-1.5 text-[19px] font-bold text-muted">
                  Unavailable in this report
                </div>
                <div className="mt-1 text-[12.5px] leading-snug text-muted">
                  Some {bureauName === "Unknown bureau" ? "credit" : bureauName} reports don&apos;t
                  include a score. Your full analysis still works.
                </div>
              </>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-white p-[22px]">
            <div className="text-[12.5px] font-medium text-muted">Accounts</div>
            <div className={`mt-1.5 text-[40px] font-semibold ${MONO}`}>
              {accounts.length}
            </div>
            <div className="mt-0.5 text-[12.5px] text-muted">
              {openAccounts} open
              {collectionCount > 0
                ? ` · ${collectionCount} collection${collectionCount > 1 ? "s" : ""}`
                : ""}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-[22px]">
            <div className="text-[12.5px] font-medium text-muted">Payment History</div>
            <div
              className={`mt-3 text-[19px] font-bold ${
                lateAccounts > 0 ? "text-[#c2731a]" : "text-[#2c7a4b]"
              }`}
            >
              {lateAccounts > 0 ? "Needs Attention" : "Strong"}
            </div>
            <div className="mt-0.5 text-[12.5px] text-muted">
              {lateAccounts > 0
                ? `${lateAccounts} late payment${lateAccounts > 1 ? "s" : ""} found`
                : "No late payments detected in the uploaded report"}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-[22px]">
            <div className="text-[12.5px] font-medium text-muted">
              {utilization != null ? "Estimated Utilization" : "Utilization"}
            </div>
            {utilization != null ? (
              <>
                <div className={`mt-3 text-[19px] font-bold ${utilizationLabelClass[uTone]}`}>
                  {uTone === "bad" ? "High — " : uTone === "warn" ? "Moderate — " : ""}
                  {utilization}%
                </div>
                <div className="mt-0.5 text-[12.5px] text-muted">Goal: below 30%</div>
              </>
            ) : (
              <div className="mt-1.5 text-[12.5px] leading-snug text-muted">
                We couldn&apos;t confidently calculate utilization from the uploaded report.
                Your full analysis includes account-level estimates where available.
              </div>
            )}
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-border bg-white p-[22px] px-6">
          <div className="mb-3 text-[15px] font-bold">Biggest opportunities we found</div>
          <div className="flex flex-col gap-3">
            {factors.length > 0 ? (
              factors.map((f, i) => (
                <div key={f.title} className="flex items-start gap-2.5 text-[13.5px]">
                  <span
                    aria-hidden
                    className={`mt-[7px] h-2 w-2 flex-none rounded-full ${toneDotClass[f.tone]}`}
                  />
                  <span>
                    <div className="font-semibold">{f.narrative}</div>
                    <div className="text-muted">{f.why}</div>
                    {i === 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedFactor(expandedFactor === f.title ? null : f.title)
                          }
                          className="mt-1 text-[12.5px] font-semibold text-teal"
                        >
                          {expandedFactor === f.title ? "▼" : "▶"} Preview why this matters
                        </button>
                        {expandedFactor === f.title && (
                          <div className="mt-2 rounded-xl bg-[#f6f8fb] p-3.5 text-[13px] leading-relaxed text-[#3d5068]">
                            {f.learnMore}
                            <div className="mt-2">
                              <Link
                                href={`/checkout?reportId=${report.id}`}
                                className="font-semibold text-teal"
                              >
                                <LockIcon className="mr-1 inline h-3 w-3 align-[-2px]" />View my personalized guidance
                              </Link>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-[13.5px] text-muted">
                We didn&apos;t find enough detail in your report to list opportunities yet.
              </span>
            )}
          </div>
        </div>

        <div className="mb-9 rounded-2xl border border-border bg-white p-[22px] px-6">
          <div className="mb-3 text-[15px] font-bold">Clarity AI initial findings</div>
          <div className="flex flex-col gap-2 text-[13.5px]">
            <div>✓ We reviewed {accounts.length} account{accounts.length === 1 ? "" : "s"}</div>
            {collectionCount > 0 && (
              <div>
                ✓ We identified {collectionCount} collection account
                {collectionCount > 1 ? "s" : ""}
              </div>
            )}
            {creditHistoryYears != null && (
              <div>✓ Your credit history spans {creditHistoryYears.toFixed(1)} years</div>
            )}
            {revolvingCount > 0 && (
              <div>
                ✓ We found {revolvingCount} revolving credit account
                {revolvingCount > 1 ? "s" : ""} on file
              </div>
            )}
            <div>✓ We found multiple opportunities to strengthen your credit profile</div>
            <div className="mt-1 font-semibold text-navy">
              <LockIcon className="mr-1 inline h-3.5 w-3.5 align-[-2px]" />{recommendationsCount} personalized insight{recommendationsCount === 1 ? "" : "s"}{" "}
              and recommendations are ready
            </div>
          </div>
        </div>

        {collectionCount > 0 ? (
          <div className="mb-9 overflow-hidden rounded-2xl border border-[#f0d9d9] bg-white">
            <div className="border-b border-[#f0d9d9] bg-[#fdf1f1] px-6 py-3.5">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#a94848]">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[#c23e3e]" /> Biggest
                opportunity
              </div>
            </div>
            <div className="px-6 py-[22px]">
              <div className="text-[19px] font-bold tracking-[-.01em]">
                {collectionCount} collection account{collectionCount > 1 ? "s" : ""} identified
              </div>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                Collections are one of the biggest factors lenders review.
              </p>
              <div className="mt-4 text-[12.5px] font-bold uppercase tracking-[0.06em] text-muted">
                Unlock to see
              </div>
              <ul className="mt-2 flex flex-col gap-1.5 text-[13.5px]">
                {[
                  "Which account matters most",
                  "What options you have",
                  "Your recommended next step",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-[#c98b8b]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : accounts.length > 0 ? (
          <div className="mb-9 rounded-2xl border border-border bg-white p-[22px] px-6">
            <div className="mb-2 text-[13px] font-bold text-muted">
              Clarity AI recommendation preview
            </div>
            <div className="flex items-start gap-2">
              <LockIcon className="mt-0.5 h-4 w-4 flex-none" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-teal-deep">
                  Priority #1
                </div>
                <div className="mt-0.5 text-[15px] font-bold">Your Most Important Next Step</div>
                <div className="mt-1 text-[13.5px] leading-relaxed text-muted">
                  We&apos;ve identified one action that may have the greatest impact on
                  strengthening your credit profile. Unlock to see which account and why.
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-9 rounded-2xl border border-border bg-white p-[22px] px-6">
          <div className="mb-3 text-[15px] font-bold">Your report has been analyzed</div>
          <div className="flex flex-col gap-2 text-[13.5px]">
            <div>✓ {accounts.length} account{accounts.length === 1 ? "" : "s"} reviewed</div>
            <div>
              ✓ {collectionCount} collection{collectionCount === 1 ? "" : "s"} identified
            </div>
            <div>
              ✓ {recommendationsCount} personalized insight{recommendationsCount === 1 ? "" : "s"}{" "}
              generated
            </div>
            <div>✓ 1 custom roadmap prepared</div>
          </div>
        </div>

        <h2 className="mb-4 text-xl tracking-[-.015em]">
          Your personalized credit report is ready
        </h2>

        {/* Two halves of the same promise: what the report looks like, and
            what's in it. Seeing the artifact makes the $5 concrete. */}
        <div className="mb-7 grid grid-cols-[1.05fr_.95fr] gap-3.5 max-lg:grid-cols-1">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-white">
            <div className="border-b border-border px-6 py-3.5 text-[13px] font-bold">
              Your personalized credit report
            </div>
            <div className="relative">
              {/* Redacted page mock: real section names, bars where the
                  content goes. Blurred rather than faked, so nothing here
                  reads as a specific claim about their file. */}
              <div className="select-none px-6 py-5 blur-[3px]" aria-hidden>
                {[
                  { h: "Executive Summary", rows: [92, 78, 85] },
                  { h: "Top Priorities", rows: [70, 88] },
                  { h: "90-Day Plan", rows: [82, 64, 74] },
                ].map((sec) => (
                  <div key={sec.h} className="mb-5 last:mb-0">
                    <div className="mb-2 text-[13.5px] font-bold text-navy">{sec.h}</div>
                    <div className="flex flex-col gap-1.5">
                      {sec.rows.map((w, i) => (
                        <div
                          key={i}
                          className="h-2.5 rounded-full bg-[linear-gradient(90deg,#dfe6ef,#eef2f7)]"
                          style={{ width: `${w}%` }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-4 flex justify-center">
                <Link
                  href={`/checkout?reportId=${report.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-navy/90 px-4 py-2 text-[12.5px] font-semibold text-white backdrop-blur transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:bg-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <LockIcon /> Unlock full report
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white px-6 py-[22px]">
            <div className="text-[15px] font-bold">Your complete analysis includes:</div>
            <ul className="mt-3.5 flex flex-col gap-2.5">
              {includedInFull.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[14px]">
                  <span
                    aria-hidden
                    className="mt-[3px] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full bg-[#e6f5ef] text-[10px] font-bold text-teal-deep"
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-7 grid grid-cols-3 gap-3.5 max-md:grid-cols-1">
          {lockedCards.map((l) => (
            <Link
              key={l.t}
              href={`/checkout?reportId=${report.id}`}
              className="group relative block overflow-hidden rounded-2xl border border-border bg-white p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:border-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div className="mb-2 flex items-center gap-2">
                <LockIcon className="mt-0.5 h-4 w-4 flex-none" />
                <span className="text-[15px] font-bold">{l.t}</span>
              </div>
              <div className="text-[13.5px] leading-relaxed text-muted">{l.d}</div>
              <div className="mt-3 h-2 w-4/5 rounded-full bg-[linear-gradient(90deg,#eef2f7,#e4e9f0)]" />
              <div className="mt-1.5 h-2 w-[55%] rounded-full bg-[linear-gradient(90deg,#eef2f7,#e4e9f0)]" />
              <div className="mt-3 text-[12.5px] font-semibold text-teal opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                Unlock for $5 →
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[18px] bg-[linear-gradient(135deg,#0b1f3a,#134066)] px-8 py-8 text-white">
          <div className="max-w-[380px]">
            <div className="text-[19px] font-bold tracking-[-.01em]">
              See my personalized action plan
            </div>
            <div className="mt-1 text-sm text-[#b9c8da]">
              One-time payment · Secure Stripe checkout · Instant access
            </div>
            <div className="mt-4 text-[11.5px] leading-relaxed text-[#8fa3ba]">
              Delivered instantly after secure payment. Download as a professional PDF and access
              it anytime from your dashboard. Your original PDF is never modified — Credit Clarity
              analyzes a secure copy.
            </div>
          </div>

          {/* Objections get answered immediately above the button, where the
              hesitation actually happens. */}
          <div className="flex w-[370px] flex-none flex-col gap-3 max-sm:w-full">
            <div className="rounded-[14px] bg-white/[.07] p-4">
              <div className="mb-2.5 flex items-center gap-2 text-[13px] font-bold">
                <LockIcon /> Your report stays private
              </div>
              <ul className="flex flex-col gap-1.5 text-[12.5px] text-[#d6e1ee]">
                {[
                  "No SSN required",
                  "No credit pull",
                  "Delete anytime",
                  "Secure Stripe checkout",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span aria-hidden className="text-[var(--mint-light)]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={`/checkout?reportId=${report.id}`}
              className="group relative isolate overflow-hidden whitespace-nowrap rounded-full bg-teal px-6 py-[15px] text-center text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(14,159,119,.4)] transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-sm:whitespace-normal"
            >
              <span
                aria-hidden
                className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-active:opacity-100 motion-reduce:transition-none"
                style={{ backgroundImage: "var(--grad-teal)" }}
              />
              Unlock My Personalized Credit Plan — $5
            </Link>
            <div className="text-center text-[11.5px] text-[#8fa3ba]">
              No subscription required.
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[12px] text-[#8fa3ba]">
          Future uploads will let you compare progress over time.
        </div>
      </div>
    </div>
  );
}
