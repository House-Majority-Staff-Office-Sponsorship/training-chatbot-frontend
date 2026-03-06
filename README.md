# Training Chatbot Frontend

A Next.js frontend for the House Majority Staff Office training chatbot. Features a landing page, multi-mode AI chat interface with intent classification, deep research with live SSE streaming, and persistent sessions via Upstash Redis.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, TypeScript) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Runtime | React 19 |
| Session Storage | [Upstash Redis](https://upstash.com/) |
| Markdown | react-markdown + remark-gfm |

---

## Project Structure

```
training-chatbot-frontend/
├── app/
│   ├── layout.tsx                        # Root layout (fonts, metadata)
│   ├── page.tsx                          # Landing / hero page
│   ├── globals.css                       # Global Tailwind styles
│   ├── api/
│   │   ├── intent/route.ts              # Proxy → backend /api/intent
│   │   ├── conversational/route.ts      # Proxy → backend /api/conversational
│   │   ├── quick-search/route.ts        # Proxy → backend /api/quick-search
│   │   ├── quick-search-pro/route.ts    # Proxy → backend /api/quick-search-pro
│   │   ├── research/route.ts            # Proxy → backend /api/research (SSE stream)
│   │   └── sessions/
│   │       ├── route.ts                 # GET list / POST create sessions
│   │       └── [id]/
│   │           ├── route.ts             # PUT update / DELETE session
│   │           └── history/route.ts     # GET conversation history + logs + research
│   └── chat/
│       ├── layout.tsx                   # Shared sidebar + session list provider
│       ├── page.tsx                     # Redirect to most recent (or new) session
│       └── [sessionId]/page.tsx         # Chat UI for a single session
├── components/
│   ├── Sidebar.tsx                      # Session list panel with delete
│   ├── ChatMessage.tsx                  # User/assistant message bubbles (markdown)
│   ├── ChatInput.tsx                    # Textarea with search mode toggle
│   ├── IntentConfirmation.tsx           # Confirmation prompt after intent check
│   ├── AgentLogPanel.tsx                # Slide-out agent activity log
│   ├── DeepResearchProgress.tsx         # Stepped pipeline progress UI
│   └── DeepResearchPanel.tsx            # Side panel for research results
├── hooks/
│   └── useSessionPersistence.ts         # Redis-backed session state (list + single)
├── contexts/
│   └── SessionListContext.tsx           # Syncs session metadata to sidebar
├── lib/
│   ├── types.ts                         # All TypeScript interfaces
│   ├── chat.ts                          # Client-side API functions
│   ├── proxy.ts                         # Server-side proxy helpers (JSON + SSE)
│   ├── redis.ts                         # Upstash client singleton
│   └── session-store.ts                # Server-side Redis CRUD for sessions
├── public/
│   ├── capitol.png                      # Hero image
│   └── logo.png                         # Chat empty state logo
├── .env.example
└── package.json
```

---

## Pages

### `/` — Landing Page
Hero section with headline, capitol building image, CTA buttons, features grid, training library preview, and footer.

### `/chat` — Chat Router
Redirects to the most recent session or creates a new one.

### `/chat/[sessionId]` — Chat Session
Full chat interface scoped to a single session. Includes:
- Floating title bar with session name
- Message history with markdown rendering
- Search mode toggle (Quick Search / Extensive Thinking / Deep Research)
- Intent classification on every message (reject, clarify, chat, or confirm)
- SSE streaming for deep research with live pipeline visualization
- Agent log panel showing token usage per agent
- Deep research panel with expandable researcher findings

---

## Chat Flow

```
User sends message
       │
       ▼
  POST /api/intent  (classifies the query)
       │
       ├─ "reject"   → show info banner
       ├─ "clarify"  → show info banner
       ├─ "chat"     → POST /api/conversational → show answer
       └─ "confirm"  → show confirmation prompt
                              │
                      User confirms
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        Quick Search    Extensive Thinking  Deep Research
              │               │               │
     /api/quick-search  /api/quick-search-pro  /api/research (SSE)
              │               │               │
              ▼               ▼               ▼
         Show answer     Show answer    Stream pipeline
```

---

## Session Persistence

Sessions are stored in Upstash Redis with no login required. Users are identified by an `anon_id` cookie (HttpOnly, 1 year TTL).

**Redis keys per session:**
| Key | Type | Contents |
|---|---|---|
| `session:{id}` | STRING | Session metadata + messages (JSON) |
| `session:{id}:history` | STRING | Conversation history for backend context |
| `session:{id}:logs` | STRING | Agent activity logs |
| `session:{id}:research` | STRING | Deep research results + researcher findings |
| `user:{anonId}:sessions` | ZSET | Session IDs scored by updatedAt |

All keys have a 90-day TTL. Maximum 50 sessions per user.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- An [Upstash Redis](https://console.upstash.com) database (free tier works)
- The [training-chatbot-backend](https://github.com/House-Majority-Staff-Office-Sponsorship/training-chatbot-backend) running

### Installation

```bash
npm install
```

### Environment Variables

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `BACKEND_URL` | Base URL of the backend API (server-side only, never exposed to browser) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> If running the backend locally, start it on a different port:
> ```bash
> # in the backend directory
> PORT=3001 npm run dev
> ```
> Then set `BACKEND_URL=http://localhost:3001` in `.env.local`.

### Build

```bash
npm run build && npm start
```

---

## Backend Proxy

All backend requests are proxied through Next.js API routes in `app/api/`. The `lib/proxy.ts` module provides two helpers:

- `proxyJson(req, path)` — forwards a JSON POST and returns JSON
- `proxyStream(req, path)` — forwards a POST and pipes the SSE stream back

This keeps the `BACKEND_URL` server-side only and avoids CORS issues in production.

---

## Notes

- This application is intended for **internal use only**.
- AI responses require verification — a disclaimer is shown below the chat input.
- Session data is tied to the browser's `anon_id` cookie. Sharing a URL does not expose another user's conversations.
