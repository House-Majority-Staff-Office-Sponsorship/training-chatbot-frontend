"use client";

import { StoredQuiz } from "@/lib/quiz-store";
import { CheckCircle } from "lucide-react";

interface QuizSidebarProps {
  quizzes: StoredQuiz[];
  activeQuizId: string;
  onSelectQuiz: (id: string) => void;
  onNewQuiz: () => void;
  onDeleteQuiz?: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function formatRelativeDate(ts: number): string {
  const now = Date.now();
  const diffMs = now - ts;
  if (diffMs < 0) return "Today";
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(title: string): string {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function QuizSidebar({
  quizzes,
  activeQuizId,
  onSelectQuiz,
  onNewQuiz,
  onDeleteQuiz,
  isOpen,
  onToggle,
}: QuizSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          flex flex-col bg-[#1a2332] text-slate-300
          transition-all duration-200 ease-in-out
          ${isOpen ? "w-72" : "w-0 md:w-14 overflow-hidden md:overflow-visible"}
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {isOpen ? (
          <>
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 shrink-0">
              <span className="text-sm font-semibold text-white">
                Knowledge Quizzes
              </span>
              <button
                onClick={onToggle}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded"
                aria-label="Collapse sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <div className="px-3 py-3 shrink-0">
              <button
                onClick={onNewQuiz}
                data-tutorial="quiz-new-btn"
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                New quiz
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 pb-4" data-tutorial="quiz-sidebar-list">
              <p className="px-2 pt-2 pb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Recent
              </p>
              <ul className="space-y-0.5">
                {quizzes.map((quiz) => (
                  <li key={quiz.id}>
                    <div
                      className={`
                        relative flex items-center rounded-md transition-colors group
                        ${quiz.id === activeQuizId
                          ? "bg-white/10 text-white"
                          : "hover:bg-white/5 text-slate-400 hover:text-slate-200"}
                      `}
                    >
                      <button
                        onClick={() => onSelectQuiz(quiz.id)}
                        className="flex-1 text-left px-3 py-2.5 min-w-0"
                      >
                        <div className="flex items-center gap-2">
                          {quiz.completed && (
                            <CheckCircle size={12} className="text-green-400 flex-shrink-0" />
                          )}
                          <p className="text-sm font-medium truncate leading-snug">
                            {quiz.title}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {quiz.questions.length} questions
                          {quiz.score !== null && ` · ${quiz.score}/${quiz.questions.length}`}
                          {" · "}
                          {formatRelativeDate(quiz.updatedAt)}
                        </p>
                      </button>
                      {onDeleteQuiz && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteQuiz(quiz.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 shrink-0 mr-2 p-1 text-slate-500 hover:text-red-400 transition-all rounded"
                          aria-label={`Delete ${quiz.title}`}
                          title="Delete quiz"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-white/10 px-4 py-3 shrink-0">
              <p className="text-xs text-slate-500">Internal use only</p>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-col items-center h-full py-3 gap-1">
            <button
              onClick={onToggle}
              className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors mb-1"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={onNewQuiz}
              className="w-9 h-9 flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              aria-label="New quiz"
              title="New quiz"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <div className="w-6 border-t border-white/10 my-1" />

            <div className="flex-1 overflow-y-auto flex flex-col items-center gap-1 w-full px-2.5">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => onSelectQuiz(quiz.id)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    quiz.id === activeQuizId
                      ? "bg-white/15 text-white"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  }`}
                  title={quiz.title}
                >
                  {quiz.completed ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <span>{getInitials(quiz.title)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
