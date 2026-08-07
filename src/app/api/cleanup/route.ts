import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reportError } from "@/lib/report-error";

// Retention job for abandoned anonymous uploads. Every upload that never
// reaches signup leaves a `reports` row (user_id null) plus the PDF in
// Storage; those are real credit reports, so keeping them forever is both
// unbounded growth and a privacy problem.
//
// Meant to be driven by a scheduler that can set a custom request header —
// GitHub Actions, Supabase pg_cron + pg_net, or any hosted cron service.
// Note that Vercel Cron cannot: it issues a plain GET with its own
// `Authorization: Bearer $CRON_SECRET` header and no way to add others, so
// driving this from Vercel Cron needs a separate GET handler that checks
// that header instead. Gated behind the same internal shared secret as
// /api/analyze so it can't be triggered by untrusted clients.
//
// Claimed reports (user_id set) are never touched — a paying user's report
// is theirs until they delete it themselves.

const DEFAULT_RETENTION_HOURS = 48;

export async function POST(req: Request) {
  // Read inside the handler (not at module scope) so this route doesn't
  // require INTERNAL_API_SECRET at build time, matching the lazy-env pattern
  // used by /api/analyze and /api/checkout.
  const expectedSecret = process.env.INTERNAL_API_SECRET;
  const providedSecret = req.headers.get("x-internal-secret");

  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Most schedulers send no body, so an absent or unparseable body is normal
  // here — fall back to the default window.
  let retentionHours = DEFAULT_RETENTION_HOURS;
  try {
    const body = (await req.json()) as { retentionHours?: number };
    if (
      typeof body?.retentionHours === "number" &&
      Number.isFinite(body.retentionHours) &&
      body.retentionHours > 0
    ) {
      retentionHours = body.retentionHours;
    }
  } catch {
    // No body — keep the default.
  }

  const admin = createAdminClient();

  // The SQL function deletes the rows and returns their storage_paths. The
  // row is the only pointer to the Storage object, so the objects must be
  // removed here using what it returned — there is no second chance to find
  // them once the rows are gone.
  const { data: deleted, error } = await admin.rpc(
    "delete_stale_anonymous_reports",
    { older_than: `${retentionHours} hours` },
  );

  if (error) {
    void reportError({
      event: "cleanup_failed",
      severity: "error",
      error,
      context: { retentionHours },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (deleted ?? []) as { id: string; storage_path: string }[];
  const storagePaths = rows.map((row) => row.storage_path).filter(Boolean);

  let storageRemoved = 0;
  let storageError: string | null = null;

  if (storagePaths.length > 0) {
    const { error: removeError } = await admin.storage
      .from("reports")
      .remove(storagePaths);

    if (removeError) {
      // The rows are already gone, so these objects are now orphaned in the
      // bucket. Surface it loudly rather than reporting a clean run — this
      // needs manual reconciliation against the bucket.
      storageError = removeError.message;
      // The rows are gone, so these objects can no longer be found by any
      // later run — they are orphaned credit reports sitting in the bucket,
      // which is a privacy problem, not just a cleanup miss.
      void reportError({
        event: "cleanup_orphaned_storage",
        severity: "error",
        error: removeError,
        context: { rowsDeleted: rows.length, orphanedObjects: storagePaths.length },
      });
    } else {
      storageRemoved = storagePaths.length;
    }
  }

  return NextResponse.json({
    retentionHours,
    reportsDeleted: rows.length,
    storageObjectsRemoved: storageRemoved,
    ...(storageError ? { storageError } : {}),
  });
}
