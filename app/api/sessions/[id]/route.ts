import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateAnonId,
  updateSession,
  deleteSession,
} from "@/lib/session-store";
import type { ConversationMessage, LogEntry } from "@/lib/types";
import type { StoredResearch } from "@/lib/session-store";

/** PUT /api/sessions/[id] — update a session */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { anonId } = await getOrCreateAnonId();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { conversationHistory, logs, deepResearch, ...patch } = body;
  await updateSession(anonId, id, patch, {
    conversationHistory: conversationHistory as ConversationMessage[] | undefined,
    logs: logs as LogEntry[] | undefined,
    deepResearch: deepResearch as StoredResearch | undefined,
  });

  return NextResponse.json({ ok: true });
}

/** DELETE /api/sessions/[id] — delete a session */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { anonId } = await getOrCreateAnonId();
  await deleteSession(anonId, id);
  return NextResponse.json({ ok: true });
}
