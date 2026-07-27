"use client";

import { useState, useRef, useEffect, useTransition, type FormEvent } from "react";
import { ChatBubble, type ChatMessage } from "@/components/app/chat-bubble";
import { sendChatMessage, clearChatConversation } from "@/app/(app)/chat/actions";
import type { AiConversationMessage } from "@/lib/supabase/types";

const SUGGESTED_PROMPTS = [
  "Why is utilization important?",
  "What should I pay first?",
  "Will paying my collection help?",
  "Explain my Capital One account",
];

const SOURCE_CHIPS = [
  { label: "Reports →", href: "/reports" },
  { label: "Lesson: Utilization →", href: "/learn" },
];

function toChatMessages(messages: AiConversationMessage[]): ChatMessage[] {
  return messages.map((m, i) => ({ id: `${i}-${m.created_at}`, role: m.role, text: m.content }));
}

interface ChatPanelProps {
  conversationId: string;
  initialMessages: AiConversationMessage[];
}

export function ChatPanel({ conversationId, initialMessages }: ChatPanelProps) {
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
    // Optimistic append of the user's message. The Server Action persists
    // both the user message and the real Claude-backed reply to
    // ai_conversations; once it resolves we re-sync from `initialMessages`
    // via revalidation, but for immediate UI feedback we also append the
    // real reply text returned here.
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

  const chatMessages = toChatMessages(messages);
  const hasMessages = chatMessages.length > 0;
  const lastIsAssistant = messages[messages.length - 1]?.role === "assistant";

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b border-[var(--border)] bg-white px-7 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--teal)] to-[var(--mint)]">
          <div className="h-3 w-3 rounded-full bg-white" />
        </div>
        <div>
          <div className="text-[15px] font-semibold">Clarity AI</div>
          <div className="text-xs font-semibold text-[var(--teal)]">
            ● Knows your report, plan, and goal
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

      {!hasMessages ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[var(--teal)] to-[var(--mint)] shadow-[0_12px_32px_rgba(14,159,119,.3)]">
            <div className="h-[22px] w-[22px] rounded-full bg-white" />
          </div>
          <div className="mb-1.5 text-[22px] font-semibold tracking-[-.02em]">
            Meet Clarity AI
          </div>
          <div className="mb-6 text-center text-[14.5px] text-[var(--muted)]">
            Ask anything about your report — answers use your real accounts.
          </div>
          <div className="grid w-full max-w-[520px] grid-cols-1 gap-2.5 sm:grid-cols-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
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
              <ChatBubble key={m.id} message={m} />
            ))}
            {isPending && !lastIsAssistant && (
              <div className="flex">
                <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-[13.5px] text-[var(--muted)]">
                  Clarity AI is thinking…
                </div>
              </div>
            )}
            {lastIsAssistant && (
              <div className="flex">
                <div className="w-[85%] max-w-[85%] rounded-2xl border border-[var(--border)] bg-white p-4">
                  <div className="mb-2.5 text-[11px] font-bold tracking-[.06em] text-[var(--teal)]">
                    SOURCES FROM YOUR REPORT
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SOURCE_CHIPS.map((chip) => (
                      <a
                        key={chip.label}
                        href={chip.href}
                        className="rounded-lg border border-[var(--border)] bg-[#f4f6f9] px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-[var(--teal)]"
                      >
                        {chip.label}
                      </a>
                    ))}
                  </div>
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
