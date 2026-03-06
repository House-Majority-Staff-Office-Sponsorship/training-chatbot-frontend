"use client";

import { useEffect, useRef } from "react";
import { LogEntry } from "@/lib/types";

interface AgentLogPanelProps {
  logs: LogEntry[];
  isOpen: boolean;
  onToggle: () => void;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function AgentLogPanel({
  logs,
  isOpen,
  onToggle,
}: AgentLogPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const totalTokens = logs.reduce((sum, l) => sum + l.totalTokens, 0);

  return (
    <>
      {/* Toggle tab - always visible on the right edge */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-8 bg-[#2d2d2d] text-[#569cd6] flex items-center justify-center hover:bg-[#3d3d3d] transition-colors cursor-pointer"
          aria-label="Open agent logs"
        >
          <span
            className="text-xs font-mono whitespace-nowrap"
            style={{ writingMode: "vertical-rl" }}
          >
            Agent Logs {logs.length > 0 && `(${logs.length})`}
          </span>
        </button>
      )}

      {/* Panel - inline, not fixed */}
      {isOpen && (
        <div className="flex-shrink-0 w-[380px] bg-[#1e1e1e] flex flex-col border-l border-[#404040]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#2d2d2d] border-b border-[#404040] shrink-0">
            <span
              className="text-xs font-semibold"
              style={{
                color: "#569cd6",
                fontFamily: "Menlo, Monaco, Courier New, monospace",
              }}
            >
              Agent Event Logs
            </span>
            <div className="flex items-center gap-3">
              <span
                className="text-xs"
                style={{
                  color: "#ce9178",
                  fontFamily: "Menlo, Monaco, Courier New, monospace",
                }}
              >
                {totalTokens.toLocaleString()} tokens
              </span>
              <button
                onClick={onToggle}
                className="text-[#808080] hover:text-[#d4d4d4] transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Log entries */}
          <div
            ref={scrollRef}
            className="overflow-y-auto flex-1 p-3 space-y-1"
          >
            {logs.length === 0 ? (
              <p
                className="text-xs text-[#808080] text-center mt-8"
                style={{
                  fontFamily: "Menlo, Monaco, Courier New, monospace",
                }}
              >
                No logs yet. Send a message to begin.
              </p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className="text-xs leading-relaxed"
                  style={{
                    fontFamily: "Menlo, Monaco, Courier New, monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  <span style={{ color: "#808080" }}>
                    [{formatTimestamp(log.timestamp)}]
                  </span>{" "}
                  <span style={{ color: "#4ec9b0" }}>{log.agent}</span>{" "}
                  <span style={{ color: "#d4d4d4" }}>{log.message}</span>{" "}
                  <span style={{ color: "#ce9178" }}>
                    [{log.promptTokens}in/{log.responseTokens}out ={" "}
                    {log.totalTokens}]
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
