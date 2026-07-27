"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { ActionPlanTask } from "@/lib/supabase/types";

// Toggles `done` on a single task inside an `action_plans.tasks` jsonb array
// and persists the whole array back. RLS ("action_plans owner") scopes this
// update to the signed-in user's own row.
export async function toggleActionPlanTask(planId: string, taskIndex: number) {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: plan, error: fetchError } = await supabase
    .from("action_plans")
    .select("tasks")
    .eq("id", planId)
    .single();

  if (fetchError || !plan) {
    return { error: fetchError?.message ?? "Action plan not found" };
  }

  const tasks = [...(plan.tasks as ActionPlanTask[])];
  if (!tasks[taskIndex]) return { error: "Task not found" };

  tasks[taskIndex] = { ...tasks[taskIndex], done: !tasks[taskIndex].done };

  const { error: updateError } = await supabase
    .from("action_plans")
    .update({ tasks, updated_at: new Date().toISOString() })
    .eq("id", planId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/plan");
  return { error: null };
}
