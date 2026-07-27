import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScoreRing } from "@/components/app/score-ring";
import { DashboardTodayTasks, type DisplayTask } from "@/components/app/dashboard-today-tasks";
import { ReportAnalysisPoller } from "@/components/app/report-analysis-poller";
import {
  bureauLabel,
  formatDate,
  overallUtilization,
  type Tone,
} from "@/lib/report-derivations";
import type { ActionPlan, ActionPlanTask, Notification, Report, ReportAccount } from "@/lib/supabase/types";

const mono = "font-[family-name:var(--font-jetbrains-mono)]";

function notificationTone(kind: string | null): Tone {
  if (kind === "deadline" || kind === "reupload_window") return "good";
  if (kind === "task_overdue" || kind === "payment") return "warn";
  return "neutral";
}

function notificationIcon(kind: string | null) {
  if (kind === "deadline") return "✉";
  if (kind === "task_overdue") return "!";
  if (kind === "reupload_window") return "↻";
  if (kind === "payment") return "$";
  return "•";
}

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

  const [{ data: accounts }, { data: actionPlan }, { data: notifications }] = await Promise.all([
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
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<Notification[]>(),
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
          <h1 className="m-0 mb-1 text-2xl tracking-[-0.02em]">Good morning, {greetingName}</h1>
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

      <div className="mb-3.5 grid grid-cols-[360px_1fr] gap-3.5">
        <div className="flex items-center gap-5 rounded-[18px] bg-gradient-to-br from-[var(--navy)] to-[#134066] p-6 text-white">
          {isAnalyzing ? (
            <div className="flex h-[116px] w-[116px] flex-none flex-col items-center justify-center gap-2 rounded-full border-4 border-white/10">
              <span className="text-[12px] font-semibold text-[#d6e1ee]">Calculating…</span>
              <span className="h-1.5 w-14 animate-pulse rounded-full bg-mint" />
            </div>
          ) : (
            <ScoreRing score={latest.clarity_score ?? 0} max={100} />
          )}
          <div>
            <div className="mb-[5px] text-[11px] font-bold tracking-[0.08em] text-[var(--mint-light)]">
              CLARITY SCORE
            </div>
            <div className="text-[13.5px] leading-[1.5] text-[#d6e1ee]">{clarityNote}</div>
            <div className="mt-2 flex gap-3 text-[12.5px]">
              <span className="text-[#8fa3ba]">{bureauLabel(latest.bureau)}</span>
              <span className={cn(mono, "font-semibold")}>{latest.credit_score ?? "—"}</span>
              {scoreDelta != null && (
                <span className="font-semibold text-[var(--mint-light)]">
                  {scoreDelta >= 0 ? "▲" : "▼"} {scoreDelta >= 0 ? "+" : ""}
                  {scoreDelta}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          <Link
            href="/goals"
            className="rounded-[18px] border border-[var(--border)] bg-white p-5 hover:border-[var(--teal)]"
          >
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
            <div className="mt-0.5 text-xs font-semibold text-[var(--teal)]">
              Simulate a payment →
            </div>
          </Link>
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
          <Link
            href="/progress"
            className="rounded-[18px] border border-[var(--border)] bg-white p-5 hover:border-[var(--teal)]"
          >
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
            <div className="mt-0.5 text-xs font-semibold text-[var(--teal)]">
              {oldest ? `since ${formatDate(oldest.report_date, { month: "long" })}` : "—"} →
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-[1.15fr_.85fr] gap-3.5">
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

        <div className="rounded-[18px] border border-[var(--border)] bg-white p-[22px]">
          <div className="mb-3.5 flex items-baseline justify-between">
            <span className="text-base font-bold">Notifications</span>
            <Link href="/notifications" className="text-[12.5px] font-semibold text-[var(--teal)]">
              All →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {(!notifications || notifications.length === 0) && (
              <div className="text-[13px] text-[var(--muted)]">You&apos;re all caught up.</div>
            )}
            {notifications?.map((n) => {
              const tone = notificationTone(n.kind);
              return (
                <div key={n.id} className="flex gap-[11px]">
                  <div
                    className={cn(
                      "flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[10px] text-[13px]",
                      tone === "good" && "bg-[#e6f5ef] text-[var(--teal-deep)]",
                      tone === "warn" && "bg-[#fdf3e7] text-[#9a6314]",
                      tone === "neutral" && "bg-[#eef2f7] text-[#3d5068]",
                    )}
                  >
                    {notificationIcon(n.kind)}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold">{n.title}</div>
                    {n.body && <div className="text-[11.5px] text-[#8fa3ba]">{n.body}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
