-- atendeBR MVP schema (applied to Supabase project)
-- See also live project: pkcuhoudvkvtunjlpidb

create extension if not exists "pgcrypto";

create type public.user_role as enum (
  'super_admin',
  'company_admin',
  'supervisor',
  'collaborator'
);

create type public.path_role as enum (
  'atencion',
  'ventas',
  'account_management'
);

create type public.lesson_type as enum (
  'content',
  'culture',
  'quiz',
  'practice'
);

create type public.progress_status as enum (
  'not_started',
  'in_progress',
  'completed'
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  primary_color text default '#0A4D68',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,
  email text not null,
  full_name text not null,
  role public.user_role not null default 'collaborator',
  avatar_url text,
  streak_days int not null default 0,
  last_activity_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  role_focus public.path_role not null,
  estimated_hours numeric(4,1) not null default 4,
  is_template boolean not null default false,
  created_at timestamptz not null default now(),
  unique (company_id, slug)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null,
  content_md text not null,
  audio_script text,
  lesson_type public.lesson_type not null default 'content',
  duration_minutes int not null default 6,
  sort_order int not null default 0,
  quiz_json jsonb,
  phrases_json jsonb,
  created_at timestamptz not null default now(),
  unique (path_id, slug)
);

create table public.simulation_scenarios (
  id uuid primary key default gen_random_uuid(),
  path_id uuid references public.learning_paths(id) on delete set null,
  company_id uuid references public.companies(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null,
  customer_persona text not null,
  situation text not null,
  opening_message text not null,
  difficulty int not null default 2 check (difficulty between 1 and 5),
  evaluation_rubric jsonb not null default '{}'::jsonb,
  is_template boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.user_path_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  path_id uuid not null references public.learning_paths(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  assigned_at timestamptz not null default now(),
  due_at timestamptz,
  unique (user_id, path_id)
);

create table public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status public.progress_status not null default 'not_started',
  score numeric(5,2),
  time_spent_seconds int not null default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table public.simulation_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  scenario_id uuid not null references public.simulation_scenarios(id) on delete cascade,
  messages jsonb not null default '[]'::jsonb,
  overall_score numeric(5,2),
  language_score numeric(5,2),
  tone_score numeric(5,2),
  culture_score numeric(5,2),
  empathy_score numeric(5,2),
  feedback text,
  suggestions jsonb default '[]'::jsonb,
  duration_seconds int not null default 0,
  created_at timestamptz not null default now()
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  icon text not null default 'award'
);

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);
