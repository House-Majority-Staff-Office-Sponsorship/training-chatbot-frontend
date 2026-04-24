"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const PADDING = 10;

export type TutorialStep = {
  selector: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
  clickToContinue?: boolean;
  scrollIntoView?: boolean;
};

interface TutorialOverlayProps {
  steps: TutorialStep[];
  onFinish: () => void;
  onSkip: () => void;
  onStepChange?: (stepIndex: number) => void;
  initialStep?: number;
}

export default function TutorialOverlay({
  steps,
  onFinish,
  onSkip,
  onStepChange,
  initialStep = 0,
}: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [tooltipH, setTooltipH] = useState(260);
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const rAFRef = useRef<number | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const currentStep = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const isFirst = stepIndex === 0;

  const retreat = () => {
    if (!isFirst) {
      const prev = stepIndex - 1;
      setStepIndex(prev);
      onStepChange?.(prev);
    }
  };

  const advance = () => {
    if (isLast) {
      onFinish();
    } else {
      const next = stepIndex + 1;
      setStepIndex(next);
      onStepChange?.(next);
    }
  };

  useEffect(() => {
    if (currentStep.scrollIntoView) {
      const el = document.querySelector(currentStep.selector);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [stepIndex, currentStep]);

  useLayoutEffect(() => {
    if (tooltipRef.current) {
      setTooltipH(tooltipRef.current.offsetHeight);
    }
  });

  useEffect(() => {
    let hasScrolledIntoView = false;
    const measure = () => {
      const el = document.querySelector(currentStep.selector);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setHighlightRect(rect);
          setVisible(true);
          if (!hasScrolledIntoView && currentStep.scrollIntoView) {
            hasScrolledIntoView = true;
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      }
    };

    measure();
    const fallbackTimer = setTimeout(measure, 80);

    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);

    observerRef.current = new MutationObserver(() => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = requestAnimationFrame(measure);
    });
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      observerRef.current?.disconnect();
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, [stepIndex, currentStep]);

  useEffect(() => {
    if (!currentStep.clickToContinue) return;
    const el = document.querySelector(currentStep.selector);
    if (!el) return;

    const handler = () => {
      setTimeout(() => {
        const next = stepIndex + 1;
        if (next >= steps.length) {
          onFinish();
        } else {
          setStepIndex(next);
          onStepChange?.(next);
        }
      }, 300);
    };

    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [stepIndex, currentStep, steps.length, onFinish, onStepChange]);

  const buildClipPath = (rect: DOMRect) => {
    const x1 = rect.left - PADDING;
    const y1 = rect.top - PADDING;
    const x2 = rect.right + PADDING;
    const y2 = rect.bottom + PADDING;
    return `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
      ${x1}px ${y1}px,
      ${x1}px ${y2}px,
      ${x2}px ${y2}px,
      ${x2}px ${y1}px,
      ${x1}px ${y1}px
    )`;
  };

  const getTooltipStyle = (
    rect: DOMRect,
    placement: TutorialStep["placement"] = "bottom"
  ): React.CSSProperties => {
    const PAD = PADDING + 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const TOOLTIP_W = Math.min(320, vw - 32);
    const TOOLTIP_H = Math.min(tooltipH, vh - 32);

    let top: number;
    let left: number;

    const centreX = rect.left + rect.width / 2;
    left = Math.max(16, Math.min(centreX - TOOLTIP_W / 2, vw - TOOLTIP_W - 16));

    if (placement === "bottom") {
      const below = rect.bottom + PAD;
      const above = rect.top - TOOLTIP_H - PAD;
      if (below + TOOLTIP_H <= vh - 16) top = below;
      else if (above >= 16) top = above;
      else top = (vh - TOOLTIP_H) / 2;
    } else if (placement === "top") {
      const above = rect.top - TOOLTIP_H - PAD;
      const below = rect.bottom + PAD;
      if (above >= 16) top = above;
      else if (below + TOOLTIP_H <= vh - 16) top = below;
      else top = (vh - TOOLTIP_H) / 2;
    } else if (placement === "right") {
      top = rect.top + rect.height / 2 - TOOLTIP_H / 2;
      left = Math.min(rect.right + PAD, vw - TOOLTIP_W - 16);
    } else {
      top = rect.top + rect.height / 2 - TOOLTIP_H / 2;
      left = Math.max(16, rect.left - TOOLTIP_W - PAD);
    }

    top = Math.max(16, Math.min(top, vh - TOOLTIP_H - 16));

    return {
      position: "fixed",
      top,
      left,
      width: TOOLTIP_W,
      maxHeight: vh - 32,
      overflowY: "auto" as const,
      zIndex: 10001,
    };
  };

  if (!visible) return null;

  return (
    <>
      {/* Click blocker */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "all",
          clipPath:
            currentStep.clickToContinue && highlightRect
              ? buildClipPath(highlightRect)
              : undefined,
        }}
      />

      {/* Dark overlay with cut-out */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          backgroundColor: "rgba(0,0,0,0.55)",
          clipPath: highlightRect ? buildClipPath(highlightRect) : undefined,
          transition: "clip-path 0.35s ease",
        }}
      />

      {/* Highlight border ring */}
      <div
        style={{
          position: "fixed",
          top: highlightRect ? highlightRect.top - PADDING : 0,
          left: highlightRect ? highlightRect.left - PADDING : 0,
          width: highlightRect ? highlightRect.width + PADDING * 2 : 0,
          height: highlightRect ? highlightRect.height + PADDING * 2 : 0,
          borderRadius: 10,
          border: highlightRect ? "2px solid #3b82f6" : "none",
          boxShadow: highlightRect
            ? "0 0 0 4px rgba(59,130,246,0.25)"
            : "none",
          zIndex: 10000,
          pointerEvents: currentStep.clickToContinue ? "none" : "all",
          transition:
            "top 0.35s ease, left 0.35s ease, width 0.35s ease, height 0.35s ease",
        }}
      />

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        style={
          highlightRect
            ? getTooltipStyle(highlightRect, currentStep.placement)
            : { position: "fixed", visibility: "hidden" }
        }
      >
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-2.5">
            <div>
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                Step {stepIndex + 1} of {steps.length}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {currentStep.title}
              </h4>
            </div>
            <button
              onClick={onSkip}
              className="text-slate-400 hover:text-slate-600 p-1 rounded"
              title="Skip tutorial"
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

          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {currentStep.description}
          </p>

          {/* Progress dots */}
          <div className="flex gap-1.5 items-center mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex
                    ? "w-4 bg-blue-600"
                    : i < stepIndex
                      ? "w-1.5 bg-blue-300"
                      : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            {!isFirst && (
              <button
                onClick={retreat}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            )}
            {!currentStep.clickToContinue && (
              <button
                onClick={advance}
                className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isLast ? "Got it!" : "Next"}
              </button>
            )}
            {currentStep.clickToContinue && (
              <span className="text-xs text-blue-500 italic self-center">
                Click the highlighted area to continue
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
