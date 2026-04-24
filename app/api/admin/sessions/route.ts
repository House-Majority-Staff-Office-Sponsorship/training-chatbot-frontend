import { NextRequest, NextResponse } from "next/server";
import { listAllSessions, deleteAllSessions } from "@/lib/session-store";

/** GET /api/admin/sessions?cursor=0&pageSize=50 — paginated list. */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const cursor = url.searchParams.get("cursor") ?? "0";
    const pageSize = Number(url.searchParams.get("pageSize") ?? "50");

    const { sessions, nextCursor } = await listAllSessions({
      cursor,
      pageSize: Number.isFinite(pageSize) ? pageSize : 50,
    });

    return NextResponse.json({ sessions, nextCursor });
  } catch (err) {
    console.error("Failed to list all sessions:", err);
    return NextResponse.json(
      { error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

/** DELETE /api/admin/sessions — wipe every session in Redis. */
export async function DELETE() {
  try {
    const { deleted } = await deleteAllSessions();
    return NextResponse.json({ deleted });
  } catch (err) {
    console.error("Failed to clear sessions:", err);
    return NextResponse.json(
      { error: "Failed to clear sessions" },
      { status: 500 }
    );
  }
}
