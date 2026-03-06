"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DeepResearchResult, ResearcherState } from "@/lib/types";

interface DeepResearchProgressProps {
  result: Partial<DeepResearchResult>;
  researchers: ResearcherState[];
  isRunning: boolean;
}

/* ── Icons ── */

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`${className} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PulseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span className={`${className} flex items-center justify-center`}>
      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
    </span>
  );
}

function InactiveIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span className={`${className} flex items-center justify-center`}>
      <span className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function StatusIcon({ done, active, size = "md" }: { done: boolean; active: boolean; size?: "md" | "sm" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  if (done) return <CheckIcon className={cls} />;
  if (active) return <PulseIcon className={cls} />;
  return <InactiveIcon className={cls} />;
}

/* ── Markdown renderer for expanded sections ── */

function StepContent({ content }: { content: string }) {
  return (
    <div className="mt-2 mx-1 mb-1 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 max-h-72 overflow-y-auto">
      <div className="step-markdown text-xs text-slate-700 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

/* ── Step item ── */

function StepItem({
  number,
  label,
  description,
  value,
  isActive,
  isDone,
}: {
  number: string;
  label: string;
  description?: string;
  value?: string;
  isActive: boolean;
  isDone: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div
        className={`
          rounded-xl border transition-colors duration-200
          ${isDone ? "border-slate-200 bg-white" : isActive ? "border-blue-200 bg-blue-50/50" : "border-slate-100 bg-slate-50/50"}
        `}
      >
        <button
          onClick={() => isDone && value && setExpanded(!expanded)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left ${isDone && value ? "cursor-pointer" : "cursor-default"}`}
          disabled={!isDone || !value}
        >
          {/* Step number badge */}
          <span
            className={`
              flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${isDone ? "bg-green-50 text-green-600" : isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}
            `}
          >
            {isDone ? (
              <CheckIcon className="w-3.5 h-3.5" />
            ) : (
              number
            )}
          </span>

          <div className="flex-1 min-w-0">
            <span
              className={`text-sm font-medium block ${
                isDone ? "text-slate-900" : isActive ? "text-blue-700" : "text-slate-400"
              }`}
            >
              {label}
            </span>
            {description && !isDone && (
              <span className="text-xs text-slate-400 block mt-0.5">{description}</span>
            )}
          </div>

          {isActive && !isDone && (
            <span className="flex items-center gap-1.5 text-xs text-blue-500 font-medium">
              <PulseIcon className="w-3 h-3" />
              Running
            </span>
          )}
          {isDone && value && <ChevronIcon open={expanded} />}
        </button>

        {expanded && value && <StepContent content={value} />}
      </div>
    </div>
  );
}

/* ── Main component ── */

export default function DeepResearchProgress({
  result,
  researchers,
  isRunning,
}: DeepResearchProgressProps) {
  const [expandedResearchers, setExpandedResearchers] = useState<Set<number>>(new Set());

  const step1Done = !!result.enrichedQuery;
  const step2Done = !!result.researchQuestions;
  const step3Active = step2Done && researchers.length > 0;
  const step3Done = researchers.length > 0 && researchers.every((r) => r.done);
  const step4Done = !!result.answer;

  const doneCount = researchers.filter((r) => r.done).length;

  function toggleResearcher(idx: number) {
    setExpandedResearchers((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  return (
    <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-900">Deep Research</span>
          {isRunning && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              In progress
            </span>
          )}
          {!isRunning && step4Done && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
              <CheckIcon className="w-3 h-3" />
              Complete
            </span>
          )}
        </div>

        {/* Steps */}
        <StepItem
          number="1"
          label="Query Analyzer"
          description="Enriching and contextualizing your query"
          value={result.enrichedQuery}
          isActive={isRunning && !step1Done}
          isDone={step1Done}
        />

        <StepItem
          number="2"
          label="Question Expander"
          description="Generating targeted research questions"
          value={result.researchQuestions}
          isActive={isRunning && step1Done && !step2Done}
          isDone={step2Done}
        />

        {/* Step 3: Parallel Researchers */}
        <div>
          <div
            className={`
              rounded-xl border transition-colors duration-200
              ${step3Done ? "border-slate-200 bg-white" : step3Active ? "border-blue-200 bg-blue-50/50" : "border-slate-100 bg-slate-50/50"}
            `}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <span
                className={`
                  flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${step3Done ? "bg-green-50 text-green-600" : step3Active ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}
                `}
              >
                {step3Done ? <CheckIcon className="w-3.5 h-3.5" /> : "3"}
              </span>

              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-medium block ${
                    step3Done ? "text-slate-900" : step3Active ? "text-blue-700" : "text-slate-400"
                  }`}
                >
                  Parallel Research
                </span>
                {!step3Active && !step3Done && (
                  <span className="text-xs text-slate-400 block mt-0.5">Dispatching researchers to gather findings</span>
                )}
              </div>

              {step3Active && !step3Done && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-blue-500">
                  <PulseIcon className="w-3 h-3" />
                  {doneCount}/{researchers.length}
                </span>
              )}
              {step3Done && (
                <span className="text-xs font-medium text-green-600">
                  {researchers.length}/{researchers.length}
                </span>
              )}
            </div>

            {/* Individual researchers */}
            {researchers.length > 0 && (
              <div className="px-3 pb-3 space-y-1.5">
                {researchers.map((r, idx) => {
                  const isExpanded = expandedResearchers.has(idx);
                  return (
                    <div
                      key={idx}
                      className={`
                        rounded-lg border transition-colors duration-200
                        ${r.done ? "border-slate-150 bg-white" : "border-blue-100 bg-blue-50/30"}
                      `}
                    >
                      <button
                        onClick={() => r.done && toggleResearcher(idx)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left ${r.done ? "cursor-pointer" : "cursor-default"}`}
                        disabled={!r.done}
                      >
                        <span className="text-[11px] font-mono text-slate-400 w-4 text-center flex-shrink-0">
                          {String.fromCharCode(97 + idx)}
                        </span>
                        <StatusIcon done={r.done} active={!r.done} size="sm" />
                        <span className={`text-xs flex-1 truncate ${r.done ? "text-slate-700" : "text-blue-600 font-medium"}`}>
                          {r.label}
                        </span>
                        {!r.done && (
                          <span className="text-[10px] text-blue-400 flex-shrink-0">researching...</span>
                        )}
                        {r.done && r.findings && (
                          <ChevronIcon open={isExpanded} />
                        )}
                      </button>
                      {isExpanded && r.findings && (
                        <div className="px-3 pb-2.5">
                          <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 max-h-56 overflow-y-auto">
                            <div className="step-markdown text-xs text-slate-700 leading-relaxed">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{r.findings}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <StepItem
          number="4"
          label="Final Report"
          description="Synthesizing findings into a comprehensive answer"
          value={result.answer}
          isActive={isRunning && step3Done && !step4Done}
          isDone={step4Done}
        />
    </div>
  );
}
