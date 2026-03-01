"use client";

import { ChatSession, QuizSession } from "@/lib/types";
import { CheckCircle, Circle } from "lucide-react";

interface SidebarProps {
  mode: "chat" | "quiz";
  // chat only
  sessions?: ChatSession[];
  activeSessionId?: string;
  onSelectSession?: (id: string) => void;
  onNewChat?: () => void;
  // quiz only
  quizzes?: QuizSession[];
  activeQuizId?: number;
  onSelectQuiz?: (id: number) => void;
  // shared
  isOpen: boolean;
  onClose: () => void;
}

const currentUser = {
  name: "Session Hire",
  role: "House Majority Staff Office",
  initials: "HI",
};

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "Today";
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Sidebar({
  mode,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  quizzes,
  activeQuizId,
  onSelectQuiz,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          flex flex-col w-64 bg-[#1a2332] text-slate-300
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isOpen ? "md:flex" : "md:hidden"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img
              src="https://portal.ehawaii.gov/assets/webp/elements/sliver/seal.webp"
              alt="Hawaii State Seal"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="text-med font-semibold text-white tracking-tight">
              House Training Assistant
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded"
            aria-label="Close sidebar"
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

        {/* New conversation button — chat mode only */}
        {mode === "chat" && (
          <div className="px-3 pt-5">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-700 rounded-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New conversation
            </button>
          </div>
        )}

        {/* List — switches based on mode */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <p className="px-2 pt-5 pb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
            {mode === "chat" ? "Recent" : "Quizzes"}
          </p>

          {/* Chat mode — session list */}
          {mode === "chat" && (
            <ul className="space-y-0.5">
              {sessions?.map((session) => (
                <li key={session.id}>
                  <button
                    onClick={() => onSelectSession?.(session.id)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-md transition-colors group
                      ${
                        session.id === activeSessionId
                          ? "bg-white/10 text-white"
                          : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                      }
                    `}
                  >
                    <p className="text-sm font-medium truncate leading-snug">
                      {session.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {formatRelativeDate(session.updatedAt)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Quiz mode — quiz list */}
          {mode === "quiz" && (
            <ul className="space-y-0.5">
              {quizzes?.map((quiz) => (
                <li key={quiz.id}>
                  <button
                    onClick={() => onSelectQuiz?.(quiz.id)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-md transition-colors group
                      ${
                        quiz.id === activeQuizId
                          ? "bg-white/10 text-white"
                          : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {quiz.completed ? (
                        <CheckCircle
                          size={12}
                          className="text-green-400 flex-shrink-0"
                        />
                      ) : (
                        <Circle
                          size={12}
                          className="text-slate-500 flex-shrink-0"
                        />
                      )}
                      <p className="text-sm font-medium truncate leading-snug">
                        {quiz.title}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 ml-5 truncate">
                      {quiz.questions} questions · {quiz.topic}
                      {quiz.completed &&
                        quiz.score !== null &&
                        ` · ${quiz.score}/${quiz.questions}`}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* User info footer */}
        <div className="border-t border-white/10 px-4 py-3 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {currentUser.initials}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-white">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500">{currentUser.role}</p>
            </div>
          </div>
          <button className="text-slate-500 hover:text-white text-[10px] transition-colors">
            Sign out
          </button>
        </div>

        {/* Internal use label */}
        <div className="px-4 pt-2 pb-3 text-center">
          <p className="text-xs text-slate-500">Internal use only</p>
        </div>
      </aside>
    </>
  );
}
