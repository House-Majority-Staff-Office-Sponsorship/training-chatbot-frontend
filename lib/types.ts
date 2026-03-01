export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
