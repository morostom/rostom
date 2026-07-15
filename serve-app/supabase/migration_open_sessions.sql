-- migration_open_sessions.sql — group sessions any org can publish to players.
--
-- Adds price / capacity / open flag to sessions, plus a security-definer RPC
-- so a PLAYER (who doesn't own the org) can join an open session: it only
-- ever appends a name, dedup- and capacity-guarded, to an open session.
-- Safe to re-run.

alter table public.sessions add column if not exists price int;
alter table public.sessions add column if not exists spots int;
alter table public.sessions add column if not exists open boolean not null default false;

create or replace function public.serve_join_session(p_session uuid, p_player text)
returns void
language sql security definer set search_path = public as $$
  update public.sessions
     set players = array_append(players, p_player)
   where id = p_session
     and open
     and p_player is not null and length(trim(p_player)) > 0
     and not (players @> array[p_player])
     and (spots is null or coalesce(array_length(players, 1), 0) < spots);
$$;

revoke all on function public.serve_join_session(uuid, text) from public;
grant execute on function public.serve_join_session(uuid, text) to authenticated;
