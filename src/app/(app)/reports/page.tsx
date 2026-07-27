import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  bureauGradient,
  bureauLabel,
  bureauShort,
  formatDate,
  statusLabel,
} from "@/lib/report-derivations";
import type { Report } from "@/lib/supabase/types";

const mono = "font-[family-name:var(--font-jetbrains-mono)]";

export default async function ReportsPage() {
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
    .returns<Report[]>();

  return (
    <div className="max-w-[980px] px-9 pb-[72px] pt-7">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="m-0 mb-1 text-2xl tracking-[-0.02em]">My Reports</h1>
          <div className="text-[13px] text-[var(--muted)]">
            Upload a new report every 90 days to track progress
          </div>
        </div>
        <Link
          href="/upload"
          className="rounded-[10px] bg-[var(--navy)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#123152]"
        >
          + Upload Report
        </Link>
      </div>

      {(!reports || reports.length === 0) && (
        <div className="flex flex-col items-start gap-4 rounded-[18px] border border-[var(--border)] bg-white p-8">
          <div className="text-lg font-bold">No reports yet</div>
          <div className="max-w-[480px] text-[13.5px] leading-[1.6] text-[var(--muted)]">
            Upload your first credit report to see it analyzed here.
          </div>
          <Link
            href="/upload"
            className="rounded-[10px] bg-[var(--navy)] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#123152]"
          >
            Upload a report
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {reports?.map((r, i) => {
          const older = reports[i + 1];
          const change =
            older?.credit_score != null && r.credit_score != null
              ? r.credit_score - older.credit_score
              : null;
          return (
            <div
              key={r.id}
              className="grid grid-cols-[44px_1.3fr_.8fr_.8fr_.9fr_auto] items-center gap-4 rounded-2xl border border-[var(--border)] bg-white px-6 py-5"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-[10px] font-bold tracking-[0.02em] text-white"
                style={{ background: bureauGradient(r.bureau) }}
              >
                {bureauShort(r.bureau)}
              </div>
              <div>
                <div className="text-[14.5px] font-bold">{formatDate(r.report_date)}</div>
                <div className="text-xs text-[#8fa3ba]">
                  {bureauLabel(r.bureau)}
                  {i === 0 ? " · current" : i === reports.length - 1 ? " · first report" : ""}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#8fa3ba]">SCORE</div>
                <div className={cn(mono, "mt-0.5 text-[17px] font-semibold")}>
                  {r.credit_score ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#8fa3ba]">CHANGE</div>
                <div
                  className={cn(
                    mono,
                    "mt-0.5 text-sm font-semibold",
                    change != null && change > 0 ? "text-[var(--teal-deep)]" : "text-[#8fa3ba]",
                  )}
                >
                  {change != null ? `${change >= 0 ? "+" : ""}${change}` : "—"}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-[#8fa3ba]">STATUS</div>
                <div className="mt-0.5 text-[12.5px] font-semibold text-[var(--teal-deep)]">
                  {statusLabel(r.status)}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/reports/${r.id}`}
                  className="rounded-[9px] border-[1.5px] border-[#dbe3ec] bg-white px-[13px] py-2 text-[12.5px] font-semibold hover:border-[var(--navy)]"
                >
                  Open
                </Link>
                <Link
                  href="/reports/compare"
                  className="rounded-[9px] border-[1.5px] border-[#dbe3ec] bg-white px-[13px] py-2 text-[12.5px] font-semibold hover:border-[var(--navy)]"
                >
                  Compare
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
