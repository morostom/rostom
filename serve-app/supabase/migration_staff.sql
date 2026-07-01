-- SERVE — migration: coaches/staff editable from the consoles.
-- Run this once in the Supabase SQL Editor (safe to re-run). It adds a `staff`
-- table (coaches, scoped per club/academy), opens it to the consoles, enables
-- realtime, and seeds the current coaches.

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,          -- 'heliopolis' (club) | 'ramyashour' (academy)
  name text not null,
  role text,
  initials text,
  squads text,
  created_at timestamptz default now()
);

alter table public.staff enable row level security;

drop policy if exists "staff read" on public.staff;
create policy "staff read" on public.staff for select using (true);
drop policy if exists "staff write" on public.staff;
create policy "staff write" on public.staff for all using (true) with check (true);

-- realtime (ignore error if already added)
do $$ begin
  alter publication supabase_realtime add table public.staff;
exception when duplicate_object then null; end $$;

-- seed coaches (only if the table is empty)
insert into public.staff (org_id, name, role, initials, squads)
select * from (values
  ('heliopolis','Ali Ashmawy','Head Coach','AA','Elite · U19'),
  ('heliopolis','Abdel Rahman ElSergany','Head Coach','AE','U15 · U17'),
  ('heliopolis','Mohamed Reda','Performance Coach','MR','U13 · U15'),
  ('heliopolis','Bassem Tarek','Fitness & Conditioning','BT','All squads'),
  ('heliopolis','Adham Nabil','Junior Development','AN','U11 · U13'),
  ('heliopolis','Ismail Sherif','Private Coach','IS','Privates'),
  ('ramyashour','Ali Ashmawy','Head Coach','AA','Elite · U19'),
  ('ramyashour','Mohamed Reda','Performance Coach','MR','U13 · U15'),
  ('ramyashour','Bassem Tarek','Fitness & Conditioning','BT','All squads'),
  ('ramyashour','Adham Nabil','Junior Development','AN','U11 · U13')
) as v(org_id, name, role, initials, squads)
where not exists (select 1 from public.staff);
