import { ChatSession, Message } from "./types";

export const MOCK_SESSIONS: ChatSession[] = [
  {
    id: "session-1",
    title: "Ethics & Conduct Rules",
    lastMessage: "Can staff members accept gifts from lobbyists?",
    updatedAt: new Date("2026-02-24T09:30:00"),
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Can staff members accept gifts from lobbyists?",
        timestamp: new Date("2026-02-24T09:28:00"),
      },
      {
        id: "m2",
        role: "assistant",
        content:
          "Under House ethics rules, staff members are generally prohibited from accepting gifts — including meals, entertainment, or travel — from lobbyists or organizations that employ lobbyists. The rules apply regardless of the gift's value. Limited exceptions exist for widely attended events, informational materials, and a few other categories, but these require careful review and, in some cases, prior approval from the Committee on Ethics.",
        timestamp: new Date("2026-02-24T09:28:15"),
      },
      {
        id: "m3",
        role: "user",
        content: "What about a nominal value item like a pen?",
        timestamp: new Date("2026-02-24T09:29:00"),
      },
      {
        id: "m4",
        role: "assistant",
        content:
          "Even items of nominal value — such as a pen or a branded notepad — are subject to the gift rules when they come from a registered lobbyist or a lobbying organization. The safest practice is to decline all such items. If you are unsure whether a specific item is permissible, the Committee on Ethics provides confidential advisory opinions and is the authoritative source for guidance.",
        timestamp: new Date("2026-02-24T09:29:20"),
      },
    ],
  },
  {
    id: "session-2",
    title: "Staff Onboarding Checklist",
    lastMessage: "What forms do new hires need to complete?",
    updatedAt: new Date("2026-02-23T16:10:00"),
    messages: [
      {
        id: "m5",
        role: "user",
        content: "What forms do new hires need to complete?",
        timestamp: new Date("2026-02-23T16:08:00"),
      },
      {
        id: "m6",
        role: "assistant",
        content:
          "New House staff members are typically required to complete the following: (1) a Standard Form 86 (SF-86) for security clearance, (2) payroll enrollment through the House Financial Services system, (3) an I-9 employment eligibility form, (4) financial disclosure filings if applicable to their position, and (5) ethics training certification within 60 days of hire. Your office manager or the House HR office can provide the full onboarding packet.",
        timestamp: new Date("2026-02-23T16:08:30"),
      },
    ],
  },
  {
    id: "session-3",
    title: "Floor Procedures Overview",
    lastMessage: "How is debate time allocated on the floor?",
    updatedAt: new Date("2026-02-22T11:45:00"),
    messages: [
      {
        id: "m7",
        role: "user",
        content: "How is debate time allocated on the floor?",
        timestamp: new Date("2026-02-22T11:43:00"),
      },
      {
        id: "m8",
        role: "assistant",
        content:
          "Debate time on the House floor is typically allocated by the rule accompanying each bill, which is adopted by the House before general debate begins. The rule specifies the total time for debate — commonly one hour — and divides it equally between the majority and minority floor managers. Those managers then control how their allotted time is parceled out to other members who wish to speak. Under the five-minute rule in the Committee of the Whole, members may speak for up to five minutes on an amendment.",
        timestamp: new Date("2026-02-22T11:43:45"),
      },
    ],
  },
];

export function createEmptySession(id: string): ChatSession {
  return {
    id,
    title: "New conversation",
    lastMessage: "",
    updatedAt: new Date(),
    messages: [],
  };
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<Message> {
  const response = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: message }),
  });

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }

  const data = await response.json();
  return {
    id: data.id ?? crypto.randomUUID(),
    role: "assistant",
    content: data.answer,
    timestamp: new Date(),
  };
}
