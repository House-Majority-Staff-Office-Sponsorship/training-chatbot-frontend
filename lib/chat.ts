import { ChatSession, ConversationMessage, IntentResponse } from "./types";

export function createEmptySession(id: string): ChatSession {
  return {
    id,
    title: "New conversation",
    lastMessage: "",
    updatedAt: new Date(),
    messages: [],
  };
}

export async function checkIntent(
  query: string,
  conversationHistory: ConversationMessage[]
): Promise<IntentResponse> {
  const res = await fetch("/api/intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversationHistory }),
  });
  if (!res.ok) throw new Error(`Intent check failed: ${res.status}`);
  return res.json();
}

export async function fetchConversational(
  query: string,
  conversationHistory: ConversationMessage[]
): Promise<{ answer: string; logs: import("./types").LogEntry[] }> {
  const res = await fetch("/api/conversational", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversationHistory }),
  });
  if (!res.ok) throw new Error(`Conversational failed: ${res.status}`);
  return res.json();
}

export async function fetchQuickSearch(
  query: string,
  context: string,
  pro: boolean,
  conversationHistory: ConversationMessage[]
): Promise<{ answer: string; logs: import("./types").LogEntry[] }> {
  const endpoint = pro ? "/api/quick-search-pro" : "/api/quick-search";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, context, conversationHistory }),
  });
  if (!res.ok) throw new Error(`Quick search failed: ${res.status}`);
  return res.json();
}

export async function fetchEscalationSearch(
  query: string,
  context: string,
  previousAnswer: string,
  conversationHistory: ConversationMessage[]
): Promise<{ answer: string; logs: import("./types").LogEntry[] }> {
  const res = await fetch("/api/search-escalate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, context, previousAnswer, conversationHistory }),
  });
  if (!res.ok) throw new Error(`Escalation search failed: ${res.status}`);
  return res.json();
}

export async function streamDeepResearch(
  query: string,
  context: string,
  conversationHistory: ConversationMessage[],
  signal?: AbortSignal
): Promise<Response> {
  const res = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, context, conversationHistory }),
    signal,
  });
  if (!res.ok) throw new Error(`Deep research failed: ${res.status}`);
  return res;
}
