-- SERVE — migration: parent accounts + "transfer to parent" payment requests.
-- Run once in the Supabase SQL Editor (safe to re-run). Adds two tables:
--   parent_links     — which parent manages which child (by name)
--   payment_requests — a child's "pay for me" request the parent approves
-- Both are opened to the app and broadcast over realtime so the parent gets a
-- live alert on their phone the moment a request comes in.

create table if not exists public.parent_links (
  id uuid primary key default gen_random_uuid(),
  parent_identifier text not null,   -- the parent's phone/email (their login)
  parent_name text,
  child_name text not null,
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

alter table public.parent_links     enable row level security;
alter table public.payment_requests enable row level security;

-- permissive policies (DEMO — matches the other shared tables)
do $$
declare t text;
begin
  foreach t in array array['parent_links','payment_requests'] loop
    execute format('drop policy if exists "%s read" on public.%I;', t, t);
    execute format('create policy "%s read" on public.%I for select using (true);', t, t);
    execute format('drop policy if exists "%s write" on public.%I;', t, t);
    execute format('create policy "%s write" on public.%I for all using (true) with check (true);', t, t);
  end loop;
end $$;

-- realtime (ignore if already added)
do $$ begin alter publication supabase_realtime add table public.parent_links;
exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.payment_requests;
exception when duplicate_object then null; end $$;
