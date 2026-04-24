"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  RefreshCw,
  Trash2,
  ShieldAlert,
  ChevronDown,
  Flag,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  StoredSession,
  StoredMessage,
  ConversationMessage,
  LogEntry,
  DeepResearchResult,
  ResearcherState,
} from "@/lib/types";

function normalizeSpacing(text: string): string {
  return text
    .replace(/\n(#{1,6}\s)/g, "\n\n$1")
    .replace(/\n(\*\*[A-Z])/g, "\n\n$1");
}

function Markdown({ children }: { children: string }) {
  return (
    <div className="chat-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {normalizeSpacing(children)}
      </ReactMarkdown>
    </div>
  );
}

type AdminSessionSummary = StoredSession & { anonId: string };

interface SessionDetail {
  session: StoredSession;
  history: ConversationMessage[];
  logs: LogEntry[];
  research: {
    result: Partial<DeepResearchResult>;
    researchers: ResearcherState[];
  } | null;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateShort(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

const PAGE_SIZE = 50;
const ACK_KEY = "hmso_admin_convos_ack";

export default function AdminConversations() {
  const [sessions, setSessions] = useState<AdminSessionSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>("0");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [ackLoaded, setAckLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionsOpen, setActionsOpen] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const actionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!actionsOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(e.target as Node)
      ) {
        setActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [actionsOpen]);

  const toggleOne = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      const target = flaggedOnly
        ? sessions.filter((s) => s.messages?.some((m) => m.flagged))
        : sessions;
      if (prev.size === target.length && target.length > 0) {
        return new Set();
      }
      return new Set(target.map((s) => s.id));
    });
  }, [sessions, flaggedOnly]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAcknowledged(sessionStorage.getItem(ACK_KEY) === "true");
    }
    setAckLoaded(true);
  }, []);

  const acknowledge = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(ACK_KEY, "true");
    }
    setAcknowledged(true);
  };

  const fetchPage = useCallback(
    async (
      reqCursor: string,
      mode: "replace" | "append"
    ): Promise<void> => {
      if (mode === "replace") setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/admin/sessions?cursor=${encodeURIComponent(reqCursor)}&pageSize=${PAGE_SIZE}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to load sessions");
        const data: {
          sessions: AdminSessionSummary[];
          nextCursor: string | null;
        } = await res.json();

        const nonEmpty = data.sessions.filter(
          (s) => (s.messages?.length ?? 0) > 0
        );
        setSessions((prev) => {
          if (mode === "replace") return nonEmpty;
          // Dedupe by id when appending — same session could surface in
          // multiple SCAN windows.
          const seen = new Set(prev.map((s) => s.id));
          return [...prev, ...nonEmpty.filter((s) => !seen.has(s.id))];
        });
        setCursor(data.nextCursor);
      } catch {
        setError("Could not load sessions from Redis.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const refresh = useCallback(() => {
    setSessions([]);
    setCursor("0");
    fetchPage("0", "replace");
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!cursor || loadingMore) return;
    fetchPage(cursor, "append");
  }, [cursor, loadingMore, fetchPage]);

  const requestDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    setActionsOpen(false);
    setConfirmOpen(true);
  }, [selectedIds]);

  const performDeleteSelected = useCallback(async () => {
    setConfirmOpen(false);
    setDeletingSelected(true);
    setError(null);

    const targets = sessions.filter((s) => selectedIds.has(s.id));
    try {
      await Promise.all(
        targets.map((s) =>
          fetch(
            `/api/admin/sessions/${encodeURIComponent(s.id)}?anonId=${encodeURIComponent(s.anonId)}`,
            { method: "DELETE" }
          )
        )
      );
      setSessions((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
    } catch {
      setError("Some sessions failed to delete — refreshing.");
      refresh();
    } finally {
      setDeletingSelected(false);
    }
  }, [selectedIds, sessions, refresh]);

  useEffect(() => {
    fetchPage("0", "replace");
  }, [fetchPage]);

  const hasMore = cursor !== null;

  if (!ackLoaded) return null;

  if (!acknowledged) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-lg w-full bg-white border border-amber-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <ShieldAlert size={20} className="text-amber-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Sensitive data ahead
            </h3>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            This page exposes every chat session stored in Redis — including
            conversations, agent logs, and research output from{" "}
            <strong>other users</strong>.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            There is currently <strong>no authentication</strong> protecting
            this page. Only proceed if you are an authorized admin and you
            understand the privacy implications of viewing or deleting other
            users&apos; conversations.
          </p>

          <button
            onClick={acknowledge}
            className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            I understand — show conversations
          </button>
        </div>
      </div>
    );
  }

  const sessionHasFlag = (s: AdminSessionSummary): boolean =>
    !!s.messages?.some((m) => m.flagged);
  const visibleSessions = flaggedOnly
    ? sessions.filter(sessionHasFlag)
    : sessions;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          All Conversations
        </h2>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <span className="text-xs text-slate-500">
              {selectedIds.size} selected
            </span>
          )}
          <button
            onClick={() => setFlaggedOnly((v) => !v)}
            className={`flex items-center gap-1.5 text-xs transition-colors px-2 py-0.5 rounded-md border ${
              flaggedOnly
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
            title="Show only sessions with flagged AI responses"
          >
            <Flag
              size={12}
              fill={flaggedOnly ? "currentColor" : "none"}
            />
            Flagged
          </button>
          <button
            onClick={refresh}
            disabled={loading || loadingMore || deletingSelected}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* Actions dropdown */}
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setActionsOpen((v) => !v)}
              disabled={deletingSelected || sessions.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-40"
            >
              Actions
              <ChevronDown
                size={12}
                className={actionsOpen ? "rotate-180 transition-transform" : "transition-transform"}
              />
            </button>
            {actionsOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-20">
                <button
                  onClick={requestDeleteSelected}
                  disabled={selectedIds.size === 0 || deletingSelected}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:text-slate-300 disabled:hover:bg-transparent flex items-center gap-2"
                >
                  <Trash2 size={12} />
                  {deletingSelected
                    ? "Deleting..."
                    : `Delete selected${selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {!error && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {/* Header row with select-all */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/60">
            <input
              type="checkbox"
              aria-label="Select all"
              checked={
                visibleSessions.length > 0 &&
                selectedIds.size === visibleSessions.length
              }
              ref={(el) => {
                if (el)
                  el.indeterminate =
                    selectedIds.size > 0 &&
                    selectedIds.size < visibleSessions.length;
              }}
              onChange={toggleAll}
              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {flaggedOnly
                ? `Flagged (${visibleSessions.length})`
                : sessions.length > 0
                  ? `Conversations (${sessions.length}${hasMore ? "+" : ""})`
                  : "Conversations"}
            </span>
          </div>

          {loading && sessions.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-400">
              Loading sessions from Redis...
            </div>
          ) : visibleSessions.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-400">
              {flaggedOnly
                ? "No flagged sessions."
                : "No conversations stored yet."}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visibleSessions.map((s) => {
                const checked = selectedIds.has(s.id);
                const flagCount =
                  s.messages?.filter((m) => m.flagged).length ?? 0;
                return (
                  <li
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                      checked ? "bg-blue-50/40" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${s.title || "session"}`}
                      checked={checked}
                      onChange={() => toggleOne(s.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 truncate leading-tight flex items-center gap-1.5">
                        {flagCount > 0 && (
                          <Flag
                            size={11}
                            className="text-amber-500 shrink-0"
                            fill="currentColor"
                            aria-label={`${flagCount} flagged response${flagCount === 1 ? "" : "s"}`}
                          />
                        )}
                        <span className="truncate">
                          {s.title || "Untitled"}
                        </span>
                      </p>
                      <p
                        className="text-[10px] text-slate-400 truncate leading-tight mt-0.5"
                        title={s.lastMessage || ""}
                      >
                        <span className="font-mono" title={s.anonId}>
                          {s.anonId.slice(0, 8)}
                        </span>
                        {" · "}
                        {s.messages?.length ?? 0} msg
                        {flagCount > 0
                          ? ` · ${flagCount} flagged`
                          : ""}
                        {s.lastMessage ? ` · ${truncate(s.lastMessage, 50)}` : ""}
                      </p>
                    </div>
                    <span
                      className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap"
                      title={new Date(s.updatedAt).toLocaleString()}
                    >
                      {formatDateShort(s.updatedAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Load more */}
          {hasMore && sessions.length > 0 && (
            <div className="border-t border-slate-100 px-3 py-2 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-400 transition-colors"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}

      {selectedId && (
        <SessionDetailDrawer
          sessionId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}

      {confirmOpen && (
        <DeleteConfirmModal
          count={selectedIds.size}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={performDeleteSelected}
        />
      )}
    </div>
  );
}

function DeleteConfirmModal({
  count,
  onCancel,
  onConfirm,
}: {
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const ready = text.trim().toLowerCase() === "delete";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            Confirm delete
          </h3>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            You are about to permanently delete{" "}
            <strong>
              {count} {count === 1 ? "conversation" : "conversations"}
            </strong>
            . This cannot be undone.
          </p>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Type <span className="font-mono text-red-600">delete</span> to
            confirm
          </label>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && ready) onConfirm();
              if (e.key === "Escape") onCancel();
            }}
            placeholder="delete"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
          />
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!ready}
            className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionDetailDrawer({
  sessionId,
  onClose,
}: {
  sessionId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"messages" | "logs" | "research">(
    "messages"
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/sessions/${encodeURIComponent(sessionId)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to load session");
        const data: SessionDetail = await res.json();
        if (!cancelled) setDetail(data);
      } catch {
        if (!cancelled) setError("Could not load session detail.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white h-full flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Conversation
            </p>
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {detail?.session.title || "Loading..."}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 transition-colors p-1 rounded"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-5 gap-4">
          {(["messages", "logs", "research"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-medium uppercase tracking-wider py-3 border-b-2 transition-colors capitalize ${
                tab === t
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <p className="text-xs text-slate-400">Loading session detail...</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {detail && !loading && (
            <>
              {tab === "messages" && <MessagesView messages={detail.session.messages} />}
              {tab === "logs" && <LogsView logs={detail.logs} />}
              {tab === "research" && <ResearchView research={detail.research} />}
            </>
          )}
        </div>

        {/* Footer */}
        {detail && (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 space-y-0.5">
            <div>
              <span className="font-medium text-slate-600">Session ID:</span>{" "}
              <span className="font-mono">{detail.session.id}</span>
            </div>
            <div>
              <span className="font-medium text-slate-600">Updated:</span>{" "}
              {formatDate(detail.session.updatedAt)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessagesView({ messages }: { messages: StoredMessage[] }) {
  if (!messages || messages.length === 0) {
    return <p className="text-xs text-slate-400">No messages.</p>;
  }
  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`rounded-lg px-3 py-2.5 text-sm ${
            m.role === "user"
              ? "bg-blue-50 border border-blue-100 ml-8"
              : m.flagged
                ? "bg-amber-50 border border-amber-200 mr-8"
                : "bg-slate-50 border border-slate-200 mr-8"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              {m.role}
              {m.flagged && (
                <Flag
                  size={10}
                  className="text-amber-600"
                  fill="currentColor"
                  aria-label="flagged"
                />
              )}
            </span>
            <span className="text-[10px] text-slate-400">
              {formatDate(m.timestamp)}
            </span>
          </div>
          {m.role === "assistant" ? (
            <Markdown>{m.content}</Markdown>
          ) : (
            <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">
              {m.content}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function LogsView({ logs }: { logs: LogEntry[] }) {
  if (!logs || logs.length === 0) {
    return <p className="text-xs text-slate-400">No agent logs.</p>;
  }
  return (
    <div className="space-y-2">
      {logs.map((l, i) => (
        <div
          key={i}
          className="rounded-lg px-3 py-2 text-xs bg-slate-50 border border-slate-200 font-mono"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-700">{l.agent}</span>
            <span className="text-slate-400">
              {l.totalTokens} tok · {formatDate(l.timestamp)}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
            {l.message}
          </p>
        </div>
      ))}
    </div>
  );
}

function ResearchView({
  research,
}: {
  research: SessionDetail["research"];
}) {
  if (!research) {
    return (
      <p className="text-xs text-slate-400">
        No deep-research data for this session.
      </p>
    );
  }

  const fields: { key: keyof DeepResearchResult; label: string }[] = [
    { key: "enrichedQuery", label: "Enriched Query" },
    { key: "researchQuestions", label: "Research Questions" },
    { key: "sectionFindings", label: "Section Findings" },
    { key: "answer", label: "Answer" },
  ];

  return (
    <div className="space-y-4">
      {fields.map(({ key, label }) =>
        research.result[key] ? (
          <div key={key}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              {label}
            </p>
            <div className="rounded-lg px-3 py-2 text-xs bg-slate-50 border border-slate-200 whitespace-pre-wrap text-slate-700">
              {research.result[key]}
            </div>
          </div>
        ) : null
      )}
      {research.researchers.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Researchers
          </p>
          <div className="space-y-2">
            {research.researchers.map((r, i) => (
              <div
                key={i}
                className="rounded-lg px-3 py-2 text-xs bg-slate-50 border border-slate-200"
              >
                <p className="font-semibold text-slate-700 mb-1">
                  {r.label} {r.done ? "✓" : "…"}
                </p>
                <p className="whitespace-pre-wrap text-slate-600">
                  {r.findings || "(no findings)"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
