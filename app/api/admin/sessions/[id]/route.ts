import { NextRequest, NextResponse } from "next/server";
import {
  getSessionById,
  getHistory,
  getLogs,
  getResearch,
  deleteSession,
} from "@/lib/session-store";

/** GET /api/admin/sessions/[id] — full session detail (messages, history, logs, research). */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const [session, history, logs, research] = await Promise.all([
      getSessionById(id),
      getHistory(id),
      getLogs(id),
      getResearch(id),
    ]);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session, history, logs, research });
  } catch (err) {
    console.error("Failed to load session detail:", err);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/sessions/[id]?anonId=... — remove a single session. */
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
    await deleteSession(anonId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete session:", err);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
