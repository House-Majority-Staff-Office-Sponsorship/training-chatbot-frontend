import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateAnonId,
  anonIdCookieHeader,
  listSessions,
  createSession,
} from "@/lib/session-store";
import { StoredSession } from "@/lib/types";

/** GET /api/sessions — list all sessions for this user */
export async function GET() {
  const { anonId, isNew } = await getOrCreateAnonId();

  const sessions = isNew ? [] : await listSessions(anonId);

  const res = NextResponse.json({ sessions });
  if (isNew) {
    res.headers.set("Set-Cookie", anonIdCookieHeader(anonId));
  }
  return res;
}

/** POST /api/sessions — create a new session */
export async function POST(req: NextRequest) {
  const { anonId, isNew } = await getOrCreateAnonId();

  let body: { id: string; title: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const session: StoredSession = {
    id: body.id,
    title: body.title,
    lastMessage: "",
    updatedAt: Date.now(),
    messages: [],
  };

  await createSession(anonId, session);

  const res = NextResponse.json({ session });
  if (isNew) {
    res.headers.set("Set-Cookie", anonIdCookieHeader(anonId));
  }
  return res;
}
