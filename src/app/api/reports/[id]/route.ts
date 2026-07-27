import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

// GET /api/reports/[id] — fetches a report plus its accounts/collections/
// inquiries. Supports both the anonymous pre-signup flow (free preview,
// before the report has been claimed) and the authenticated flow used by
// later pages, without leaking a claimed report's data to anonymous
// requests:
//   - report.user_id === null (still anonymous): anyone with the id (an
//     unguessable UUID) may read it — same anonymous-access design already
//     used by /api/parse and /api/checkout.
//   - report.user_id !== null (claimed): only the authenticated owner may
//     read it. Anyone else (including unauthenticated requests) gets 404,
//     not 403, so the response doesn't confirm the report's existence.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const admin = createAdminClient();

  const { data: report, error: reportError } = await admin
    .from("reports")
    .select("*")
    .eq("id", params.id)
    .single();

  if (reportError || !report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (report.user_id !== null) {
    const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== report.user_id) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
  }

  const [
    { data: accounts, error: accountsError },
    { data: collections, error: collectionsError },
    { data: inquiries, error: inquiriesError },
  ] = await Promise.all([
    admin.from("report_accounts").select("*").eq("report_id", report.id),
    admin.from("report_collections").select("*").eq("report_id", report.id),
    admin.from("report_inquiries").select("*").eq("report_id", report.id),
  ]);

  if (accountsError || collectionsError || inquiriesError) {
    return NextResponse.json(
      {
        error:
          accountsError?.message ??
          collectionsError?.message ??
          inquiriesError?.message ??
          "Failed to fetch report data",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ report, accounts, collections, inquiries });
}

// DELETE /api/reports/[id] — hard-deletes a report and its Storage object
// for the authenticated owner. Per BUILD.md: "Users can permanently delete
// reports/account at any time (no retention period)."
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  // @supabase/ssr's bundled types (createServerClient's `Schema` generic)
  // resolve against an older @supabase/supabase-js internal path than the
  // version installed here, which collapses table typing to `never`. The
  // client returned at runtime is a real SupabaseClient<Database>, so this
  // cast restores accurate typing without touching src/lib/supabase/server.ts.
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // RLS ("reports read own") scopes this select to rows owned by the
  // current user — a report belonging to someone else, or still anonymous,
  // comes back as no row.
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("*")
    .eq("id", params.id)
    .single();

  if (reportError || !report || report.user_id !== user.id) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Ownership is confirmed above via the RLS-scoped client; the actual
  // deletes run through the admin client since Storage removal and the
  // cascading detail-table deletes aren't covered by the reports RLS policy.
  const admin = createAdminClient();

  const { error: storageError } = await admin.storage
    .from("reports")
    .remove([report.storage_path]);

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { error: deleteError } = await admin
    .from("reports")
    .delete()
    .eq("id", report.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}
