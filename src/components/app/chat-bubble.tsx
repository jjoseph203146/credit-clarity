import { cn } from "@/lib/utils";
import type { AiConversationSource } from "@/lib/supabase/types";

export interface ChatMessage {
  id: string;
  index: number;
  role: "user" | "assistant";
  text: string;
  sources?: AiConversationSource[];
  feedback?: "up" | "down" | null;
}

const FOLLOW_UPS = ["Explain this more simply", "Show me an example"];

interface ChatBubbleProps {
  message: ChatMessage;
  reportId: string;
  onFeedback: (index: number, feedback: "up" | "down") => void;
  onFollowUp: (prompt: string) => void;
}

export function ChatBubble({ message, reportId, onFeedback, onFollowUp }: ChatBubbleProps) {
  const isAi = message.role === "assistant";
  return (
    <div className={cn("flex flex-col", isAi ? "items-start" : "items-end")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3.5 text-sm leading-relaxed",
          isAi
            ? "rounded-bl-[5px] border border-[var(--border)] bg-white text-[#22354d]"
            : "rounded-br-[5px] bg-[var(--navy)] text-white",
        )}
      >
        {message.text}
      </div>

      {isAi && (message.sources?.length ?? 0) > 0 && (
        <div className="mt-2 flex max-w-[85%] flex-wrap gap-2">
          {message.sources!.map((s) => (
            <a
              key={`${s.type}-${s.id}`}
              href={`/reports/${reportId}#${s.type}-${s.id}`}
              className="rounded-lg border border-[var(--border)] bg-[#f4f6f9] px-2.5 py-1.5 text-xs font-semibold transition-colors hover:border-[var(--teal)]"
            >
              {s.label} →
            </a>
          ))}
        </div>
      )}

      {isAi && (
        <div className="mt-2 flex max-w-[85%] flex-wrap items-center gap-2">
          {FOLLOW_UPS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onFollowUp(prompt)}
              className="rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-[11.5px] font-semibold text-[var(--muted)] transition-colors hover:border-[var(--teal)] hover:text-[var(--teal)]"
            >
              {prompt}
            </button>
          ))}
          <span className="mx-1 h-3 w-px bg-[var(--border)]" />
          <button
            type="button"
            onClick={() => onFeedback(message.index, "up")}
            aria-label="Helpful"
            className={cn(
              "rounded-full px-1.5 py-1 text-[13px] transition-colors",
              message.feedback === "up" ? "text-[var(--teal)]" : "text-[#c7d2df] hover:text-[var(--teal)]",
            )}
          >
            👍
          </button>
          <button
            type="button"
            onClick={() => onFeedback(message.index, "down")}
            aria-label="Not helpful"
            className={cn(
              "rounded-full px-1.5 py-1 text-[13px] transition-colors",
              message.feedback === "down" ? "text-[#c23e3e]" : "text-[#c7d2df] hover:text-[#c23e3e]",
            )}
          >
            👎
          </button>
        </div>
      )}
    </div>
  );
}
