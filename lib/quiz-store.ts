/**
 * Redis-backed quiz persistence.
 * Same pattern as session-store.ts — uses anon_id cookie + Redis sorted sets.
 */

import { redis, SESSION_TTL, MAX_SESSIONS } from "./redis";
import { QuizQuestion } from "./quiz";

/** A saved quiz with its questions, score, and metadata. */
export interface StoredQuiz {
  id: string;
  title: string;
  topic: string;
  questions: QuizQuestion[];
  completed: boolean;
  score: number | null;
  answers: number[];
  createdAt: number;
  updatedAt: number;
}

function quizKey(id: string) {
  return `quiz:${id}`;
}

function userQuizzesKey(anonId: string) {
  return `user:${anonId}:quizzes`;
}

/** List all quizzes for a user, newest first. */
export async function listQuizzes(anonId: string): Promise<StoredQuiz[]> {
  const ids = await redis.zrange<string[]>(
    userQuizzesKey(anonId),
    0,
    -1,
    { rev: true }
  );
  if (!ids || ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get(quizKey(id));
  }
  const results = await pipeline.exec<(StoredQuiz | null)[]>();

  const quizzes: StoredQuiz[] = [];
  for (let i = 0; i < ids.length; i++) {
    const data = results[i];
    if (data) {
      quizzes.push(data);
    } else {
      await redis.zrem(userQuizzesKey(anonId), ids[i]);
    }
  }
  return quizzes;
}

/** Save a new quiz. */
export async function saveQuiz(
  anonId: string,
  quiz: StoredQuiz
): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.set(quizKey(quiz.id), quiz, { ex: SESSION_TTL });
  pipeline.zadd(userQuizzesKey(anonId), {
    score: quiz.updatedAt,
    member: quiz.id,
  });
  pipeline.expire(userQuizzesKey(anonId), SESSION_TTL);
  await pipeline.exec();

  // Enforce max quizzes (reuse MAX_SESSIONS limit)
  const count = await redis.zcard(userQuizzesKey(anonId));
  if (count > MAX_SESSIONS) {
    const toRemove = await redis.zrange<string[]>(
      userQuizzesKey(anonId),
      0,
      count - MAX_SESSIONS - 1
    );
    if (toRemove.length > 0) {
      const cleanup = redis.pipeline();
      for (const id of toRemove) {
        cleanup.del(quizKey(id));
        cleanup.zrem(userQuizzesKey(anonId), id);
      }
      await cleanup.exec();
    }
  }
}

/** Update an existing quiz (e.g., mark completed, update score). */
export async function updateQuiz(
  anonId: string,
  quizId: string,
  patch: Partial<StoredQuiz>
): Promise<void> {
  const existing = await redis.get<StoredQuiz>(quizKey(quizId));
  if (!existing) return;

  const updated: StoredQuiz = {
    ...existing,
    ...patch,
    id: quizId,
    updatedAt: Date.now(),
  };

  const pipeline = redis.pipeline();
  pipeline.set(quizKey(quizId), updated, { ex: SESSION_TTL });
  pipeline.zadd(userQuizzesKey(anonId), {
    score: updated.updatedAt,
    member: quizId,
  });
  await pipeline.exec();
}

/** Get a single quiz by ID. */
export async function getQuiz(quizId: string): Promise<StoredQuiz | null> {
  return redis.get<StoredQuiz>(quizKey(quizId));
}

/** Delete a quiz. */
export async function deleteQuiz(
  anonId: string,
  quizId: string
): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.del(quizKey(quizId));
  pipeline.zrem(userQuizzesKey(anonId), quizId);
  await pipeline.exec();
}

export type AdminQuizSummary = StoredQuiz & { anonId: string };

export interface PaginatedQuizzes {
  quizzes: AdminQuizSummary[];
  nextCursor: string | null;
}

/**
 * Cursor-paginated SCAN over every user's quizzes. Mirrors the conversation
 * admin pagination so a single page completes quickly.
 */
export async function listAllQuizzes({
  cursor = 0,
  pageSize = 50,
}: {
  cursor?: string | number;
  pageSize?: number;
} = {}): Promise<PaginatedQuizzes> {
  const byQuizId = new Map<string, AdminQuizSummary>();
  const visitedUserKeys = new Set<string>();
  let nextCursor: string | number = cursor;

  do {
    const scanRes = (await redis.scan(nextCursor, {
      match: "user:*:quizzes",
      count: 100,
    })) as [string | number, string[]];
    nextCursor = scanRes[0];
    const keys = scanRes[1];

    const newKeys = keys.filter((k) => {
      if (visitedUserKeys.has(k)) return false;
      visitedUserKeys.add(k);
      return true;
    });

    const userBatches = await Promise.all(
      newKeys.map(async (userKey) => {
        const anonId = userKey.slice("user:".length, -":quizzes".length);
        const ids = await redis.zrange<string[]>(userKey, 0, -1, { rev: true });
        if (!ids || ids.length === 0) return [] as AdminQuizSummary[];

        const pipeline = redis.pipeline();
        for (const id of ids) pipeline.get(quizKey(id));
        const results = await pipeline.exec<(StoredQuiz | null)[]>();

        const out: AdminQuizSummary[] = [];
        for (const data of results) {
          if (data) out.push({ ...data, anonId });
        }
        return out;
      })
    );

    for (const batch of userBatches) {
      for (const q of batch) {
        if (!byQuizId.has(q.id)) byQuizId.set(q.id, q);
      }
    }
  } while (
    nextCursor !== 0 &&
    nextCursor !== "0" &&
    byQuizId.size < pageSize
  );

  const done = nextCursor === 0 || nextCursor === "0";
  const quizzes = Array.from(byQuizId.values()).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  return {
    quizzes,
    nextCursor: done ? null : String(nextCursor),
  };
}
