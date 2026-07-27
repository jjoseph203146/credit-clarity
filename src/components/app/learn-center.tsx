"use client";

import { useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { markLessonComplete } from "@/app/(app)/learn/actions";

export type Lesson = {
  slug: string;
  title: string;
  description: string;
  tag: string;
  minutes: number;
  relevant?: boolean;
  relevantReason?: string;
};

export type GlossaryTerm = { term: string; what: string; why: string };

const HOT_TAGS = new Set(["BASICS", "DEBT", "REPAIR"]);
const CATEGORY_ORDER = ["BASICS", "DEBT", "REPAIR", "STRATEGY", "BUILDING", "SAFETY"];

interface LearnCenterProps {
  lessons: Lesson[];
  glossary: GlossaryTerm[];
  initialCompletedSlugs: string[];
}

function LessonCard({
  lesson,
  isComplete,
  disabled,
  onClick,
}: {
  lesson: Lesson;
  isComplete: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-[var(--border)] bg-white p-5 text-left transition-colors hover:border-[var(--teal)]"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10.5px] font-bold",
            HOT_TAGS.has(lesson.tag) ? "bg-[#e6f5ef] text-[#0b7d5e]" : "bg-[#eef2f7] text-[var(--muted)]",
          )}
        >
          {lesson.tag}
        </span>
        <span className="font-mono text-[11.5px] text-[#8fa3ba]">{lesson.minutes} min</span>
      </div>
      <div className="mb-1.5 text-[15px] font-semibold">{lesson.title}</div>
      <div className="text-[13px] leading-relaxed text-[var(--muted)]">{lesson.description}</div>
      {lesson.relevant && lesson.relevantReason && (
        <div className="mt-2.5 rounded-lg bg-[#f2faf6] px-2.5 py-2 text-[12px] leading-snug text-[#0b7d5e]">
          <span className="font-bold">Relevant because: </span>
          {lesson.relevantReason}
        </div>
      )}
      <div className="mt-2.5 flex items-center gap-3 text-[11.5px] font-bold">
        {lesson.relevant && <span className="text-[var(--teal)]">● Relevant to your report</span>}
        {isComplete && <span className="text-[#0b7d5e]">✓ Completed</span>}
      </div>
    </button>
  );
}

export function LearnCenter({ lessons, glossary, initialCompletedSlugs }: LearnCenterProps) {
  const [activeTerm, setActiveTerm] = useState<GlossaryTerm | null>(null);
  const [completed, setCompleted] = useState(new Set(initialCompletedSlugs));
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleLessonClick = (slug: string) => {
    if (completed.has(slug)) return;
    setCompleted((prev) => new Set(prev).add(slug));
    startTransition(async () => {
      const result = await markLessonComplete(slug);
      if (result.error) {
        setCompleted((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
      }
    });
  };

  const recommended = lessons.filter((l) => l.relevant);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lessons;
    return lessons.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.tag.toLowerCase().includes(q),
    );
  }, [lessons, query]);

  const byCategory = useMemo(() => {
    const groups = new Map<string, Lesson[]>();
    for (const l of filtered) {
      const list = groups.get(l.tag) ?? [];
      list.push(l);
      groups.set(l.tag, list);
    }
    return CATEGORY_ORDER.filter((c) => groups.has(c)).map((c) => ({
      category: c,
      lessons: groups.get(c)!,
    }));
  }, [filtered]);

  const totalLessons = lessons.length;
  const completedCount = lessons.filter((l) => completed.has(l.slug)).length;
  const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="max-w-[1040px] px-9 pb-[72px] pt-7">
      <h1 className="mb-1 text-2xl font-semibold tracking-[-.02em]">Learning Center</h1>
      <p className="mb-4 text-[13px] text-[var(--muted)]">
        Short, plain-English lessons. Clarity AI links here when it explains your report.
      </p>

      <div className="mb-5 rounded-2xl border border-[var(--border)] bg-white p-5">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[13.5px] font-semibold">Learning progress</span>
          <span className="text-[12.5px] text-[var(--muted)]">
            {completedCount} of {totalLessons} lessons completed
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#eef2f7]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--teal)] to-[var(--mint)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-[var(--border)] bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-5 w-5 rounded-[7px] bg-gradient-to-br from-[var(--teal)] to-[var(--mint)]" />
          <span className="text-[11px] font-bold tracking-[.08em] text-[var(--teal)]">
            EXPLAIN THIS — TAP ANY TERM
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {glossary.map((g) => (
            <button
              key={g.term}
              type="button"
              onClick={() => setActiveTerm(g)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold text-[#3d5068] transition-colors hover:border-[var(--teal)]",
                activeTerm?.term === g.term
                  ? "border-[var(--teal)] bg-[#f4f6f9]"
                  : "border-[var(--border)] bg-[#f4f6f9]",
              )}
            >
              {g.term}
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e6f5ef] text-[9.5px] font-bold text-[#0b7d5e]">
                i
              </span>
            </button>
          ))}
        </div>
        {activeTerm && (
          <div className="mt-4 rounded-xl border-l-[3px] border-[var(--teal)] bg-[#f8fafc] p-4">
            <div className="mb-1 text-[13.5px] font-bold text-[var(--ink)]">{activeTerm.term}</div>
            <div className="mb-2 text-[13px] leading-relaxed text-[#22354d]">{activeTerm.what}</div>
            <div className="text-[13px] leading-relaxed text-[var(--muted)]">
              <span className="font-semibold text-[var(--ink)]">Why it matters: </span>
              {activeTerm.why}
            </div>
          </div>
        )}
      </div>

      <div className="mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lessons…"
          className="w-full rounded-[13px] border-[1.5px] border-[#dbe3ec] px-4 py-3 text-sm outline-none focus:border-[var(--teal)] sm:max-w-[320px]"
        />
      </div>

      {!query && recommended.length > 0 && (
        <div className="mb-7">
          <div className="mb-3 text-[15px] font-bold">Recommended for you</div>
          <div className="mb-1 text-[12.5px] text-[var(--muted)]">Relevant to your report</div>
          <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((lesson) => (
              <LessonCard
                key={lesson.slug}
                lesson={lesson}
                isComplete={completed.has(lesson.slug)}
                disabled={isPending && !completed.has(lesson.slug)}
                onClick={() => handleLessonClick(lesson.slug)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-3 text-[15px] font-bold">
        {query ? `Results for "${query}"` : "Browse all lessons"}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#c7d2df] bg-white p-8 text-center text-[13.5px] text-[var(--muted)]">
          No lessons match &quot;{query}&quot;.
        </div>
      ) : (
        byCategory.map(({ category, lessons: group }) => (
          <div key={category} className="mb-6">
            {!query && (
              <div className="mb-2.5 text-[11px] font-bold tracking-[.08em] text-[var(--muted)]">
                {category}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((lesson) => (
                <LessonCard
                  key={lesson.slug}
                  lesson={lesson}
                  isComplete={completed.has(lesson.slug)}
                  disabled={isPending && !completed.has(lesson.slug)}
                  onClick={() => handleLessonClick(lesson.slug)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
