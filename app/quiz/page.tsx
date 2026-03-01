"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";

import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import { MOCK_QUIZZES, QUIZ_DATA } from "@/lib/quiz";
import { QuizSession } from "@/lib/types";

type QuizView = "empty" | "detail" | "taking" | "results";

export default function QuizPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeQuizId, setActiveQuizId] = useState<number | undefined>(
    undefined
  );
  const [quizView, setQuizView] = useState<QuizView>("empty");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedScores, setCompletedScores] = useState<
    Record<number, number>
  >({ 1: 4 });

  function handleSelectQuiz(id: number) {
    setActiveQuizId(id);
    setQuizView("detail");
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setShowAnswer(false);
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setSidebarOpen(false);
  }

  function handleStartQuiz() {
    setQuizView("taking");
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setShowAnswer(false);
  }

  function handleConfirm() {
    if (selected === null) return;
    setShowAnswer(true);
  }

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    const quiz = QUIZ_DATA[activeQuizId!];
    if (currentQ + 1 < quiz.questions.length) {
      setAnswers(newAnswers);
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      const score = newAnswers.filter(
        (a, i) => a === quiz.questions[i].correct
      ).length;
      setCompletedScores({ ...completedScores, [activeQuizId!]: score });
      setAnswers(newAnswers);
      setQuizView("results");
    }
  }

  const activeQuiz = activeQuizId ? QUIZ_DATA[activeQuizId] : null;
  const q = activeQuiz ? activeQuiz.questions[currentQ] : null;
  const score = activeQuiz
    ? answers.filter((a, i) => a === activeQuiz.questions[i].correct).length
    : 0;

  const enrichedQuizzes: QuizSession[] = MOCK_QUIZZES.map((quiz) => ({
    ...quiz,
    completed: completedScores[quiz.id] !== undefined,
    score: completedScores[quiz.id] ?? null,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        mode="quiz"
        quizzes={enrichedQuizzes}
        activeQuizId={activeQuizId}
        onSelectQuiz={handleSelectQuiz}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              Training
            </p>
            <h1 className="text-sm font-semibold text-slate-900 truncate">
              Knowledge Quizzes
            </h1>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors hidden sm:block"
          >
            Home
          </Link>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Empty state — no quiz selected */}
          {quizView === "empty" && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <BookOpen size={24} className="text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-700 mb-2">
                Select a quiz to get started
              </h2>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                Choose a quiz from the sidebar. Questions are generated from
                official House training materials.
              </p>
            </div>
          )}

          {/* Quiz detail — selected but not started */}
          {quizView === "detail" && activeQuizId && (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    completedScores[activeQuizId] !== undefined
                      ? "bg-green-50"
                      : "bg-blue-50"
                  }`}
                >
                  {completedScores[activeQuizId] !== undefined ? (
                    <CheckCircle size={28} className="text-green-500" />
                  ) : (
                    <BookOpen size={28} className="text-blue-400" />
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  {activeQuiz?.title}
                </h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">
                  {MOCK_QUIZZES.find((q) => q.id === activeQuizId)?.topic}
                </p>
                <div className="flex items-center justify-center gap-6 mb-6 text-sm text-slate-500">
                  <span>{activeQuiz?.questions.length} questions</span>
                  {completedScores[activeQuizId] !== undefined && (
                    <span className="text-green-600 font-medium">
                      {completedScores[activeQuizId]}/
                      {activeQuiz?.questions.length} correct
                    </span>
                  )}
                </div>
                {completedScores[activeQuizId] !== undefined && (
                  <div className="h-1.5 bg-slate-100 rounded-full mb-6">
                    <div
                      className="h-1.5 bg-green-400 rounded-full"
                      style={{
                        width: `${
                          (completedScores[activeQuizId] /
                            (activeQuiz?.questions.length ?? 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Questions are generated from official House training materials
                  and include source citations after each answer.
                </p>
                <button
                  onClick={handleStartQuiz}
                  className="w-full py-3 bg-[#1a2332] hover:bg-[#243044] text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {completedScores[activeQuizId] !== undefined
                    ? "Retake Quiz"
                    : "Start Quiz"}
                </button>
              </div>
            </div>
          )}

          {/* Taking quiz */}
          {quizView === "taking" && activeQuiz && q && (
            <div className="flex flex-col items-center px-6 py-10 h-full overflow-y-auto">
              {/* Progress */}
              <div className="w-full max-w-xl mb-6">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <button
                    onClick={() => setQuizView("detail")}
                    className="flex items-center gap-1 hover:text-slate-700 transition-colors"
                  >
                    <ArrowLeft size={13} /> Back
                  </button>
                  <span>
                    {currentQ + 1} / {activeQuiz.questions.length}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div
                    className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (currentQ / activeQuiz.questions.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="w-full max-w-xl">
                <p className="text-lg font-semibold text-slate-900 mb-6 leading-snug">
                  {q.question}
                </p>

                <div className="flex flex-col gap-3 mb-6">
                  {q.options.map((opt, idx) => {
                    let style =
                      "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50";
                    if (selected === idx && !showAnswer)
                      style = "bg-blue-50 border border-blue-400 text-blue-800";
                    if (showAnswer && idx === q.correct)
                      style =
                        "bg-green-50 border border-green-400 text-green-800";
                    if (showAnswer && selected === idx && idx !== q.correct)
                      style = "bg-red-50 border border-red-400 text-red-700";
                    return (
                      <button
                        key={idx}
                        onClick={() => !showAnswer && setSelected(idx)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${style}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          {opt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Source citation */}
                {showAnswer && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                      Source
                    </p>
                    <p className="text-xs text-slate-600">{q.source}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selected === q.correct
                        ? "✓ Correct — Great job!"
                        : `✗ Incorrect — The correct answer is "${
                            q.options[q.correct]
                          }".`}
                    </p>
                  </div>
                )}

                {!showAnswer ? (
                  <button
                    onClick={handleConfirm}
                    disabled={selected === null}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Confirm Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-[#1a2332] hover:bg-[#243044] text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {currentQ + 1 < activeQuiz.questions.length
                      ? "Next Question"
                      : "See Results"}
                    <ChevronRight size={15} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {quizView === "results" && activeQuiz && (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Trophy size={28} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  Quiz Complete
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  {activeQuiz.title}
                </p>
                <div className="text-5xl font-bold text-[#1a2332] mb-1">
                  {Math.round((score / activeQuiz.questions.length) * 100)}%
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  {score} out of {activeQuiz.questions.length} correct
                </p>
                <div className="h-2 bg-slate-100 rounded-full mb-8">
                  <div
                    className="h-2 bg-blue-500 rounded-full"
                    style={{
                      width: `${(score / activeQuiz.questions.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleStartQuiz}
                    className="flex items-center justify-center gap-2 w-full py-3 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <RotateCcw size={14} /> Retake Quiz
                  </button>
                  <button
                    onClick={() => setQuizView("detail")}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    Back to Quizzes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
