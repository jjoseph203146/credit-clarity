import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScoreGauge } from "@/components/ui/score-gauge";
import { DashboardTodayTasks, type DisplayTask } from "@/components/app/dashboard-today-tasks";
import { ReportAnalysisPoller } from "@/components/app/report-analysis-poller";
import {
  bureauLabel,
  formatDate,
  overallUtilization,
  type Tone,
} from "@/lib/report-derivations";
import type { ActionPlan, ActionPlanTask, Report, ReportAccount } from "@/lib/supabase/types";

const mono = "font-[family-name:var(--font-jetbrains-mono)]";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: reports }] = await Promise.all([
    supabase
      .from("users")
      .select("full_name, email")
      .eq("id", user.id)
      .returns<{ full_name: string | null; email: string }[]>()
      .maybeSingle(),
    supabase
      .from("reports")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("report_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .returns<Report[]>(),
  ]);

  const greetingName = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";

  if (!reports || reports.length === 0) {
    return (
      <div className="max-w-[1080px] px-9 pb-[72px] pt-7">
        <h1 className="m-0 mb-1 text-2xl tracking-[-0.02em]">Good morning, {greetingName}</h1>
        <div className="mb-8 text-[13px] text-[var(--muted)]">
          You haven&apos;t uploaded a credit report yet.
        </div>
        <div className="flex flex-col items-start gap-4 rounded-[18px] border border-[var(--border)] bg-white p-8">
          <div className="text-lg font-bold">Upload your first report to get started</div>
          <div className="max-w-[480px] text-[13.5px] leading-[1.6] text-[var(--muted)]">
            Once you upload a credit report, Clarity AI will parse your accounts, collections, and
            inquiries and build your dashboard automatically.
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

  const latest = reports[0];
  const previous = reports[1] ?? null;
  const oldest = reports[reports.length - 1];

  const [{ data: accounts }, { data: actionPlan }] = await Promise.all([
    supabase.from("report_accounts").select("*").eq("report_id", latest.id).returns<ReportAccount[]>(),
    supabase
      .from("action_plans")
      .select("*")
      .eq("report_id", latest.id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .returns<ActionPlan[]>()
      .maybeSingle(),
  ]);

  const util = overallUtilization(accounts ?? []);
  const scoreDelta =
    previous?.credit_score != null && latest.credit_score != null
      ? latest.credit_score - previous.credit_score
      : null;
  const scoreTrend =
    oldest?.credit_score != null && latest.credit_score != null && oldest.id !== latest.id
      ? latest.credit_score - oldest.credit_score
      : null;

  const tasks: ActionPlanTask[] = actionPlan?.tasks ?? [];
  const planDone = tasks.filter((t) => t.done).length;
  const planTotal = tasks.length;
  const displayTasks: DisplayTask[] = tasks
    .map((t, index) => ({ ...t, index }))
    .filter((t) => !t.done)
    .slice(0, 3);
  const shownTasks = displayTasks.length > 0 ? displayTasks : tasks.map((t, index) => ({ ...t, index })).slice(0, 3);

  const nextUpload = latest.report_date
    ? formatDate(
        new Date(new Date(latest.report_date).getTime() + 90 * 24 * 3600 * 1000).toISOString(),
        { month: "short", day: "numeric" },
      )
    : "—";

  const isAnalyzing = latest.status !== "analyzed" && latest.status !== "error";

  const clarityNote = isAnalyzing
    ? "Clarity AI is analyzing your report…"
    : util != null && util > 30
      ? `Focus on utilization${(accounts ?? []).some((a) => a.type === "collection") ? " and your collection account" : ""}.`
      : "Your profile is trending well — keep it up.";

  return (
    <div className="max-w-[1080px] px-9 pb-[72px] pt-7">
      {isAnalyzing && <ReportAnalysisPoller reportId={latest.id} />}
      <div className="mb-[22px] flex items-end justify-between">
        <div>
          <h1 className="m-0 mb-1 font-display text-[38px] font-normal leading-[1.08] tracking-[-0.02em] text-[var(--navy)]">
            Hello, {greetingName}
          </h1>
          <div className="text-[13px] text-[var(--muted)]">
            {isAnalyzing ? (
              <>
                Your {reports.length === 1 ? "first " : ""}report is currently being analyzed.
                This usually takes less than one minute.
              </>
            ) : (
              <>
                {bureauLabel(latest.bureau)} · {formatDate(latest.report_date)} ·{" "}
                <span className="font-semibold text-[var(--teal)]">next upload {nextUpload}</span>
              </>
            )}
          </div>
        </div>
        <Link
          href="/reports"
          className="rounded-[10px] border-[1.5px] border-[#dbe3ec] bg-white px-4 py-2.5 text-[13px] font-semibold hover:border-[var(--navy)]"
        >
          My Reports
        </Link>
      </div>

      {isAnalyzing && (
        <div className="mb-3.5 rounded-[18px] border border-[#c9e9dc] bg-[#f2faf6] p-5">
          <div className="mb-2 text-[15px] font-bold text-[var(--teal-deep)]">
            🎉 Your report is being prepared
          </div>
          <div className="mb-1 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px] text-[var(--ink)]">
            <span>✅ Accounts</span>
            <span>✅ Collections</span>
            <span>🔄 Recommendations</span>
            <span>🔄 90-day roadmap</span>
          </div>
          <div className="text-[12.5px] text-[var(--muted)]">
            Estimated completion: under a minute — this page will update automatically.
          </div>
        </div>
      )}

      <div className="mb-3.5 grid grid-cols-[360px_1fr] gap-3.5 max-lg:grid-cols-1">
        <div className="rounded-[18px] border border-[var(--border)] bg-white p-6 shadow-[0_1px_2px_rgba(11,31,58,.04),0_12px_28px_-14px_rgba(11,31,58,.14)]">
          {isAnalyzing ? (
            <div className="flex h-[186px] flex-col items-center justify-center gap-2">
              <span className="text-[13px] font-semibold text-[var(--muted)]">
                Calculating your score…
              </span>
              <span className="h-1.5 w-14 animate-pulse rounded-full bg-teal" />
            </div>
          ) : (
            <ScoreGauge
              score={latest.credit_score}
              // Sweep from the previous report's score when we have one, so
              // the animation shows the actual change rather than 300-up.
              from={
                scoreDelta != null && latest.credit_score != null
                  ? latest.credit_score - scoreDelta
                  : undefined
              }
              label={bureauLabel(latest.bureau)}
              delta={scoreDelta}
              size={288}
              className="mx-auto"
            />
          )}
          <div className="mt-4 border-t border-[#eef2f7] pt-3.5">
            <div className="mb-1 text-[11px] font-bold tracking-[0.08em] text-[var(--teal-deep)]">
              CLARITY SCORE {latest.clarity_score ?? "—"}/100
            </div>
            <div className="text-[13px] leading-[1.6] text-[var(--muted)]">{clarityNote}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          <div className="rounded-[18px] border border-[var(--border)] bg-white p-5">
            <div className="text-xs text-[var(--muted)]">Card Utilization</div>
            {isAnalyzing ? (
              <div className="mt-2 text-[14px] font-semibold text-[var(--muted)]">
                Analyzing revolving accounts…
              </div>
            ) : (
              <div
                className={cn(
                  mono,
                  "mt-2 text-[34px] font-semibold",
                  util != null && util > 30 ? "text-[#c23e3e]" : "text-[var(--teal-deep)]",
                )}
              >
                {util != null ? `${util}%` : "—"}
              </div>
            )}
            <div className="mt-0.5 text-xs text-[var(--muted)]">of your total limits</div>
          </div>
          <Link
            href="/plan"
            className="rounded-[18px] border border-[var(--border)] bg-white p-5 hover:border-[var(--teal)]"
          >
            <div className="text-xs text-[var(--muted)]">Plan Progress</div>
            {isAnalyzing ? (
              <div className="mt-2 text-[14px] font-semibold text-[var(--muted)]">
                Building your plan…
              </div>
            ) : (
              <div className={cn(mono, "mt-2 text-[34px] font-semibold")}>
                {planDone}
                <span className="text-[17px] text-[#8fa3ba]">/{planTotal}</span>
              </div>
            )}
            <div className="mt-0.5 text-xs font-semibold text-[var(--teal)]">Open planner →</div>
          </Link>
          <div className="rounded-[18px] border border-[var(--border)] bg-white p-5">
            <div className="text-xs text-[var(--muted)]">Score Trend</div>
            {isAnalyzing ? (
              <div className="mt-2 text-[14px] font-semibold text-[var(--muted)]">
                Available after your first completed analysis
              </div>
            ) : (
              <div className={cn(mono, "mt-2 text-[34px] font-semibold text-[var(--teal-deep)]")}>
                {scoreTrend != null ? `${scoreTrend >= 0 ? "+" : ""}${scoreTrend}` : "—"}
              </div>
            )}
            <div className="mt-0.5 text-xs text-[var(--muted)]">
              {oldest ? `since ${formatDate(oldest.report_date, { month: "long" })}` : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        <div className="rounded-[18px] border border-[var(--border)] bg-white p-[22px]">
          <div className="mb-3.5 flex items-baseline justify-between">
            <span className="text-base font-bold">Today&apos;s actions</span>
            <Link href="/plan" className="text-[12.5px] font-semibold text-[var(--teal)]">
              Full plan →
            </Link>
          </div>
          <DashboardTodayTasks
            actionPlanId={actionPlan?.id ?? null}
            initialTasks={shownTasks}
            emptyMessage={
              isAnalyzing
                ? "Building your personalized action plan…"
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
