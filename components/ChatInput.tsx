"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SearchMode } from "@/lib/types";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  searchMode: SearchMode;
  onSearchModeChange: (mode: SearchMode) => void;
}

function getModeLabel(mode: SearchMode, extended: boolean): string {
  if (mode === "deep") return "Gemini 3.1 Pro";
  return extended ? "Gemini 3.1 Pro" : "Gemini 3.1 Flash-Lite";
}

export default function ChatInput({
  onSend,
  disabled = false,
  searchMode,
  onSearchModeChange,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownLockedRef = useRef(false);

  // Tutorial drives the dropdown open/closed via events so the overlay can
  // highlight model options without the user clicking.
  useEffect(() => {
    const lock = () => {
      dropdownLockedRef.current = true;
      setDropdownOpen(true);
    };
    const unlock = () => {
      dropdownLockedRef.current = false;
      setDropdownOpen(false);
    };
    window.addEventListener("tutorial:lock-dropdown", lock);
    window.addEventListener("tutorial:unlock-dropdown", unlock);
    return () => {
      window.removeEventListener("tutorial:lock-dropdown", lock);
      window.removeEventListener("tutorial:unlock-dropdown", unlock);
    };
  }, []);

  const isExtended = searchMode === "quick-pro";
  const isDeep = searchMode === "deep";

  // Refocus textarea when re-enabled (after AI responds)
  useEffect(() => {
    if (!disabled) {
      textareaRef.current?.focus();
    }
  }, [disabled]);

  // Close dropdown on outside click (skipped while the tutorial has it locked)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownLockedRef.current) return;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }

  function selectQuickSearch() {
    onSearchModeChange("quick");
    setDropdownOpen(false);
  }

  function selectDeepResearch() {
    onSearchModeChange("deep");
    setDropdownOpen(false);
  }

  function toggleExtended() {
    onSearchModeChange(isExtended ? "quick" : "quick-pro");
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm" data-tutorial="chat-input">
      <form onSubmit={handleSubmit} className="flex items-end gap-3 px-4 py-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          disabled={disabled}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          className="flex-1 resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none leading-relaxed max-h-[180px] overflow-y-auto disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors"
          aria-label="Send message"
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
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        </button>
      </form>

      {/* Bottom bar with logo and model selector */}
      <div className="flex items-center justify-between px-4 pb-2.5 pt-0">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-5 w-auto opacity-60"
        />

        {/* Model selector dropdown */}
        <div className="relative" ref={dropdownRef} data-tutorial="model-selector">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            disabled={disabled}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <span>{getModeLabel(searchMode, isExtended)}</span>
            {isExtended && !isDeep && (
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                Extended
              </span>
            )}
            {isDeep && (
              <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                Deep
              </span>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3.5 w-3.5 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
              {/* Gemini 3.1 Flash-Lite option */}
              <button
                type="button"
                onClick={selectQuickSearch}
                data-tutorial="model-flash"
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Gemini 3.1 Flash-Lite
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fast answers for everyday questions
                  </p>
                </div>
                {(searchMode === "quick" || searchMode === "quick-pro") && (
                  <svg
                    className="h-4 w-4 text-blue-600 flex-shrink-0 ml-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              {/* Extended thinking toggle */}
              <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between" data-tutorial="model-extended">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Extended thinking
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Think longer for complex tasks
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleExtended}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    isExtended ? "bg-blue-600" : "bg-slate-200"
                  }`}
                  role="switch"
                  aria-checked={isExtended}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform ${
                      isExtended ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-slate-100" />

              {/* Deep Research option */}
              <button
                type="button"
                onClick={selectDeepResearch}
                data-tutorial="model-deep"
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Deep Research
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Multi-agent pipeline with Gemini 3.1 Pro
                  </p>
                </div>
                {searchMode === "deep" && (
                  <svg
                    className="h-4 w-4 text-blue-600 flex-shrink-0 ml-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
