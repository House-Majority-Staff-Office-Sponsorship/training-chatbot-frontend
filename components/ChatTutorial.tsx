"use client";

import { useEffect, useState } from "react";
import TutorialOverlay, { TutorialStep } from "./TutorialOverlay";

const STORAGE_KEY = "hmso_chat_tutorial_done";

function isTutorialDone(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === "true";
}

function markTutorialDone(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, "true");
}

export function clearChatTutorial(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

const STEPS: TutorialStep[] = [
  {
    selector: "[data-tutorial='empty-state']",
    title: "Welcome!",
    description:
      "Ask questions about House Majority training docs, policies, and procedures.",
    placement: "bottom",
  },
  {
    selector: "[data-tutorial='chat-input']",
    title: "Ask a question",
    description:
      "Type your question here and press Enter to send. The assistant will search official training documents to find your answer.",
    placement: "top",
  },
  {
    selector: "[data-tutorial='model-selector']",
    title: "Switch models",
    description:
      "Open this dropdown anytime to choose between different AI models. Each model offers a different balance of speed and depth for your search.",
    placement: "top",
  },
  {
    selector: "[data-tutorial='model-flash']",
    title: "Gemini 3.1 Flash-Lite",
    description:
      "The default model. Fast answers for everyday questions — great for quick lookups on policies, procedures, and rules.",
    placement: "left",
  },
  {
    selector: "[data-tutorial='model-extended']",
    title: "Extended thinking",
    description:
      "Toggle this on to use the Pro model for deeper analysis. It takes a bit longer but produces more thorough, nuanced answers.",
    placement: "left",
  },
  {
    selector: "[data-tutorial='model-deep']",
    title: "Deep Research",
    description:
      "For complex topics, Deep Research runs a multi-agent pipeline: it breaks your question into sub-questions, researches each one in parallel, and compiles a comprehensive report.",
    placement: "left",
  },
  {
    selector: "[data-tutorial='suggestion-cards']",
    title: "Try a suggestion",
    description:
      "Click any of these example questions to get started right away. You can always type your own question instead.",
    placement: "top",
  },
];

// Steps 2..5 highlight elements that only exist when the model dropdown is
// open. We "lock" the dropdown open while the tutorial is on those steps.
const FIRST_DROPDOWN_STEP = 2;
const LAST_DROPDOWN_STEP = 5;

function syncDropdown(stepIndex: number) {
  if (typeof window === "undefined") return;
  const inDropdownRange =
    stepIndex >= FIRST_DROPDOWN_STEP && stepIndex <= LAST_DROPDOWN_STEP;
  window.dispatchEvent(
    new Event(
      inDropdownRange ? "tutorial:lock-dropdown" : "tutorial:unlock-dropdown"
    )
  );
}

export default function ChatTutorial() {
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
    syncDropdown(-1); // ensure unlocked
    setShow(false);
  };

  return (
    <TutorialOverlay
      steps={STEPS}
      onFinish={finish}
      onSkip={finish}
      onStepChange={syncDropdown}
    />
  );
}
