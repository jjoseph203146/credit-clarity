"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { navMain, navAccount, type NavItem } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Static — this app is pay-per-report with no subscription tiers (matches
// the "Current plan" section on /settings), so there is no per-user plan
// field to fetch.
const PLAN_LABEL = "Pay per report";

function initialsOf(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase() || "?";
}

function LogOutIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-[10px] px-3 py-2.5 text-[13.5px] font-semibold transition-colors",
        active
          ? "bg-[rgba(46,230,168,0.12)] text-[var(--mint-light)]"
          : "text-[#b9c8da] hover:bg-white/5 hover:text-white",
      )}
    >
      <span className="mr-2 inline-block w-[18px] text-center opacity-80">{item.icon}</span>
      {item.label}
      {!!item.dot && (
        <span className="ml-auto rounded-full bg-[#d05252] px-[7px] py-[1px] text-[10px] font-bold text-white">
          {item.dot}
        </span>
      )}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Below md, the sidebar is an off-canvas drawer (opened via the hamburger in
// MobileTopBar) rather than a permanently docked 224px column — there isn't
// room for both the nav and real content on a phone-width screen.
export function AppSidebar({
  mobileOpen = false,
  onNavigate,
}: {
  mobileOpen?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [identity, setIdentity] = useState<{ name: string; initials: string } | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient() as unknown as SupabaseClient<Database>;
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    let cancelled = false;

    async function loadIdentity() {
      const supabase = createClient() as unknown as SupabaseClient<Database>;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data: profile } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;

      const email = profile?.email ?? user.email ?? "";
      const fullName = profile?.full_name ?? null;
      setIdentity({ name: fullName ?? email, initials: initialsOf(fullName, email) });
    }

    void loadIdentity();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-[224px] flex-none flex-col overflow-y-auto bg-[var(--navy-deep)] p-[18px_12px] text-[#b9c8da] transition-transform duration-200 ease-out motion-reduce:transition-none",
        "md:sticky md:top-0 md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="mb-[18px] flex items-center gap-[9px] px-[10px] py-[6px]">
        <Image src="/logo.png" alt="" width={309} height={235} className="h-[28px] w-auto" />
        <span className="text-[15px] font-bold tracking-[-0.01em] text-white">Credit Clarity</span>
      </div>

      <nav className="flex flex-col gap-0.5" onClick={onNavigate}>
        {navMain.map((item) => (
          <NavRow key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="px-3 pb-1.5 pt-[18px] text-[10.5px] font-bold tracking-[0.1em] text-[#5b6f89]">
        ACCOUNT
      </div>
      <nav className="flex flex-col gap-0.5" onClick={onNavigate}>
        {navAccount.map((item) => (
          <NavRow key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-white/[0.08] px-2.5 pt-3">
        <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-gradient-to-br from-[var(--blue)] to-[var(--teal)] text-[11.5px] font-bold text-white">
          {identity?.initials ?? ""}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-white">{identity?.name ?? ""}</div>
          <div className="text-[11px] text-[#8fa3ba]">{PLAN_LABEL}</div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          aria-label="Log out"
          title="Log out"
          className="flex h-7 w-7 flex-none items-center justify-center rounded-[8px] text-[#8fa3ba] transition-colors duration-150 hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint-light)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOutIcon />
        </button>
      </div>
    </div>
  );
}
