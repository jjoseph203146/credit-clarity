"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app/sidebar";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-5 w-5">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

// Below md, the persistent sidebar becomes an off-canvas drawer opened from
// this top bar — there isn't room to dock a 224px nav column and real
// content side by side on a phone. Closes automatically on route change so
// tapping a nav link doesn't leave the drawer open over the new page.
export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="sticky top-0 z-40 flex h-14 w-full items-center gap-3 border-b border-white/[0.08] bg-[var(--navy-deep)] px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex h-9 w-9 flex-none items-center justify-center rounded-[8px] text-[#b9c8da] transition-colors duration-150 hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint-light)] active:scale-95"
        >
          <MenuIcon open={mobileOpen} />
        </button>
        <Link href="/dashboard" className="flex items-center gap-[9px]">
          <Image src="/logo.png" alt="" width={309} height={235} className="h-6 w-auto" />
          <span className="text-[14px] font-bold tracking-[-0.01em] text-white">Credit Clarity</span>
        </Link>
      </div>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
        />
      )}

      <AppSidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
