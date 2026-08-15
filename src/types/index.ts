export type UserRole =
  | "super_admin"
  | "company_admin"
  | "supervisor"
  | "collaborator";

export type PathRole = "atencion" | "ventas" | "account_management";
export type LessonType = "content" | "culture" | "quiz" | "practice";
export type ProgressStatus = "not_started" | "in_progress" | "completed";

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  primary_color: string;
  invite_code?: string | null;
}

export interface Profile {
  id: string;
  company_id: string | null;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string | null;
  streak_days: number;
  last_activity_at?: string | null;
}

export interface Phrase {
  pt: string;
  es: string;
  note?: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface Lesson {
  id: string;
  path_id: string;
  slug: string;
  title: string;
  summary: string;
  content_md: string;
  audio_script?: string | null;
  lesson_type: LessonType;
  duration_minutes: number;
  sort_order: number;
  quiz_json?: { questions: QuizQuestion[] } | null;
  phrases_json?: Phrase[] | null;
}

export interface LearningPath {
  id: string;
  company_id: string | null;
  slug: string;
  title: string;
  description: string;
  role_focus: PathRole;
  estimated_hours: number;
  is_template: boolean;
  lessons?: Lesson[];
}

export interface SimulationScenario {
  id: string;
  path_id: string | null;
  slug: string;
  title: string;
  description: string;
  customer_persona: string;
  situation: string;
  opening_message: string;
  difficulty: number;
  evaluation_rubric: { focus?: string[] };
}

export interface ChatMessage {
  role: "customer" | "agent" | "system";
  content: string;
  at?: string;
}

export interface SimulationScore {
  overall: number;
  language: number;
  tone: number;
  culture: number;
  empathy: number;
  feedback: string;
  suggestions: string[];
}

export interface SimulationAttempt {
  id: string;
  user_id: string;
  scenario_id: string;
  messages: ChatMessage[];
  overall_score: number | null;
  language_score: number | null;
  tone_score: number | null;
  culture_score: number | null;
  empathy_score: number | null;
  feedback: string | null;
  suggestions: string[];
  duration_seconds: number;
  created_at: string;
  scenario?: SimulationScenario;
}

export interface LessonProgress {
  lesson_id: string;
  status: ProgressStatus;
  score?: number | null;
  time_spent_seconds: number;
  completed_at?: string | null;
}

export interface TeamMemberProgress {
  profile: Profile;
  lessons_completed: number;
  lessons_total: number;
  avg_simulation_score: number | null;
  last_activity_at: string | null;
  assigned_path_title: string;
  is_behind: boolean;
}

export interface DemoSession {
  profile: Profile;
  company: Company;
}
