"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import QuizSidebar from "@/components/QuizSidebar";
import { StoredQuiz } from "@/lib/quiz-store";

interface QuizListContextValue {
  quizzes: StoredQuiz[];
  addQuiz: (quiz: StoredQuiz) => void;
  updateQuizInList: (id: string, patch: Partial<StoredQuiz>) => void;
}

export const QuizListContext = createContext<QuizListContextValue>({
  quizzes: [],
  addQuiz: () => {},
  updateQuizInList: () => {},
});

export function useQuizListContext() {
  return useContext(QuizListContext);
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const activeQuizId = (params?.quizId as string) ?? "";

  const [quizzes, setQuizzes] = useState<StoredQuiz[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetch("/api/quiz/list")
      .then((r) => r.json())
      .then((data) => {
        if (data.quizzes) setQuizzes(data.quizzes);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  function handleSelectQuiz(id: string) {
    router.push(`/quiz/${id}`);
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setSidebarOpen(false);
  }

  function handleNewQuiz() {
    router.push("/quiz/new");
    if (typeof window !== "undefined" && window.innerWidth < 768)
      setSidebarOpen(false);
  }

  function handleDeleteQuiz(id: string) {
    fetch(`/api/quiz/${id}`, { method: "DELETE" }).then(() => {
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      if (id === activeQuizId) {
        const remaining = quizzes.filter((q) => q.id !== id);
        if (remaining.length > 0) {
          router.push(`/quiz/${remaining[0].id}`);
        } else {
          router.push("/quiz/new");
        }
      }
    });
  }

  const addQuiz = useCallback((quiz: StoredQuiz) => {
    setQuizzes((prev) => [quiz, ...prev]);
  }, []);

  const updateQuizInList = useCallback((id: string, patch: Partial<StoredQuiz>) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch, updatedAt: Date.now() } : q))
    );
  }, []);

  if (!loaded) {
    return (
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="text-sm text-slate-400">Loading your quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuizListContext.Provider value={{ quizzes, addQuiz, updateQuizInList }}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <QuizSidebar
          quizzes={quizzes}
          activeQuizId={activeQuizId}
          onSelectQuiz={handleSelectQuiz}
          onNewQuiz={handleNewQuiz}
          onDeleteQuiz={handleDeleteQuiz}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />
        {children}
      </div>
    </QuizListContext.Provider>
  );
}
