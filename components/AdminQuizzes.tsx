"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  X,
  RefreshCw,
  Trash2,
  ChevronDown,
  CheckCircle,
  Circle,
} from "lucide-react";
import { QuizQuestion } from "@/lib/quiz";

interface StoredQuiz {
  id: string;
  title: string;
  topic: string;
  questions: QuizQuestion[];
  completed: boolean;
  score: number | null;
  answers: number[];
  createdAt: number;
  updatedAt: number;
}

type AdminQuizSummary = StoredQuiz & { anonId: string };

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

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<AdminQuizSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>("0");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionsOpen, setActionsOpen] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
      if (prev.size === quizzes.length && quizzes.length > 0) {
        return new Set();
      }
      return new Set(quizzes.map((q) => q.id));
    });
  }, [quizzes]);

  const fetchPage = useCallback(
    async (reqCursor: string, mode: "replace" | "append"): Promise<void> => {
      if (mode === "replace") setLoading(true);
      else setLoadingMore(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/admin/quizzes?cursor=${encodeURIComponent(reqCursor)}&pageSize=${PAGE_SIZE}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to load quizzes");
        const data: {
          quizzes: AdminQuizSummary[];
          nextCursor: string | null;
        } = await res.json();

        setQuizzes((prev) => {
          if (mode === "replace") return data.quizzes;
          const seen = new Set(prev.map((q) => q.id));
          return [...prev, ...data.quizzes.filter((q) => !seen.has(q.id))];
        });
        setCursor(data.nextCursor);
      } catch {
        setError("Could not load quizzes from Redis.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const refresh = useCallback(() => {
    setQuizzes([]);
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

    const targets = quizzes.filter((q) => selectedIds.has(q.id));
    try {
      await Promise.all(
        targets.map((q) =>
          fetch(
            `/api/admin/quizzes/${encodeURIComponent(q.id)}?anonId=${encodeURIComponent(q.anonId)}`,
            { method: "DELETE" }
          )
        )
      );
      setQuizzes((prev) => prev.filter((q) => !selectedIds.has(q.id)));
      setSelectedIds(new Set());
    } catch {
      setError("Some quizzes failed to delete — refreshing.");
      refresh();
    } finally {
      setDeletingSelected(false);
    }
  }, [selectedIds, quizzes, refresh]);

  useEffect(() => {
    fetchPage("0", "replace");
  }, [fetchPage]);

  const hasMore = cursor !== null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          All Quizzes
        </h2>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <span className="text-xs text-slate-500">
              {selectedIds.size} selected
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading || loadingMore || deletingSelected}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setActionsOpen((v) => !v)}
              disabled={deletingSelected || quizzes.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-md transition-colors disabled:opacity-40"
            >
              Actions
              <ChevronDown
                size={12}
                className={
                  actionsOpen
                    ? "rotate-180 transition-transform"
                    : "transition-transform"
                }
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
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50/60">
            <input
              type="checkbox"
              aria-label="Select all"
              checked={
                quizzes.length > 0 && selectedIds.size === quizzes.length
              }
              ref={(el) => {
                if (el)
                  el.indeterminate =
                    selectedIds.size > 0 && selectedIds.size < quizzes.length;
              }}
              onChange={toggleAll}
              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              {quizzes.length > 0
                ? `Quizzes (${quizzes.length}${hasMore ? "+" : ""})`
                : "Quizzes"}
            </span>
          </div>

          {loading && quizzes.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-400">
              Loading quizzes from Redis...
            </div>
          ) : quizzes.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-400">
              No quizzes stored yet.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {quizzes.map((q) => {
                const checked = selectedIds.has(q.id);
                const total = q.questions?.length ?? 0;
                const scoreLabel = q.completed
                  ? `${q.score ?? 0}/${total}`
                  : `${q.answers?.length ?? 0}/${total} answered`;
                return (
                  <li
                    key={q.id}
                    onClick={() => setSelectedId(q.id)}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                      checked ? "bg-blue-50/40" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${q.title || "quiz"}`}
                      checked={checked}
                      onChange={() => toggleOne(q.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 truncate leading-tight flex items-center gap-1.5">
                        {q.completed ? (
                          <CheckCircle
                            size={11}
                            className="text-green-500 shrink-0"
                          />
                        ) : (
                          <Circle
                            size={11}
                            className="text-slate-300 shrink-0"
                          />
                        )}
                        <span className="truncate">
                          {q.title || "Untitled quiz"}
                        </span>
                      </p>
                      <p
                        className="text-[10px] text-slate-400 truncate leading-tight mt-0.5"
                        title={q.topic || ""}
                      >
                        <span className="font-mono" title={q.anonId}>
                          {q.anonId.slice(0, 8)}
                        </span>
                        {" · "}
                        {scoreLabel}
                        {q.topic ? ` · ${truncate(q.topic, 50)}` : ""}
                      </p>
                    </div>
                    <span
                      className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap"
                      title={new Date(q.updatedAt).toLocaleString()}
                    >
                      {formatDateShort(q.updatedAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {hasMore && quizzes.length > 0 && (
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
        <QuizDetailDrawer
          quizId={selectedId}
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

function QuizDetailDrawer({
  quizId,
  onClose,
}: {
  quizId: string;
  onClose: () => void;
}) {
  const [quiz, setQuiz] = useState<StoredQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/quizzes/${encodeURIComponent(quizId)}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to load quiz");
        const data: { quiz: StoredQuiz } = await res.json();
        if (!cancelled) setQuiz(data.quiz);
      } catch {
        if (!cancelled) setError("Could not load quiz detail.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white h-full flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Quiz
            </p>
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {quiz?.title || "Loading..."}
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

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading && (
            <p className="text-xs text-slate-400">Loading quiz detail...</p>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {quiz && !loading && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Stat label="Topic" value={quiz.topic || "—"} />
                <Stat
                  label="Status"
                  value={quiz.completed ? "Completed" : "In progress"}
                />
                <Stat
                  label="Score"
                  value={
                    quiz.completed
                      ? `${quiz.score ?? 0} / ${quiz.questions.length}`
                      : "—"
                  }
                />
                <Stat
                  label="Answered"
                  value={`${quiz.answers?.length ?? 0} / ${quiz.questions.length}`}
                />
              </div>

              <div className="space-y-3">
                {quiz.questions.map((question, idx) => {
                  const userAnswer = quiz.answers?.[idx];
                  const answered = typeof userAnswer === "number";
                  const isCorrect = answered && userAnswer === question.correct;
                  return (
                    <div
                      key={question.id ?? idx}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-xs font-semibold text-slate-500 mb-1">
                        Question {idx + 1}
                        {answered && (
                          <span
                            className={`ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              isCorrect
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-900 mb-2">
                        {question.question}
                      </p>
                      <ul className="space-y-1">
                        {question.options.map((opt, i) => {
                          const isUser = answered && userAnswer === i;
                          const isCorrectOpt = i === question.correct;
                          return (
                            <li
                              key={i}
                              className={`text-xs px-2 py-1 rounded border flex items-center gap-2 ${
                                isCorrectOpt
                                  ? "border-green-300 bg-green-50 text-green-800"
                                  : isUser
                                    ? "border-red-300 bg-red-50 text-red-800"
                                    : "border-slate-200 bg-white text-slate-600"
                              }`}
                            >
                              <span className="font-mono text-[10px] uppercase">
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className="flex-1">{opt}</span>
                              {isCorrectOpt && (
                                <span className="text-[10px] font-semibold">
                                  ✓ correct
                                </span>
                              )}
                              {isUser && !isCorrectOpt && (
                                <span className="text-[10px] font-semibold">
                                  user pick
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      {question.source && (
                        <p className="text-[10px] text-slate-400 mt-2">
                          Source: {question.source}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {quiz && (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 space-y-0.5">
            <div>
              <span className="font-medium text-slate-600">Quiz ID:</span>{" "}
              <span className="font-mono">{quiz.id}</span>
            </div>
            <div>
              <span className="font-medium text-slate-600">Created:</span>{" "}
              {formatDate(quiz.createdAt)}
            </div>
            <div>
              <span className="font-medium text-slate-600">Updated:</span>{" "}
              {formatDate(quiz.updatedAt)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="text-sm text-slate-900 truncate">{value}</p>
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
              {count} {count === 1 ? "quiz" : "quizzes"}
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
