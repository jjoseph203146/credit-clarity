import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { PlanBoard } from "@/components/app/plan-board";
import type { ActionPlanTask, Goal } from "@/lib/supabase/types";

const GOAL_LABELS: Record<Goal, string> = {
  build_credit: "Build Credit",
  recover_mistakes: "Recover From Mistakes",
  pay_down_debt: "Pay Down Debt",
  major_purchase: "Make a Major Purchase",
  understand_finances: "Understand My Finances",
};

export default async function PlanPage() {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Most recent report for this user, if any — used to prefer a report-scoped
  // action plan over a general one.
  const { data: latestReport } = await supabase
    .from("reports")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let plan = null as { id: string; tasks: ActionPlanTask[]; goal_snapshot: string | null } | null;

  if (latestReport) {
    const { data } = await supabase
      .from("action_plans")
      .select("id, tasks, goal_snapshot")
      .eq("user_id", user.id)
      .eq("report_id", latestReport.id)
      .maybeSingle();
    plan = data;
  }

  if (!plan) {
    // Fall back to the most recently updated action plan for this user,
    // regardless of report.
    const { data } = await supabase
      .from("action_plans")
      .select("id, tasks, goal_snapshot")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    plan = data;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("goal")
    .eq("id", user.id)
    .maybeSingle();

  const goalLabel =
    plan?.goal_snapshot ?? (profile?.goal ? GOAL_LABELS[profile.goal] : "Not set yet");

  const tasks = plan?.tasks ?? [];
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.done).length;

  return (
    <div className="max-w-[1040px] px-9 pb-[72px] pt-7">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold tracking-[-.02em]">Action Plan</h1>
          <div className="text-[13px] text-[var(--muted)]">
            {plan
              ? `${doneTasks} of ${totalTasks} done · built for your goal: `
              : "No action plan yet · goal: "}
            <strong className="text-[var(--ink)]">{goalLabel}</strong>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/goals">Change Goal</Link>
        </Button>
      </div>

      {plan ? (
        <PlanBoard planId={plan.id} tasks={tasks} />
      ) : (
        <div className="rounded-[18px] border border-dashed border-[#c7d2df] bg-white px-8 py-14 text-center">
          <div className="mb-1 text-base font-semibold">Your action plan will appear here</div>
          <div className="text-[13.5px] text-[var(--muted)]">
            Once a report has been analyzed, Clarity AI builds a 90-day plan tailored to your
            goal.
          </div>
        </div>
      )}
    </div>
  );
}
