import Link from "next/link";

export function MarketingFooter() {
  return (
    <div className="bg-navy-deep px-8 py-10 text-[#8fa3ba]">
      <div className="mx-auto flex max-w-[1120px] flex-wrap justify-between gap-6 text-[13px]">
        <div className="max-w-[460px] leading-relaxed">
          Credit Clarity is an educational service. We do not repair credit, remove
          accurate information, or guarantee score changes. The Credit Clarity Score is
          not a FICO® or VantageScore® credit score.
        </div>
        <div className="flex gap-5 font-medium">
          <Link href="/security" className="hover:text-white">
            Security
          </Link>
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
