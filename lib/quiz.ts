import { QuizSession } from "@/lib/types";

export const MOCK_QUIZZES: QuizSession[] = [
  {
    id: 1,
    title: "Legislative Process Basics",
    topic: "Procedures",
    questions: 5,
    completed: true,
    score: 4,
  },
  {
    id: 2,
    title: "House Ethics Rules",
    topic: "Ethics",
    questions: 5,
    completed: false,
    score: null,
  },
];

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  source: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

export const QUIZ_DATA: Record<number, QuizData> = {
  1: {
    title: "Legislative Process Basics",
    questions: [
      {
        id: 1,
        question: "What is the first step in the legislative process?",
        options: [
          "Floor vote",
          "Introduction of a bill",
          "Committee review",
          "Governor's signature",
        ],
        correct: 1,
        source: "Legislative Process Guide, §1.1",
      },
      {
        id: 2,
        question: "Which body must pass a bill before it goes to the Governor?",
        options: [
          "Only the House",
          "Only the Senate",
          "Both the House and Senate",
          "The Committee on Finance",
        ],
        correct: 2,
        source: "Legislative Process Guide, §2.3",
      },
      {
        id: 3,
        question: "What happens if the Governor vetoes a bill?",
        options: [
          "It becomes law automatically",
          "It is sent back to the Legislature",
          "It is permanently rejected",
          "It goes to the Supreme Court",
        ],
        correct: 1,
        source: "Legislative Process Guide, §4.1",
      },
      {
        id: 4,
        question: "What is a committee hearing?",
        options: [
          "A floor debate",
          "A public meeting to review a bill",
          "A vote on the bill",
          "A press conference",
        ],
        correct: 1,
        source: "Legislative Process Guide, §2.1",
      },
      {
        id: 5,
        question: "How many readings does a bill typically require?",
        options: ["One", "Two", "Three", "Four"],
        correct: 2,
        source: "Legislative Process Guide, §1.4",
      },
    ],
  },
  2: {
    title: "House Ethics Rules",
    questions: [
      {
        id: 1,
        question: "Can staff members accept gifts from lobbyists?",
        options: [
          "Yes, if under $25",
          "No, gifts from lobbyists are generally prohibited",
          "Yes, with supervisor approval",
          "Only non-monetary gifts",
        ],
        correct: 1,
        source: "House Ethics Manual, §3.1",
      },
      {
        id: 2,
        question: "What should you do if unsure whether a gift is permissible?",
        options: [
          "Accept it and report later",
          "Decline it to be safe",
          "Consult the Committee on Ethics",
          "Ask your supervisor",
        ],
        correct: 2,
        source: "House Ethics Manual, §3.4",
      },
      {
        id: 3,
        question: "Which of the following is an exception to the gift rule?",
        options: [
          "Meals at a lobbyist's office",
          "Widely attended event invitations",
          "Travel paid by a lobbying organization",
          "Holiday gifts under $50",
        ],
        correct: 1,
        source: "House Ethics Manual, §3.2",
      },
      {
        id: 4,
        question: "Who is the authoritative source for ethics guidance?",
        options: [
          "The Speaker",
          "Your supervisor",
          "The Committee on Ethics",
          "The Majority Leader",
        ],
        correct: 2,
        source: "House Ethics Manual, §1.1",
      },
      {
        id: 5,
        question:
          "Ethics rules regarding gifts apply regardless of the gift's value.",
        options: [
          "True",
          "False — only gifts over $25",
          "False — only monetary gifts",
          "False — depends on source",
        ],
        correct: 0,
        source: "House Ethics Manual, §3.1",
      },
    ],
  },
};

export async function fetchQuizQuestions(
  quizId: number
): Promise<QuizData | null> {
  return QUIZ_DATA[quizId] ?? null;
}

export async function submitQuizResult(
  quizId: number,
  score: number,
  total: number
): Promise<void> {
  console.log(`Quiz ${quizId} completed: ${score}/${total}`);
}
