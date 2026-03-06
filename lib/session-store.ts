import { cookies } from "next/headers";
import { redis, SESSION_TTL, MAX_SESSIONS } from "./redis";
import { StoredSession, ConversationMessage, LogEntry, DeepResearchResult, ResearcherState } from "./types";

function sessionKey(id: string) {
  return `session:${id}`;
}
function historyKey(id: string) {
  return `session:${id}:history`;
}
function logsKey(id: string) {
  return `session:${id}:logs`;
}
function researchKey(id: string) {
  return `session:${id}:research`;
}
function userSessionsKey(anonId: string) {
  return `user:${anonId}:sessions`;
}

export interface StoredResearch {
  result: Partial<DeepResearchResult>;
  researchers: ResearcherState[];
}

/** Read anon_id from cookie, or generate a new one. */
export async function getOrCreateAnonId(): Promise<{
  anonId: string;
  isNew: boolean;
}> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("anon_id")?.value;
  if (existing) return { anonId: existing, isNew: false };
  const anonId = crypto.randomUUID();
  return { anonId, isNew: true };
}

/** Set the anon_id cookie on a Response via Set-Cookie header. */
export function anonIdCookieHeader(anonId: string): string {
  const maxAge = 365 * 24 * 60 * 60;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `anon_id=${anonId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

/** List all sessions for a user, newest first. */
export async function listSessions(
  anonId: string
): Promise<StoredSession[]> {
  const ids = await redis.zrange<string[]>(
    userSessionsKey(anonId),
    0,
    -1,
    { rev: true }
  );
  if (!ids || ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get(sessionKey(id));
  }
  const results = await pipeline.exec<(StoredSession | null)[]>();

  const sessions: StoredSession[] = [];
  for (let i = 0; i < ids.length; i++) {
    const data = results[i];
    if (data) {
      sessions.push(data);
    } else {
      // Orphaned ZSET member — clean up
      await redis.zrem(userSessionsKey(anonId), ids[i]);
    }
  }
  return sessions;
}

/** Create a new session and add it to the user's ZSET. */
export async function createSession(
  anonId: string,
  session: StoredSession
): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.set(sessionKey(session.id), session, { ex: SESSION_TTL });
  pipeline.set(historyKey(session.id), [] as ConversationMessage[], { ex: SESSION_TTL });
  pipeline.set(logsKey(session.id), [] as LogEntry[], { ex: SESSION_TTL });
  pipeline.zadd(userSessionsKey(anonId), {
    score: session.updatedAt,
    member: session.id,
  });
  pipeline.expire(userSessionsKey(anonId), SESSION_TTL);
  await pipeline.exec();

  // Enforce max sessions
  const count = await redis.zcard(userSessionsKey(anonId));
  if (count > MAX_SESSIONS) {
    const toRemove = await redis.zrange<string[]>(
      userSessionsKey(anonId),
      0,
      count - MAX_SESSIONS - 1
    );
    if (toRemove.length > 0) {
      const cleanup = redis.pipeline();
      for (const id of toRemove) {
        cleanup.del(sessionKey(id));
        cleanup.del(historyKey(id));
        cleanup.del(logsKey(id));
        cleanup.del(researchKey(id));
        cleanup.zrem(userSessionsKey(anonId), id);
      }
      await cleanup.exec();
    }
  }
}

/** Partial update of a session. Refreshes TTLs and ZSET score. */
export async function updateSession(
  anonId: string,
  sessionId: string,
  patch: Partial<StoredSession>,
  extras?: {
    conversationHistory?: ConversationMessage[];
    logs?: LogEntry[];
    deepResearch?: StoredResearch;
  }
): Promise<void> {
  const existing = await redis.get<StoredSession>(sessionKey(sessionId));
  if (!existing) return;

  const updated: StoredSession = {
    ...existing,
    ...patch,
    id: sessionId, // never overwrite ID
    updatedAt: Date.now(),
  };

  const pipeline = redis.pipeline();
  pipeline.set(sessionKey(sessionId), updated, { ex: SESSION_TTL });
  pipeline.zadd(userSessionsKey(anonId), {
    score: updated.updatedAt,
    member: sessionId,
  });
  pipeline.expire(userSessionsKey(anonId), SESSION_TTL);

  if (extras?.conversationHistory) {
    pipeline.set(historyKey(sessionId), extras.conversationHistory, { ex: SESSION_TTL });
  }
  if (extras?.logs) {
    pipeline.set(logsKey(sessionId), extras.logs, { ex: SESSION_TTL });
  }
  if (extras?.deepResearch) {
    pipeline.set(researchKey(sessionId), extras.deepResearch, { ex: SESSION_TTL });
  }

  await pipeline.exec();
}

/** Delete a session and all related keys. */
export async function deleteSession(
  anonId: string,
  sessionId: string
): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.del(sessionKey(sessionId));
  pipeline.del(historyKey(sessionId));
  pipeline.del(logsKey(sessionId));
  pipeline.del(researchKey(sessionId));
  pipeline.zrem(userSessionsKey(anonId), sessionId);
  await pipeline.exec();
}

/** Get conversation history for a session. */
export async function getHistory(
  sessionId: string
): Promise<ConversationMessage[]> {
  const data = await redis.get<ConversationMessage[]>(historyKey(sessionId));
  return data ?? [];
}

/** Get agent logs for a session. */
export async function getLogs(
  sessionId: string
): Promise<LogEntry[]> {
  const data = await redis.get<LogEntry[]>(logsKey(sessionId));
  return data ?? [];
}

/** Get deep research results for a session. */
export async function getResearch(
  sessionId: string
): Promise<StoredResearch | null> {
  return redis.get<StoredResearch>(researchKey(sessionId));
}
