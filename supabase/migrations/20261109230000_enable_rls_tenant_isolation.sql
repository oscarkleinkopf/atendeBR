-- Enable tenant isolation before exposing these tables through the Supabase anon/authenticated keys.
-- service_role continues to bypass RLS (migrations, admin jobs).

create or replace function public.auth_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.company_id
  from public.profiles p
  where p.id = (select auth.uid())
$$;

create or replace function public.auth_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
$$;

revoke all on function public.auth_company_id() from public;
revoke all on function public.auth_role() from public;
grant execute on function public.auth_company_id() to authenticated;
grant execute on function public.auth_role() to authenticated;

create or replace function public.is_company_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.auth_role() in ('supervisor', 'company_admin', 'super_admin')
$$;

revoke all on function public.is_company_manager() from public;
grant execute on function public.is_company_manager() to authenticated;

-- companies
alter table public.companies enable row level security;

create policy "companies_select_own"
  on public.companies
  for select
  to authenticated
  using (
    public.auth_role() = 'super_admin'
    or id = public.auth_company_id()
  );

create policy "companies_update_admin"
  on public.companies
  for update
  to authenticated
  using (
    public.auth_role() = 'super_admin'
    or (public.auth_role() = 'company_admin' and id = public.auth_company_id())
  )
  with check (
    public.auth_role() = 'super_admin'
    or (public.auth_role() = 'company_admin' and id = public.auth_company_id())
  );

create policy "companies_insert_super_admin"
  on public.companies
  for insert
  to authenticated
  with check (public.auth_role() = 'super_admin');

-- profiles
alter table public.profiles enable row level security;

create policy "profiles_select_company"
  on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or public.auth_role() = 'super_admin'
    or company_id = public.auth_company_id()
  );

create policy "profiles_insert_self"
  on public.profiles
  for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and role = 'collaborator'
  );

create policy "profiles_update_self"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role = public.auth_role()
    and company_id is not distinct from public.auth_company_id()
  );

create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (
    public.auth_role() = 'super_admin'
    or (
      public.auth_role() = 'company_admin'
      and company_id = public.auth_company_id()
    )
  )
  with check (
    public.auth_role() = 'super_admin'
    or (
      public.auth_role() = 'company_admin'
      and company_id = public.auth_company_id()
      and role <> 'super_admin'
    )
  );

-- learning_paths
alter table public.learning_paths enable row level security;

create policy "learning_paths_select"
  on public.learning_paths
  for select
  to authenticated
  using (
    public.auth_role() = 'super_admin'
    or is_template
    or company_id is null
    or company_id = public.auth_company_id()
  );

create policy "learning_paths_write_admin"
  on public.learning_paths
  for all
  to authenticated
  using (
    public.auth_role() = 'super_admin'
    or (public.auth_role() = 'company_admin' and company_id = public.auth_company_id())
  )
  with check (
    public.auth_role() = 'super_admin'
    or (public.auth_role() = 'company_admin' and company_id = public.auth_company_id())
  );

-- lessons (visibility follows parent path)
alter table public.lessons enable row level security;

create policy "lessons_select"
  on public.lessons
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.learning_paths lp
      where lp.id = lessons.path_id
        and (
          public.auth_role() = 'super_admin'
          or lp.is_template
          or lp.company_id is null
          or lp.company_id = public.auth_company_id()
        )
    )
  );

create policy "lessons_write_admin"
  on public.lessons
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.learning_paths lp
      where lp.id = lessons.path_id
        and (
          public.auth_role() = 'super_admin'
          or (public.auth_role() = 'company_admin' and lp.company_id = public.auth_company_id())
        )
    )
  )
  with check (
    exists (
      select 1
      from public.learning_paths lp
      where lp.id = lessons.path_id
        and (
          public.auth_role() = 'super_admin'
          or (public.auth_role() = 'company_admin' and lp.company_id = public.auth_company_id())
        )
    )
  );

-- simulation_scenarios
alter table public.simulation_scenarios enable row level security;

create policy "scenarios_select"
  on public.simulation_scenarios
  for select
  to authenticated
  using (
    public.auth_role() = 'super_admin'
    or is_template
    or company_id is null
    or company_id = public.auth_company_id()
  );

create policy "scenarios_write_admin"
  on public.simulation_scenarios
  for all
  to authenticated
  using (
    public.auth_role() = 'super_admin'
    or (public.auth_role() = 'company_admin' and company_id = public.auth_company_id())
  )
  with check (
    public.auth_role() = 'super_admin'
    or (public.auth_role() = 'company_admin' and company_id = public.auth_company_id())
  );

-- user_path_assignments
alter table public.user_path_assignments enable row level security;

create policy "assignments_select"
  on public.user_path_assignments
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.auth_role() = 'super_admin'
    or (
      public.is_company_manager()
      and exists (
        select 1
        from public.profiles p
        where p.id = user_path_assignments.user_id
          and p.company_id = public.auth_company_id()
      )
    )
  );

create policy "assignments_write_managers"
  on public.user_path_assignments
  for all
  to authenticated
  using (
    public.auth_role() = 'super_admin'
    or (
      public.auth_role() in ('supervisor', 'company_admin')
      and exists (
        select 1
        from public.profiles p
        where p.id = user_path_assignments.user_id
          and p.company_id = public.auth_company_id()
      )
    )
  )
  with check (
    public.auth_role() = 'super_admin'
    or (
      public.auth_role() in ('supervisor', 'company_admin')
      and exists (
        select 1
        from public.profiles p
        where p.id = user_path_assignments.user_id
          and p.company_id = public.auth_company_id()
      )
    )
  );

-- user_lesson_progress
alter table public.user_lesson_progress enable row level security;

create policy "progress_select"
  on public.user_lesson_progress
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.auth_role() = 'super_admin'
    or (
      public.is_company_manager()
      and exists (
        select 1
        from public.profiles p
        where p.id = user_lesson_progress.user_id
          and p.company_id = public.auth_company_id()
      )
    )
  );

create policy "progress_write_self"
  on public.user_lesson_progress
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "progress_update_self"
  on public.user_lesson_progress
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- simulation_attempts
alter table public.simulation_attempts enable row level security;

create policy "attempts_select"
  on public.simulation_attempts
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.auth_role() = 'super_admin'
    or (
      public.is_company_manager()
      and exists (
        select 1
        from public.profiles p
        where p.id = simulation_attempts.user_id
          and p.company_id = public.auth_company_id()
      )
    )
  );

create policy "attempts_insert_self"
  on public.simulation_attempts
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- badges (catalog)
alter table public.badges enable row level security;

create policy "badges_select_authenticated"
  on public.badges
  for select
  to authenticated
  using (true);

-- user_badges
alter table public.user_badges enable row level security;

create policy "user_badges_select"
  on public.user_badges
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.auth_role() = 'super_admin'
    or (
      public.is_company_manager()
      and exists (
        select 1
        from public.profiles p
        where p.id = user_badges.user_id
          and p.company_id = public.auth_company_id()
      )
    )
  );
