import Link from "next/link";

const MONO = "font-[family-name:var(--font-jetbrains-mono)]";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-[980px] px-8 pb-24 pt-[72px]">
      <h1 className="mb-3 text-center text-[40px] tracking-[-.03em]">
        Simple, honest pricing
      </h1>
      <p className="mb-12 text-center text-base text-muted">
        No subscriptions required. No upsells mid-report.
      </p>
      <div className="grid grid-cols-[1fr_1.15fr_1fr] items-start gap-[18px] max-lg:grid-cols-1">
        {/* Free Preview */}
        <div className="rounded-[18px] border border-border bg-white p-7">
          <div className="text-[17px] font-bold">Free Preview</div>
          <div className={`my-3 text-[34px] font-semibold ${MONO}`}>$0</div>
          <div className="mb-[18px] text-[13px] text-[#8fa3ba]">with every upload</div>
          <div className="flex flex-col gap-2.5 text-sm text-[#3d5068]">
            <div>✓ Credit snapshot &amp; score</div>
            <div>✓ Account count &amp; summary</div>
            <div>✓ Top factors affecting your score</div>
            <div>✓ Basic insights</div>
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
          <div className="mb-[18px] text-[13px] text-[#8fa3ba]">one-time, per report</div>
          <div className="flex flex-col gap-2.5 text-sm text-[#d6e1ee]">
            <div>✓ Everything in Free</div>
            <div>✓ Full AI account-by-account analysis</div>
            <div>✓ Personalized 90-day action plan</div>
            <div>✓ Collections &amp; dispute guidance</div>
            <div>✓ Communication scripts &amp; letters</div>
            <div>✓ Downloadable PDF report</div>
            <div>✓ Clarity AI chat</div>
          </div>
          <Link
            href="/upload"
            className="mt-[22px] block w-full rounded-[11px] bg-teal py-[13px] text-center text-[15px] font-semibold text-white transition-colors hover:bg-[#0b8663]"
          >
            Analyze My Credit Report
          </Link>
        </div>

        {/* Clarity Plus */}
        <div className="rounded-[18px] border border-dashed border-[#c7d2df] bg-white p-7">
          <div className="flex items-center gap-2 text-[17px] font-bold">
            Clarity Plus
            <span className="rounded-full bg-[#eef2f7] px-2 py-[3px] text-[10.5px] font-bold text-muted">
              COMING SOON
            </span>
          </div>
          <div className={`my-3 text-[34px] font-semibold ${MONO}`}>
            $9<span className="text-base text-[#8fa3ba]">/mo</span>
          </div>
          <div className="mb-[18px] text-[13px] text-[#8fa3ba]">continuous monitoring</div>
          <div className="flex flex-col gap-2.5 text-sm text-[#3d5068]">
            <div>Quarterly re-analysis</div>
            <div>Score change alerts</div>
            <div>Unlimited Clarity AI chat</div>
            <div>Progress tracking over time</div>
          </div>
          <button
            disabled
            className="mt-[22px] w-full cursor-not-allowed rounded-[11px] bg-[#eef2f7] py-3 text-[14.5px] font-semibold text-[#8fa3ba]"
          >
            Join Waitlist
          </button>
        </div>
      </div>
      <div className="mt-7 text-center text-[13px] text-[#8fa3ba]">
        Payments processed securely by Stripe. Educational service — not credit repair.
      </div>
    </div>
  );
}
