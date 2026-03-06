"use client";

import { PendingConfirmation, SearchMode } from "@/lib/types";

interface IntentConfirmationProps {
  confirmation: PendingConfirmation;
  mode: SearchMode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function IntentConfirmation({
  confirmation,
  mode,
  onConfirm,
  onCancel,
}: IntentConfirmationProps) {
  const isDeep = mode === "deep";

  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
        AI
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[75%]">
        <p className="text-sm text-slate-800 mb-3">{confirmation.message}</p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 text-xs font-medium text-white rounded-md transition-colors ${
              isDeep
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Yes, proceed
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
          >
            No, let me rephrase
          </button>
        </div>
      </div>
    </div>
  );
}
