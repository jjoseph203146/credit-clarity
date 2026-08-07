"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { claimReportForUser } from "@/lib/claim-report";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const reportId = formData.get("reportId") as string | null;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Preserve the report through a failed attempt, or a retry would drop it.
    const qs = new URLSearchParams({ error: error.message });
    if (reportId) qs.set("reportId", reportId);
    redirect(`/login?${qs.toString()}`);
  }

  // Someone who already had an account and paid arrives here from the signup
  // page's "Login instead" link. Their report is still anonymous at this
  // point, so claim it exactly as signup does — otherwise it is orphaned and
  // never appears under My Reports.
  if (reportId && data.user) {
    const claimedReportId = await claimReportForUser(reportId, data.user.id);
    if (claimedReportId) {
      redirect(`/processing?reportId=${claimedReportId}`);
    }
  }

  redirect("/dashboard");
}
