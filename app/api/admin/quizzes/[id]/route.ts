import { NextRequest, NextResponse } from "next/server";
import { getQuiz, deleteQuiz } from "@/lib/quiz-store";

/** GET /api/admin/quizzes/[id] — full quiz detail (questions, answers, score). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const quiz = await getQuiz(id);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    return NextResponse.json({ quiz });
  } catch (err) {
    console.error("Failed to load quiz detail:", err);
    return NextResponse.json(
      { error: "Failed to load quiz" },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/quizzes/[id]?anonId=... — remove a single quiz. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const anonId = url.searchParams.get("anonId");

  if (!anonId) {
    return NextResponse.json(
      { error: "Missing anonId query param" },
      { status: 400 }
    );
  }

  try {
    await deleteQuiz(anonId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete quiz:", err);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
