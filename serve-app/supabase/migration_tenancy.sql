-- SERVE — per-owner isolation (RLS). Run once in the Supabase SQL Editor.
-- Safe to re-run. A rollback block is at the bottom if anything misbehaves.
--
-- What this does:
--   · An org (row in org_settings) is owned by the auth user in owner_id.
--   · While owner_id is NULL the org is "unclaimed" — any signed-in admin can
--     edit it (this is what lets your first signup claim it). The app calls
--     claimOrg() on setup to set owner_id.
--   · Once claimed, ONLY that owner can write the org and everything under it
--     (its branches, and the courts/sessions/staff belonging to those branches).
--   · Reads stay public so players still see every club/academy.
--   · Anonymous writes remain blocked (from migration_secure).

-- ── ownership helpers (SECURITY DEFINER so they can read org_settings) ──
create or replace function public.serve_owns_org(p_org text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.org_settings o
    where o.id = p_org and (o.owner_id is null or o.owner_id = auth.uid())
  );
$$;

-- a court/session's club_id is a BRANCH id; resolve it to the parent org.
-- (If the branch isn't in the branches table yet, treat as editable so nothing
--  gets stranded during rollout.)
create or replace function public.serve_owns_branch(p_branch text)
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select (o.owner_id is null or o.owner_id = auth.uid())
       from public.branches b join public.org_settings o on o.id = b.org_id
      where b.id = p_branch),
    true  -- unknown branch → allow (legacy rows)
  );
$$;

-- ── org_settings: owner-gated writes ─────────────────────────────────
drop policy if exists "org_settings write" on public.org_settings;
create policy "org_settings write" on public.org_settings for all to authenticated
  using (owner_id is null or owner_id = auth.uid())
  with check (owner_id is null or owner_id = auth.uid());

-- ── branches / staff: gated by their org ─────────────────────────────
drop policy if exists "branches write" on public.branches;
create policy "branches write" on public.branches for all to authenticated
  using (serve_owns_org(org_id)) with check (serve_owns_org(org_id));

drop policy if exists "staff write" on public.staff;
create policy "staff write" on public.staff for all to authenticated
  using (serve_owns_org(org_id)) with check (serve_owns_org(org_id));

-- ── courts / sessions: gated by their branch's org ───────────────────
drop policy if exists "courts write" on public.courts;
create policy "courts write" on public.courts for all to authenticated
  using (serve_owns_branch(club_id)) with check (serve_owns_branch(club_id));

drop policy if exists "sessions write" on public.sessions;
create policy "sessions write" on public.sessions for all to authenticated
  using (serve_owns_branch(club_id)) with check (serve_owns_branch(club_id));

-- payments + access_codes stay authenticated-write for now (academy-only demo
-- data, not yet org-scoped). Reviews/cancellations/bookings are user-owned
-- or public by design and are left as set in earlier migrations.

-- ─────────────────────────────────────────────────────────────────────
-- ROLLBACK (uncomment + run to revert to "any signed-in admin can write"):
--
-- do $$ declare t text; begin
--   foreach t in array array['org_settings','branches','staff','courts','sessions'] loop
--     execute format('drop policy if exists "%s write" on public.%I;', t, t);
--     execute format('create policy "%s write" on public.%I for all to authenticated using (true) with check (true);', t, t);
--   end loop;
-- end $$;
