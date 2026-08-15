"use client";

import { createClient } from "@/lib/supabase/client";
import { DEMO_LESSONS, DEMO_SCENARIOS } from "@/lib/demo-data";
import type {
  ChatMessage,
  Company,
  DemoSession,
  Profile,
  SimulationAttempt,
  SimulationScore,
  TeamMemberProgress,
  UserRole,
} from "@/types";

type ProfileRow = Profile & { company?: Company | Company[] | null };

function asCompany(raw: Company | Company[] | null | undefined): Company | null {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

export async function loadCloudSession(): Promise<DemoSession | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("*, company:companies(*)")
    .eq("id", user.id)
    .maybeSingle();

  let row = existing as ProfileRow | null;

  if (!row) {
    const fullName =
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
      (user.email?.split("@")[0] ?? "Colaborador");

    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
      role: "collaborator",
    });

    const { data: created } = await supabase
      .from("profiles")
      .select("*, company:companies(*)")
      .eq("id", user.id)
      .maybeSingle();
    row = created as ProfileRow | null;
  }

  if (!row) return null;

  const company = asCompany(row.company);
  return {
    profile: {
      id: row.id,
      company_id: row.company_id,
      email: row.email,
      full_name: row.full_name,
      role: row.role,
      avatar_url: row.avatar_url,
      streak_days: row.streak_days,
      last_activity_at: row.last_activity_at,
    },
    company: company ?? {
      id: "",
      name: "Sin empresa",
      slug: "pending",
      primary_color: "#0A4D68",
      invite_code: null,
    },
  };
}

export async function createCompany(name: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase.rpc("create_company_for_user", { p_name: name });
  if (error) throw error;
  return data as { company_id: string; invite_code: string; name: string; already: boolean };
}

export async function joinCompany(code: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase no configurado");
  const { data, error } = await supabase.rpc("join_company_by_invite", { p_code: code });
  if (error) throw error;
  return data as { company_id: string; name: string; invite_code: string };
}

export async function signOutCloud() {
  const supabase = createClient();
  if (supabase) await supabase.auth.signOut();
}

export async function saveLessonProgressCloud(lessonId: string, score: number, timeSpentSeconds = 360) {
  const supabase = createClient();
  if (!supabase) return false;
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return false;

  const { error } = await supabase.from("user_lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      status: "completed",
      score,
      time_spent_seconds: timeSpentSeconds,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );
  if (error) {
    console.error("saveLessonProgressCloud", error.message);
    return false;
  }

  await supabase
    .from("profiles")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", user.id);

  return true;
}

export async function saveSimulationCloud(
  scenarioId: string,
  messages: ChatMessage[],
  score: SimulationScore,
  durationSeconds: number,
) {
  const supabase = createClient();
  if (!supabase) return false;
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return false;

  const { error } = await supabase.from("simulation_attempts").insert({
    user_id: user.id,
    scenario_id: scenarioId,
    messages,
    overall_score: score.overall,
    language_score: score.language,
    tone_score: score.tone,
    culture_score: score.culture,
    empathy_score: score.empathy,
    feedback: score.feedback,
    suggestions: score.suggestions,
    duration_seconds: durationSeconds,
  });
  if (error) {
    console.error("saveSimulationCloud", error.message);
    return false;
  }

  await supabase
    .from("profiles")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", user.id);

  return true;
}

export async function fetchMyLessonCompletions(): Promise<string[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, status")
    .eq("user_id", auth.user.id);
  if (error || !data) return [];
  return data.filter((row) => row.status === "completed").map((row) => row.lesson_id as string);
}

export async function fetchMyAttempts(): Promise<SimulationAttempt[]> {
  const supabase = createClient();
  if (!supabase) return [];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from("simulation_attempts")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    scenario_id: row.scenario_id,
    messages: (row.messages ?? []) as ChatMessage[],
    overall_score: row.overall_score,
    language_score: row.language_score,
    tone_score: row.tone_score,
    culture_score: row.culture_score,
    empathy_score: row.empathy_score,
    feedback: row.feedback,
    suggestions: Array.isArray(row.suggestions) ? row.suggestions.map(String) : [],
    duration_seconds: row.duration_seconds ?? 0,
    created_at: row.created_at,
    scenario: DEMO_SCENARIOS.find((s) => s.id === row.scenario_id),
  }));
}

export async function fetchTeamProgressLive(
  companyId: string,
  role: UserRole,
): Promise<TeamMemberProgress[] | null> {
  if (role !== "supervisor" && role !== "company_admin" && role !== "super_admin") {
    return null;
  }
  const supabase = createClient();
  if (!supabase || !companyId) return null;

  const { data: members, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("company_id", companyId)
    .order("full_name");
  if (error || !members) return null;

  const ids = members.map((m) => m.id);
  if (ids.length === 0) return [];

  const [{ data: progress }, { data: attempts }] = await Promise.all([
    supabase.from("user_lesson_progress").select("user_id, status").in("user_id", ids),
    supabase.from("simulation_attempts").select("user_id, overall_score").in("user_id", ids),
  ]);

  const totalLessons = DEMO_LESSONS.length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return members.map((member) => {
    const completed = (progress ?? []).filter(
      (p) => p.user_id === member.id && p.status === "completed",
    ).length;
    const scores = (attempts ?? [])
      .filter((a) => a.user_id === member.id && a.overall_score != null)
      .map((a) => Number(a.overall_score));
    const avg =
      scores.length > 0 ? Math.round(scores.reduce((acc, n) => acc + n, 0) / scores.length) : null;
    const last = member.last_activity_at ? new Date(member.last_activity_at).getTime() : 0;
    const isBehind = completed < Math.ceil(totalLessons * 0.3) || last < weekAgo;

    return {
      profile: member as Profile,
      lessons_completed: completed,
      lessons_total: totalLessons,
      avg_simulation_score: avg,
      last_activity_at: member.last_activity_at ?? null,
      assigned_path_title: "Atención al Cliente",
      is_behind: isBehind,
    };
  });
}
