"use client";

import { cn } from "@/lib/utils";

export interface PlanTask {
  id: string;
  label: string;
  sub: string;
  done: boolean;
}

interface PlanColumnProps {
  title: string;
  tasks: PlanTask[];
  onToggle: (id: string) => void;
}

export function PlanColumn({ title, tasks, onToggle }: PlanColumnProps) {
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="text-xs font-bold tracking-[.08em] text-[var(--ink)]">
          {title}
        </span>
        <span className="font-mono text-[11.5px] font-bold text-[#8fa3ba]">
          {doneCount}/{tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onToggle(t.id)}
            className="flex items-start gap-2.5 rounded-xl bg-[#f8fafc] p-3 text-left transition-colors hover:bg-[#eef4f1]"
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
              <div className="mt-0.5 text-[11.5px] text-[#8fa3ba]">{t.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
