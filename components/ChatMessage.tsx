import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "@/lib/types";

interface ChatMessageProps {
  message: Message;
}

/** Ensure blank lines before headings and bold-start lines so markdown parses spacing correctly. */
function normalizeSpacing(text: string): string {
  return text
    .replace(/\n(#{1,6}\s)/g, "\n\n$1")
    .replace(/\n(\*\*[A-Z])/g, "\n\n$1");
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
          ${isUser ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}
        `}
        aria-hidden="true"
      >
        {isUser ? "You" : "AI"}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}
      >
        <div
          className={`
            rounded-2xl text-sm leading-relaxed
            ${
              isUser
                ? "bg-blue-600 text-white rounded-tr-sm px-4 py-3"
                : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm px-5 py-4"
            }
          `}
        >
          {isUser ? (
            message.content
          ) : (
            <div className="chat-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {normalizeSpacing(message.content)}
              </ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-xs text-slate-400 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
