"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Server Action for the post-payment signup page. Per BUILD.md step 6, this
// signup happens after Stripe checkout and claims the anonymous report
// (reports.user_id is null until now) onto the newly created user.
export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm_password") as string;
  const fullName = formData.get("full_name") as string;
  const reportId = formData.get("reportId") as string | null;

  if (password !== confirmPassword) {
    redirect(`/signup?error=${encodeURIComponent("Passwords do not match")}`);
  }

  const supabase = await createClient();

  // Checkout now routes already-signed-in payers straight to /processing,
  // but this page can still be reached while authenticated (stale link,
  // back button). Don't run signUp() again in that case — it just errors
  // on the existing email. Claim the report for the current session and
  // continue instead of creating a second account.
  const {
    data: { user: existingUser },
  } = await supabase.auth.getUser();

  if (existingUser) {
    if (reportId) {
      const admin = createAdminClient();
      const { error: claimError } = await admin
        .from("reports")
        .update({ user_id: existingUser.id })
        .eq("id", reportId)
        .is("user_id", null);

      if (claimError) {
        redirect(`/signup?error=${encodeURIComponent(claimError.message)}`);
      }

      const { error: paymentClaimError } = await admin
        .from("payments")
        .update({ user_id: existingUser.id })
        .eq("report_id", reportId);
      if (paymentClaimError) {
        console.warn(
          `[signup] failed to backfill payments.user_id for report ${reportId}: ${paymentClaimError.message}`,
        );
      }

      redirect(`/processing?reportId=${reportId}`);
    }

    redirect("/dashboard");
  }

  // When "Confirm email" is ON, the emailed link lands on /auth/callback.
  // Carry the report through `next` so a user who just paid is returned to
  // their report after confirming, instead of a dashboard that doesn't
  // explain where the thing they bought went.
  const origin = (await headers()).get("origin");
  const confirmNext = reportId
    ? `/processing?reportId=${encodeURIComponent(reportId)}`
    : "/dashboard";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      ...(origin
        ? {
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(confirmNext)}`,
          }
        : {}),
    },
  });

  if (error || !data.user) {
    redirect(
      `/signup?error=${encodeURIComponent(error?.message ?? "Signup failed")}`,
    );
  }

  // The `users` row and the report claim both touch data that isn't
  // RLS-owned by this brand-new user yet (or, for the report, was never
  // owned at all) — use the service-role client for both writes.
  const admin = createAdminClient();

  const { error: insertError } = await admin.from("users").insert({
    id: data.user.id,
    email,
    full_name: fullName,
  });

  if (insertError) {
    redirect(`/signup?error=${encodeURIComponent(insertError.message)}`);
  }

  let claimedReportId: string | null = null;

  if (reportId) {
    const { data: claimedReport, error: claimError } = await admin
      .from("reports")
      .update({ user_id: data.user.id })
      .eq("id", reportId)
      .is("user_id", null)
      .select()
      .maybeSingle();

    if (claimError) {
      redirect(`/signup?error=${encodeURIComponent(claimError.message)}`);
    } else if (!claimedReport) {
      console.warn(
        `[signup] report ${reportId} could not be claimed for user ${data.user.id} — already claimed or not found`,
      );
    } else {
      claimedReportId = claimedReport.id;

      // `payments.user_id` is null at insert time (checkout happens before
      // an account exists) and nothing else ever backfills it — without
      // this, the settings page's payment history would show "no payments"
      // forever even for a user who just paid. Best-effort: a failure here
      // shouldn't block signup, just log it.
      const { error: paymentClaimError } = await admin
        .from("payments")
        .update({ user_id: data.user.id })
        .eq("report_id", claimedReportId);
      if (paymentClaimError) {
        console.warn(
          `[signup] failed to backfill payments.user_id for report ${claimedReportId}: ${paymentClaimError.message}`,
        );
      }
    }
  }

  // supabase.auth.signUp() only returns an active session immediately when
  // the project's "Confirm email" setting is OFF. When it's ON (Supabase's
  // default), data.session is null here — the user must click the emailed
  // confirmation link (which lands on /auth/callback) before they can sign
  // in at all. Redirecting straight to /dashboard in that case just bounces
  // them back out via middleware with no explanation, and any login attempt
  // fails until they confirm. Detect this and send them to a clear
  // "check your email" message on /login instead.
  if (!data.session) {
    // The report was already claimed above, so it's safely attached to this
    // account and waiting — say so explicitly. A user who just paid $5 and
    // is then bounced to a login screen needs to know their money and their
    // report are accounted for.
    redirect(
      `/login?message=${encodeURIComponent(
        claimedReportId
          ? "Account created and your report is saved to it. Check your email to confirm your address — the confirmation link takes you straight to your report."
          : "Account created — check your email to confirm it before logging in.",
      )}`,
    );
  }

  // The report they just paid for is what they came here for — send them to
  // the processing screen (which polls for the AI analysis the Stripe
  // webhook already kicked off) rather than the empty dashboard.
  if (claimedReportId) {
    redirect(`/processing?reportId=${claimedReportId}`);
  }

  redirect("/dashboard");
}
