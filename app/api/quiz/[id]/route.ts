import { NextRequest, NextResponse } from "next/server";
import { getOrCreateAnonId, anonIdCookieHeader } from "@/lib/session-store";
import { getQuiz, updateQuiz, deleteQuiz } from "@/lib/quiz-store";

/** GET /api/quiz/:id — get a single quiz */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quiz = await getQuiz(id);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }
  return NextResponse.json({ quiz });
}

/** PATCH /api/quiz/:id — update a quiz (score, completed, answers) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { anonId, isNew } = await getOrCreateAnonId();

  let patch: Record<string, unknown>;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await updateQuiz(anonId, id, patch);

  const res = NextResponse.json({ ok: true });
  if (isNew) {
    res.headers.set("Set-Cookie", anonIdCookieHeader(anonId));
  }
  return res;
}

/** DELETE /api/quiz/:id — delete a quiz */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { anonId } = await getOrCreateAnonId();
  await deleteQuiz(anonId, id);
  return NextResponse.json({ ok: true });
}
