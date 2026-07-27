import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
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

  const { data: profile } = await supabase
    .from("users")
    .select("goal, timeline, challenge")
    .eq("id", user.id)
    .maybeSingle();

  const currentGoal = {
    goalLabel: profile?.goal ? GOAL_LABELS[profile.goal] : null,
    timelineLabel: profile?.timeline ? TIMELINE_LABELS[profile.timeline] : null,
    challengeLabel: profile?.challenge ? CHALLENGE_LABELS[profile.challenge] : null,
  };

  return <GoalsSimulator currentGoal={currentGoal} />;
}
