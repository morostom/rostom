-- SERVE — migration: reviews, contact numbers (WhatsApp), and session
-- cancellations (with under-16 parent approval). Run once (safe to re-run).

-- ── reviews (players rate an academy/club after a booking) ───────────
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  venue_id text not null,
  venue_name text,
  player text,
  rating int not null,            -- 1..5
  comment text,
  created_at timestamptz default now()
);

-- ── contact numbers for WhatsApp (owner + head coach, per org) ───────
alter table public.org_settings add column if not exists owner_phone text;
alter table public.org_settings add column if not exists coach_phone text;
alter table public.staff        add column if not exists phone text;

-- ── cancellations (session cancel; under-16 needs parent approval) ───
create table if not exists public.cancellations (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  session_title text,
  club_id text default 'heliopolis',
  coach text,
  player text,
  parent_identifier text,          -- set when a parent must approve
  reason text,
  status text default 'cancelled', -- pending | cancelled | declined
  created_at timestamptz default now()
);

alter table public.reviews       enable row level security;
alter table public.cancellations enable row level security;

-- reviews: public read (ratings show pre-login), authenticated write
drop policy if exists "reviews read" on public.reviews;
create policy "reviews read" on public.reviews for select using (true);
drop policy if exists "reviews write" on public.reviews;
create policy "reviews write" on public.reviews for all to authenticated using (true) with check (true);

-- cancellations: authenticated only
drop policy if exists "cancellations read" on public.cancellations;
create policy "cancellations read" on public.cancellations for select to authenticated using (true);
drop policy if exists "cancellations write" on public.cancellations;
create policy "cancellations write" on public.cancellations for all to authenticated using (true) with check (true);

do $$ begin alter publication supabase_realtime add table public.reviews;
exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.cancellations;
exception when duplicate_object then null; end $$;

-- a couple of seed reviews so ratings aren't empty (only if none exist)
insert into public.reviews (venue_id, venue_name, player, rating, comment)
select * from (values
  ('ramyashour','Ramy Ashour Squash Academy','Aly Kamal',5,'World-class coaching, courts always ready.'),
  ('ramyashour','Ramy Ashour Squash Academy','Nour Hassan',4,'Great sessions, booking is easy.'),
  ('cairohub','Cairo Squash Hub','Taha Ibrahim',4,'Good value and friendly coaches.'),
  ('shoukry','Shoukry Squash',null,5,'Excellent fitness program.')
) as v(venue_id, venue_name, player, rating, comment)
where not exists (select 1 from public.reviews);
