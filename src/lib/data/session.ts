import { cookies } from "next/headers";
import {
  DEMO_COMPANY,
  DEMO_LESSONS,
  DEMO_PATH,
  DEMO_SCENARIOS,
  DEMO_USERS,
  getDefaultProgress,
  getDemoAttempts,
  getDemoTeamProgress,
} from "@/lib/demo-data";
import type {
  DemoSession,
  LearningPath,
  Lesson,
  LessonProgress,
  SimulationAttempt,
  SimulationScenario,
  TeamMemberProgress,
} from "@/types";
import { canViewTeam } from "@/lib/utils";

export { canViewTeam };

export const DEMO_COOKIE = "atendebr_demo_role";

export async function getDemoSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get(DEMO_COOKIE)?.value as
    | "collaborator"
    | "supervisor"
    | "company_admin"
    | undefined;

  if (!role || !DEMO_USERS[role]) return null;

  return {
    profile: DEMO_USERS[role],
    company: DEMO_COMPANY,
  };
}

export async function requireSession(): Promise<DemoSession> {
  const session = await getDemoSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export function getLearningPath(): LearningPath {
  return { ...DEMO_PATH, lessons: DEMO_LESSONS };
}

export function getLesson(lessonId: string): Lesson | undefined {
  return DEMO_LESSONS.find((l) => l.id === lessonId || l.slug === lessonId);
}

export function getScenarios(): SimulationScenario[] {
  return DEMO_SCENARIOS;
}

export function getScenario(idOrSlug: string): SimulationScenario | undefined {
  return DEMO_SCENARIOS.find((s) => s.id === idOrSlug || s.slug === idOrSlug);
}

export async function getProgressForUser(userId: string): Promise<LessonProgress[]> {
  void userId;
  return getDefaultProgress();
}

export async function getAttemptsForUser(userId: string): Promise<SimulationAttempt[]> {
  return getDemoAttempts(userId);
}

export function getTeamProgress(): TeamMemberProgress[] {
  return getDemoTeamProgress();
}

export function allPhrases() {
  return DEMO_LESSONS.flatMap((lesson) =>
    (lesson.phrases_json ?? []).map((phrase) => ({
      ...phrase,
      lessonTitle: lesson.title,
    })),
  );
}
