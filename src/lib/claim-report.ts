import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Attach an anonymous report (reports.user_id IS NULL) to a user, and backfill
 * the payment row that was created before any account existed.
 *
 * Shared by both post-payment paths. Checkout happens before sign-in, so a
 * paid report is ownerless until whichever door the user walks through next —
 * sign up OR log in. Only signup used to do this, so anyone who already had an
 * account and chose "Log in" silently lost the report they just paid for.
 *
 * Writes use the service-role client: the rows being claimed are not yet
 * RLS-owned by this user, so a normal client cannot see or update them.
 *
 * Returns the claimed report id, or null if there was nothing to claim.
 */
export async function claimReportForUser(
  reportId: string,
  userId: string,
): Promise<string | null> {
  const admin = createAdminClient();

  const { data: claimed, error } = await admin
    .from("reports")
    .update({ user_id: userId })
    // Only ever claims an *unowned* report, so passing someone else's id can
    // never transfer it away from them.
    .eq("id", reportId)
    .is("user_id", null)
    .select("id")
    .maybeSingle();

  if (error) {
    console.warn(`[claim-report] failed to claim ${reportId} for ${userId}: ${error.message}`);
    return null;
  }

  if (!claimed) {
    // Nothing was updated. Either it belongs to someone else, or it is
    // already this user's (e.g. they hit the same link twice) — in which
    // case the caller should still route them to it.
    const { data: existing } = await admin
      .from("reports")
      .select("id")
      .eq("id", reportId)
      .eq("user_id", userId)
      .maybeSingle();
    return existing?.id ?? null;
  }

  // payments.user_id is null at insert time (checkout precedes the account).
  // Best-effort: a failure here shouldn't block sign-in, but without it the
  // user's payment history stays empty forever.
  const { error: paymentError } = await admin
    .from("payments")
    .update({ user_id: userId })
    .eq("report_id", claimed.id);

  if (paymentError) {
    console.warn(
      `[claim-report] failed to backfill payments.user_id for ${claimed.id}: ${paymentError.message}`,
    );
  }

  return claimed.id;
}
