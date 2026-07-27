import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDate, formatPercent, overallUtilization } from "@/lib/report-derivations";
import type { Report, ReportAccount } from "@/lib/supabase/types";

const mono = "font-[family-name:var(--font-jetbrains-mono)]";

type CompareRow = {
  metric: string;
  before: string;
  after: string;
  pill: string;
  pillTone: "good" | "neutral" | "warn";
};

export default async function ReportComparePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("report_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(2)
    .returns<Report[]>();

  if (!reports || reports.length < 2) {
    return (
      <div className="max-w-[980px] px-9 pb-[72px] pt-7">
        <Link href="/reports" className="mb-3 inline-block text-[13px] font-semibold text-[var(--teal)]">
          ← My Reports
        </Link>
        <h1 className="m-0 mb-1 text-2xl tracking-[-0.02em]">Compare reports</h1>
        <div className="mb-[22px] text-[13px] text-[var(--muted)]">
          You need at least two reports to compare progress over time.
        </div>
        <div className="flex flex-col items-start gap-4 rounded-[18px] border border-[var(--border)] bg-white p-8">
          <div className="text-lg font-bold">Upload another report to compare</div>
          <div className="max-w-[480px] text-[13.5px] leading-[1.6] text-[var(--muted)]">
            Once you have two or more reports, Clarity AI will show what changed between them.
          </div>
          <Link
            href="/upload"
            className="rounded-[10px] bg-[var(--navy)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#123152]"
          >
            Upload a report
          </Link>
        </div>
      </div>
    );
  }

  const [newer, older] = reports;

  const [
    { data: newerAccounts },
    { data: olderAccounts },
    { count: newerCollections },
    { count: olderCollections },
    { count: newerInquiries },
    { count: olderInquiries },
  ] = await Promise.all([
    supabase.from("report_accounts").select("*").eq("report_id", newer.id).returns<ReportAccount[]>(),
    supabase.from("report_accounts").select("*").eq("report_id", older.id).returns<ReportAccount[]>(),
    supabase.from("report_collections").select("*", { count: "exact", head: true }).eq("report_id", newer.id),
    supabase.from("report_collections").select("*", { count: "exact", head: true }).eq("report_id", older.id),
    supabase.from("report_inquiries").select("*", { count: "exact", head: true }).eq("report_id", newer.id),
    supabase.from("report_inquiries").select("*", { count: "exact", head: true }).eq("report_id", older.id),
  ]);

  const newerUtil = overallUtilization(newerAccounts ?? []);
  const olderUtil = overallUtilization(olderAccounts ?? []);

  const rows: CompareRow[] = [];

  if (newer.credit_score != null && older.credit_score != null) {
    const delta = newer.credit_score - older.credit_score;
    rows.push({
      metric: "Credit score",
      before: String(older.credit_score),
      after: String(newer.credit_score),
      pill: delta > 0 ? "▲ IMPROVED" : delta < 0 ? "▼ DECLINED" : "UNCHANGED",
      pillTone: delta > 0 ? "good" : delta < 0 ? "warn" : "neutral",
    });
  }

  if (newerUtil != null && olderUtil != null) {
    const delta = newerUtil - olderUtil;
    rows.push({
      metric: "Card utilization",
      before: formatPercent(olderUtil),
      after: formatPercent(newerUtil),
      pill: delta < 0 ? "▲ IMPROVED" : delta > 0 ? "▼ WORSE" : "UNCHANGED",
      pillTone: delta < 0 ? "good" : delta > 0 ? "warn" : "neutral",
    });
  }

  const newerCollectionsCount = newerCollections ?? 0;
  const olderCollectionsCount = olderCollections ?? 0;
  rows.push({
    metric: "Collections",
    before: String(olderCollectionsCount),
    after: String(newerCollectionsCount),
    pill:
      newerCollectionsCount < olderCollectionsCount
        ? "▲ IMPROVED"
        : newerCollectionsCount > olderCollectionsCount
          ? "▼ WORSE"
          : "UNCHANGED",
    pillTone:
      newerCollectionsCount < olderCollectionsCount
        ? "good"
        : newerCollectionsCount > olderCollectionsCount
          ? "warn"
          : "neutral",
  });

  const newerInquiriesCount = newerInquiries ?? 0;
  const olderInquiriesCount = olderInquiries ?? 0;
  rows.push({
    metric: "Hard inquiries",
    before: String(olderInquiriesCount),
    after: String(newerInquiriesCount),
    pill: newerInquiriesCount === olderInquiriesCount ? "UNCHANGED" : "CHANGED",
    pillTone: newerInquiriesCount === olderInquiriesCount ? "neutral" : "warn",
  });

  const scoreDelta =
    newer.credit_score != null && older.credit_score != null ? newer.credit_score - older.credit_score : null;
  const utilDelta = newerUtil != null && olderUtil != null ? newerUtil - olderUtil : null;
  const compareNote =
    scoreDelta != null && scoreDelta > 0
      ? `Your score moved ${scoreDelta >= 0 ? "+" : ""}${scoreDelta} points${
          utilDelta != null && utilDelta < 0 ? ", driven largely by lower card utilization" : ""
        }. Keep up the same pattern for your next comparison.`
      : "Keep tracking your accounts — your next report will show what's changed.";

  const beforeLabel = formatDate(older.report_date, { month: "short" }).toUpperCase();
  const afterLabel = formatDate(newer.report_date, { month: "short" }).toUpperCase();

  return (
    <div className="max-w-[980px] px-9 pb-[72px] pt-7">
      <Link href="/reports" className="mb-3 inline-block text-[13px] font-semibold text-[var(--teal)]">
        ← My Reports
      </Link>
      <h1 className="m-0 mb-1 text-2xl tracking-[-0.02em]">
        {formatDate(older.report_date, { month: "long", year: "numeric" })} vs.{" "}
        {formatDate(newer.report_date, { month: "long", year: "numeric" })}
      </h1>
      <div className="mb-[22px] text-[13px] text-[var(--muted)]">
        What changed between your last two reports.
      </div>

      <div className="flex flex-col gap-2.5">
        {rows.map((c, i) => (
          <div
            key={i}
            className="grid grid-cols-[1.2fr_1fr_40px_1fr_.9fr] items-center gap-3.5 rounded-[14px] border border-[var(--border)] bg-white px-6 py-[18px]"
          >
            <div className="text-sm font-bold">{c.metric}</div>
            <div className="text-center">
              <div className="text-[10.5px] font-semibold text-[#8fa3ba]">{beforeLabel}</div>
              <div className={cn(mono, "mt-0.5 text-base font-semibold")}>{c.before}</div>
            </div>
            <div className="text-center text-[#8fa3ba]">→</div>
            <div className="text-center">
              <div className="text-[10.5px] font-semibold text-[#8fa3ba]">{afterLabel}</div>
              <div className={cn(mono, "mt-0.5 text-base font-semibold")}>{c.after}</div>
            </div>
            <div className="text-right">
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-bold",
                  c.pillTone === "good" && "bg-[#e6f5ef] text-[var(--teal-deep)]",
                  c.pillTone === "neutral" && "bg-[#eef2f7] text-[var(--muted)]",
                  c.pillTone === "warn" && "bg-[#fdf3e7] text-[#9a6314]",
                )}
              >
                {c.pill}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[14px] bg-[#e6f5ef] px-[22px] py-[18px] text-sm leading-[1.65] text-[#22354d]">
        <strong>Clarity AI:</strong> {compareNote}
      </div>
    </div>
  );
}
