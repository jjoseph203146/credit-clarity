import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/demo-data";

export interface NotificationItem {
  id: string;
  icon: string;
  tone: Tone;
  title: string;
  description: string;
  when: string;
}

const toneClasses: Record<Tone, string> = {
  good: "bg-[#e6f5ef] text-[#0b7d5e]",
  warn: "bg-[#fdf3e7] text-[#9a6314]",
  bad: "bg-[#fbecec] text-[#a33232]",
  neutral: "bg-[#eef2f7] text-[#3d5068]",
};

export function NotificationRow({ icon, tone, title, description, when }: NotificationItem) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-[var(--border)] bg-white px-5 py-4">
      <div
        className={cn(
          "flex h-9 w-9 flex-none items-center justify-center rounded-xl text-[15px]",
          toneClasses[tone],
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-[12.5px] text-[var(--muted)]">{description}</div>
      </div>
      <div className="flex-none text-[11.5px] text-[#8fa3ba]">{when}</div>
    </div>
  );
}
