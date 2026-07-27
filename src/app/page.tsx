import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

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
      <div className="bg-[linear-gradient(160deg,#081527_0%,#0b1f3a_55%,#134066_100%)] px-8 py-[88px] pb-24 text-white">
        <div className="mx-auto grid max-w-[1120px] grid-cols-[1.05fr_.95fr] items-center gap-16 max-lg:grid-cols-1">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/[.12] px-3.5 py-1.5 text-[13px] font-semibold text-[#7defc4]">
              <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              Powered by Clarity AI
            </div>
            <h1 className="mb-5 text-[52px] font-bold leading-[1.08] tracking-[-.03em]">
              Understand your credit.
              <br />
              <span className="text-mint-light">Build your future.</span>
            </h1>
            <p className="mb-8 max-w-[480px] text-lg leading-relaxed text-[#b9c8da]">
              Upload your credit report and let Clarity AI explain what matters, identify
              opportunities, and create your personalized roadmap.
            </p>
            <div className="flex items-center gap-3.5">
              <Link
                href="/upload"
                className="rounded-xl bg-teal px-[26px] py-[15px] text-base font-semibold text-white shadow-[0_8px_24px_rgba(14,159,119,.35)] transition-colors hover:bg-[#0b8663]"
              >
                Analyze My Credit Report
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-xl border border-white/25 px-6 py-[15px] text-base font-semibold text-white transition-colors hover:border-white/60"
              >
                See How It Works
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-[22px] text-[12.5px] font-medium text-[#8fa3ba]">
              <span>🔐 256-bit encryption</span>
              <span>Reports deleted on request</span>
              <span>Not a credit repair service</span>
            </div>
          </div>

          {/* product preview card */}
          <div className="rounded-[20px] bg-white p-[26px] text-ink shadow-[0_24px_64px_rgba(3,10,20,.45)]">
            <div className="mb-[18px] flex items-center justify-between">
              <div className="text-[15px] font-bold">Your Credit Snapshot</div>
              <div className="rounded-full bg-[#e6f5ef] px-2.5 py-1 text-[11px] font-semibold text-teal">
                Analyzed by Clarity AI
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[14px] bg-[var(--bg)] p-4">
                <div className="text-xs font-medium text-muted">Credit Score</div>
                <div className={`mt-1 text-[34px] font-semibold ${MONO}`}>642</div>
                <div className="text-xs font-semibold text-teal">▲ +14 since Jan</div>
              </div>
              <div className="rounded-[14px] bg-[var(--bg)] p-4">
                <div className="text-xs font-medium text-muted">Clarity Score</div>
                <div className={`mt-1 text-[34px] font-semibold ${MONO}`}>
                  74<span className="text-base text-[#8fa3ba]">/100</span>
                </div>
                <div className="text-xs text-muted">Improving</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-[#fdf3e7] px-4 py-3.5">
              <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-[#f6ddba] font-bold text-[#9a6314]">
                !
              </div>
              <div>
                <div className="text-[13.5px] font-semibold">
                  Utilization is your biggest opportunity
                </div>
                <div className="text-[12.5px] text-muted">
                  Cards at 72% — bring under 30% for the biggest lift.
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <div className="flex justify-between text-[12.5px]">
                <span className="text-muted">Payment history</span>
                <span className="font-semibold text-[#c2731a]">Needs attention</span>
              </div>
              <div className="flex justify-between text-[12.5px]">
                <span className="text-muted">Open accounts</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between text-[12.5px]">
                <span className="text-muted">Collections</span>
                <span className="font-semibold text-[#c23e3e]">1 account</span>
              </div>
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
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-[22px] bg-[linear-gradient(135deg,#0b1f3a,#134066)] p-11 px-12 text-white">
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
              className="rounded-xl bg-teal px-6 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#0b8663]"
            >
              Start Free
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-white/30 px-[22px] py-3.5 text-[15px] font-semibold text-white transition-colors hover:border-white/60"
            >
              See Pricing
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
