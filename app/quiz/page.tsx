"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuizIndexPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/quiz/list");
        if (res.ok) {
          const data = await res.json();
          if (data.quizzes?.length > 0) {
            router.replace(`/quiz/${data.quizzes[0].id}`);
            return;
          }
        }
      } catch {
        // Fall through
      }
      router.replace("/quiz/new");
    })();
  }, [router]);

  return null;
}
