"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import IntentConfirmation from "@/components/IntentConfirmation";
import AgentLogPanel from "@/components/AgentLogPanel";
import DeepResearchProgress from "@/components/DeepResearchProgress";
import DeepResearchPanel from "@/components/DeepResearchPanel";
import ChatTutorial from "@/components/ChatTutorial";
import {
  Message,
  SearchMode,
  PendingConfirmation,
} from "@/lib/types";
import {
  checkIntent,
  fetchConversational,
  fetchQuickSearch,
  fetchEscalationSearch,
  streamDeepResearch,
} from "@/lib/chat";
import { useSingleSession } from "@/hooks/useSessionPersistence";
import { useSessionListContext } from "@/contexts/SessionListContext";

export default function ChatSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { updateSessionInList } = useSessionListContext();

  const {
    session,
    sessionLoaded,
    addUserMessage,
    addAssistantMessage,
    getConversationHistory,
    appendToHistory,
    logs,
    setLogs,
    deepResult,
    setDeepResult,
    researchers,
    setResearchers,
    persistExtras,
  } = useSingleSession(sessionId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Search mode
  const [searchMode, setSearchMode] = useState<SearchMode>("quick");

  // Intent confirmation
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);

  // Escalation flow: satisfaction check after Flash answer
  const [satisfaction, setSatisfaction] = useState<"pending" | "satisfied" | "escalated" | null>(null);
  const [escalationContext, setEscalationContext] = useState<{ query: string; context: string; previousAnswer: string } | null>(null);

  // Agent log panel
  const [logPanelOpen, setLogPanelOpen] = useState(false);

  // Deep research UI state
  const [deepRunning, setDeepRunning] = useState(false);
  const [researchPanelOpen, setResearchPanelOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Wake the backend while the user reads / types so the first chat
  // request doesn't pay a cold-start penalty.
  useEffect(() => {
    fetch("/api/warmup", { cache: "no-store" }).catch(() => {});
  }, []);

  // Sync session title/lastMessage changes to the sidebar
  useEffect(() => {
    if (sessionLoaded) {
      updateSessionInList(sessionId, {
        title: session.title,
        lastMessage: session.lastMessage,
        updatedAt: session.updatedAt,
      });
    }
  }, [sessionLoaded, sessionId, session.title, session.lastMessage, session.updatedAt, updateSessionInList]);

  // Auto-open research panel if we loaded persisted research data
  useEffect(() => {
    if (sessionLoaded && researchers.length > 0 && !deepRunning) {
      setResearchPanelOpen(true);
    }
  }, [sessionLoaded, researchers.length, deepRunning]);

  // Auto-open log panel if we loaded persisted logs
  // Agent log panel stays closed unless the user opens it manually

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, pendingConfirmation, deepRunning, satisfaction]);

  const handleConfirm = useCallback(async () => {
    if (!pendingConfirmation) return;
    const { query, enrichedQuery } = pendingConfirmation;
    setPendingConfirmation(null);
    setLoading(true);
    setError(null);

    try {
      if (searchMode === "deep") {
        setDeepRunning(true);
        setDeepResult({});
        setResearchers([]);

        const controller = new AbortController();
        abortRef.current = controller;

        const history = getConversationHistory();
        const res = await streamDeepResearch(
          query,
          enrichedQuery,
          history,
          controller.signal
        );

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let eventType = "";

        function processLine(line: string) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const raw = line.slice(6);
            try {
              const payload = JSON.parse(raw);

              switch (eventType) {
                case "log":
                  setLogs((prev) => [...prev, payload]);
                  break;
                case "step":
                  setDeepResult((prev) => ({
                    ...prev,
                    [payload.field]: payload.value,
                  }));
                  if (payload.field === "answer") {
                    addAssistantMessage(payload.value);
                    appendToHistory("user", query);
                    appendToHistory("assistant", payload.value);
                  }
                  break;
                case "researchers_init":
                  setResearchers(
                    payload.labels.map((label: string) => ({
                      label,
                      findings: "",
                      done: false,
                    }))
                  );
                  break;
                case "researcher_done":
                  setResearchers((prev) =>
                    prev.map((r, i) =>
                      i === payload.index
                        ? { ...r, findings: payload.value, done: true }
                        : r
                    )
                  );
                  break;
                case "error":
                  setError(payload.error || "Deep research failed");
                  break;
              }
            } catch {
              // skip malformed JSON
            }
            eventType = "";
          }
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            processLine(line);
          }
        }

        // Process any remaining data left in the buffer
        if (buffer.trim()) {
          processLine(buffer);
        }

        setDeepRunning(false);
        setResearchPanelOpen(true);
        abortRef.current = null;

        // Delay persist so React renders first and refs sync via useEffect
        setTimeout(() => persistExtras(), 300);
      } else {
        const isPro = searchMode === "quick-pro";
        const history = getConversationHistory();
        const data = await fetchQuickSearch(
          query,
          enrichedQuery,
          isPro,
          history
        );
        addAssistantMessage(data.answer);
        appendToHistory("user", query);
        appendToHistory("assistant", data.answer);
        if (data.logs) {
          setLogs((prev) => [...prev, ...data.logs]);
          setTimeout(() => persistExtras(), 100);
        }
        // After a Flash (non-pro) search, show satisfaction check
        if (!isPro) {
          setSatisfaction("pending");
          setEscalationContext({ query, context: enrichedQuery, previousAnswer: data.answer });
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pendingConfirmation, searchMode, addAssistantMessage, appendToHistory, getConversationHistory, setLogs, setDeepResult, setResearchers, persistExtras]);

  async function handleSend(content: string) {
    if (loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    addUserMessage(userMessage);
    setLoading(true);
    setError(null);
    setInfoMessage(null);
    setSatisfaction(null);
    setEscalationContext(null);

    try {
      const history = getConversationHistory();
      const intent = await checkIntent(content, history);

      if (intent.logs) {
        setLogs((prev) => [...prev, ...intent.logs!]);
      }

      switch (intent.action) {
        case "reject":
        case "clarify":
          setInfoMessage(intent.message);
          setLoading(false);
          return;

        case "chat": {
          const chatHistory = getConversationHistory();
          const data = await fetchConversational(content, chatHistory);
          addAssistantMessage(data.answer);
          appendToHistory("user", content);
          appendToHistory("assistant", data.answer);
          if (data.logs) {
            setLogs((prev) => [...prev, ...data.logs]);
            setTimeout(() => persistExtras(), 100);
          }
          setLoading(false);
          return;
        }

        case "confirm": {
          const enrichedQuery = intent.enrichedQuery ?? content;
          if (searchMode === "deep") {
            setDeepRunning(true);
            setDeepResult({});
            setResearchers([]);
            const controller = new AbortController();
            abortRef.current = controller;
            const history = getConversationHistory();
            const res = await streamDeepResearch(content, enrichedQuery, history, controller.signal);
            const reader = res.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let eventType = "";
            function processLine(line: string) {
              if (line.startsWith("event: ")) {
                eventType = line.slice(7).trim();
              } else if (line.startsWith("data: ")) {
                try {
                  const payload = JSON.parse(line.slice(6));
                  switch (eventType) {
                    case "log": setLogs((prev) => [...prev, payload]); break;
                    case "step":
                      setDeepResult((prev) => ({ ...prev, [payload.field]: payload.value }));
                      if (payload.field === "answer") {
                        addAssistantMessage(payload.value);
                        appendToHistory("user", content);
                        appendToHistory("assistant", payload.value);
                      }
                      break;
                    case "researchers_init":
                      setResearchers(payload.labels.map((label: string) => ({ label, findings: "", done: false })));
                      break;
                    case "researcher_done":
                      setResearchers((prev) => prev.map((r, i) => i === payload.index ? { ...r, findings: payload.value, done: true } : r));
                      break;
                    case "error": setError(payload.error || "Deep research failed"); break;
                  }
                } catch { /* skip */ }
                eventType = "";
              }
            }
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";
              for (const l of lines) processLine(l);
            }
            if (buffer.trim()) processLine(buffer);
            setDeepRunning(false);
            setResearchPanelOpen(true);
            abortRef.current = null;
            setTimeout(() => persistExtras(), 300);
          } else {
            const isPro = searchMode === "quick-pro";
            const history = getConversationHistory();
            const data = await fetchQuickSearch(content, enrichedQuery, isPro, history);
            addAssistantMessage(data.answer);
            appendToHistory("user", content);
            appendToHistory("assistant", data.answer);
            if (data.logs) {
              setLogs((prev) => [...prev, ...data.logs]);
              setTimeout(() => persistExtras(), 100);
            }
            if (!isPro) {
              setSatisfaction("pending");
              setEscalationContext({ query: content, context: enrichedQuery, previousAnswer: data.answer });
            }
          }
          setLoading(false);
          return;
        }

        default:
          setLoading(false);
          return;
      }
    } catch {
      setError(
        "The assistant is unavailable right now. Please try again later."
      );
      setLoading(false);
    }
  }

  const handleEscalate = useCallback(async () => {
    if (!escalationContext) return;
    setSatisfaction("escalated");
    setLoading(true);
    setError(null);
    try {
      const history = getConversationHistory();
      const data = await fetchEscalationSearch(
        escalationContext.query,
        escalationContext.context,
        escalationContext.previousAnswer,
        history
      );
      addAssistantMessage(data.answer);
      appendToHistory("assistant", data.answer);
      if (data.logs) {
        setLogs((prev) => [...prev, ...data.logs]);
        setTimeout(() => persistExtras(), 100);
      }
    } catch {
      setError("Deeper search failed. Please try again.");
    } finally {
      setLoading(false);
      setEscalationContext(null);
    }
  }, [escalationContext, getConversationHistory, addAssistantMessage, appendToHistory, setLogs, persistExtras]);

  function handleCancelConfirmation() {
    setPendingConfirmation(null);
  }

  if (!sessionLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-sm text-slate-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main area */}
      <div className="relative flex flex-col flex-1 min-w-0">
        {/* Floating title bar */}
        {session.messages.length > 0 && (
          <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
            <div className="bg-gradient-to-b from-slate-50 from-60% to-transparent pb-6 pt-3 pointer-events-auto">
              <div className="px-4">
                <h1 className="text-sm font-medium text-slate-500 truncate">
                  {session.title}
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pb-44">
          <div className="max-w-3xl mx-auto px-4 py-6 pt-12 space-y-6">
            {session.messages.length === 0 &&
            !pendingConfirmation &&
            !deepRunning ? (
              <EmptyState onSuggestionClick={handleSend} />
            ) : (
              <>
                {session.messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {deepRunning && (
                  <DeepResearchProgress
                    result={deepResult}
                    researchers={researchers}
                    isRunning={deepRunning}
                  />
                )}
              </>
            )}

            {/* Info message (clarify/reject) */}
            {infoMessage && (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                {infoMessage}
              </div>
            )}


            {/* Satisfaction check — compact, tucked under the AI response */}
            {satisfaction === "pending" && !loading && (
              <div className="flex gap-3">
                <div className="w-8 flex-shrink-0" />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Did this help?</span>
                  <button
                    onClick={() => { setSatisfaction("satisfied"); setEscalationContext(null); }}
                    className="px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleEscalate}
                    className="px-2.5 py-1 rounded-full border border-cyan-200 text-cyan-700 hover:bg-cyan-50 transition-colors"
                  >
                    Search deeper
                  </button>
                </div>
              </div>
            )}

            {/* Escalation in progress */}
            {satisfaction === "escalated" && loading && (
              <div className="flex gap-3">
                <div className="w-8 flex-shrink-0" />
                <span className="text-xs text-cyan-600">Searching deeper with Pro model...</span>
              </div>
            )}

            {/* Loading indicator with timer */}
            {loading && !deepRunning && satisfaction !== "escalated" && <ThinkingIndicator />}

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Floating input */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <div className="bg-gradient-to-t from-slate-50 from-60% to-transparent pt-8 pb-4 pointer-events-auto">
            <div className="max-w-3xl mx-auto px-4">
              <ChatInput
                onSend={handleSend}
                disabled={loading}
                searchMode={searchMode}
                onSearchModeChange={setSearchMode}
              />
              <p className="text-center text-xs text-slate-400 mt-2">
                Sponsored by the House of Majority Staff Office (HMSO)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Research Panel */}
      <DeepResearchPanel
        result={deepResult}
        researchers={researchers}
        isRunning={deepRunning}
        isOpen={researchPanelOpen}
        onToggle={() => setResearchPanelOpen((v) => !v)}
      />

      {/* Agent Log Panel */}
      <AgentLogPanel
        logs={logs}
        isOpen={logPanelOpen}
        onToggle={() => setLogPanelOpen((v) => !v)}
      />

      {/* First-time tutorial */}
      <ChatTutorial />
    </>
  );
}

function ThinkingIndicator() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const label = elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
        AI
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
          <span className="text-xs text-slate-400 font-mono tabular-nums">{label}</span>
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
    <div className="flex flex-col items-center justify-center py-16 text-center" data-tutorial="empty-state">
      <Image
        src="/logo.png"
        alt="House Training Assistant"
        width={64}
        height={64}
        className="object-contain mb-4"
      />
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        How can I help you today?
      </h2>
      <p className="text-sm text-slate-500 mb-8 max-w-sm">
        Ask me anything about House procedures, ethics rules, staff policies, or
        training materials.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg" data-tutorial="suggestion-cards">
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
