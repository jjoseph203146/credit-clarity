import Link from "next/link";

const MONO = "font-[family-name:var(--font-jetbrains-mono)]";

const freeFeatures = [
  "Credit snapshot",
  "Report summary",
  "Biggest opportunities",
  "Initial Clarity AI findings",
];

const paidFeatures = [
  "Everything in Free",
  "Full AI account-by-account analysis",
  "Personalized action plan",
  "Items worth reviewing for accuracy",
  "Professional PDF report you can save or share",
  "Clarity AI Q&A",
];

const trustRow = [
  "One-time payment",
  "Secure Stripe checkout",
  "No subscription",
  "Delete your data anytime",
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[860px] px-8 pb-24 pt-[72px]">
      <h1 className="mb-3 text-center text-[40px] tracking-[-.03em]">
        One report. One price.
      </h1>
      <p className="mb-12 text-center text-base text-muted">
        Only pay when you need an analysis — no subscriptions, no upsells mid-report.
      </p>
      <div className="grid grid-cols-[1fr_1.2fr] items-start gap-[18px] max-md:grid-cols-1">
        {/* Free Preview */}
        <div className="rounded-[18px] border border-border bg-white p-7">
          <div className="text-[17px] font-bold">Free Preview</div>
          <div className={`my-3 text-[34px] font-semibold ${MONO}`}>$0</div>
          <div className="mb-[18px] text-[13px] text-[#8fa3ba]">with every upload</div>
          <div className="flex flex-col gap-2.5 text-sm text-[#3d5068]">
            {freeFeatures.map((f) => (
              <div key={f}>✓ {f}</div>
            ))}
          </div>
          <Link
            href="/upload"
            className="mt-[22px] block w-full rounded-[11px] border-[1.5px] border-navy bg-white py-3 text-center text-[14.5px] font-semibold text-navy transition-colors hover:bg-[var(--bg)]"
          >
            Upload a Report
          </Link>
        </div>

        {/* Full Analysis */}
        <div className="rounded-[18px] bg-[linear-gradient(160deg,#0b1f3a,#134066)] p-[30px] text-white shadow-[0_20px_48px_rgba(8,21,39,.3)]">
          <div className="flex items-center justify-between">
            <div className="text-[17px] font-bold">Full Credit Analysis</div>
            <div className="rounded-full bg-teal px-2.5 py-1 text-[11px] font-bold">
              MOST POPULAR
            </div>
          </div>
          <div className={`my-3 text-[40px] font-semibold ${MONO}`}>$5</div>
          <div className="mb-3.5 text-[13px] text-[#8fa3ba]">one-time, per report</div>
          <p className="mb-[18px] border-l-2 border-mint/70 pl-3 text-[14.5px] leading-relaxed text-[#eaf2fa]">
            Understand exactly what&apos;s helping your credit, what&apos;s holding it
            back, and what to do next.
          </p>
          <div className="flex flex-col gap-2.5 text-sm text-[#d6e1ee]">
            {paidFeatures.map((f) => (
              <div key={f}>✓ {f}</div>
            ))}
          </div>
          <Link
            href="/upload"
            className="mt-[22px] block w-full rounded-[11px] bg-teal py-[13px] text-center text-[15px] font-semibold text-white transition-colors hover:bg-[#0b8663]"
          >
            Analyze My Credit Report
          </Link>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-white/[.12] pt-4 text-[12.5px] text-[#a9bcd2] max-sm:grid-cols-1">
            {trustRow.map((t) => (
              <div key={t}>
                <span className="mr-1.5 text-mint">✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-[520px] text-center text-[15px] leading-relaxed text-[#3d5068]">
        <span className="font-semibold text-navy">Why only $5?</span> We believe everyone
        should be able to understand their credit without paying hundreds for financial
        coaching.
      </p>
      <div className="mt-6 text-center text-[13px] text-[#8fa3ba]">
        Payments processed securely by Stripe. Educational service — not credit repair.
      </div>
    </div>
  );
}
