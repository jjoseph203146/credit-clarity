"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Ends the session and clears the Supabase auth cookies. Server Action
// rather than a client-side supabase.auth.signOut() so the cookie removal
// happens on the response the browser is already receiving — a client-side
// sign-out leaves the httpOnly cookies for middleware to keep refreshing
// until the next navigation.
export async function logout() {
  const supabase = await createClient();

  // scope: "local" clears this browser's session only. A shared-device sign
  // out shouldn't kill the user's session on their phone too.
  await supabase.auth.signOut({ scope: "local" });

  // Server Components cache per-path; without this a Back navigation can
  // render an authenticated page shell from cache after signing out.
  revalidatePath("/", "layout");

  redirect("/login");
}
