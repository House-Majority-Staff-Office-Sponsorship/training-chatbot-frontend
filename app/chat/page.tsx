"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import { ChatSession, Message } from "@/lib/types";
import { MOCK_SESSIONS, createEmptySession, sendMessage } from "@/lib/chat";

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_SESSIONS);
  const [activeId, setActiveId] = useState<string>(MOCK_SESSIONS[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeId)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  function handleSelectSession(id: string) {
    setActiveId(id);
    setError(null);
    // Close sidebar on mobile after selection
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setSidebarOpen(false);
  }

  function handleNewChat() {
    const id = `session-${Date.now()}`;
    const newSession = createEmptySession(id);
    setSessions((prev) => [newSession, ...prev]);
    setActiveId(id);
    setError(null);
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setSidebarOpen(false);
  }

  async function handleSend(content: string) {
    if (loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeId) return s;
        const isFirst = s.messages.length === 0;
        return {
          ...s,
          title: isFirst ? content.slice(0, 50) : s.title,
          lastMessage: content,
          updatedAt: new Date(),
          messages: [...s.messages, userMessage],
        };
      })
    );

    setLoading(true);
    setError(null);

    try {
      const assistantMessage = await sendMessage(activeId, content);
      setSessions((prev) =>
        prev.map((s) =>
          s.id !== activeId
            ? s
            : { ...s, messages: [...s.messages, assistantMessage] }
        )
      );
    } catch {
      setError(
        "The assistant is unavailable right now. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        mode="chat"
        sessions={sessions}
        activeSessionId={activeId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-slate-900 truncate">
              {activeSession?.title ?? "New conversation"}
            </h1>
          </div>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors hidden sm:block"
          >
            Home
          </Link>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {activeSession?.messages.length === 0 ? (
              <EmptyState onSuggestionClick={handleSend} />
            ) : (
              activeSession.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
                  AI
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5 items-center h-5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <ChatInput onSend={handleSend} disabled={loading} />
            <p className="text-center text-xs text-slate-400 mt-2">
              Responses are generated by AI and may require verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "What are the gift rules for House staff?",
  "Summarize the floor amendment process.",
  "What is required for new staff onboarding?",
  "Explain the role of the Committee on Ethics.",
];

function EmptyState({
  onSuggestionClick,
}: {
  onSuggestionClick: (text: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        How can I help you today?
      </h2>
      <p className="text-sm text-slate-500 mb-8 max-w-sm">
        Ask me anything about House procedures, ethics rules, staff policies, or
        training materials.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestionClick(s)}
            className="text-left text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
