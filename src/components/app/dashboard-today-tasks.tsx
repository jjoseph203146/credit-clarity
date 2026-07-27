"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { toggleActionPlanTask } from "@/app/(app)/dashboard/actions";
import type { ActionPlanTask } from "@/lib/supabase/types";

export interface DisplayTask extends ActionPlanTask {
  /** Index of this task inside the action plan's `tasks` array. */
  index: number;
}

/**
 * Client island for the dashboard's "Today's actions" checklist. Renders
 * the initial tasks passed down from the server component and persists
 * toggles back to `action_plans.tasks` via a Server Action.
 */
export function DashboardTodayTasks({
  actionPlanId,
  initialTasks,
  emptyMessage,
}: {
  actionPlanId: string | null;
  initialTasks: DisplayTask[];
  emptyMessage?: string;
}) {
  const [tasks, setTasks] = useState(initialTasks);
  const [, startTransition] = useTransition();

  function toggleTask(task: DisplayTask) {
    if (!actionPlanId) return;
    setTasks((prev) => prev.map((t) => (t.index === task.index ? { ...t, done: !t.done } : t)));
    startTransition(async () => {
      const result = await toggleActionPlanTask(actionPlanId, task.index);
      if (!result.ok) {
        // Revert optimistic update on failure.
        setTasks((prev) => prev.map((t) => (t.index === task.index ? { ...t, done: task.done } : t)));
      }
    });
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl bg-[#f8fafc] px-3.5 py-3 text-[13px] text-[var(--muted)]">
        {emptyMessage ??
          "No tasks yet — your action plan will appear here once your report is analyzed."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {tasks.map((t) => (
        <button
          key={t.index}
          onClick={() => toggleTask(t)}
          className="flex items-center gap-[11px] rounded-xl bg-[#f8fafc] px-3.5 py-3 text-left hover:bg-[#eef4f1]"
        >
          <span
            className={cn(
              "flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[6px] text-[10px] font-bold",
              t.done ? "bg-[var(--teal)] text-white" : "border-[1.5px] border-[#c7d2df] bg-white",
            )}
          >
            {t.done ? "✓" : ""}
          </span>
          <span className={cn("text-[13.5px] font-semibold", t.done && "text-[#8fa3ba] line-through")}>
            {t.label}
            {t.sub && <span className="ml-1.5 font-normal text-[#8fa3ba]">— {t.sub}</span>}
          </span>
          <span className="ml-auto text-[11px] font-bold text-[#8fa3ba]">
            M{t.month} · W{t.week}
          </span>
        </button>
      ))}
    </div>
  );
}
