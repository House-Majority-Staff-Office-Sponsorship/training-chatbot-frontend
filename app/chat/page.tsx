"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionListContext } from "@/contexts/SessionListContext";

type Status = "loading" | "empty" | "error";

export default function ChatIndexPage() {
  const router = useRouter();
  const { startNewChat } = useSessionListContext();
  const [status, setStatus] = useState<Status>("loading");
  const startedRef = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-invoke.
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/sessions");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.sessions.length > 0) {
          router.replace(`/chat/${data.sessions[0].id}`);
        } else {
          setStatus("empty");
        }
      } catch {
        setStatus("error");
      }
    })();
  }, [router]);

  if (status === "error") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-red-500">
          Failed to load sessions. Please refresh.
        </p>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            No conversations yet
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Start a new conversation to ask questions about House Majority
            training documents, policies, and procedures.
          </p>
          <button
            onClick={startNewChat}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            New conversation
          </button>
        </div>
      </div>
    );
  }

  // status === "loading" — layout already shows a loader
  return null;
}
