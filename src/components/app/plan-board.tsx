"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { ActionPlanTask } from "@/lib/supabase/types";
import { toggleActionPlanTask } from "@/app/(app)/plan/actions";

// Indexed task keeps the task's position in the original `action_plans.tasks`
// array so toggling can write back to the right slot, even after grouping.
type IndexedTask = ActionPlanTask & { index: number };

interface PlanBoardProps {
  planId: string;
  tasks: ActionPlanTask[];
}

export function PlanBoard({ planId, tasks }: PlanBoardProps) {
  const [isPending, startTransition] = useTransition();

  const indexed: IndexedTask[] = tasks.map((t, index) => ({ ...t, index }));
  const months = Array.from(new Set(indexed.map((t) => t.month))).sort((a, b) => a - b);

  const columns = months.map((month) => ({
    title: `MONTH ${month}`,
    tasks: indexed
      .filter((t) => t.month === month)
      .sort((a, b) => a.week - b.week),
  }));

  const toggle = (index: number) => {
    startTransition(() => {
      void toggleActionPlanTask(planId, index);
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
      {columns.map((col) => {
        const doneCount = col.tasks.filter((t) => t.done).length;
        return (
          <div
            key={col.title}
            className="rounded-2xl border border-[var(--border)] bg-white p-5"
          >
            <div className="mb-3.5 flex items-center justify-between">
              <span className="text-xs font-bold tracking-[.08em] text-[var(--ink)]">
                {col.title}
              </span>
              <span className="font-mono text-[11.5px] font-bold text-[#8fa3ba]">
                {doneCount}/{col.tasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {col.tasks.map((t) => (
                <button
                  key={`${t.month}-${t.week}-${t.label}`}
                  type="button"
                  disabled={isPending}
                  onClick={() => toggle(t.index)}
                  className="flex items-start gap-2.5 rounded-xl bg-[#f8fafc] p-3 text-left transition-colors hover:bg-[#eef4f1] disabled:opacity-60"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-[6px] text-[10px] font-bold",
                      t.done
                        ? "bg-[var(--teal)] text-white"
                        : "border-[1.5px] border-[#c7d2df] bg-white",
                    )}
                  >
                    {t.done ? "✓" : ""}
                  </span>
                  <div className="flex-1">
                    <div
                      className={cn(
                        "text-[13.5px] font-semibold",
                        t.done ? "text-[#8fa3ba] line-through" : "text-[var(--ink)]",
                      )}
                    >
                      {t.label}
                    </div>
                    {t.sub && (
                      <div className="mt-0.5 text-[11.5px] text-[#8fa3ba]">{t.sub}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
