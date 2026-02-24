# Training Chatbot Frontend

A Next.js 15 (App Router) frontend for the House Majority Staff Office training chatbot. Provides a clean landing page and a full chat interface that communicates with the `training-chatbot-backend` API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, TypeScript) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Language | TypeScript 5 |
| Runtime | React 19 |

---

## Project Structure

```
training-chatbot-frontend/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Landing / hero page
│   ├── globals.css         # Global Tailwind styles
│   ├── api/
│   │   └── research/
│   │       └── route.ts    # Server-side API route — proxies POST to backend /research
│   └── chat/
│       └── page.tsx        # Full-height chat interface (client component)
├── components/
│   ├── Sidebar.tsx         # Toggleable dark-navy session panel
│   ├── ChatMessage.tsx     # Individual message bubble (user & assistant)
│   └── ChatInput.tsx       # Auto-growing textarea with send button
├── lib/
│   ├── types.ts            # Message and ChatSession TypeScript interfaces
│   └── chat.ts             # Mock session data, session helpers, sendMessage()
├── .env.example            # Required environment variable template
├── next.config.ts
├── tailwind.config (via postcss.config.mjs)
└── package.json
```

---

## Pages and Components

### `app/page.tsx` — Landing Page
Hero section with a headline, dual call-to-action buttons, and a three-column features grid. Links directly to the chat page.

### `app/chat/page.tsx` — Chat Interface
Full-height layout that manages:
- Session state (list of conversations, active session)
- Sending messages to the backend and appending responses
- Loading/error states with visual feedback
- Sidebar toggle (auto-closes on mobile after session selection)

### `components/Sidebar.tsx`
- Dark navy (`#1a2332`) panel, 288 px wide
- Lists recent sessions with relative timestamps (Today / Yesterday / N days ago)
- Mobile-aware: renders a backdrop overlay and auto-closes on session selection
- Controlled via `isOpen` / `onClose` props

### `components/ChatMessage.tsx`
- Right-aligned blue bubbles for user messages
- Left-aligned white cards with a border for assistant messages
- Avatar labels ("You" / "AI") and formatted timestamps

### `components/ChatInput.tsx`
- Auto-growing `<textarea>` capped at 180 px
- **Enter** sends the message; **Shift+Enter** inserts a newline
- Disabled state while a response is loading

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Installation

```bash
cd training-chatbot-frontend
npm install
```

### Environment Variables

Copy the example file and fill in the backend URL:

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|---|---|---|
| `BACKEND_URL` | Full URL of the `training-chatbot-backend` `/api/research` endpoint (server-side only) | `http://localhost:3001/api/research` |

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Running both repos locally:** The `training-chatbot-backend` is also a Next.js app. Because this frontend already occupies port 3000, start the backend on port 3001:
>
> ```bash
> # in the training-chatbot-backend directory
> PORT=3001 npm run dev
> ```
>
> With the backend running on port 3001, the default `BACKEND_URL` value (`http://localhost:3001/api/research`) in `.env.example` will work without any changes.

### Build for Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Backend Integration

The frontend sends chat messages through a Next.js server-side API route (`/api/research`), which proxies the request to the backend. This keeps the backend URL on the server and never exposes it to the browser.

```ts
// app/api/research/route.ts
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3001/api/research";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendRes = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // ...
}
```

The client calls the Next.js route directly:

```ts
// lib/chat.ts
export async function sendMessage(
  sessionId: string,
  message: string
): Promise<Message> {
  const response = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  // ...
}
```

### Expected Response Shape

The backend should return a JSON object containing at least one of the following fields:

```json
{
  "id": "optional-message-id",
  "response": "The assistant reply text"
}
```

Accepted response fields (in priority order): `response`, `message`, `content`.

---

## Data Model

```ts
// lib/types.ts

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  messages: Message[];
}
```

---

## Notes

- Mock session data in `lib/chat.ts` pre-populates the sidebar with sample conversations. Replace or remove `MOCK_SESSIONS` when connecting to a real session-management backend.
- This application is intended for **internal use only** within the House network.
