"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { createAdminClient } from "@/lib/supabase/admin";

// Permanently deletes the signed-in user's account and all associated data.
// Per BUILD.md: "Users can permanently delete reports/account at any time
// (no retention period)." This is hard, irreversible, and requires the
// caller (the UI) to have already collected a "type DELETE to confirm" step
// — this action itself performs no further confirmation.
export async function deleteAccount() {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();

  // 1. Remove Storage objects for every report this user owns — DB cascades
  // below remove the rows, but never touch Storage.
  const { data: reports } = await admin
    .from("reports")
    .select("storage_path")
    .eq("user_id", user.id);

  const storagePaths = (reports ?? []).map((r) => r.storage_path).filter(Boolean);
  if (storagePaths.length > 0) {
    await admin.storage.from("reports").remove(storagePaths);
  }

  // 2. Delete the user's reports explicitly. `report_accounts`,
  // `report_collections`, `report_inquiries`, and `payments` all reference
  // reports.id with `on delete cascade`, so this also clears those.
  await admin.from("reports").delete().eq("user_id", user.id);

  // 3. Delete the `users` row. `action_plans`, `ai_conversations`,
  // `learning_progress`, and `notifications` all reference users.id with
  // `on delete cascade`, so this clears those too.
  const { error: userDeleteError } = await admin.from("users").delete().eq("id", user.id);

  if (userDeleteError) {
    return { error: userDeleteError.message };
  }

  // 4. Delete the underlying auth user. `users.id` also references
  // auth.users(id) on delete cascade, but the public row is already gone
  // above — this just removes the Supabase Auth identity itself.
  const { error: authDeleteError } = await admin.auth.admin.deleteUser(user.id);

  if (authDeleteError) {
    return { error: authDeleteError.message };
  }

  redirect("/");
}
