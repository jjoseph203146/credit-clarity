"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Marks a lesson complete for the signed-in user. Upserts on the
// `(user_id, lesson_slug)` unique constraint so re-clicking a completed
// lesson is a no-op rather than an error.
export async function markLessonComplete(lessonSlug: string) {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("learning_progress")
    .upsert(
      { user_id: user.id, lesson_slug: lessonSlug, completed_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_slug" },
    );

  if (error) return { error: error.message };

  revalidatePath("/learn");
  return { error: null };
}
