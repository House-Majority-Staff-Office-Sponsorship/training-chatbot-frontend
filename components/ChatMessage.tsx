import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Flag } from "lucide-react";
import { Message } from "@/lib/types";

interface ChatMessageProps {
  message: Message;
  onToggleFlag?: (id: string) => void;
  isTyping?: boolean;
  onTypingComplete?: () => void;
}

/** Reveal `content` word-by-word when `enabled` is true; otherwise show it all. */
function useTypingReveal(
  content: string,
  enabled: boolean,
  onDone?: () => void
): { shown: string; isAnimating: boolean } {
  const [shown, setShown] = useState(enabled ? "" : content);
  const [isAnimating, setIsAnimating] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setShown(content);
      setIsAnimating(false);
      return;
    }
    // Split keeping whitespace tokens so spacing/newlines render naturally.
    const tokens = content.split(/(\s+)/);
    let i = 0;
    setShown("");
    setIsAnimating(true);

    const id = window.setInterval(() => {
      // Reveal 2 tokens per tick (~ a word + its trailing whitespace) for
      // a snappier feel on long answers without losing the typing vibe.
      const next = tokens.slice(i, i + 2).join("");
      i += 2;
      if (!next) {
        window.clearInterval(id);
        setIsAnimating(false);
        onDone?.();
        return;
      }
      setShown((prev) => prev + next);
    }, 18);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, enabled]);

  return { shown, isAnimating };
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

function formatThinkingDuration(ms: number): string {
  const totalSec = Math.max(1, Math.round(ms / 1000));
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

export default function ChatMessage({
  message,
  onToggleFlag,
  isTyping = false,
  onTypingComplete,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const isFlagged = !!message.flagged;
  const animate = !isUser && isTyping;
  const { shown, isAnimating } = useTypingReveal(
    message.content,
    animate,
    onTypingComplete
  );
  const displayContent = isUser ? message.content : shown;

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
        className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1 group`}
      >
        {!isUser && message.thinkingMs && message.thinkingMs > 0 && (
          <span className="text-[11px] text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full self-start">
            Thought for {formatThinkingDuration(message.thinkingMs)}
          </span>
        )}
        <div
          className={`
            rounded-2xl text-sm leading-relaxed
            ${
              isUser
                ? "bg-blue-600 text-white rounded-tr-sm px-4 py-3"
                : `bg-white border ${isFlagged ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"} text-slate-800 rounded-tl-sm px-5 py-4`
            }
          `}
        >
          {isUser ? (
            displayContent
          ) : (
            <div className="chat-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {normalizeSpacing(displayContent)}
              </ReactMarkdown>
              {isAnimating && (
                <span className="inline-block w-1.5 h-4 -mb-0.5 ml-0.5 bg-slate-400 animate-pulse rounded-sm align-middle" />
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-slate-400">
            {formatTime(message.timestamp)}
          </span>
          {!isUser && onToggleFlag && (
            <button
              onClick={() => onToggleFlag(message.id)}
              title={
                isFlagged
                  ? "Unflag this response"
                  : "Flag this response for admin review"
              }
              aria-label={
                isFlagged ? "Unflag this response" : "Flag this response"
              }
              className={`text-[11px] font-medium flex items-center gap-1 px-2 py-0.5 rounded-full border transition-colors ${
                isFlagged
                  ? "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                  : "text-slate-500 bg-white border-slate-200 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50"
              }`}
            >
              <Flag size={11} fill={isFlagged ? "currentColor" : "none"} />
              {isFlagged ? "Flagged" : "Flag response"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
