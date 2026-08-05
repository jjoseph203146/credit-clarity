"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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

export function AppSidebar() {
  const pathname = usePathname();
  const [identity, setIdentity] = useState<{ name: string; initials: string } | null>(null);

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
    <div className="sticky top-0 flex h-screen w-[224px] flex-none flex-col overflow-y-auto bg-[var(--navy-deep)] p-[18px_12px] text-[#b9c8da]">
      <div className="mb-[18px] flex items-center gap-[9px] px-[10px] py-[6px]">
        <Image src="/logo.png" alt="" width={309} height={235} className="h-[28px] w-auto" />
        <span className="text-[15px] font-bold tracking-[-0.01em] text-white">Credit Clarity</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {navMain.map((item) => (
          <NavRow key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="px-3 pb-1.5 pt-[18px] text-[10.5px] font-bold tracking-[0.1em] text-[#5b6f89]">
        ACCOUNT
      </div>
      <nav className="flex flex-col gap-0.5">
        {navAccount.map((item) => (
          <NavRow key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-white/[0.08] px-2.5 pt-3">
        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gradient-to-br from-[var(--blue)] to-[var(--teal)] text-[11.5px] font-bold text-white">
          {identity?.initials ?? ""}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white">{identity?.name ?? ""}</div>
          <div className="text-[11px] text-[#8fa3ba]">{PLAN_LABEL}</div>
        </div>
      </div>
    </div>
  );
}
