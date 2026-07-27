import Link from "next/link";

export function MarketingNav() {
  return (
    <div className="sticky top-0 z-50 border-b border-border bg-white/[.92] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center gap-7 px-8">
        <Link href="/" className="flex items-center gap-[9px]">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg bg-gradient-to-br from-navy to-blue">
            <div className="h-[10px] w-[10px] rounded-full bg-mint" />
          </div>
          <span className="text-base font-bold tracking-[-.02em]">Credit Clarity</span>
        </Link>
        <div className="ml-3 flex gap-[22px] text-sm font-medium text-[#3d5068]">
          <Link href="/how-it-works" className="hover:text-navy">
            How it works
          </Link>
          <Link href="/pricing" className="hover:text-navy">
            Pricing
          </Link>
          <Link href="/security" className="hover:text-navy">
            Security
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-3.5">
          <Link href="/login" className="text-sm font-semibold text-[#3d5068] hover:text-navy">
            Log in
          </Link>
          <Link
            href="/upload"
            className="rounded-[10px] bg-navy px-[18px] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#123152]"
          >
            Analyze My Credit Report
          </Link>
        </div>
      </div>
    </div>
  );
}
