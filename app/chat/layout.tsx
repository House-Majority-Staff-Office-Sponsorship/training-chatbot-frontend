"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useSessionList } from "@/hooks/useSessionPersistence";
import { SessionListContext } from "@/contexts/SessionListContext";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const activeSessionId = (params?.sessionId as string) ?? "";

  const { sessions, loaded, createSession, deleteSession, updateSessionInList } =
    useSessionList();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function handleSelectSession(id: string) {
    router.push(`/chat/${id}`);
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setSidebarOpen(false);
  }

  function handleNewChat() {
    const id = createSession();
    router.push(`/chat/${id}`);
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setSidebarOpen(false);
  }

  function handleDeleteSession(id: string) {
    const nextId = deleteSession(id);
    if (id === activeSessionId) {
      if (nextId) {
        router.push(`/chat/${nextId}`);
      } else {
        const newId = createSession();
        router.push(`/chat/${newId}`);
      }
    }
  }

  if (!loaded) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="text-sm text-slate-400">Loading your sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SessionListContext.Provider value={{ updateSessionInList }}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />
        {children}
      </div>
    </SessionListContext.Provider>
  );
}
