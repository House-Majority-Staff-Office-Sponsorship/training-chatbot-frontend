import { NextRequest, NextResponse } from "next/server";
import { getHistory, getLogs, getResearch } from "@/lib/session-store";

/** GET /api/sessions/[id]/history — get conversation history, logs, and research */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [history, logs, research] = await Promise.all([
    getHistory(id),
    getLogs(id),
    getResearch(id),
  ]);

  return NextResponse.json({ history, logs, research });
}
