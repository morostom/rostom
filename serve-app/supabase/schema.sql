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
  owner_phone text,       -- WhatsApp: owner/admin
  coach_phone text,       -- WhatsApp: head coach
  owner_id uuid,          -- the auth user who owns this org (multi-tenancy)
  updated_at timestamptz default now()
);

-- ── branches (a club/academy can run several locations) ──────────────
-- The branch id is used as club_id on courts/sessions, so each branch has
-- its own live board + schedule under a parent org_id.
create table if not exists public.branches (
  id text primary key,          -- e.g. 'hel-masr'
  org_id text not null,         -- 'heliopolis' | 'ramyashour'
  name text not null,
  location text,
  court_count int default 0,
  created_at timestamptz default now()
);

-- ── live courts (per branch — club_id holds the branch id) ───────────
create table if not exists public.courts (
  id bigint generated always as identity primary key,
  club_id text not null,        -- branch id
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
  branch text,
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
  phone text,                    -- WhatsApp
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

-- ── parent accounts: links + "transfer to parent" payment requests ───
create table if not exists public.parent_links (
  id uuid primary key default gen_random_uuid(),
  parent_identifier text not null,   -- the parent's phone/email (their login)
  parent_name text,
  child_name text not null,
  status text default 'pending',     -- pending | approved (child must approve)
  created_at timestamptz default now()
);

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  parent_identifier text not null,   -- who should approve & pay
  child_name text,
  item text,
  venue text,
  court text,
  day text,
  time text,
  amount int,
  status text default 'pending',     -- pending | paid | declined | expired
  expires_at timestamptz,            -- the 10-minute court hold
  created_at timestamptz default now()
);

-- ── reviews (players rate an academy/club after a booking) ───────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id text not null,
  venue_name text,
  player text,
  rating int not null,               -- 1..5
  comment text,
  created_at timestamptz default now()
);

-- ── cancellations (under-16 need parent approval; club gets notified) ─
create table if not exists public.cancellations (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  session_title text,
  club_id text default 'heliopolis',
  coach text,
  player text,
  parent_identifier text,
  reason text,
  status text default 'cancelled',   -- pending | cancelled | declined
  created_at timestamptz default now()
);

-- ── Row Level Security ───────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.org_settings     enable row level security;
alter table public.courts           enable row level security;
alter table public.sessions         enable row level security;
alter table public.bookings         enable row level security;
alter table public.payments         enable row level security;
alter table public.access_codes     enable row level security;
alter table public.staff            enable row level security;
alter table public.parent_links     enable row level security;
alter table public.payment_requests enable row level security;
alter table public.reviews          enable row level security;
alter table public.cancellations    enable row level security;
alter table public.branches         enable row level security;

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

-- shared live tables: public read (live boards show pre-login), writes
-- require a signed-in account. Per-org roles come with multi-tenancy.
do $$
declare t text;
begin
  foreach t in array array['org_settings','courts','sessions','payments','access_codes','staff','branches'] loop
    execute format('drop policy if exists "%s read" on public.%I;', t, t);
    execute format('create policy "%s read" on public.%I for select using (true);', t, t);
    execute format('drop policy if exists "%s write" on public.%I;', t, t);
    execute format('create policy "%s write" on public.%I for all to authenticated using (true) with check (true);', t, t);
  end loop;
end $$;

-- parent tables: signed-in accounts only, read and write
do $$
declare t text;
begin
  foreach t in array array['parent_links','payment_requests','cancellations'] loop
    execute format('drop policy if exists "%s read" on public.%I;', t, t);
    execute format('create policy "%s read" on public.%I for select to authenticated using (true);', t, t);
    execute format('drop policy if exists "%s write" on public.%I;', t, t);
    execute format('create policy "%s write" on public.%I for all to authenticated using (true) with check (true);', t, t);
  end loop;
end $$;

-- reviews: public read (ratings show pre-login), authenticated write
drop policy if exists "reviews read" on public.reviews;
create policy "reviews read" on public.reviews for select using (true);
drop policy if exists "reviews write" on public.reviews;
create policy "reviews write" on public.reviews for all to authenticated using (true) with check (true);

-- ── Realtime: broadcast row changes for the live tables ──────────────
alter publication supabase_realtime add table public.courts;
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.org_settings;
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.staff;
alter publication supabase_realtime add table public.parent_links;
alter publication supabase_realtime add table public.payment_requests;
alter publication supabase_realtime add table public.reviews;
alter publication supabase_realtime add table public.cancellations;
alter publication supabase_realtime add table public.branches;
