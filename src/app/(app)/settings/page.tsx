import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SecurityToggles } from "@/components/app/security-toggles";
import { DeleteAccountForm } from "@/components/app/delete-account-form";
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

function initialsOf(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default async function SettingsPage() {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("email, full_name, goal, timeline, challenge, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const { count: reportsCount } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const { data: payments } = await supabase
    .from("payments")
    .select("id, created_at, amount_cents, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const email = profile?.email ?? user.email ?? "";
  const fullName = profile?.full_name ?? null;
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const CONTEXT_ROWS = [
    { label: "Financial goal", value: profile?.goal ? GOAL_LABELS[profile.goal] : "Not set" },
    { label: "Timeline", value: profile?.timeline ? TIMELINE_LABELS[profile.timeline] : "Not set" },
    {
      label: "Biggest challenge",
      value: profile?.challenge ? CHALLENGE_LABELS[profile.challenge] : "Not set",
    },
    { label: "Reports on file", value: String(reportsCount ?? 0) },
  ];

  return (
    <div className="max-w-[720px] px-9 pb-[72px] pt-7">
      <h1 className="mb-5 text-2xl font-semibold tracking-[-.02em]">
        Profile, Settings &amp; Billing
      </h1>

      {/* Profile */}
      <div className="mb-3.5 rounded-[18px] border border-[var(--border)] bg-white p-6">
        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--blue)] to-[var(--teal)] text-lg font-bold text-white">
            {initialsOf(fullName, email)}
          </div>
          <div>
            <div className="text-[17px] font-semibold">{fullName ?? email}</div>
            <div className="text-[13px] text-[var(--muted)]">
              {memberSince ? `Member since ${memberSince}` : ""}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 text-xs font-semibold text-[#3d5068]">Full name</div>
            <Input defaultValue={fullName ?? ""} readOnly />
          </div>
          <div>
            <div className="mb-1.5 text-xs font-semibold text-[#3d5068]">Email</div>
            <Input defaultValue={email} type="email" readOnly />
          </div>
        </div>
      </div>

      {/* Your context */}
      <div className="mb-3.5 rounded-[18px] border border-[var(--border)] bg-white p-6">
        <div className="mb-3.5 text-[15px] font-semibold">Your context</div>
        <div className="flex flex-col gap-3 text-[13.5px]">
          {CONTEXT_ROWS.map((row) => (
            <div key={row.label} className="flex justify-between">
              <span className="text-[var(--muted)]">{row.label}</span>
              <span className="font-semibold">
                {row.value}
                {row.label === "Financial goal" && (
                  <a href="/goals" className="ml-1.5 cursor-pointer font-semibold text-[var(--teal)]">
                    · change
                  </a>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="mb-3.5 rounded-[18px] border border-[var(--border)] bg-white p-6">
        <div className="mb-4 text-[15px] font-semibold">Security</div>
        <SecurityToggles />
      </div>

      {/* Billing */}
      <div className="mb-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="rounded-[18px] border border-[var(--border)] bg-white p-6">
          <div className="mb-1.5 text-xs font-medium text-[var(--muted)]">Current plan</div>
          <div className="text-[17px] font-semibold">Pay per report</div>
          <div className="mt-1 text-[13px] text-[var(--muted)]">$5 per analysis · no subscription</div>
        </div>
        <div className="rounded-[18px] bg-gradient-to-br from-[var(--navy)] to-[#134066] p-6 text-white">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-[#8fa3ba]">Upgrade</span>
            <span className="rounded-full bg-[var(--teal)] px-2 py-0.5 text-[10px] font-bold">
              SOON
            </span>
          </div>
          <div className="text-[17px] font-semibold">Clarity Plus — $9/mo</div>
          <div className="mt-1 text-[13px] text-[#b9c8da]">
            Quarterly re-analysis + unlimited chat
          </div>
        </div>
      </div>

      <div className="mb-3.5 rounded-[18px] border border-[var(--border)] bg-white p-6">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="text-[15px] font-semibold">Payment history</span>
          <span className="rounded-lg bg-[#f4f6f9] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--muted)]">
            via Stripe
          </span>
        </div>
        {payments && payments.length > 0 ? (
          <div className="flex flex-col">
            {payments.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[1.2fr_1fr_.6fr] items-center gap-3 border-b border-[#eef2f7] py-3.5 text-[13.5px] last:border-b-0"
              >
                <span className="font-semibold">
                  {new Date(p.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="text-[var(--muted)] capitalize">{p.status}</span>
                <span className="font-mono font-semibold">
                  ${(p.amount_cents / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[13px] text-[var(--muted)]">No payments yet.</div>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-[18px] border border-[#f0d4d4] bg-white p-6">
        <div className="mb-1.5 text-[15px] font-semibold">Your data</div>
        <div className="mb-4 text-[13.5px] leading-relaxed text-[var(--muted)]">
          Deleting removes your reports, analysis, chat history, and account permanently. No
          retention period.
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline">Export My Data</Button>
          <DeleteAccountForm />
        </div>
      </div>
    </div>
  );
}
