"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;

  const supabase = await createClient();

  // exchangeCodeForSession (in the /auth/callback route) already established
  // a recovery session via cookies by the time this form is submitted.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/forgot-password?error=${encodeURIComponent("Your reset link expired. Please request a new one.")}`,
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent("Password updated — log in with your new password.")}`,
  );
}
