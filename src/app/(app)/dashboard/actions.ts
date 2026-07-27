"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionPlanTask } from "@/lib/supabase/types";

/**
 * Toggles a single task's `done` flag inside an `action_plans.tasks` jsonb
 * array and persists it. RLS ("action_plans owner") already scopes updates
 * to `user_id = auth.uid()`, but we double-check the signed-in user here
 * too so a bad id just no-ops instead of throwing.
 */
export async function toggleActionPlanTask(actionPlanId: string, taskIndex: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const };

  const { data: plan, error: fetchError } = await supabase
    .from("action_plans")
    .select("tasks")
    .eq("id", actionPlanId)
    .eq("user_id", user.id)
    .returns<{ tasks: ActionPlanTask[] }[]>()
    .single();

  if (fetchError || !plan) return { ok: false as const };

  const tasks = (plan.tasks as ActionPlanTask[]) ?? [];
  if (taskIndex < 0 || taskIndex >= tasks.length) return { ok: false as const };

  const nextTasks = tasks.map((t, i) => (i === taskIndex ? { ...t, done: !t.done } : t));

  // `.update()`'s payload type collapses to `never` under the installed
  // @supabase/ssr@0.5.2 / @supabase/supabase-js@2.110.8 combination (a
  // pre-existing version-mismatch issue affecting every mutation in the
  // app, not something introduced here — see report-derivations.ts note).
  // `.returns<T>()` fixes reads; there is no equivalent for writes, so we
  // narrow the payload type explicitly instead of widening to `any`.
  const { error: updateError } = await supabase
    .from("action_plans")
    .update({ tasks: nextTasks } satisfies { tasks: ActionPlanTask[] } as never)
    .eq("id", actionPlanId)
    .eq("user_id", user.id);

  if (updateError) return { ok: false as const };

  revalidatePath("/dashboard");
  return { ok: true as const };
}
