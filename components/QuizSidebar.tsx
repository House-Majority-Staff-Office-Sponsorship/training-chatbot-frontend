"use client";

import { QuizSession } from "@/lib/types";
import { CheckCircle, Circle } from "lucide-react";

interface QuizSidebarProps {
  quizzes: QuizSession[];
  activeQuizId?: number;
  onSelectQuiz: (id: number) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function QuizSidebar({
  quizzes,
  activeQuizId,
  onSelectQuiz,
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
          ${isOpen ? "w-72 translate-x-0" : "w-0 md:w-14 -translate-x-full md:translate-x-0 overflow-hidden md:overflow-visible"}
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

            <nav className="flex-1 overflow-y-auto px-2 pb-4">
              <p className="px-2 pt-3 pb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Quizzes
              </p>
              <ul className="space-y-0.5">
                {quizzes.map((quiz) => (
                  <li key={quiz.id}>
                    <button
                      onClick={() => onSelectQuiz(quiz.id)}
                      className={`
                        w-full text-left px-3 py-2.5 rounded-md transition-colors group
                        ${quiz.id === activeQuizId ? "bg-white/10 text-white" : "hover:bg-white/5 text-slate-400 hover:text-slate-200"}
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        {quiz.completed ? (
                          <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                        ) : (
                          <Circle size={14} className="text-slate-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate leading-snug">{quiz.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {quiz.topic} &middot; {quiz.questions} questions
                            {quiz.score !== null && ` &middot; ${quiz.score}/${quiz.questions}`}
                          </p>
                        </div>
                      </div>
                    </button>
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
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
            <div className="w-6 border-t border-white/10 my-1" />
            <div className="flex-1 overflow-y-auto flex flex-col items-center gap-1 w-full px-2.5">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => onSelectQuiz(quiz.id)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    quiz.id === activeQuizId ? "bg-white/15 text-white" : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  }`}
                  title={quiz.title}
                >
                  {quiz.completed ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <span>{quiz.id}</span>
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
