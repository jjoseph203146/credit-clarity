"use client";

import Link from "next/link";
import { glossary } from "@/lib/demo-data";

/** The floating "Explain This" glossary panel used across the report viewer. */
export function ExplainPanel({
  term,
  onClose,
}: {
  term: string | null;
  onClose: () => void;
}) {
  if (!term) return null;
  const entry = glossary[term];
  if (!entry) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] overflow-hidden rounded-[18px] border border-[var(--border)] bg-white shadow-[0_24px_64px_rgba(8,21,39,0.25)]">
      <div className="flex items-center gap-[11px] bg-gradient-to-br from-[var(--navy)] to-[#134066] px-5 py-4">
        <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--teal)] to-[var(--mint)]">
          <div className="h-[10px] w-[10px] rounded-full bg-white" />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-bold text-white">{entry.term}</div>
          <div className="text-[11px] font-semibold text-[#8fa3ba]">Explained by Clarity AI</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="cursor-pointer px-1.5 py-0.5 text-[17px] font-semibold text-[#8fa3ba] hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="flex max-h-[52vh] flex-col gap-[13px] overflow-y-auto px-5 py-[18px]">
        <div>
          <div className="mb-1 text-[10.5px] font-bold tracking-[0.08em] text-[var(--teal)]">
            WHAT IT MEANS
          </div>
          <div className="text-[13px] leading-[1.6] text-[#22354d]">{entry.what}</div>
        </div>
        <div>
          <div className="mb-1 text-[10.5px] font-bold tracking-[0.08em] text-[var(--teal)]">
            WHY IT MATTERS
          </div>
          <div className="text-[13px] leading-[1.6] text-[#22354d]">{entry.why}</div>
        </div>
        <div>
          <div className="mb-1 text-[10.5px] font-bold tracking-[0.08em] text-[var(--teal)]">
            ACTION RECOMMENDED?
          </div>
          <div className="text-[13px] leading-[1.6] text-[#22354d]">{entry.action}</div>
        </div>
        <div className="rounded-[11px] bg-[#fdf3e7] px-[13px] py-[11px]">
          <div className="mb-1 text-[10.5px] font-bold tracking-[0.08em] text-[#9a6314]">
            COMMON MISCONCEPTION
          </div>
          <div className="text-[12.5px] leading-[1.6] text-[#22354d]">{entry.misconception}</div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/chat"
            className="rounded-[9px] border-[1.5px] border-[#dbe3ec] px-[14px] py-[9px] text-[12px] font-semibold hover:border-[var(--navy)]"
          >
            Ask a follow-up
          </Link>
        </div>
      </div>
    </div>
  );
}
