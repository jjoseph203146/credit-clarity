import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import { audit } from "@/lib/audit";

// GET /api/reports/[id]/file — returns a short-lived signed URL for the
// user's own uploaded PDF.
//
// The `reports` bucket is private (see
// supabase/migrations/0003_storage_limits_and_cleanup.sql) and must stay
// that way: a public bucket would make every uploaded credit report readable
// by anyone who learns or guesses its path. The only correct way to hand a
// file back is:
//
//   request -> verify ownership server-side -> mint a temporary signed URL
//
// Never getPublicUrl(), and never expose storage_path to the client — the
// path is an input to signing, not a capability on its own.

// Long enough to click through and download, short enough that a leaked URL
// (browser history, shared logs, a proxy) stops working quickly.
const SIGNED_URL_TTL_SECONDS = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Next 16: route params are async.
  const { id } = await params;

  // @supabase/ssr's bundled types collapse table typing to `never` against
  // the installed @supabase/supabase-js; the runtime client is a real
  // SupabaseClient<Database>. Same cast as the DELETE handler one level up.
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Ownership check runs through the RLS-scoped client, so a report owned by
  // someone else — or one still anonymous — simply returns no row. The
  // explicit user_id comparison below is belt-and-braces on top of RLS.
  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !report || report.user_id !== user.id) {
    // 404 rather than 403 so the response doesn't confirm the report exists.
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Signing requires bucket privileges the user's own token doesn't have, so
  // this step uses the service-role client — but only after the ownership
  // check above has already passed.
  const { data: signed, error: signError } = await createAdminClient()
    .storage.from("reports")
    .createSignedUrl(report.storage_path, SIGNED_URL_TTL_SECONDS);

  if (signError || !signed) {
    console.error(`[reports] failed to sign download for ${report.id}:`, signError);
    return NextResponse.json(
      { error: "We couldn't prepare your file for download. Please try again." },
      { status: 500 },
    );
  }

  void audit({
    action: "report_downloaded",
    userId: user.id,
    reportId: report.id,
    req: _req,
  });

  return NextResponse.json({
    url: signed.signedUrl,
    expiresInSeconds: SIGNED_URL_TTL_SECONDS,
  });
}
