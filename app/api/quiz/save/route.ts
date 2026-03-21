import { NextRequest, NextResponse } from "next/server";
import { getOrCreateAnonId, anonIdCookieHeader } from "@/lib/session-store";
import { saveQuiz, StoredQuiz } from "@/lib/quiz-store";

/** POST /api/quiz/save — save a generated quiz */
export async function POST(req: NextRequest) {
  const { anonId, isNew } = await getOrCreateAnonId();

  let body: StoredQuiz;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await saveQuiz(anonId, body);

  const res = NextResponse.json({ ok: true });
  if (isNew) {
    res.headers.set("Set-Cookie", anonIdCookieHeader(anonId));
  }
  return res;
}
