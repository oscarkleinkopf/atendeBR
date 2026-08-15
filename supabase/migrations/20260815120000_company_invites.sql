-- Invite codes + RPCs de onboarding (aplicado en proyecto pkcuhoudvkvtunjlpidb)

alter table public.companies
  add column if not exists invite_code text;

update public.companies
set invite_code = coalesce(invite_code, 'DEMO2026')
where invite_code is null;

create unique index if not exists companies_invite_code_uidx
  on public.companies (invite_code);
