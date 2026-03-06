# Training Chatbot Backend — Integration Guide

This document tells you everything you need to integrate the backend API into the **training-chatbot-frontend** repo at `/Users/uhcaa/Documents/GitHub/training-chatbot-frontend`.

---

## Backend Overview

This is a Next.js API backend that powers a multi-agent research pipeline using Google Gemini models and Vertex AI RAG. It exposes 4 API endpoints, all POST, all JSON, all with CORS support.

The backend runs on `http://localhost:3001` (or wherever deployed). The frontend must set `NEXT_PUBLIC_BACKEND_URL` (or similar env var) to point to it.

---

## API Endpoints

### 1. `POST /api/intent` — Intent Orchestrator (always called first)

Every user message goes through intent classification first. This is the gatekeeper.

**Request:**
```json
{
  "query": "user's message",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response — one of 4 actions:**

| `action` | Meaning | What to do in UI |
|----------|---------|-----------------|
| `"proceed"` | Query is valid, ready for search/research | Show confirmation prompt with `message` and `enrichedQuery`, then call the appropriate search endpoint |
| `"chat"` | Casual/conversational query (greeting, "what can you do", etc.) | Route directly to `/api/conversational` — no confirmation needed |
| `"clarify"` | Query is ambiguous | Display `message` as a yellow info banner, let user rephrase |
| `"reject"` | Off-topic query | Display `message` as a yellow info banner |

**Response shape:**
```json
{
  "action": "proceed" | "chat" | "clarify" | "reject",
  "enrichedQuery": "enhanced version of the query (only for proceed)",
  "message": "human-readable message to show the user",
  "logs": [LogEntry, ...]
}
```

### 2. `POST /api/conversational` — Simple Chat (no RAG)

For greetings, small talk, and capability questions. No document search.

**Request:** `{ "query": string, "conversationHistory": [...] }`
**Response:** `{ "answer": string, "logs": [LogEntry, ...] }`

### 3. `POST /api/quick-search` — Quick Search (Flash model)

Single-agent RAG search using `gemini-2.0-flash`. Fast responses.

**Request:** `{ "query": string, "context": string, "conversationHistory": [...] }`
- `context` is the `enrichedQuery` from the intent response

**Response:** `{ "answer": string, "logs": [LogEntry, ...] }`

### 4. `POST /api/quick-search-pro` — Extensive Thinking (Pro model)

Same as quick-search but uses `gemini-2.5-pro` for deeper reasoning.

**Request/Response:** Same shape as `/api/quick-search`

### 5. `POST /api/research` — Deep Research (SSE stream)

Multi-agent pipeline that returns a **Server-Sent Events stream**, not JSON. This is the most complex endpoint.

**Request:** `{ "query": string, "context": string, "conversationHistory": [...] }`

**SSE Events (in order):**

| Event | Data | Description |
|-------|------|-------------|
| `log` | `LogEntry` | Agent activity log (token usage, timing) |
| `step` | `{ field: "enrichedQuery", value: "..." }` | Step 1: Query Analyzer output |
| `step` | `{ field: "researchQuestions", value: "..." }` | Step 2: Question Expander output |
| `researchers_init` | `{ count: N, labels: ["topic1", ...] }` | Step 3 begins: N parallel researchers spawned |
| `researcher_done` | `{ index: 0, label: "topic", value: "findings..." }` | One researcher finished |
| `step` | `{ field: "sectionFindings", value: "..." }` | Intermediate (combined findings) |
| `step` | `{ field: "answer", value: "..." }` | Step 4: Final synthesized report |
| `done` | `{}` | Stream complete |
| `error` | `{ error: string, detail?: string }` | Pipeline failure |

---

## LogEntry Type

Every endpoint returns logs. The shape is:

```typescript
interface LogEntry {
  agent: string;        // e.g. "intent_orchestrator", "quick_search", "researcher_2"
  message: string;      // human-readable description
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  timestamp: number;    // epoch ms
  researcherIndex?: number; // only present for researcher agent logs during deep research
}
```

---

## Agentic Flow — Full Lifecycle of a Chat Message

```
User types message
       │
       ▼
  POST /api/intent  (intent orchestrator classifies the query)
       │
       ├─ action:"reject"  → show rejection message, stop
       ├─ action:"clarify" → show clarification message, stop
       ├─ action:"chat"    → POST /api/conversational → show answer
       └─ action:"proceed" → show confirmation prompt to user
                                    │
                                    ▼
                            User clicks "Yes, proceed"
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              mode:"quick"    mode:"quick-pro"  mode:"deep"
                    │               │               │
           POST /api/quick-search   │      POST /api/research (SSE)
                    │      POST /api/quick-search-pro  │
                    │               │               │
                    ▼               ▼               ▼
               Show answer     Show answer    Stream pipeline:
                                              1. Query Analyzer
                                              2. Question Expander
                                              3. Parallel Researchers (N agents)
                                              4. Final Report
```

---

## User-Facing Search Modes

The UI presents a toggle with these options:

| Internal mode | User-facing label | Description |
|--------------|-------------------|-------------|
| `"quick"` | **Quick Search** | Fast single-pass RAG with Flash model |
| `"quick-pro"` | **Extensive Thinking** | Same RAG but with Pro model (deeper reasoning) |
| `"deep"` | **Deep Research** | Full multi-agent pipeline with parallel researchers, SSE streaming, live progress |

**Deep Research is a toggle** — the user can turn it on/off. When off, the choice is between Quick Search and Extensive Thinking.

---

## Frontend Integration Plan for `/training-chatbot-frontend`

### What exists now
- The frontend has a chat UI with Sidebar, ChatMessage, ChatInput components
- It uses Tailwind CSS v4
- It currently calls a single `/api/research` endpoint via `lib/chat.ts:sendMessage()`
- It has `lib/types.ts` with `Message` and `ChatSession` types
- The chat page is at `app/chat/page.tsx`

### What needs to change

#### 1. Environment config
Add to `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

#### 2. Update `lib/types.ts` — add backend types
```typescript
// Existing types stay. Add:

export type SearchMode = "quick" | "quick-pro" | "deep";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LogEntry {
  agent: string;
  message: string;
  promptTokens: number;
  responseTokens: number;
  totalTokens: number;
  timestamp: number;
  researcherIndex?: number;
}

export interface DeepResearchResult {
  enrichedQuery: string;
  researchQuestions: string;
  sectionFindings: string;
  answer: string;
}

export type DeepStepKey = keyof DeepResearchResult;

export interface ResearcherState {
  label: string;
  findings: string;
  done: boolean;
}

export interface IntentResponse {
  action: "proceed" | "chat" | "clarify" | "reject";
  enrichedQuery?: string;
  message: string;
  logs?: LogEntry[];
}

export interface PendingConfirmation {
  query: string;
  enrichedQuery: string;
  message: string;
}
```

#### 3. Update `lib/chat.ts` — add API client functions

Replace the current `sendMessage` with proper API calls. All requests go to `NEXT_PUBLIC_BACKEND_URL`:

```typescript
const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function checkIntent(query: string, conversationHistory: ConversationMessage[]): Promise<IntentResponse> {
  const res = await fetch(`${BASE}/api/intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversationHistory }),
  });
  return res.json();
}

export async function fetchConversational(query: string, conversationHistory: ConversationMessage[]) {
  const res = await fetch(`${BASE}/api/conversational`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversationHistory }),
  });
  return res.json(); // { answer, logs }
}

export async function fetchQuickSearch(query: string, context: string, pro: boolean, conversationHistory: ConversationMessage[]) {
  const endpoint = pro ? "/api/quick-search-pro" : "/api/quick-search";
  const res = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, context, conversationHistory }),
  });
  return res.json(); // { answer, logs }
}

export async function streamDeepResearch(query: string, context: string, conversationHistory: ConversationMessage[], signal?: AbortSignal) {
  const res = await fetch(`${BASE}/api/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, context, conversationHistory }),
    signal,
  });
  return res; // caller reads the SSE stream from res.body
}
```

#### 4. Create `components/AgentLogPanel.tsx` — Slide-out log drawer

This component should:
- Render as a **right-side slide-out panel** triggered by a tab/button
- Show a terminal-style dark log view (`bg-[#1e1e1e]`, monospace font)
- Display each log entry with: `[timestamp] agent_name message [Xin/Yout = Z tokens]`
- Consolidate researcher logs (group by `researcherIndex`) into summary lines
- Show total token count in the header
- Auto-scroll to bottom as new logs arrive
- Be togglable open/closed

Key styling from the original `page.tsx` (lines 373-482):
- Background: `#1e1e1e`, text: `#d4d4d4`
- Header: `#2d2d2d` with `#569cd6` label
- Agent names: `#4ec9b0` (teal)
- Token counts: `#ce9178` (orange)
- Timestamps: `#808080` (gray)
- Font: `Menlo, Monaco, Courier New, monospace` at `0.75rem`

#### 5. Create `components/DeepResearchProgress.tsx` — Pipeline visualization

When Deep Research mode is active, show a stepped progress UI:
1. **Query Analyzer** — shows enrichedQuery when done
2. **Question Expander** — shows generated research questions
3. **Parallel Research** — shows N researchers with individual progress, expandable findings + per-researcher event logs
4. **Final Report** — the synthesized answer

Each step has states: inactive (gray), active/running (blue dot + "running..."), done (green checkmark, expandable).

Researchers are lettered (3a, 3b, 3c...) and individually expandable to show their findings and event logs.

#### 6. Create `components/SearchModeToggle.tsx` — Mode selector

A toggle bar with two options visible by default + a Deep Research toggle:
- **Quick Search** — default, uses Flash model
- **Extensive Thinking** — uses Pro model (like extended thinking)
- **Deep Research** — toggle on/off, enables the full multi-agent pipeline

When Deep Research is ON, the quick/extensive buttons are hidden (deep research uses both models internally).

#### 7. Create `components/IntentConfirmation.tsx` — Confirmation prompt

When intent returns `action: "proceed"`, show:
- The intent message (what the system understood)
- "Yes, proceed" button (blue/purple depending on mode)
- "No, let me rephrase" button

#### 8. Update `app/chat/page.tsx` — Wire it all together

The main flow in the chat page `handleSend`:

```
1. Call checkIntent(query, conversationHistory)
2. If action is "reject" or "clarify" → show message banner
3. If action is "chat" → call fetchConversational → add answer to messages
4. If action is "proceed" → show IntentConfirmation
   - On confirm: based on mode, call fetchQuickSearch or streamDeepResearch
   - For quick/extensive: add answer to messages, collect logs
   - For deep: read SSE stream, update DeepResearchProgress state, collect logs
5. All logs go to AgentLogPanel state
```

### SSE Stream Parsing (Deep Research)

This is the trickiest part. Here's the exact parsing logic from the backend page.tsx (lines 180-249):

```typescript
const reader = res.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() ?? "";

  let eventType = "";
  for (const line of lines) {
    if (line.startsWith("event: ")) {
      eventType = line.slice(7).trim();
    } else if (line.startsWith("data: ")) {
      const raw = line.slice(6);
      const payload = JSON.parse(raw);

      switch (eventType) {
        case "log":
          // Append to logs array
          break;
        case "step":
          // Update deepResult[payload.field] = payload.value
          // If field === "answer", that's the final answer — add to messages
          break;
        case "researchers_init":
          // Initialize N researcher slots: payload.labels (string[])
          break;
        case "researcher_done":
          // Mark researchers[payload.index] as done with payload.value as findings
          break;
        case "error":
          // Show error
          break;
      }
      eventType = "";
    }
  }
}
```

### Conversation History

Maintain a `ConversationMessage[]` array across messages within a session. After each successful response, append both the user query and assistant answer:
```typescript
conversationHistory.push(
  { role: "user", content: query },
  { role: "assistant", content: answer }
);
```

This gets sent with every API call so the backend has context.

---

## Key Implementation Notes

- The `/api/research` route uses **SSE (Server-Sent Events)**, NOT WebSockets. Parse it with `ReadableStream` reader, not `EventSource` (because it's a POST request).
- The intent check happens on EVERY message before any search. It acts as a guardrail.
- For `action: "proceed"`, the `enrichedQuery` from intent is passed as `context` to the search/research endpoints.
- Deep Research supports `AbortController` for cancellation — store a ref and call `abort()` if the user navigates away.
- All non-SSE endpoints return `{ logs: LogEntry[] }` alongside their main response data.
- The backend has CORS configured via `ALLOWED_ORIGINS` env var. Set it to include the frontend's origin for cross-origin requests.
- The backend runs on a different port (3001) than the frontend (3000) during local dev.
