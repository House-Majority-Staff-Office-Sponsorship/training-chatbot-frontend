"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChatSession,
  Message,
  ConversationMessage,
  LogEntry,
  DeepResearchResult,
  ResearcherState,
  StoredSession,
  fromStoredSession,
  toStoredSession,
} from "@/lib/types";

// ── Persistence helpers (fire-and-forget) ──

function persistCreate(id: string, title: string) {
  fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, title }),
  }).catch((err) => console.error("Failed to persist new session:", err));
}

interface PersistExtras {
  conversationHistory?: ConversationMessage[];
  logs?: LogEntry[];
  deepResearch?: {
    result: Partial<DeepResearchResult>;
    researchers: ResearcherState[];
  };
}

function persistUpdate(
  sessionId: string,
  session: ChatSession,
  extras?: PersistExtras
) {
  const stored = toStoredSession(session);
  fetch(`/api/sessions/${encodeURIComponent(sessionId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: stored.title,
      lastMessage: stored.lastMessage,
      updatedAt: stored.updatedAt,
      messages: stored.messages,
      ...(extras?.conversationHistory ? { conversationHistory: extras.conversationHistory } : {}),
      ...(extras?.logs ? { logs: extras.logs } : {}),
      ...(extras?.deepResearch ? { deepResearch: extras.deepResearch } : {}),
    }),
  }).catch((err) => console.error("Failed to persist session update:", err));
}

function persistDelete(sessionId: string) {
  fetch(`/api/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  }).catch((err) => console.error("Failed to persist session delete:", err));
}

function makeEmptySession(id: string): ChatSession {
  return {
    id,
    title: "New conversation",
    lastMessage: "",
    updatedAt: new Date(),
    messages: [],
  };
}

// ── Hook: session list (for sidebar) ──

export function useSessionList() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/sessions");
        if (!res.ok) throw new Error("Failed to load sessions");
        const data: { sessions: StoredSession[] } = await res.json();
        if (cancelled) return;
        setSessions(data.sessions.map(fromStoredSession));
      } catch (err) {
        console.error("Failed to load sessions from Redis:", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const createSession = useCallback((): string => {
    const id = `session-${Date.now()}`;
    const newSession = makeEmptySession(id);
    setSessions((prev) => [newSession, ...prev]);
    persistCreate(id, newSession.title);
    return id;
  }, []);

  const deleteSession = useCallback((sessionId: string): string | null => {
    let nextId: string | null = null;
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length > 0) {
        nextId = filtered[0].id;
      }
      return filtered;
    });
    persistDelete(sessionId);
    return nextId;
  }, []);

  const updateSessionInList = useCallback(
    (sessionId: string, patch: Partial<ChatSession>) => {
      setSessions((prev) => {
        const exists = prev.some((s) => s.id === sessionId);
        if (exists) {
          return prev.map((s) => (s.id === sessionId ? { ...s, ...patch } : s));
        }
        // Session not in list (e.g. created before sidebar loaded) — add it
        return [{ ...makeEmptySession(sessionId), ...patch }, ...prev];
      });
    },
    []
  );

  return { sessions, loaded, createSession, deleteSession, updateSessionInList };
}

// ── Hook: single session (for the chat page) ──

export function useSingleSession(sessionId: string) {
  const [session, setSession] = useState<ChatSession>(makeEmptySession(sessionId));
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const historyCache = useRef<ConversationMessage[]>([]);

  // Logs and deep research state — persisted to Redis
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deepResult, setDeepResult] = useState<Partial<DeepResearchResult>>({});
  const [researchers, setResearchers] = useState<ResearcherState[]>([]);

  // Refs for fire-and-forget persistence (so we always have the latest values)
  const logsRef = useRef<LogEntry[]>([]);
  const deepResultRef = useRef<Partial<DeepResearchResult>>({});
  const researchersRef = useRef<ResearcherState[]>([]);

  // Keep refs in sync with state
  useEffect(() => { logsRef.current = logs; }, [logs]);
  useEffect(() => { deepResultRef.current = deepResult; }, [deepResult]);
  useEffect(() => { researchersRef.current = researchers; }, [researchers]);

  // Load session data + history + logs + research from Redis on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sessionsRes, extrasRes] = await Promise.all([
          fetch("/api/sessions"),
          fetch(`/api/sessions/${encodeURIComponent(sessionId)}/history`),
        ]);

        if (cancelled) return;

        if (sessionsRes.ok) {
          const data: { sessions: StoredSession[] } = await sessionsRes.json();
          const found = data.sessions.find((s) => s.id === sessionId);
          if (found) {
            setSession(fromStoredSession(found));
          }
        }

        if (extrasRes.ok) {
          const data = await extrasRes.json();
          if (data.history) {
            historyCache.current = data.history;
          }
          if (data.logs && data.logs.length > 0) {
            setLogs(data.logs);
          }
          if (data.research) {
            if (data.research.result && Object.keys(data.research.result).length > 0) {
              setDeepResult(data.research.result);
            }
            if (data.research.researchers && data.research.researchers.length > 0) {
              setResearchers(data.research.researchers);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load session:", err);
      } finally {
        if (!cancelled) setSessionLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  const addUserMessage = useCallback(
    (message: Message) => {
      setSession((prev) => {
        const isFirst = prev.messages.length === 0;
        return {
          ...prev,
          title: isFirst ? message.content.slice(0, 50) : prev.title,
          lastMessage: message.content,
          updatedAt: new Date(),
          messages: [...prev.messages, message],
        };
      });
    },
    []
  );

  /** Add an assistant message and persist everything to Redis. */
  const addAssistantMessage = useCallback(
    (content: string): Message => {
      const msg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        timestamp: new Date(),
      };
      setSession((prev) => {
        const updated = {
          ...prev,
          messages: [...prev.messages, msg],
          updatedAt: new Date(),
        };
        // Persist the full session + all extras
        persistUpdate(sessionId, updated, {
          conversationHistory: historyCache.current,
          logs: logsRef.current,
          deepResearch: researchersRef.current.length > 0
            ? { result: deepResultRef.current, researchers: researchersRef.current }
            : undefined,
        });
        return updated;
      });
      return msg;
    },
    [sessionId]
  );

  /** Toggle the flagged state on a single assistant message and persist. */
  const toggleFlag = useCallback(
    (messageId: string) => {
      setSession((prev) => {
        const updated = {
          ...prev,
          messages: prev.messages.map((m) =>
            m.id === messageId ? { ...m, flagged: !m.flagged } : m
          ),
          updatedAt: new Date(),
        };
        persistUpdate(sessionId, updated, {
          conversationHistory: historyCache.current,
          logs: logsRef.current,
          deepResearch: researchersRef.current.length > 0
            ? { result: deepResultRef.current, researchers: researchersRef.current }
            : undefined,
        });
        return updated;
      });
    },
    [sessionId]
  );

  /** Persist logs + research after deep research or quick search completes. */
  const persistExtras = useCallback(() => {
    setSession((prev) => {
      persistUpdate(sessionId, prev, {
        conversationHistory: historyCache.current,
        logs: logsRef.current,
        deepResearch: researchersRef.current.length > 0
          ? { result: deepResultRef.current, researchers: researchersRef.current }
          : undefined,
      });
      return prev; // no state change, just using the updater for latest `prev`
    });
  }, [sessionId]);

  const getConversationHistory = useCallback(
    (): ConversationMessage[] => historyCache.current,
    []
  );

  const appendToHistory = useCallback(
    (role: "user" | "assistant", content: string) => {
      historyCache.current.push({ role, content });
    },
    []
  );

  return {
    session,
    setSession,
    sessionLoaded,
    addUserMessage,
    addAssistantMessage,
    toggleFlag,
    getConversationHistory,
    appendToHistory,
    // Logs
    logs,
    setLogs,
    // Deep research
    deepResult,
    setDeepResult,
    researchers,
    setResearchers,
    // Manual persist trigger
    persistExtras,
  };
}
