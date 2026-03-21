"use client";

import { useEffect, useState } from "react";
import TutorialOverlay, { TutorialStep } from "./TutorialOverlay";

const STORAGE_KEY = "hmso_quiz_tutorial_done";

function isTutorialDone(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === "true";
}

function markTutorialDone(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, "true");
}

export function clearQuizTutorial(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

const STEPS: TutorialStep[] = [
  {
    selector: "[data-tutorial='quiz-card']",
    title: "Generate a Quiz",
    description:
      "This is where you create AI-generated quizzes. Describe any topic related to House training and the AI will search official documents to build questions for you.",
    placement: "right",
  },
  {
    selector: "[data-tutorial='quiz-topic']",
    title: "Choose a topic",
    description:
      "Type what you want to be tested on. Be as specific or broad as you like — for example, \"ethics rules for staff\" or \"the legislative process\".",
    placement: "bottom",
  },
  {
    selector: "[data-tutorial='quiz-options']",
    title: "Set quiz length",
    description:
      "Choose how many questions you want (3, 5, 7, or 10) and hit Generate. The AI will search training documents and create your quiz.",
    placement: "bottom",
  },
  {
    selector: "[data-tutorial='quiz-suggestions']",
    title: "Quick suggestions",
    description:
      "Click any popular topic to fill in the input automatically. These cover common training areas like ethics, procedures, and onboarding.",
    placement: "top",
    scrollIntoView: true,
  },
  {
    selector: "[data-tutorial='quiz-new-btn']",
    title: "Create new quizzes",
    description:
      "You can always come back and generate a new quiz by clicking this button. Each quiz is saved so you can revisit it later.",
    placement: "right",
  },
  {
    selector: "[data-tutorial='quiz-sidebar-list']",
    title: "Your saved quizzes",
    description:
      "All generated quizzes appear here. Click any quiz to retake it or review your score. Quizzes are saved to your session automatically.",
    placement: "right",
  },
];

export default function QuizTutorial() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isTutorialDone()) {
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  const finish = () => {
    markTutorialDone();
    setShow(false);
  };

  return <TutorialOverlay steps={STEPS} onFinish={finish} onSkip={finish} />;
}
