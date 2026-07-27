"use server";

import { revalidatePath } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { AiConversationMessage } from "@/lib/supabase/types";

const FALLBACK_ERROR_MESSAGE =
  "Clarity AI is temporarily unavailable — please try again.";

// Chat-appropriate variant of the SYSTEM_PROMPT in src/lib/analyze.ts,
// following the same product-safety rules but for a conversational,
// plain-text reply rather than a forced tool-use call.
const CHAT_SYSTEM_PROMPT = `You are Clarity AI, an educational credit assistant for Credit Clarity, chatting with a user about their own credit report.

Product rules you must follow at all times, without exception:
- Credit Clarity is NOT a credit repair service. Never claim a guaranteed score improvement, and never state or imply that Credit Clarity (or you) will dispute anything on the user's behalf. At most, suggest the user consider disputing or requesting validation themselves.
- The "Credit Clarity Score" (if referenced) is educational only and is not a FICO(R) or VantageScore(R) score.
- All responses are educational content only — not legal, financial, or credit repair advice.
- Use realistic, cautious language: prefer phrases like "may help", "consider", "could improve over time" instead of "will fix", "guaranteed", "removes this from your report", or similarly certain claims.
- Never recommend illegal or deceptive tactics (e.g. disputing accurate information as a delay tactic, "credit sweep" schemes, requesting a new identity/CPN).
- No credit pull, no SSN collection, ever.

You will be given the user's parsed credit report as structured JSON (bureau, credit score, accounts, collections, inquiries) as context. Answer the user's question conversationally, in plain text, referencing their actual accounts/collections by name where relevant. Keep responses concise and easy to read in a chat UI. If the report data doesn't contain what's needed to answer, say so rather than guessing.`;

// Fetches the report data this conversation is scoped to, in the same shape
// used by the analysis call in src/lib/analyze.ts (bureau, credit_score,
// accounts, collections, inquiries).
async function fetchReportData(
  supabase: SupabaseClient<Database>,
  reportId: string,
) {
  const [
    { data: report },
    { data: accounts },
    { data: collections },
    { data: inquiries },
  ] = await Promise.all([
    supabase.from("reports").select("bureau, credit_score").eq("id", reportId).maybeSingle(),
    supabase.from("report_accounts").select("*").eq("report_id", reportId),
    supabase.from("report_collections").select("*").eq("report_id", reportId),
    supabase.from("report_inquiries").select("*").eq("report_id", reportId),
  ]);

  return {
    bureau: report?.bureau ?? null,
    credit_score: report?.credit_score ?? null,
    accounts: (accounts ?? []).map((a) => ({
      account_id: a.id,
      name: a.name,
      type: a.type,
      balance: a.balance,
      credit_limit: a.credit_limit,
      utilization: a.utilization,
      payment_history: a.payment_history,
      opened_date: a.opened_date,
    })),
    collections: (collections ?? []).map((c) => ({
      collection_id: c.id,
      original_creditor: c.original_creditor,
      agency_name: c.agency_name,
      amount: c.amount,
      opened_date: c.opened_date,
      first_delinquency_date: c.first_delinquency_date,
      falls_off_date: c.falls_off_date,
    })),
    inquiries: (inquiries ?? []).map((i) => ({
      lender_name: i.lender_name,
      inquiry_type: i.inquiry_type,
      inquiry_date: i.inquiry_date,
    })),
  };
}

// Appends the user's message and a real Claude-backed assistant reply to an
// `ai_conversations` row. RLS ("ai_conversations owner") scopes this to the
// signed-in user's own conversation. Each message is one Claude call scoped
// with the report JSON + conversation history, per BUILD.md step 9.
export async function sendChatMessage(conversationId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return { error: "Message is empty" };

  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: convo, error: fetchError } = await supabase
    .from("ai_conversations")
    .select("report_id, messages")
    .eq("id", conversationId)
    .single();

  if (fetchError || !convo) {
    return { error: fetchError?.message ?? "Conversation not found" };
  }

  const history = convo.messages as AiConversationMessage[];
  const now = new Date().toISOString();
  const userMessage: AiConversationMessage = { role: "user", content: trimmed, created_at: now };

  let replyText: string;
  try {
    // Constructed inside the function (not at module scope) so this module
    // doesn't require ANTHROPIC_API_KEY to be set at build time, matching
    // the lazy-client pattern in src/lib/analyze.ts.
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const reportData = await fetchReportData(supabase, convo.report_id);

    const contextPrefix = `Here is the user's parsed credit report data (for your context only — do not repeat it verbatim unless asked):\n\n${JSON.stringify(reportData, null, 2)}\n\n---\n\n`;

    // Conversation history mapped to {role, content} turns. The report JSON
    // is prepended to the new user turn (not persisted to `messages` in the
    // DB) so the model always has current report data as context.
    const priorTurns: Anthropic.MessageParam[] = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const newUserTurn: Anthropic.MessageParam = {
      role: "user",
      content: `${contextPrefix}${trimmed}`,
    };

    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      system: CHAT_SYSTEM_PROMPT,
      messages: [...priorTurns, newUserTurn],
    });

    const textBlock = message.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text",
    );

    replyText = textBlock?.text ?? FALLBACK_ERROR_MESSAGE;
  } catch (err) {
    console.error("sendChatMessage: Anthropic API call failed", err);
    replyText = FALLBACK_ERROR_MESSAGE;
  }

  const assistantMessage: AiConversationMessage = {
    role: "assistant",
    content: replyText,
    created_at: new Date().toISOString(),
  };

  const messages = [...history, userMessage, assistantMessage];

  const { error: updateError } = await supabase
    .from("ai_conversations")
    .update({ messages, updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/chat");
  return { error: null, reply: replyText };
}

// Clears a conversation's message history in place (used by "+ New
// conversation" in the UI) rather than creating a new row per chat.
export async function clearChatConversation(conversationId: string) {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("ai_conversations")
    .update({ messages: [], updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) return { error: error.message };

  revalidatePath("/chat");
  return { error: null };
}
