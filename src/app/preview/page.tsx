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

const toneClasses: Record<string, string> = {
  bad: "bg-[#fbecec] text-[#a33232]",
  warn: "bg-[#fdf3e7] text-[#9a6314]",
  good: "bg-[#e6f5ef] text-teal-deep",
};

const lockedCards = [
  {
    t: "Full Account Analysis",
    d: "Every account explained with a specific recommendation.",
  },
  {
    t: "Personalized Improvement Plan",
    d: "Your 90-day roadmap, sequenced by impact.",
  },
  { t: "Debt Strategy", d: "What to pay first, and exactly why." },
  { t: "Dispute Guidance", d: "3 possible errors found on your report." },
  {
    t: "Communication Scripts",
    d: "Letters and scripts written for your accounts.",
  },
];

function scoreTier(score: number | null): { label: string; className: string } {
  if (score == null) return { label: "Not yet found", className: "text-muted" };
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
  const tier = scoreTier(score);

  const openAccounts = accounts.filter((a) => a.status === "open").length;
  const collectionCount = collections.length;

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

  const reportMeta = [
    bureauLabel(report.bureau) === "Unknown bureau" ? "Credit report" : `${bureauLabel(report.bureau)} report`,
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

        <div className="mb-4 grid grid-cols-4 gap-3.5 max-md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-[22px]">
            <div className="text-[12.5px] font-medium text-muted">Credit Score</div>
            <div className={`mt-1.5 text-[40px] font-semibold ${MONO}`}>
              {score ?? "—"}
            </div>
            <div className={`mt-0.5 text-[12.5px] font-semibold ${tier.className}`}>
              {tier.label}
            </div>
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
              {lateAccounts > 0 ? "Needs Attention" : "Looks Good"}
            </div>
            <div className="mt-0.5 text-[12.5px] text-muted">
              {lateAccounts > 0
                ? `${lateAccounts} late payment${lateAccounts > 1 ? "s" : ""} found`
                : "No late payments found"}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-[22px]">
            <div className="text-[12.5px] font-medium text-muted">Utilization</div>
            <div className={`mt-3 text-[19px] font-bold ${utilizationLabelClass[uTone]}`}>
              {utilization != null
                ? `${uTone === "bad" ? "High — " : uTone === "warn" ? "Moderate — " : ""}${utilization}%`
                : "—"}
            </div>
            <div className="mt-0.5 text-[12.5px] text-muted">Goal: below 30%</div>
          </div>
        </div>

        <div className="mb-9 rounded-2xl border border-border bg-white p-[22px] px-6">
          <div className="mb-3 text-[15px] font-bold">
            Major factors affecting your score
          </div>
          <div className="flex flex-wrap gap-2.5">
            {factors.length > 0 ? (
              factors.map((f) => (
                <span
                  key={f.title}
                  className={`rounded-full px-3.5 py-[7px] text-sm font-semibold ${
                    toneClasses[f.positive ? "good" : "bad"]
                  }`}
                >
                  {f.title}
                </span>
              ))
            ) : (
              <span className="text-[13.5px] text-muted">
                We didn&apos;t find enough detail in your report to list factors yet.
              </span>
            )}
          </div>
        </div>

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
              Unlock your full analysis, roadmap &amp; scripts
            </div>
            <div className="mt-1 text-sm text-[#b9c8da]">
              One-time payment · Secure Stripe checkout · Instant access
            </div>
          </div>
          <Link
            href={`/checkout?reportId=${report.id}`}
            className="flex-none rounded-xl bg-teal px-[26px] py-[15px] text-base font-semibold text-white shadow-[0_8px_24px_rgba(14,159,119,.4)] transition-colors hover:bg-[#0b8663]"
          >
            Unlock Full Analysis — $5
          </Link>
        </div>
      </div>
    </div>
  );
}
