import { DEMO_LESSONS } from "@/lib/demo-data";

const LESSON_IDS = new Set(DEMO_LESSONS.flatMap((lesson) => [lesson.id, lesson.slug]));

export type ProgressInput = {
  lessonId: string;
  score: number;
  timeSpentSeconds: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function parseProgressInput(
  value: unknown,
): { ok: true; value: ProgressInput } | { ok: false; error: string } {
  const body = asRecord(value);
  if (!body) return { ok: false, error: "Cuerpo inválido" };
  if (typeof body.lessonId !== "string" || !LESSON_IDS.has(body.lessonId)) {
    return { ok: false, error: "lessonId inválido" };
  }

  let score = 100;
  if (body.score !== undefined) {
    if (typeof body.score !== "number" || !Number.isFinite(body.score)) {
      return { ok: false, error: "score inválido" };
    }
    score = Math.max(0, Math.min(100, Math.round(body.score)));
  }

  let timeSpentSeconds = 0;
  if (body.timeSpentSeconds !== undefined) {
    if (typeof body.timeSpentSeconds !== "number" || !Number.isFinite(body.timeSpentSeconds)) {
      return { ok: false, error: "timeSpentSeconds inválido" };
    }
    timeSpentSeconds = Math.max(0, Math.min(7200, Math.round(body.timeSpentSeconds)));
  }

  return { ok: true, value: { lessonId: body.lessonId, score, timeSpentSeconds } };
}
