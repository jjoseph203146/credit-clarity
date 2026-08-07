import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReportStatus } from "@/lib/supabase/types";

// Scheduled maintenance sweep. Runs two independent jobs:
//
//   1. Stale pending payments -> "failed". A Checkout Session the user
//      abandoned leaves a `pending` payments row forever; after the session
//      expires it can never succeed, so it is closed out. Non-destructive.
//
//   2. Abandoned anonymous uploads -> deleted. A report with user_id = null
//      that was never paid for and never claimed at signup (BUILD.md step 6)
//      is an orphan: no one can ever reach it, and it is holding a credit
//      report PDF in Storage. Both the Storage object and the row are removed;
//      child tables (report_accounts/collections/inquiries) cascade.
//
// Deliberately NOT swept: anything with a user_id, and anything at status
// "paid" or "analyzed". Paid work is never deleted by a cron job regardless of
// age, and claimed reports belong to a user who deletes them on their own
// terms (BUILD.md: "Users can permanently delete reports/account at any time").
//
// Scheduled via vercel.json. Vercel Cron issues a GET with an
// `Authorization: Bearer $CRON_SECRET` header; POST + `x-internal-secret` is
// also accepted so it can be triggered by hand with the same secret
// /api/analyze uses.

// Anonymous, unpaid reports older than this are deleted outright.
const ABANDONED_REPORT_DAYS = Number(process.env.CLEANUP_ABANDONED_REPORT_DAYS ?? 7);
// Pending payments older than this can no longer succeed (Stripe Checkout
// Sessions expire after 24h).
const PENDING_PAYMENT_HOURS = Number(process.env.CLEANUP_PENDING_PAYMENT_HOURS ?? 24);

// Statuses safe to delete: never "paid", never "analyzed".
const ABANDONED_STATUSES: ReportStatus[] = ["uploaded", "parsed", "error"];

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const internalSecret = process.env.INTERNAL_API_SECRET;

  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const internalHeader = req.headers.get("x-internal-secret");
  if (internalSecret && internalHeader === internalSecret) return true;

  return false;
}

async function expireStalePayments(admin: ReturnType<typeof createAdminClient>) {
  const cutoff = new Date(Date.now() - PENDING_PAYMENT_HOURS * 3600_000).toISOString();

  const { data, error } = await admin
    .from("payments")
    .update({ status: "failed" })
    .eq("status", "pending")
    .lt("created_at", cutoff)
    .select("id");

  if (error) throw new Error(`Pending-payment sweep failed: ${error.message}`);
  return data?.length ?? 0;
}

async function deleteAbandonedReports(admin: ReturnType<typeof createAdminClient>) {
  const cutoff = new Date(Date.now() - ABANDONED_REPORT_DAYS * 86_400_000).toISOString();

  const { data: reports, error: selectError } = await admin
    .from("reports")
    .select("id, storage_path")
    .is("user_id", null)
    .in("status", ABANDONED_STATUSES)
    .lt("created_at", cutoff);

  if (selectError) {
    throw new Error(`Abandoned-report sweep failed: ${selectError.message}`);
  }
  if (!reports || reports.length === 0) {
    return { reportsDeleted: 0, filesDeleted: 0 };
  }

  // Storage first: if the row were deleted first and this failed, the PDF
  // would be orphaned with nothing left pointing at it.
  const paths = reports.map((r) => r.storage_path).filter(Boolean);
  let filesDeleted = 0;

  if (paths.length > 0) {
    const { error: storageError } = await admin.storage.from("reports").remove(paths);
    if (storageError) {
      throw new Error(`Storage cleanup failed: ${storageError.message}`);
    }
    filesDeleted = paths.length;
  }

  const ids = reports.map((r) => r.id);
  const { error: deleteError } = await admin.from("reports").delete().in("id", ids);

  if (deleteError) {
    throw new Error(`Report deletion failed: ${deleteError.message}`);
  }

  return { reportsDeleted: ids.length, filesDeleted };
}

async function handle(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Payments first: deleting a report cascades its payments rows, so
    // sweeping payments afterwards would report a misleadingly low count.
    const paymentsExpired = await expireStalePayments(createAdminClient());
    const { reportsDeleted, filesDeleted } = await deleteAbandonedReports(createAdminClient());

    const summary = { paymentsExpired, reportsDeleted, filesDeleted };
    console.log("Cleanup sweep complete", summary);

    return NextResponse.json({ status: "ok", ...summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cleanup failed";
    console.error("Cleanup sweep failed", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
