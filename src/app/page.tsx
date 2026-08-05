import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { ScoreGauge } from "@/components/ui/score-gauge";

const MONO = "font-[family-name:var(--font-jetbrains-mono)]";

const homeSteps = [
  {
    num: "01",
    t: "Upload your report",
    d: "Drag in a PDF from Experian, Equifax, or TransUnion. No account needed.",
  },
  {
    num: "02",
    t: "Get your free snapshot",
    d: "Score, accounts, and the major factors affecting you — free, instantly.",
  },
  {
    num: "03",
    t: "Unlock the full analysis",
    d: "$5 one-time. Clarity AI explains every account and builds your plan.",
  },
  {
    num: "04",
    t: "Follow your roadmap",
    d: "A 90-day plan with scripts, letters, and a coach that knows your report.",
  },
];

const benefits = [
  {
    ic: "Aa",
    t: "Plain-English explanations",
    d: 'Every account, inquiry, and status decoded — no jargon, no guessing what "charge-off" means.',
  },
  {
    ic: "↗",
    t: "Prioritized by impact",
    d: "Not 40 generic tips. The 3-5 moves that matter most for your specific report, ranked.",
  },
  {
    ic: "✉",
    t: "Words that work",
    d: "Validation letters, goodwill requests, and negotiation scripts — written for your accounts, ready to send.",
  },
];

const quotes = [
  {
    q: "I'd stared at my report for years without understanding it. This explained my collection account in one paragraph and gave me the exact letter to send.",
    n: "Maria T.",
    r: "Houston, TX",
    in: "MT",
  },
  {
    q: "The 90-day plan told me which card to pay first and why. My score went from 615 to 671 in four months.",
    n: "Devon W.",
    r: "Atlanta, GA",
    in: "DW",
  },
  {
    q: "We use it in our church financial wellness group. It's the first tool members actually finish.",
    n: "Pastor J. Okafor",
    r: "Riverside Community Church",
    in: "JO",
  },
];

const faqs = [
  {
    q: "Is this credit repair?",
    a: "No. We don't dispute accurate information, promise score increases, or contact bureaus for you. Credit Clarity explains your report and gives you the knowledge and tools to act yourself.",
  },
  {
    q: "Do you pull my credit?",
    a: "Never. You upload a report you already have — there's no inquiry, and we don't need your SSN. Free reports are available weekly at annualcreditreport.com.",
  },
  {
    q: "What happens to my report after analysis?",
    a: "It's encrypted at rest, visible only to you, and you can permanently delete it (and your account) with one click at any time.",
  },
  {
    q: "What exactly does $5 get me?",
    a: "A full AI analysis of every account, a personalized 90-day action plan, dispute and negotiation scripts, a downloadable PDF report, and access to Clarity AI chat.",
  },
  {
    q: "Will my score definitely go up?",
    a: "No one can promise that — and you should be suspicious of anyone who does. We show you the factors, the actions most likely to help, and track your progress across reports.",
  },
];

export default function Home() {
  return (
    <div>
      <MarketingNav />

      {/* hero */}
      <div className="relative overflow-hidden px-8 pb-24 pt-[72px]">
        {/* Layered radial washes — cool light ground, not a flat fill. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[var(--bg)]"
          style={{
            backgroundImage:
              "radial-gradient(900px 460px at 78% 8%, rgba(46,230,168,.16), transparent 62%), radial-gradient(760px 400px at 12% 0%, rgba(21,90,138,.10), transparent 60%), radial-gradient(600px 500px at 50% 100%, rgba(11,31,58,.05), transparent 70%)",
          }}
        />
        <div className="mx-auto grid max-w-[1120px] grid-cols-[1.05fr_.95fr] items-center gap-16 max-lg:grid-cols-1">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal/25 bg-white/70 px-3.5 py-1.5 text-[13px] font-semibold text-[var(--teal-deep)] shadow-[0_1px_2px_rgba(11,31,58,.04)] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              Powered by Clarity AI
            </div>
            <h1 className="mb-5 font-display text-[64px] font-normal leading-[1.02] tracking-[-.03em] text-[var(--navy)] max-sm:text-[44px]">
              Your credit report,
              <br />
              <em className="italic text-[var(--teal-deep)]">finally legible.</em>
            </h1>
            <p className="mb-8 max-w-[470px] text-[17px] leading-[1.7] text-[var(--muted)]">
              Upload the PDF you already have. Clarity AI reads every account and tells you, in
              plain English, what it means and what to do next.
            </p>
            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                href="/upload"
                className="group relative isolate overflow-hidden rounded-full bg-[var(--navy)] px-7 py-[15px] text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(11,31,58,.20),0_10px_24px_-6px_rgba(11,31,58,.35)] transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-active:opacity-100 motion-reduce:transition-none"
                  style={{ backgroundImage: "var(--grad-teal)" }}
                />
                Analyze my credit report
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-full border border-[#d6dfea] bg-white/80 px-6 py-[15px] text-[15px] font-semibold text-[var(--ink)] transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                See how it works
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-[22px] gap-y-2 text-[12.5px] font-medium text-[var(--muted)]">
              <span>No credit pull</span>
              <span>·</span>
              <span>No SSN required</span>
              <span>·</span>
              <span>Delete anytime</span>
            </div>
          </div>

          {/* product preview — floating layer, gauge carries the proof */}
          <div className="relative">
            <div className="rounded-[24px] border border-white/80 bg-white/85 p-[26px] shadow-[0_1px_2px_rgba(11,31,58,.04),0_18px_40px_-12px_rgba(11,31,58,.16),0_40px_80px_-24px_rgba(11,31,58,.12)] backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[13px] font-semibold text-[var(--muted)]">Your snapshot</div>
                <div className="rounded-full bg-[#e6f5ef] px-2.5 py-1 text-[11px] font-semibold text-[var(--teal-deep)]">
                  Analyzed by Clarity AI
                </div>
              </div>

              <ScoreGauge
                score={800}
                from={450}
                label="Experian"
                delta={350}
                size={296}
                className="mx-auto"
              />

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {[
                  { k: "Utilization", v: "72%", tone: "bad" as const },
                  { k: "On-time", v: "94%", tone: "good" as const },
                  { k: "Accounts", v: "8", tone: "flat" as const },
                ].map((m) => (
                  <div key={m.k} className="rounded-[14px] bg-[#f4f7fa] px-3.5 py-3">
                    <div className="text-[11.5px] text-[var(--muted)]">{m.k}</div>
                    <div
                      className={`mt-0.5 font-mono text-[21px] font-semibold ${
                        m.tone === "bad"
                          ? "text-[#a94848]"
                          : m.tone === "good"
                            ? "text-[var(--teal-deep)]"
                            : "text-[var(--ink)]"
                      }`}
                    >
                      {m.v}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 flex items-start gap-3 rounded-[14px] bg-[#fdf6ec] px-4 py-3.5">
                <div className="mt-px flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-[#f6ddba] text-[13px] font-bold text-[#9a6314]">
                  1
                </div>
                <div>
                  <div className="text-[13.5px] font-semibold text-[var(--ink)]">
                    Start with utilization
                  </div>
                  <div className="text-[12.5px] leading-relaxed text-[var(--muted)]">
                    Your cards sit at 72%. Getting under 30% is the single biggest lever on this
                    report.
                  </div>
                </div>
              </div>
            </div>

            {/* Elevated chip breaking the card edge — establishes the depth ladder. */}
            <div className="absolute -bottom-4 left-6 rounded-full border border-[#e4e9f0] bg-white px-4 py-2 text-[12.5px] font-semibold text-[var(--ink)] shadow-[0_8px_20px_-6px_rgba(11,31,58,.22)]">
              90-day plan ready
            </div>
          </div>
        </div>
      </div>

      {/* how it works strip */}
      <div className="mx-auto max-w-[1120px] px-8 pb-2 pt-[72px]">
        <div className="mb-11 text-center">
          <h2 className="mb-2.5 text-[32px] tracking-[-.02em]">
            From confusion to a clear plan
          </h2>
          <p className="text-base text-muted">Four steps. About five minutes.</p>
        </div>
        <div className="grid grid-cols-4 gap-[18px] max-md:grid-cols-1">
          {homeSteps.map((s) => (
            <div key={s.num} className="rounded-2xl border border-border bg-white p-[22px]">
              <div className={`mb-2.5 text-xs font-semibold text-teal ${MONO}`}>{s.num}</div>
              <div className="mb-1.5 text-base font-bold">{s.t}</div>
              <div className="text-[13.5px] leading-relaxed text-muted">{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* benefits */}
      <div className="mx-auto max-w-[1120px] px-8 pb-2 pt-16">
        <div className="grid grid-cols-3 gap-[18px] max-md:grid-cols-1">
          {benefits.map((b) => (
            <div key={b.t} className="rounded-2xl border border-border bg-white p-6">
              <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#e6f5ef] text-[15px] font-bold text-teal">
                {b.ic}
              </div>
              <div className="mb-1.5 text-base font-bold">{b.t}</div>
              <div className="text-sm leading-relaxed text-muted">{b.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* testimonials */}
      <div className="mx-auto max-w-[1120px] px-8 pb-2 pt-16">
        <h2 className="mb-6 text-center text-[26px] tracking-[-.02em]">
          People finally get it
        </h2>
        <div className="grid grid-cols-3 gap-[18px] max-md:grid-cols-1">
          {quotes.map((q) => (
            <div key={q.n} className="rounded-2xl border border-border bg-white p-6">
              <div className="text-[14.5px] leading-relaxed text-[#22354d]">
                &ldquo;{q.q}&rdquo;
              </div>
              <div className="mt-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-navy to-blue text-xs font-bold text-white">
                  {q.in}
                </div>
                <div>
                  <div className="text-[13px] font-semibold">{q.n}</div>
                  <div className="text-xs text-[#8fa3ba]">{q.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* pricing preview */}
      <div className="mx-auto max-w-[1120px] px-8 pb-2 pt-16">
        <div
          className="flex flex-wrap items-center justify-between gap-8 rounded-[22px] p-11 px-12 text-white"
          style={{ backgroundImage: "var(--grad-navy-mint)" }}
        >
          <div>
            <h2 className="mb-2 text-[28px] tracking-[-.02em]">
              One report. One clear plan. <span className="text-mint-light">$5.</span>
            </h2>
            <p className="max-w-[520px] text-[15px] text-[#b9c8da]">
              Free credit snapshot with every upload. Unlock the full AI analysis, roadmap,
              and communication scripts for a one-time $5.
            </p>
          </div>
          <div className="flex flex-none gap-3">
            <Link
              href="/upload"
              className="rounded-full bg-[var(--navy)] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(8,21,39,.24),0_10px_24px_-8px_rgba(8,21,39,.45)] transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)] active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-[var(--navy)]/25 bg-white/90 px-[22px] py-3.5 text-[15px] font-semibold text-[var(--navy)] transition-colors duration-150 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)] active:bg-[#eef2f7]"
            >
              See pricing
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-[760px] px-8 pb-20 pt-16">
        <h2 className="mb-[22px] text-center text-[26px] tracking-[-.02em]">
          Questions, answered
        </h2>
        <div className="flex flex-col gap-2.5">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="rounded-2xl border border-border bg-white px-5 py-4"
            >
              <summary className="cursor-pointer list-none text-[15px] font-semibold">
                {f.q}
              </summary>
              <div className="mt-2.5 text-sm leading-relaxed text-muted">{f.a}</div>
            </details>
          ))}
        </div>
      </div>

      <MarketingFooter />
    </div>
  );
}
