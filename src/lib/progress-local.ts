/** Progreso local + rachas — patrón Ulpan (progress.ts) adaptado a atendeBR. */

import type { LessonProgress, ProgressStatus } from "@/types";

export type AtendeProgress = {
  completedLessons: string[];
  lessonScores: Record<string, number>;
  streak: number;
  lastStudyDay: string | null;
  xp: number;
  simulationCount: number;
  lastSimulationScore: number | null;
};

const STORAGE_KEY = "atendebr-progress-v1";
export const PROGRESS_EVENT = "atendebr-progress";

export function subscribeProgress(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PROGRESS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PROGRESS_EVENT, onStoreChange);
  };
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function defaultProgress(): AtendeProgress {
  return {
    completedLessons: [],
    lessonScores: {},
    streak: 0,
    lastStudyDay: null,
    xp: 0,
    simulationCount: 0,
    lastSimulationScore: null,
  };
}

export const EMPTY_PROGRESS: AtendeProgress = defaultProgress();

let cachedRaw: string | null = null;
let cachedProgress: AtendeProgress = EMPTY_PROGRESS;

export function loadProgress(): AtendeProgress {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedProgress;
    cachedRaw = raw;
    cachedProgress = raw ? { ...defaultProgress(), ...JSON.parse(raw) } : EMPTY_PROGRESS;
    return cachedProgress;
  } catch {
    cachedRaw = null;
    cachedProgress = EMPTY_PROGRESS;
    return EMPTY_PROGRESS;
  }
}

export function getServerProgressSnapshot(): AtendeProgress {
  return EMPTY_PROGRESS;
}

export function saveProgress(state: AtendeProgress): void {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(state);
  localStorage.setItem(STORAGE_KEY, serialized);
  cachedRaw = serialized;
  cachedProgress = state;
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

function bumpStreak(state: AtendeProgress): Pick<AtendeProgress, "streak" | "lastStudyDay"> {
  const day = todayKey();
  if (state.lastStudyDay === day) {
    return { streak: state.streak, lastStudyDay: day };
  }
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);
  return {
    streak: state.lastStudyDay === yKey ? state.streak + 1 : 1,
    lastStudyDay: day,
  };
}

export function markLessonComplete(
  state: AtendeProgress,
  lessonId: string,
  scorePercent: number,
): AtendeProgress {
  const already = state.completedLessons.includes(lessonId);
  const completed = already ? state.completedLessons : [...state.completedLessons, lessonId];
  const streak = bumpStreak(state);
  return {
    ...state,
    ...streak,
    completedLessons: completed,
    lessonScores: {
      ...state.lessonScores,
      [lessonId]: Math.max(scorePercent, state.lessonScores[lessonId] ?? 0),
    },
    xp: state.xp + (already ? 10 : 40) + Math.round(scorePercent / 10),
  };
}

export function recordSimulation(state: AtendeProgress, score: number): AtendeProgress {
  const streak = bumpStreak(state);
  return {
    ...state,
    ...streak,
    simulationCount: state.simulationCount + 1,
    lastSimulationScore: score,
    xp: state.xp + 25 + Math.round(score / 10),
  };
}

export function toLessonProgressList(
  state: AtendeProgress,
  lessonIds: string[],
): LessonProgress[] {
  return lessonIds.map((lessonId) => {
    const completed = state.completedLessons.includes(lessonId);
    const status: ProgressStatus = completed
      ? "completed"
      : state.lessonScores[lessonId] != null
        ? "in_progress"
        : "not_started";
    return {
      lesson_id: lessonId,
      status,
      score: state.lessonScores[lessonId] ?? null,
      time_spent_seconds: 0,
      completed_at: completed ? new Date().toISOString() : null,
    };
  });
}
