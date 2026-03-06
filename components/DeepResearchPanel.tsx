"use client";

import DeepResearchProgress from "./DeepResearchProgress";
import { DeepResearchResult, ResearcherState } from "@/lib/types";

interface DeepResearchPanelProps {
  result: Partial<DeepResearchResult>;
  researchers: ResearcherState[];
  isRunning: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

export default function DeepResearchPanel({
  result,
  researchers,
  isRunning,
  isOpen,
  onToggle,
}: DeepResearchPanelProps) {
  const hasData = isRunning || Object.keys(result).length > 0;
  if (!hasData) return null;

  const stepsDone = [
    !!result.enrichedQuery,
    !!result.researchQuestions,
    researchers.length > 0 && researchers.every((r) => r.done),
    !!result.answer,
  ].filter(Boolean).length;

  return (
    <>
      {/* Toggle tab */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="flex-shrink-0 w-8 bg-purple-900/90 text-purple-300 flex items-center justify-center hover:bg-purple-800 transition-colors cursor-pointer"
          aria-label="Open deep research"
        >
          <span
            className="text-xs font-mono whitespace-nowrap"
            style={{ writingMode: "vertical-rl" }}
          >
            Research {isRunning ? "(running)" : `(${stepsDone}/4)`}
          </span>
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="flex-shrink-0 w-[420px] bg-white flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-purple-700">
                Deep Research Pipeline
              </span>
              {isRunning && (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  Running
                </span>
              )}
            </div>
            <button
              onClick={onToggle}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-4">
            <DeepResearchProgress
              result={result}
              researchers={researchers}
              isRunning={isRunning}
            />
          </div>
        </div>
      )}
    </>
  );
}
