-- SERVE — Supabase schema (first pass: auth + live sync)
-- Run this in your Supabase project: SQL Editor → paste → Run.
-- Safe to re-run (drops & recreates the demo tables).
--
-- Security note: the shared "live" tables (courts, sessions, org_settings)
-- use permissive policies so the coach/admin consoles — which don't have
-- their own login yet — can edit and have the player app react in real time.
-- Tighten these to org-admin roles before any real launch.

-- ── profiles (one row per authenticated user) ────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  method text,            -- 'phone' | 'email'
  identifier text,        -- the phone/email they signed up with
  card jsonb,             -- their player card (cardType, division, etc.)
  created_at timestamptz default now()
);

-- ── org settings (themes, names, uploaded images per club/academy) ───
create table if not exists public.org_settings (
  id text primary key,    -- 'heliopolis' | 'ramyashour' ...
  type text,              -- 'club' | 'academy'
  name text,
  accent text,
  logo text,              -- data URL or storage path
  cover text,
  crest text,
  updated_at timestamptz default now()
);

-- ── live courts (one club's board — Heliopolis for the demo) ─────────
create table if not exists public.courts (
  id bigint generated always as identity primary key,
  club_id text not null,
  court_no int not null,
  type text default 'Standard',
  status text default 'free',   -- free | playing | lesson | booked
  who text,
  coach text,
  until text,
  remaining int,                -- minutes left
  next text,
  unique (club_id, court_no)
);

-- ── schedule sessions ────────────────────────────────────────────────
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  club_id text not null default 'heliopolis',
  day text,
  time text,
  type text,                    -- Lesson | Group training | Fitness
  title text,
  coach text,
  court int,
  players text[] default '{}',
  created_at timestamptz default now()
);

-- ── bookings (per user) ──────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  venue text,
  court text,
  title text,
  type text,
  day text,
  time text,
  end_time text,
  price int,
  method text,                  -- applepay | card | telda
  status text default 'confirmed',
  created_at timestamptz default now()
);

-- ── academy payments (manual cash/card reconciliation) ───────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  academy_id text default 'ramyashour',
  player text,
  item text,
  amount int,
  status text default 'unpaid', -- unpaid | paid
  method text                   -- cash | card
);

-- ── staff (coaches, editable from the consoles) ──────────────────────
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  org_id text not null,          -- 'heliopolis' | 'ramyashour'
  name text not null,
  role text,
  initials text,
  squads text,
  created_at timestamptz default now()
);

-- ── access codes ─────────────────────────────────────────────────────
create table if not exists public.access_codes (
  code text primary key,
  club_id text default 'heliopolis',
  assigned_to text,
  status text default 'open',   -- open | sent | redeemed
  via text,
  when_label text
);

-- ── Row Level Security ───────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.org_settings  enable row level security;
alter table public.courts        enable row level security;
alter table public.sessions      enable row level security;
alter table public.bookings      enable row level security;
alter table public.payments      enable row level security;
alter table public.access_codes  enable row level security;
alter table public.staff         enable row level security;

-- profiles: anyone can read (rosters), you manage your own
drop policy if exists "profiles read" on public.profiles;
create policy "profiles read"   on public.profiles for select using (true);
drop policy if exists "profiles write own" on public.profiles;
create policy "profiles write own" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- bookings: you only see and write your own
drop policy if exists "bookings own" on public.bookings;
create policy "bookings own" on public.bookings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- shared demo tables: public read; write allowed for everyone (DEMO ONLY)
do $$
declare t text;
begin
  foreach t in array array['org_settings','courts','sessions','payments','access_codes','staff'] loop
    execute format('drop policy if exists "%s read" on public.%I;', t, t);
    execute format('create policy "%s read" on public.%I for select using (true);', t, t);
    execute format('drop policy if exists "%s write" on public.%I;', t, t);
    execute format('create policy "%s write" on public.%I for all using (true) with check (true);', t, t);
  end loop;
end $$;

-- ── Realtime: broadcast row changes for the live tables ──────────────
alter publication supabase_realtime add table public.courts;
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.org_settings;
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.staff;
