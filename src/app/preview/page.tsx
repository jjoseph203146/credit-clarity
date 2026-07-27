"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import {
  bureauLabel,
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
  const toneDot: Record<string, string> = { good: "🟢", warn: "🟡", bad: "🔴", neutral: "⚪" };

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
        </div>
        <h1 className="mb-7 text-[32px] tracking-[-.025em]">Here&apos;s your credit snapshot</h1>

        {/* Step tracker: frames the preview as a finished analysis waiting to be revealed. */}
        <div className="mb-6 flex items-center gap-2 text-[12.5px] font-semibold text-muted">
          <span className="flex items-center gap-1.5 text-teal-deep">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-deep text-[9px] text-white">✓</span>
            Analyzing report
          </span>
          <span className="h-px w-6 bg-border" />
          <span className="flex items-center gap-1.5 text-teal-deep">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-deep text-[9px] text-white">✓</span>
            Preview complete
          </span>
          <span className="h-px w-6 bg-border" />
          <span className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-[9px]">3</span>
            Full analysis ready
          </span>
          <span className="h-px w-6 bg-border" />
          <span className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-border text-[9px]">4</span>
            Unlock to continue
          </span>
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
                : "✓ No late payments detected"}
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
          <div className="flex flex-col gap-2">
            {factors.length > 0 ? (
              factors.map((f) => (
                <div key={f.title} className="flex items-start gap-2.5 text-[13.5px]">
                  <span className="mt-[1px]">{toneDot[f.tone]}</span>
                  <span>{f.narrative}</span>
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
              🔒 {recommendationsCount} personalized recommendation
              {recommendationsCount === 1 ? "" : "s"} ready
            </div>
          </div>
        </div>

        {collectionCount > 0 || accounts.length > 0 ? (
          <div className="mb-9 rounded-2xl border border-border bg-white p-[22px] px-6">
            <div className="mb-2 text-[13px] font-bold text-muted">
              Clarity AI recommendation preview
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm">🔒</span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-teal-deep">
                  Priority #1
                </div>
                <div className="mt-0.5 text-[15px] font-bold">
                  {collectionCount > 0
                    ? "Address your highest-impact collection account"
                    : "Reduce revolving credit utilization"}
                </div>
                <div className="mt-1 text-[13.5px] leading-relaxed text-muted">
                  We&apos;ve already identified the account that could have the biggest impact on
                  your credit profile. Unlock to see which account and why.
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <h2 className="mb-4 text-xl tracking-[-.015em]">Your full analysis is ready</h2>
        <div className="mb-7 grid grid-cols-3 gap-3.5 max-md:grid-cols-1">
          {lockedCards.map((l) => (
            <div
              key={l.t}
              className="relative overflow-hidden rounded-2xl border border-border bg-white p-5"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm">🔒</span>
                <span className="text-[15px] font-bold">{l.t}</span>
              </div>
              <div className="text-[13.5px] leading-relaxed text-muted">{l.d}</div>
              <div className="mt-3 h-2 w-4/5 rounded-full bg-[linear-gradient(90deg,#eef2f7,#e4e9f0)]" />
              <div className="mt-1.5 h-2 w-[55%] rounded-full bg-[linear-gradient(90deg,#eef2f7,#e4e9f0)]" />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[18px] bg-[linear-gradient(135deg,#0b1f3a,#134066)] px-8 py-7 text-white">
          <div>
            <div className="text-[19px] font-bold tracking-[-.01em]">
              See my personalized action plan
            </div>
            <div className="mt-1 text-sm text-[#b9c8da]">
              One-time payment · Secure Stripe checkout · Instant access
            </div>
          </div>
          <div className="flex flex-none flex-col items-center gap-2">
            <Link
              href={`/checkout?reportId=${report.id}`}
              className="rounded-xl bg-teal px-[26px] py-[15px] text-base font-semibold text-white shadow-[0_8px_24px_rgba(14,159,119,.4)] transition-colors hover:bg-[#0b8663]"
            >
              Unlock My Complete Credit Roadmap — $5
            </Link>
            <div className="max-w-[280px] text-center text-[11.5px] leading-snug text-[#8fa3ba]">
              Secure one-time payment through Stripe. No subscription required. Your report
              remains private and can be deleted at any time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
