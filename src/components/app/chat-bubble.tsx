import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isAi = message.role === "assistant";
  return (
    <div className={cn("flex", isAi ? "justify-start" : "justify-end")}>
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
    </div>
  );
}
