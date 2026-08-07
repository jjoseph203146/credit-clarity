import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Exchanges a Supabase auth link's `code` param (password recovery, email
// confirmation, magic link) for a real session cookie, then continues on to
// `next`. Both resetPasswordForEmail's redirectTo and Supabase's default
// email-confirmation link point here.
// `next` arrives from a link in an email, so treat it as untrusted: only
// allow same-site absolute paths. Rejecting "//evil.example" matters
// specifically — appending it to origin yields a protocol-relative URL that
// some clients follow off-site.
function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("That link is invalid or has expired. Please request a new one.")}`,
  );
}
