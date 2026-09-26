-- migration_slots.sql — freed court time, offered to the right people.
--
-- When a session or booking is cancelled the court sits empty. Today nobody
-- finds out. This table is the offer: the venue picks WHO hears about it —
-- the coach whose session it was, the players who were in it, one squad, or
-- everyone at the venue — and the first person to claim it takes the slot.
--
-- The audience choice matters for more than noise. Broadcasting a junior
-- squad's freed slot to the whole venue tells strangers when and where a
-- group of children will be, so "everyone" is a deliberate choice the venue
-- makes rather than the default.
--
-- Safe to run more than once.

create table if not exists public.slot_offers (
  id            uuid primary key default gen_random_uuid(),
  org_id        text not null,
  branch        text,
  court         text,
  day           text,
  time          text,
  duration      smallint,
  price         numeric,
  source        text default 'cancellation',  -- cancellation | manual
  session_id    text,
  session_title text,
  coach         text,
  audience      text not null default 'players', -- coach | players | squad | all
  audience_ref  text,                            -- squad name when audience = 'squad'
  recipients    text[] default '{}',             -- resolved player names
  claimed_by    text,
  claimed_at    timestamptz,
  status        text not null default 'open',    -- open | claimed | expired | withdrawn
  expires_at    timestamptz,
  created_at    timestamptz default now()
);

create index if not exists slot_offers_org_idx    on public.slot_offers (org_id, status);
create index if not exists slot_offers_branch_idx on public.slot_offers (branch, status);

alter table public.slot_offers enable row level security;

-- Read: the venue that owns it, or a player it was actually offered to.
-- Crucially NOT "any authenticated user" — an open offer names a court, a
-- time and often a squad.
drop policy if exists "slot_offers read" on public.slot_offers;
create policy "slot_offers read" on public.slot_offers
  for select to authenticated using (
    public.serve_owns_branch(branch)
    or public.serve_my_name() = any (select lower(unnest(recipients)))
    or (audience = 'all' and status = 'open')
  );

-- Only the venue creates, edits or withdraws an offer.
drop policy if exists "slot_offers write" on public.slot_offers;
create policy "slot_offers write" on public.slot_offers
  for all to authenticated
  using (public.serve_owns_branch(branch))
  with check (public.serve_owns_branch(branch));

-- Claiming is a race: two players tap at the same moment and exactly one
-- should win. Doing it in the app would be read-then-write, which loses the
-- race. This takes the row lock and checks the status in one statement.
create or replace function public.serve_claim_slot(p_id uuid, p_player text)
returns table (ok boolean, reason text)
language plpgsql security definer set search_path = public as $$
declare v public.slot_offers%rowtype;
begin
  select * into v from public.slot_offers where id = p_id for update;

  if not found then
    return query select false, 'not found'; return;
  end if;
  if v.status <> 'open' then
    return query select false, 'already taken'; return;
  end if;
  if v.expires_at is not null and v.expires_at <= now() then
    update public.slot_offers set status = 'expired' where id = p_id;
    return query select false, 'expired'; return;
  end if;
  -- the offer has to have been made to this player
  if v.audience <> 'all'
     and not (lower(coalesce(p_player, '')) = any (select lower(unnest(v.recipients)))) then
    return query select false, 'not offered'; return;
  end if;

  update public.slot_offers
     set status = 'claimed', claimed_by = p_player, claimed_at = now()
   where id = p_id;
  return query select true, 'claimed';
end $$;

revoke all on function public.serve_claim_slot(uuid, text) from public;
grant execute on function public.serve_claim_slot(uuid, text) to authenticated;

do $$ begin alter publication supabase_realtime add table public.slot_offers;
exception when duplicate_object then null; end $$;
