export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  flagged?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  messages: Message[];
}

export interface QuizSession {
  id: number;
  title: string;
  topic: string;
  questions: number;
  completed: boolean;
  score: number | null;
}

// --- Backend integration types ---

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
  action: "confirm" | "chat" | "clarify" | "reject";
  enrichedQuery?: string;
  message: string;
  logs?: LogEntry[];
}

export interface PendingConfirmation {
  sessionId: string;
  query: string;
  enrichedQuery: string;
  message: string;
}

// --- Redis persistence types ---

export interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number; // epoch ms
  flagged?: boolean;
}

export interface StoredSession {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: number; // epoch ms
  messages: StoredMessage[];
}

export function toStoredSession(session: ChatSession): StoredSession {
  return {
    id: session.id,
    title: session.title,
    lastMessage: session.lastMessage,
    updatedAt: session.updatedAt.getTime(),
    messages: session.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.getTime(),
      flagged: m.flagged,
    })),
  };
}

export function fromStoredSession(stored: StoredSession): ChatSession {
  return {
    id: stored.id,
    title: stored.title,
    lastMessage: stored.lastMessage,
    updatedAt: new Date(stored.updatedAt),
    messages: stored.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.timestamp),
      flagged: m.flagged,
    })),
  };
}
