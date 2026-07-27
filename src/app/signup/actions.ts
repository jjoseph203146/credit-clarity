"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Server Action for the post-payment signup page. Per BUILD.md step 6, this
// signup happens after Stripe checkout and claims the anonymous report
// (reports.user_id is null until now) onto the newly created user.
export async function signup(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const reportId = formData.get("reportId") as string | null;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
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
    }
  }

  redirect("/dashboard");
}
