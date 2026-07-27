import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ReportAccount } from "@/lib/supabase/types";
import { GoalsSimulator } from "@/components/app/goals-simulator";
import type { Challenge, Goal, Timeline } from "@/lib/supabase/types";

const GOAL_LABELS: Record<Goal, string> = {
  build_credit: "Build Credit",
  recover_mistakes: "Recover From Mistakes",
  pay_down_debt: "Pay Down Debt",
  major_purchase: "Make a Major Purchase",
  understand_finances: "Understand My Finances",
};

const TIMELINE_LABELS: Record<Timeline, string> = {
  "30_days": "30 days",
  "90_days": "90 days",
  "6_months": "6 months",
  long_term: "Long term",
};

const CHALLENGE_LABELS: Record<Challenge, string> = {
  debt: "Debt",
  missed_payments: "Missed payments",
  collections: "Collections",
  low_score: "Low score",
  lack_of_understanding: "Understanding credit",
};

export default async function GoalsPage() {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: latestReport }] = await Promise.all([
    supabase.from("users").select("goal, timeline, challenge").eq("id", user.id).maybeSingle(),
    supabase
      .from("reports")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const currentGoal = {
    goalLabel: profile?.goal ? GOAL_LABELS[profile.goal] : null,
    timelineLabel: profile?.timeline ? TIMELINE_LABELS[profile.timeline] : null,
    challengeLabel: profile?.challenge ? CHALLENGE_LABELS[profile.challenge] : null,
  };

  let revolvingAccounts: { name: string; balance: number; creditLimit: number }[] = [];
  let readiness: {
    utilization: number | null;
    hasCollections: boolean;
    hasLatePayment: boolean;
    oldestAccountYears: number | null;
  } | null = null;

  if (latestReport) {
    const [{ data: accounts }, { data: collections }] = await Promise.all([
      supabase
        .from("report_accounts")
        .select("*")
        .eq("report_id", latestReport.id)
        .returns<ReportAccount[]>(),
      supabase.from("report_collections").select("id").eq("report_id", latestReport.id),
    ]);

    const revolving = (accounts ?? []).filter(
      (a) => (a.type === "credit_card" || a.type === "retail_card") && a.balance != null && a.credit_limit != null && a.credit_limit > 0,
    );
    revolvingAccounts = revolving
      .sort((a, b) => (b.utilization ?? 0) - (a.utilization ?? 0))
      .map((a) => ({ name: a.name, balance: a.balance!, creditLimit: a.credit_limit! }));

    const totalBalance = revolving.reduce((s, a) => s + (a.balance ?? 0), 0);
    const totalLimit = revolving.reduce((s, a) => s + (a.credit_limit ?? 0), 0);
    const oldest = [...(accounts ?? [])]
      .filter((a) => a.opened_date)
      .sort((a, b) => new Date(a.opened_date!).getTime() - new Date(b.opened_date!).getTime())[0];

    readiness = {
      utilization: totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : null,
      hasCollections: (collections?.length ?? 0) > 0,
      hasLatePayment: (accounts ?? []).some((a) => a.payment_history && /late/i.test(a.payment_history)),
      oldestAccountYears: oldest
        ? Math.max(0, (Date.now() - new Date(oldest.opened_date!).getTime()) / (365.25 * 24 * 3600 * 1000))
        : null,
    };
  }

  return (
    <GoalsSimulator currentGoal={currentGoal} revolvingAccounts={revolvingAccounts} readiness={readiness} />
  );
}
