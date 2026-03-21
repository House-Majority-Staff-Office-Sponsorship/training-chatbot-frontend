"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sparkles, Loader2 } from "lucide-react";
import { StoredQuiz } from "@/lib/quiz-store";
import { useQuizListContext } from "../layout";

const QUIZ_SUGGESTIONS = [
  { label: "Legislative Process", topic: "the legislative process and how a bill becomes law" },
  { label: "Ethics Rules", topic: "ethics rules and code of conduct for House staff" },
  { label: "Committee Procedures", topic: "committee procedures, hearings, and reports" },
  { label: "Staff Onboarding", topic: "new hire onboarding process and orientation" },
  { label: "Floor Procedures", topic: "floor session procedures and decorum rules" },
  { label: "HMSO Services", topic: "House Majority Staff Office services and responsibilities" },
];

export default function NewQuizPage() {
  const router = useRouter();
  const { addQuiz } = useQuizListContext();

  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), numQuestions }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setGenerating(false);
        return;
      }

      if (!data.quiz?.questions?.length) {
        setError("No questions were generated. Try a different topic.");
        setGenerating(false);
        return;
      }

      const newQuiz: StoredQuiz = {
        id: crypto.randomUUID(),
        title: data.quiz.title || topic.trim(),
        topic: topic.trim(),
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

      addQuiz(newQuiz);
      router.push(`/quiz/${newQuiz.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
      setGenerating(false);
    }
  }

  if (generating) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
        <h2 className="text-base font-semibold text-slate-700 mb-2">
          Generating your quiz...
        </h2>
        <p className="text-sm text-slate-400 max-w-sm">
          Searching training documents and creating questions about &ldquo;{topic}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto py-10">
      {/* Generate card */}
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <Image
            src="/logo.png"
            alt="HMSO Training"
            width={48}
            height={48}
            className="object-contain mb-4"
          />
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Generate a Quiz
          </h2>
          <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
            Describe what you want to be tested on. AI will search official House training materials and create questions.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Topic
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              rows={2}
              placeholder="Describe what you want to be tested on..."
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Number of questions
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-400 transition-all"
              >
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} questions
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 pt-5">
              <button
                onClick={handleGenerate}
                disabled={!topic.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Sparkles size={14} />
                Generate
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>

        {/* Suggestions */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
            Popular topics
          </p>
          <div className="grid grid-cols-2 gap-2">
            {QUIZ_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => setTopic(s.topic)}
                className="text-left text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Sponsored by the House of Majority Staff Office (HMSO)
      </p>
    </div>
  );
}
