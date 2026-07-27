import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export default async function ProgressPage() {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reports } = await supabase
    .from("reports")
    .select("id, report_date, credit_score, bureau, created_at")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .not("credit_score", "is", null)
    .order("report_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  const history = reports ?? [];
  const hasEnoughHistory = history.length >= 2;

  const scores = history.map((r) => r.credit_score as number);
  const minScore = scores.length ? Math.min(...scores) - 20 : 560;
  const maxScore = scores.length ? Math.max(...scores) + 20 : 700;
  const heightPct = (score: number) =>
    Math.round(((score - minScore) / (maxScore - minScore || 1)) * 100);

  const monthLabel = (dateStr: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", { month: "short" })
      : "—";

  const first = history[0];
  const last = history[history.length - 1];

  const improved: { label: string; value: string }[] = [];
  const stillToAddress: { label: string; value: string; tone: "bad" | "warn" }[] = [];

  if (hasEnoughHistory && first && last) {
    const delta = (last.credit_score as number) - (first.credit_score as number);
    improved.push({
      label: "Credit score",
      value: `${first.credit_score} → ${last.credit_score} (${delta >= 0 ? "+" : ""}${delta})`,
    });
  }

  return (
    <div className="max-w-[980px] px-9 pb-[72px] pt-7">
      <h1 className="mb-1 text-2xl font-semibold tracking-[-.02em]">Progress</h1>
      <p className="mb-5 text-[13px] text-[var(--muted)]">
        Score across your reports, and what moved it.
      </p>

      {history.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-[#c7d2df] bg-white px-8 py-14 text-center">
          <div className="mb-1 text-base font-semibold">No analyzed reports yet</div>
          <div className="text-[13.5px] text-[var(--muted)]">
            Upload and analyze a report to start tracking your score over time.
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3.5 rounded-[18px] border border-[var(--border)] bg-white p-6">
            <div className="flex h-[180px] items-end gap-8 px-2">
              {history.map((r) => (
                <div
                  key={r.id}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div className="font-mono text-[15px] font-semibold text-[var(--ink)]">
                    {r.credit_score ?? "—"}
                  </div>
                  <div
                    className={cn(
                      "w-14 rounded-t-lg rounded-b-[3px]",
                      r.id === last?.id
                        ? "bg-gradient-to-b from-[var(--mint)] to-[var(--teal)]"
                        : "bg-[var(--navy)]",
                    )}
                    style={{ height: `${heightPct(r.credit_score as number)}%` }}
                  />
                  <div className="text-xs font-semibold text-[var(--muted)]">
                    {monthLabel(r.report_date)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center gap-5 text-[11.5px] text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--navy)]" /> Past
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[var(--teal)]" /> Current
              </span>
            </div>
          </div>

          {!hasEnoughHistory && (
            <div className="mb-3.5 rounded-2xl border border-dashed border-[#c7d2df] bg-white p-5 text-[13px] text-[var(--muted)]">
              Upload a second report to start seeing trends and comparisons here.
            </div>
          )}

          {hasEnoughHistory && (
            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-white p-[22px]">
                <div className="mb-3 text-[15px] font-semibold">What improved</div>
                <div className="flex flex-col gap-2.5 text-[13.5px]">
                  {improved.length === 0 ? (
                    <div className="text-[var(--muted)]">Nothing tracked yet.</div>
                  ) : (
                    improved.map((row) => (
                      <div key={row.label} className="flex justify-between">
                        <span className="text-[var(--muted)]">{row.label}</span>
                        <span className="font-semibold text-[#0b7d5e]">{row.value}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-white p-[22px]">
                <div className="mb-3 text-[15px] font-semibold">Still to address</div>
                <div className="flex flex-col gap-2.5 text-[13.5px]">
                  {stillToAddress.length === 0 ? (
                    <div className="text-[var(--muted)]">
                      See your latest report for open items.
                    </div>
                  ) : (
                    stillToAddress.map((row) => (
                      <div key={row.label} className="flex justify-between">
                        <span className="text-[var(--muted)]">{row.label}</span>
                        <span
                          className={cn(
                            "font-semibold",
                            row.tone === "bad" ? "text-[#c23e3e]" : "text-[#c2731a]",
                          )}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
