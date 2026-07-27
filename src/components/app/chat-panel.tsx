"use client";

import { useState, useRef, useEffect, useTransition, type FormEvent } from "react";
import { ChatBubble, type ChatMessage } from "@/components/app/chat-bubble";
import { sendChatMessage, clearChatConversation, setMessageFeedback } from "@/app/(app)/chat/actions";
import type { AiConversationMessage } from "@/lib/supabase/types";

export interface ChatContext {
  bureauName: string;
  analyzed: boolean;
  accountCount: number;
  insightCount: number;
  goalLabel: string | null;
  accounts: { id: string; name: string }[];
  hasCollections: boolean;
  reportId: string;
}

const QUICK_ACTIONS = [
  { icon: "📄", label: "Summarize my report", prompt: "Summarize my report in a few sentences." },
  { icon: "🎯", label: "Show my top priorities", prompt: "What are my top priorities right now?" },
  { icon: "📈", label: "How can I improve in 90 days?", prompt: "How can I improve my credit over the next 90 days?" },
];

function toChatMessages(messages: AiConversationMessage[]): ChatMessage[] {
  return messages.map((m, i) => ({
    id: `${i}-${m.created_at}`,
    index: i,
    role: m.role,
    text: m.content,
    sources: m.sources,
    feedback: m.feedback,
  }));
}

interface ChatPanelProps {
  conversationId: string;
  initialMessages: AiConversationMessage[];
  context: ChatContext;
}

export function ChatPanel({ conversationId, initialMessages, context }: ChatPanelProps) {
  const [messages, setMessages] = useState<AiConversationMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed, created_at: new Date().toISOString() },
    ]);
    startTransition(async () => {
      const result = await sendChatMessage(conversationId, trimmed);
      if (!result.error && result.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.reply,
            created_at: new Date().toISOString(),
            sources: result.sources,
            feedback: null,
          },
        ]);
      }
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const handleNewConversation = () => {
    startTransition(async () => {
      await clearChatConversation(conversationId);
      setMessages([]);
    });
  };

  const handleFeedback = (index: number, feedback: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m,
      ),
    );
    startTransition(async () => {
      await setMessageFeedback(conversationId, index, feedback);
    });
  };

  const chatMessages = toChatMessages(messages);
  const hasMessages = chatMessages.length > 0;
  const lastIsAssistant = messages[messages.length - 1]?.role === "assistant";

  const suggestedPrompts = [
    context.accounts[0]
      ? `Explain why my ${context.accounts[0].name} account matters`
      : "Why is utilization important?",
    context.hasCollections ? "Will paying my collection help?" : "What should I pay first?",
    "Why did you recommend paying this account first?",
    "What's my biggest opportunity right now?",
  ];

  return (
    <div className="flex h-screen flex-col">
      <div className="border-b border-[var(--border)] bg-white px-7 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--teal)] to-[var(--mint)]">
            <div className="h-3 w-3 rounded-full bg-white" />
          </div>
          <div>
            <div className="text-[15px] font-semibold">Ask about your credit report</div>
            <div className="text-xs font-semibold text-[var(--teal)]">
              ● Grounded in your uploaded report — won&apos;t guess if it doesn&apos;t know
            </div>
          </div>
          {hasMessages && (
            <button
              type="button"
              onClick={handleNewConversation}
              className="ml-auto text-[12.5px] font-semibold text-[var(--teal)]"
            >
              + New conversation
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12.5px] text-[var(--muted)]">
          <span>✓ Your {context.bureauName} report has been {context.analyzed ? "analyzed" : "parsed"}</span>
          <span>✓ {context.accountCount} account{context.accountCount === 1 ? "" : "s"} indexed</span>
          {context.analyzed && <span>✓ {context.insightCount} personalized insights available</span>}
          {context.goalLabel && <span>✓ Goal: {context.goalLabel}</span>}
        </div>
      </div>

      {!hasMessages ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[var(--teal)] to-[var(--mint)] text-[26px] shadow-[0_12px_32px_rgba(14,159,119,.3)]">
            💬
          </div>
          <div className="mb-1.5 text-[22px] font-semibold tracking-[-.02em]">
            Ask anything about your report
          </div>
          <div className="mb-6 max-w-md text-center text-[14.5px] text-[var(--muted)]">
            I can explain accounts, recommend priorities, or help you understand credit concepts —
            using your real report data.
          </div>

          <div className="mb-3 flex w-full max-w-[520px] flex-wrap justify-center gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => ask(action.prompt)}
                className="rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors hover:border-[var(--teal)]"
              >
                {action.icon} {action.label}
              </button>
            ))}
            <a
              href={`/reports/${context.reportId}/pdf-report`}
              className="rounded-full border border-[var(--border)] bg-white px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors hover:border-[var(--teal)]"
            >
              📥 Download PDF
            </a>
          </div>

          <div className="grid w-full max-w-[520px] grid-cols-1 gap-2.5 sm:grid-cols-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => ask(prompt)}
                className="rounded-2xl border border-[var(--border)] bg-white p-4 text-left text-[13.5px] font-semibold transition-colors hover:border-[var(--teal)]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto py-6">
          <div className="mx-auto flex max-w-[680px] flex-col gap-4 px-6">
            {chatMessages.map((m) => (
              <ChatBubble
                key={m.id}
                message={m}
                reportId={context.reportId}
                onFeedback={handleFeedback}
                onFollowUp={ask}
              />
            ))}
            {isPending && !lastIsAssistant && (
              <div className="flex">
                <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[13.5px] text-[var(--muted)]">
                  Clarity AI is thinking…
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-[var(--border)] bg-white px-6 pb-[22px] pt-4"
      >
        <div className="mx-auto flex max-w-[680px] gap-2.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your credit…"
            disabled={isPending}
            className="flex-1 rounded-[13px] border-[1.5px] border-[#dbe3ec] px-4 py-3.5 text-sm outline-none focus:border-[var(--teal)] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-[52px] rounded-[13px] bg-[var(--teal)] text-lg font-bold text-white transition-colors hover:bg-[var(--teal-deep)] disabled:opacity-60"
          >
            ↑
          </button>
        </div>
      </form>
    </div>
  );
}
