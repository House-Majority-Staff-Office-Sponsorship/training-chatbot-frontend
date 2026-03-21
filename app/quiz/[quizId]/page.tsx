"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  ArrowLeft,
} from "lucide-react";
import { StoredQuiz } from "@/lib/quiz-store";
import { QuizData } from "@/lib/quiz";
import { useQuizListContext } from "../layout";

type QuizView = "loading" | "detail" | "taking" | "results";

export default function QuizSessionPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const { quizzes, updateQuizInList } = useQuizListContext();

  const [quiz, setQuiz] = useState<StoredQuiz | null>(null);
  const [quizView, setQuizView] = useState<QuizView>("loading");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  // Load quiz data
  useEffect(() => {
    const cached = quizzes.find((q) => q.id === quizId);
    if (cached) {
      setQuiz(cached);
      setQuizView("detail");
      return;
    }

    fetch(`/api/quiz/${quizId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.quiz) {
          setQuiz(data.quiz);
          setQuizView("detail");
        } else {
          router.replace("/quiz/new");
        }
      })
      .catch(() => router.replace("/quiz/new"));
  }, [quizId, quizzes, router]);

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
    if (selected === null || !quiz) return;
    const newAnswers = [...answers, selected];
    if (currentQ + 1 < quiz.questions.length) {
      setAnswers(newAnswers);
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      const finalScore = newAnswers.filter(
        (a, i) => a === quiz.questions[i].correct
      ).length;
      setAnswers(newAnswers);
      setQuizView("results");

      // Persist to Redis
      fetch(`/api/quiz/${quizId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: true,
          score: finalScore,
          answers: newAnswers,
        }),
      });
      updateQuizInList(quizId, { completed: true, score: finalScore });
      setQuiz((prev) => prev ? { ...prev, completed: true, score: finalScore, answers: newAnswers } : prev);
    }
  }

  if (quizView === "loading" || !quiz) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  const q = quiz.questions[currentQ];
  const score = answers.filter((a, i) => a === quiz.questions[i].correct).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 relative">
      {/* Floating title bar */}
      {quizView === "taking" && (
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
          <div className="bg-gradient-to-b from-slate-50 from-60% to-transparent pt-3 pb-6 pointer-events-auto">
            <div className="max-w-xl mx-auto px-6">
              <h1 className="text-sm font-medium text-slate-500 truncate">
                {quiz.title}
              </h1>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Detail view */}
        {quizView === "detail" && (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  quiz.completed ? "bg-green-50" : "bg-blue-50"
                }`}
              >
                {quiz.completed ? (
                  <CheckCircle size={28} className="text-green-500" />
                ) : (
                  <BookOpen size={28} className="text-blue-400" />
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                {quiz.title}
              </h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">
                {quiz.topic}
              </p>
              <div className="flex items-center justify-center gap-6 mb-6 text-sm text-slate-500">
                <span>{quiz.questions.length} questions</span>
                {quiz.score !== null && (
                  <span className="text-green-600 font-medium">
                    {quiz.score}/{quiz.questions.length} correct
                  </span>
                )}
              </div>
              {quiz.score !== null && (
                <div className="h-1.5 bg-slate-100 rounded-full mb-6">
                  <div
                    className="h-1.5 bg-green-400 rounded-full"
                    style={{ width: `${(quiz.score / quiz.questions.length) * 100}%` }}
                  />
                </div>
              )}
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Questions generated from official House training materials with source citations.
              </p>
              <button
                onClick={handleStartQuiz}
                className="w-full py-3 bg-[#1a2332] hover:bg-[#243044] text-white text-sm font-medium rounded-xl transition-colors"
              >
                {quiz.completed ? "Retake Quiz" : "Start Quiz"}
              </button>
            </div>
          </div>
        )}

        {/* Taking quiz */}
        {quizView === "taking" && q && (
          <div className="flex flex-col items-center px-6 py-10 pt-16 h-full overflow-y-auto">
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
                  {currentQ + 1} / {quiz.questions.length}
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full">
                <div
                  className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${(currentQ / quiz.questions.length) * 100}%` }}
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
                    style = "bg-green-50 border border-green-400 text-green-800";
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

              {showAnswer && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-6">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                    Source
                  </p>
                  <p className="text-xs text-slate-600">{q.source}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {selected === q.correct
                      ? "Correct — Great job!"
                      : `Incorrect — The correct answer is "${q.options[q.correct]}".`}
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
                  {currentQ + 1 < quiz.questions.length ? "Next Question" : "See Results"}
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {quizView === "results" && (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Trophy size={28} className="text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">
                Quiz Complete
              </h2>
              <p className="text-slate-400 text-sm mb-6">{quiz.title}</p>
              <div className="text-5xl font-bold text-[#1a2332] mb-1">
                {Math.round((score / quiz.questions.length) * 100)}%
              </div>
              <p className="text-sm text-slate-500 mb-6">
                {score} out of {quiz.questions.length} correct
              </p>
              <div className="h-2 bg-slate-100 rounded-full mb-8">
                <div
                  className="h-2 bg-blue-500 rounded-full"
                  style={{ width: `${(score / quiz.questions.length) * 100}%` }}
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
                  onClick={() => router.push("/quiz/new")}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Generate Another Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
