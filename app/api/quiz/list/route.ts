import { NextResponse } from "next/server";
import { getOrCreateAnonId, anonIdCookieHeader } from "@/lib/session-store";
import { listQuizzes } from "@/lib/quiz-store";

/** GET /api/quiz/list — list all saved quizzes for this user */
export async function GET() {
  const { anonId, isNew } = await getOrCreateAnonId();
  const quizzes = isNew ? [] : await listQuizzes(anonId);

  const res = NextResponse.json({ quizzes });
  if (isNew) {
    res.headers.set("Set-Cookie", anonIdCookieHeader(anonId));
  }
  return res;
}
