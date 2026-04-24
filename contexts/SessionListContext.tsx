"use client";

import { createContext, useContext } from "react";
import { ChatSession } from "@/lib/types";

interface SessionListContextValue {
  /** Update a session's metadata in the sidebar list. */
  updateSessionInList: (sessionId: string, patch: Partial<ChatSession>) => void;
  /** Start a brand-new chat session and navigate to it. */
  startNewChat: () => void;
}

export const SessionListContext = createContext<SessionListContextValue>({
  updateSessionInList: () => {},
  startNewChat: () => {},
});

export function useSessionListContext() {
  return useContext(SessionListContext);
}
