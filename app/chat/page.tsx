"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ChatIndexPage() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(true);
  const startedRef = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-invoke (which was creating two
    // empty "New conversation" sessions on first visit).
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const data = await res.json();
          if (data.sessions.length > 0) {
            router.replace(`/chat/${data.sessions[0].id}`);
            return;
          }
        }
      } catch {
        // Fall through to create a new session
      }

      // No existing sessions — create one
      try {
        const id = `session-${Date.now()}`;
        await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, title: "New conversation" }),
        });
        router.replace(`/chat/${id}`);
      } catch {
        setRedirecting(false);
      }
    })();
  }, [router]);

  if (!redirecting) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-red-500">
          Failed to load sessions. Please refresh.
        </p>
      </div>
    );
  }

  // Show nothing — the layout handles the loading state
  return null;
}
