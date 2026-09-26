-- migration_hardening.sql — close the data-exposure holes before SERVE has
-- real families on it. Run once in the Supabase SQL Editor (safe to re-run).
--
-- WHAT WAS WRONG
-- The policies written during the demo phase were deliberately permissive:
-- "authenticated using (true)" everywhere, so any logged-in account could read
-- and write every row in the shared tables. On a platform whose users are
-- largely children, that is not a demo shortcut, it is a disclosure:
--
--   1. profiles       — ANONYMOUS read of every player's name, phone/email and
--                       player card (age, club, photo). No login required.
--   2. access_codes   — public read of the codes themselves, so anyone could
--                       read an unredeemed code and walk into any club.
--   3. parent_links   — any signed-in user could list every child in the
--      payment_requests  system with their parent's phone number, their venue,
--      cancellations     their court and the time they would be there.
--   4. the same three — writable by anyone: mark a request paid, or re-point a
--                       parent link at your own number to receive another
--                       family's requests.
--   5. reviews        — any account could edit or delete any venue's reviews.
--   6. payments       — public read.
--
-- WHAT THIS DOES
-- Reads and writes are scoped to the person or the venue they belong to.
-- Public reads survive only where the app genuinely shows data before login:
-- venue pages, live court boards, schedules and ratings.

-- ── identity helpers ─────────────────────────────────────────────────
-- SECURITY DEFINER so a policy can look up who the caller is without the
-- caller needing read access to profiles. search_path is pinned: without it
-- a caller could shadow `public` and hijack a definer function.

-- Match the app's normId(): lowercase, strip spaces/parens/hyphens, then a
-- leading +. Phone numbers arrive written a dozen different ways.
create or replace function public.serve_norm(s text)
returns text language sql immutable set search_path = public as $$
  select regexp_replace(
           regexp_replace(lower(coalesce(s, '')), '[\s()\-]', '', 'g'),
           '^\+', '')
$$;

create or replace function public.serve_my_identifier()
returns text language sql stable security definer set search_path = public as $$
  select public.serve_norm(identifier) from public.profiles where id = auth.uid()
$$;

create or replace function public.serve_my_name()
returns text language sql stable security definer set search_path = public as $$
  select lower(coalesce(nullif(p.name, ''), p.card->>'name'))
  from public.profiles p where p.id = auth.uid()
$$;

revoke all on function public.serve_norm(text) from public;
grant execute on function public.serve_norm(text) to authenticated, anon;
grant execute on function public.serve_my_identifier() to authenticated;
grant execute on function public.serve_my_name() to authenticated;

-- ── 1. profiles: your own row only ───────────────────────────────────
-- Rosters still need to show a teammate's card, so the public-safe subset
-- moves to a view. The base table stops being world-readable.
drop policy if exists "profiles read" on public.profiles;
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles
  for select to authenticated using (auth.uid() = id);

-- The roster view: name, age, division, ranking, club. Never the identifier
-- (phone/email), never the photo, never admin or parent accounts.
create or replace view public.player_cards as
  select
    p.card->>'name'                      as name,
    p.card->>'age'                       as age,
    p.card->>'division'                  as division,
    p.card->>'rankLabel'                 as rank_label,
    coalesce((p.card->>'rankVerified')::boolean, false) as rank_verified,
    p.card->>'club'                      as club
  from public.profiles p
  where p.card is not null
    and coalesce(p.card->>'kind', '') not in ('admin', 'parent')
    and coalesce(p.card->>'name', '') <> '';

-- security_invoker = off (the default for views) means the view runs as its
-- owner and is NOT blocked by the profiles policy above — which is the point.
grant select on public.player_cards to anon, authenticated;

-- ── 2. access_codes: never readable by players ───────────────────────
-- A readable code table defeats the entire membership gate.
drop policy if exists "access_codes read"  on public.access_codes;
drop policy if exists "access_codes write" on public.access_codes;
create policy "access_codes owner" on public.access_codes
  for all to authenticated
  using (public.serve_owns_branch(club_id)) with check (public.serve_owns_branch(club_id));

-- Redemption goes through a definer function instead, so a player can check
-- one code they already hold without being able to list any others.
create or replace function public.serve_redeem_code(p_code text)
returns table (org_id text, ok boolean)
language plpgsql security definer set search_path = public as $$
declare v record;
begin
  select c.*, b.org_id as parent_org into v
    from public.access_codes c
    left join public.branches b on b.id = c.club_id
   where upper(c.code) = upper(trim(p_code))
     and c.status <> 'redeemed'
   limit 1;
  if not found then
    return query select null::text, false; return;
  end if;
  update public.access_codes set status = 'redeemed' where code = v.code;
  return query select coalesce(v.parent_org, v.club_id), true;
end $$;
revoke all on function public.serve_redeem_code(text) from public;
grant execute on function public.serve_redeem_code(text) to authenticated;

-- ── 3. parent_links: the parent and the child, nobody else ───────────
drop policy if exists "parent_links read"  on public.parent_links;
drop policy if exists "parent_links write" on public.parent_links;

create policy "parent_links read own" on public.parent_links
  for select to authenticated using (
    public.serve_norm(parent_identifier) = public.serve_my_identifier()
    or lower(child_name) = public.serve_my_name()
  );

-- A parent may only create a link naming THEMSELVES as the parent.
create policy "parent_links insert own" on public.parent_links
  for insert to authenticated with check (
    public.serve_norm(parent_identifier) = public.serve_my_identifier()
  );

-- Either side may update (the child approves; the parent can rename), but
-- neither may re-point the link at a different parent.
create policy "parent_links update own" on public.parent_links
  for update to authenticated
  using (
    public.serve_norm(parent_identifier) = public.serve_my_identifier()
    or lower(child_name) = public.serve_my_name()
  )
  with check (
    public.serve_norm(parent_identifier) = public.serve_my_identifier()
    or lower(child_name) = public.serve_my_name()
  );

create policy "parent_links delete own" on public.parent_links
  for delete to authenticated using (
    public.serve_norm(parent_identifier) = public.serve_my_identifier()
    or lower(child_name) = public.serve_my_name()
  );

-- ── 4. payment_requests: the child asks, only the parent answers ─────
drop policy if exists "payment_requests read"  on public.payment_requests;
drop policy if exists "payment_requests write" on public.payment_requests;

create policy "payment_requests read own" on public.payment_requests
  for select to authenticated using (
    public.serve_norm(parent_identifier) = public.serve_my_identifier()
    or lower(child_name) = public.serve_my_name()
  );

-- A child can only raise a request in their own name.
create policy "payment_requests insert own" on public.payment_requests
  for insert to authenticated with check (
    lower(child_name) = public.serve_my_name()
    or public.serve_norm(parent_identifier) = public.serve_my_identifier()
  );

-- Approving, declining and expiring belong to the parent alone. This is the
-- one that stopped any account being able to mark any request paid.
create policy "payment_requests update parent" on public.payment_requests
  for update to authenticated
  using (public.serve_norm(parent_identifier) = public.serve_my_identifier())
  with check (public.serve_norm(parent_identifier) = public.serve_my_identifier());

-- ── 5. cancellations: the player, their parent, or the venue ─────────
drop policy if exists "cancellations read"  on public.cancellations;
drop policy if exists "cancellations write" on public.cancellations;

create policy "cancellations read own" on public.cancellations
  for select to authenticated using (
    public.serve_norm(parent_identifier) = public.serve_my_identifier()
    or lower(player) = public.serve_my_name()
    or public.serve_owns_branch(club_id)
  );

create policy "cancellations insert own" on public.cancellations
  for insert to authenticated with check (
    lower(player) = public.serve_my_name()
    or public.serve_owns_branch(club_id)
  );

-- a parent approves/declines their child's request; the venue can resolve it
create policy "cancellations update allowed" on public.cancellations
  for update to authenticated
  using (
    public.serve_norm(parent_identifier) = public.serve_my_identifier()
    or public.serve_owns_branch(club_id)
  )
  with check (
    public.serve_norm(parent_identifier) = public.serve_my_identifier()
    or public.serve_owns_branch(club_id)
  );

create policy "cancellations delete allowed" on public.cancellations
  for delete to authenticated using (
    lower(player) = public.serve_my_name()
    or public.serve_owns_branch(club_id)
  );

-- ── 6. reviews: write your own, edit only your own ───────────────────
alter table public.reviews add column if not exists user_id uuid
  references auth.users(id) on delete set null;

drop policy if exists "reviews write" on public.reviews;

-- public read stays: ratings show before login, by design
create policy "reviews insert own" on public.reviews
  for insert to authenticated with check (user_id = auth.uid());
create policy "reviews update own" on public.reviews
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reviews delete own" on public.reviews
  for delete to authenticated using (user_id = auth.uid());

-- ── 7. payments: not world-readable ──────────────────────────────────
drop policy if exists "payments read" on public.payments;
create policy "payments read auth" on public.payments
  for select to authenticated using (true);

-- ── 8. close the "unknown branch" hole ───────────────────────────────
-- The old version returned TRUE for a branch it had never seen, so inventing
-- a club_id was enough to write courts and sessions anywhere.
create or replace function public.serve_owns_branch(p_branch text)
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select (o.owner_id is null or o.owner_id = auth.uid())
       from public.branches b join public.org_settings o on o.id = b.org_id
      where b.id = p_branch),
    false   -- unknown branch → deny (was: allow)
  );
$$;

-- ── 9. push_subscriptions: belt and braces ───────────────────────────
-- Already per-device from migration_push; re-assert in case that ran before
-- this file existed.
do $$ begin
  if to_regclass('public.push_subscriptions') is not null then
    execute 'drop policy if exists "push own read" on public.push_subscriptions';
    execute 'create policy "push own read" on public.push_subscriptions
               for select to authenticated using (user_id = auth.uid())';
  end if;
end $$;
