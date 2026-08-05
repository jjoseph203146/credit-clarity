import Link from "next/link";
import Image from "next/image";

export function MarketingNav() {
  return (
    <div className="sticky top-0 z-50 bg-transparent">
      <div className="mx-auto flex h-[76px] max-w-[1120px] items-center gap-4 px-5 sm:gap-7 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-[9px] rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal"
        >
          <Image
            src="/logo.png"
            alt=""
            width={309}
            height={235}
            priority
            className="h-[30px] w-auto"
          />
          <span className="whitespace-nowrap text-[15px] font-bold tracking-[-.02em] text-navy sm:text-[17px]">
            Credit Clarity
          </span>
        </Link>

        {/* Pill group — one floating surface, per the reference nav treatment. */}
        <div className="ml-3 flex items-center gap-1 rounded-full border border-white/70 bg-white/70 p-1 shadow-[0_1px_2px_rgba(11,31,58,.05),0_8px_24px_-10px_rgba(11,31,58,.18)] backdrop-blur max-md:hidden">
          {[
            { href: "/how-it-works", label: "How it works" },
            { href: "/pricing", label: "Pricing" },
            { href: "/security", label: "Security" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-[#3d5068] transition-colors duration-150 hover:bg-white hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal active:bg-[#eef2f7]"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3.5">
          <Link
            href="/login"
            className="whitespace-nowrap rounded-full px-2 py-2 text-sm font-semibold text-[#3d5068] transition-colors duration-150 hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal sm:px-3"
          >
            Log in
          </Link>
          <Link
            href="/upload"
            className="group relative isolate overflow-hidden whitespace-nowrap rounded-full bg-navy px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(11,31,58,.20),0_8px_20px_-8px_rgba(11,31,58,.40)] transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-5 sm:text-sm"
          >
            {/* Gradient Teal hover/active state, per the brand button system. */}
            <span
              aria-hidden
              className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-active:opacity-100 motion-reduce:transition-none"
              style={{ backgroundImage: "var(--grad-teal)" }}
            />
            Analyze my report
          </Link>
        </div>
      </div>
    </div>
  );
}
