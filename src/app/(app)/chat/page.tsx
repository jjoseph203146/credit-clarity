import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { ChatPanel } from "@/components/app/chat-panel";

export default async function ChatPage() {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: latestReport } = await supabase
    .from("reports")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestReport) {
    return (
      <div className="flex h-screen flex-col items-center justify-center px-8 text-center">
        <div className="mb-1.5 text-[22px] font-semibold tracking-[-.02em]">Meet Clarity AI</div>
        <div className="max-w-md text-[14.5px] text-[var(--muted)]">
          Upload and analyze a report first — Clarity AI answers questions using your real
          accounts.
        </div>
      </div>
    );
  }

  let { data: conversation } = await supabase
    .from("ai_conversations")
    .select("id, messages")
    .eq("user_id", user.id)
    .eq("report_id", latestReport.id)
    .maybeSingle();

  if (!conversation) {
    const { data: created, error } = await supabase
      .from("ai_conversations")
      .insert({ user_id: user.id, report_id: latestReport.id, messages: [] })
      .select("id, messages")
      .single();

    if (error || !created) {
      return (
        <div className="flex h-screen flex-col items-center justify-center px-8 text-center">
          <div className="text-[14.5px] text-[var(--muted)]">
            Couldn&apos;t start a conversation right now. Try refreshing.
          </div>
        </div>
      );
    }
    conversation = created;
  }

  return (
    <ChatPanel conversationId={conversation.id} initialMessages={conversation.messages ?? []} />
  );
}
