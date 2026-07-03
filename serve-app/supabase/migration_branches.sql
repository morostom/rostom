-- SERVE — migration: branches (multi-location) + multi-tenancy groundwork.
-- Run once in the Supabase SQL Editor (safe to re-run).
--
-- A club/academy can run several branches, each with its own live board and
-- schedule. We model a branch as its own club_id on the courts/sessions tables
-- (so no unique-constraint surgery), listed in a new `branches` table under a
-- parent org_id. Existing Heliopolis courts move to the "Masr El Gedida" branch
-- and a second "El Shorouk" branch (10 courts) is added.

-- 1) branches table
create table if not exists public.branches (
  id text primary key,             -- e.g. 'hel-masr'
  org_id text not null,            -- parent org: 'heliopolis' | 'ramyashour'
  name text not null,              -- 'Masr El Gedida'
  location text,                   -- 'Heliopolis · Cairo'
  court_count int default 0,
  created_at timestamptz default now()
);

-- 2) bookings gain a branch tag (to free the right court on cancel)
alter table public.bookings add column if not exists branch text;

-- 3) multi-tenancy foundation: which auth user owns an org
alter table public.org_settings add column if not exists owner_id uuid;

-- 4) move existing Heliopolis live courts + schedule to the Masr El Gedida branch
update public.courts   set club_id = 'hel-masr' where club_id = 'heliopolis';
update public.sessions set club_id = 'hel-masr' where club_id = 'heliopolis';

-- 5) seed branches (only if none yet)
insert into public.branches (id, org_id, name, location, court_count)
select * from (values
  ('hel-masr',    'heliopolis', 'Masr El Gedida', 'Heliopolis · Cairo', 7),
  ('hel-shorouk', 'heliopolis', 'El Shorouk',     'El Shorouk City',    10),
  ('ramy-main',   'ramyashour', 'Main Branch',    'New Cairo',          7)
) as v(id, org_id, name, location, court_count)
where not exists (select 1 from public.branches);

-- 6) seed El Shorouk's 10 courts (only if that branch has none)
insert into public.courts (club_id, court_no, type, status, next)
select 'hel-shorouk', g, 'Standard', 'free', 'open'
from generate_series(1, 10) as g
where not exists (select 1 from public.courts where club_id = 'hel-shorouk');

-- 7) RLS + realtime for branches (public read, authenticated write)
alter table public.branches enable row level security;
drop policy if exists "branches read" on public.branches;
create policy "branches read" on public.branches for select using (true);
drop policy if exists "branches write" on public.branches;
create policy "branches write" on public.branches for all to authenticated using (true) with check (true);

do $$ begin alter publication supabase_realtime add table public.branches;
exception when duplicate_object then null; end $$;
