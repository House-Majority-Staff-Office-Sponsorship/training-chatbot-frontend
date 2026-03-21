"use client";

import { useEffect, useState, useCallback } from "react";
import QuizSidebar from "@/components/QuizSidebar";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Sparkles,
  Loader2,
} from "lucide-react";
import { QuizData } from "@/lib/quiz";
import { QuizSession } from "@/lib/types";
import { StoredQuiz } from "@/lib/quiz-store";

const QUIZ_SUGGESTIONS = [
  { label: "Legislative Process", topic: "the legislative process and how a bill becomes law" },
  { label: "Ethics Rules", topic: "ethics rules and code of conduct for House staff" },
  { label: "Committee Procedures", topic: "committee procedures, hearings, and reports" },
  { label: "Staff Onboarding", topic: "new hire onboarding process and orientation" },
  { label: "Floor Procedures", topic: "floor session procedures and decorum rules" },
  { label: "HMSO Services", topic: "House Majority Staff Office services and responsibilities" },
];

type QuizView = "empty" | "generating" | "detail" | "taking" | "results";

export default function QuizPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeQuizId, setActiveQuizId] = useState<string | undefined>(undefined);
  const [quizView, setQuizView] = useState<QuizView>("empty");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);

  // Dynamic quiz state
  const [savedQuizzes, setSavedQuizzes] = useState<StoredQuiz[]>([]);
  const [generateTopic, setGenerateTopic] = useState("");
  const [generateCount, setGenerateCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Load saved quizzes from Redis on mount
  useEffect(() => {
    fetch("/api/quiz/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.quizzes) setSavedQuizzes(data.quizzes);
      })
      .catch(() => {});
  }, []);

  function getActiveQuiz(): QuizData | null {
    if (!activeQuizId) return null;
    const saved = savedQuizzes.find((q) => q.id === activeQuizId);
    if (saved) return { title: saved.title, questions: saved.questions };
    return null;
  }

  function getActiveScore(): number | null {
    if (!activeQuizId) return null;
    const saved = savedQuizzes.find((q) => q.id === activeQuizId);
    if (saved?.completed) return saved.score;
    return null;
  }

  function getActiveTopic(): string {
    if (!activeQuizId) return "";
    const saved = savedQuizzes.find((q) => q.id === activeQuizId);
    return saved?.topic ?? "";
  }

  function handleSelectQuiz(id: number) {
    setActiveQuizId(String(id));
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

  const handleNext = useCallback(() => {
    if (selected === null) return;
    const quiz = getActiveQuiz();
    if (!quiz) return;

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

      // Persist score to Redis for dynamic quizzes
      if (activeQuizId && savedQuizzes.find((q) => q.id === activeQuizId)) {
        fetch(`/api/quiz/${activeQuizId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completed: true,
            score: finalScore,
            answers: newAnswers,
          }),
        }).then(() => {
          setSavedQuizzes((prev) =>
            prev.map((q) =>
              q.id === activeQuizId
                ? { ...q, completed: true, score: finalScore, answers: newAnswers }
                : q
            )
          );
        });
      }
    }
  }, [selected, answers, currentQ, activeQuizId, savedQuizzes]);

  // Generate a new quiz
  async function handleGenerate() {
    if (!generateTopic.trim() || generating) return;
    setGenerating(true);
    setGenerateError(null);
    setQuizView("generating");

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: generateTopic.trim(),
          numQuestions: generateCount,
        }),
      });
      const data = await res.json();

      if (data.error) {
        setGenerateError(data.error);
        setQuizView("empty");
        return;
      }

      if (!data.quiz?.questions?.length) {
        setGenerateError("No questions were generated. Try a different topic.");
        setQuizView("empty");
        return;
      }

      // Save to Redis
      const newQuiz: StoredQuiz = {
        id: crypto.randomUUID(),
        title: data.quiz.title || generateTopic.trim(),
        topic: generateTopic.trim(),
        questions: data.quiz.questions,
        completed: false,
        score: null,
        answers: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await fetch("/api/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuiz),
      });

      setSavedQuizzes((prev) => [newQuiz, ...prev]);
      setActiveQuizId(newQuiz.id);
      setQuizView("detail");
      setGenerateTopic("");
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate quiz");
      setQuizView("empty");
    } finally {
      setGenerating(false);
    }
  }

  const activeQuiz = getActiveQuiz();
  const activeScore = getActiveScore();
  const q = activeQuiz ? activeQuiz.questions[currentQ] : null;
  const score = activeQuiz
    ? answers.filter((a, i) => a === activeQuiz.questions[i].correct).length
    : 0;

  // Build sidebar items: saved quizzes (dynamic)
  const sidebarQuizzes: QuizSession[] = savedQuizzes.map((q, i) => ({
    id: parseInt(q.id) || 1000 + i,
    title: q.title,
    topic: q.topic,
    questions: q.questions.length,
    completed: q.completed,
    score: q.score,
    _dynamicId: q.id,
  })) as (QuizSession & { _dynamicId?: string })[];

  // Handle sidebar selection (dynamic quizzes use string IDs)
  function handleSidebarSelect(id: number) {
    const dynamicQuiz = sidebarQuizzes.find((q) => q.id === id) as
      | (QuizSession & { _dynamicId?: string })
      | undefined;
    if (dynamicQuiz?._dynamicId) {
      setActiveQuizId(dynamicQuiz._dynamicId);
    } else {
      setActiveQuizId(String(id));
    }
    setQuizView("detail");
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setShowAnswer(false);
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <QuizSidebar
        quizzes={sidebarQuizzes}
        activeQuizId={activeQuizId ? parseInt(activeQuizId) || undefined : undefined}
        onSelectQuiz={handleSidebarSelect}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
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
          {/* Empty state — generate or select */}
          {quizView === "empty" && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-slate-700 mb-2">
                Generate a quiz
              </h2>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
                Describe what you want to be tested on and AI will generate questions from official House training materials.
              </p>

              {/* Generate form */}
              <div className="w-full max-w-md space-y-3">
                <textarea
                  value={generateTopic}
                  onChange={(e) => setGenerateTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  rows={2}
                  placeholder="Describe what you want to be tested on..."
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all resize-none"
                />
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-500 whitespace-nowrap">
                    Questions:
                  </label>
                  <select
                    value={generateCount}
                    onChange={(e) => setGenerateCount(Number(e.target.value))}
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none"
                  >
                    {[3, 5, 7, 10].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleGenerate}
                    disabled={!generateTopic.trim() || generating}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    <Sparkles size={14} />
                    Generate Quiz
                  </button>
                </div>
                {generateError && (
                  <p className="text-xs text-red-500 mt-2">{generateError}</p>
                )}
              </div>

              {/* Topic suggestions */}
              <div className="w-full max-w-md mt-6">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium mb-3">
                  Popular topics
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUIZ_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setGenerateTopic(s.topic)}
                      className="text-left text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2.5 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {savedQuizzes.length > 0 && (
                <p className="text-xs text-slate-400 mt-6">
                  Or select a saved quiz from the sidebar
                </p>
              )}
            </div>
          )}

          {/* Generating state */}
          {quizView === "generating" && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
              <h2 className="text-base font-semibold text-slate-700 mb-2">
                Generating your quiz...
              </h2>
              <p className="text-sm text-slate-400 max-w-sm">
                Searching training documents and creating questions about &ldquo;{generateTopic}&rdquo;
              </p>
            </div>
          )}

          {/* Quiz detail — selected but not started */}
          {quizView === "detail" && activeQuiz && (
            <div className="flex flex-col items-center justify-center h-full px-6">
              <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    activeScore !== null ? "bg-green-50" : "bg-blue-50"
                  }`}
                >
                  {activeScore !== null ? (
                    <CheckCircle size={28} className="text-green-500" />
                  ) : (
                    <BookOpen size={28} className="text-blue-400" />
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  {activeQuiz.title}
                </h2>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-4">
                  {getActiveTopic()}
                </p>
                <div className="flex items-center justify-center gap-6 mb-6 text-sm text-slate-500">
                  <span>{activeQuiz.questions.length} questions</span>
                  {activeScore !== null && (
                    <span className="text-green-600 font-medium">
                      {activeScore}/{activeQuiz.questions.length} correct
                    </span>
                  )}
                </div>
                {activeScore !== null && (
                  <div className="h-1.5 bg-slate-100 rounded-full mb-6">
                    <div
                      className="h-1.5 bg-green-400 rounded-full"
                      style={{
                        width: `${(activeScore / activeQuiz.questions.length) * 100}%`,
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
                  {activeScore !== null ? "Retake Quiz" : "Start Quiz"}
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
                      width: `${(currentQ / activeQuiz.questions.length) * 100}%`,
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
                      style =
                        "bg-blue-50 border border-blue-400 text-blue-800";
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

                {showAnswer && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-6">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
                      Source
                    </p>
                    <p className="text-xs text-slate-600">{q.source}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {selected === q.correct
                        ? "✓ Correct — Great job!"
                        : `✗ Incorrect — The correct answer is "${q.options[q.correct]}".`}
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
                    onClick={() => {
                      setActiveQuizId(undefined);
                      setQuizView("empty");
                    }}
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
    </div>
  );
}
