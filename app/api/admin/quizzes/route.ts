import { NextRequest, NextResponse } from "next/server";
import { listAllQuizzes } from "@/lib/quiz-store";

/** GET /api/admin/quizzes?cursor=0&pageSize=50 — paginated list of every quiz. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor") ?? "0";
    const pageSize = Number(url.searchParams.get("pageSize") ?? "50");

    const { quizzes, nextCursor } = await listAllQuizzes({
      cursor,
      pageSize: Number.isFinite(pageSize) ? pageSize : 50,
    });

    return NextResponse.json({ quizzes, nextCursor });
  } catch (err) {
    console.error("Failed to list all quizzes:", err);
    return NextResponse.json(
      { error: "Failed to load quizzes" },
      { status: 500 }
    );
  }
}
