-- migration_rates.sql — court pricing, opening hours, and session length.
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query →
-- paste → Run). It is safe to run more than once.
--
-- Everything here is NULLABLE on purpose: a venue that never opens the rates
-- editor keeps the house rate (EGP 200/hr) and stays open 24/7, which is how
-- SERVE behaved before this migration.

-- ── branches: rate card + opening hours ────────────────────────────────
alter table public.branches add column if not exists price        numeric;  -- EGP per hour, standard
alter table public.branches add column if not exists peak_price   numeric;  -- EGP per hour, peak window
alter table public.branches add column if not exists peak_from    smallint; -- hour 0–23
alter table public.branches add column if not exists peak_to      smallint; -- hour 0–23
alter table public.branches add column if not exists open_hour    smallint; -- null = open 24/7
alter table public.branches add column if not exists close_hour   smallint; -- may be <= open_hour (wraps past midnight)

-- ── courts: an optional override for one court (the glass show court) ──
alter table public.courts   add column if not exists price        numeric;

-- ── sessions: how long the session actually runs, in minutes ───────────
alter table public.sessions add column if not exists duration     smallint;

-- sanity: hours are hours, prices aren't negative
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'branches_hours_range') then
    alter table public.branches add constraint branches_hours_range check (
      (open_hour  is null or (open_hour  between 0 and 23)) and
      (close_hour is null or (close_hour between 0 and 23)) and
      (peak_from  is null or (peak_from  between 0 and 23)) and
      (peak_to    is null or (peak_to    between 0 and 23))
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'branches_price_positive') then
    alter table public.branches add constraint branches_price_positive check (
      (price is null or price >= 0) and (peak_price is null or peak_price >= 0)
    );
  end if;
  if not exists (select 1 from pg_constraint where conname = 'courts_price_positive') then
    alter table public.courts add constraint courts_price_positive check (price is null or price >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'sessions_duration_range') then
    alter table public.sessions add constraint sessions_duration_range check (duration is null or duration between 5 and 480);
  end if;
end $$;

-- Players read rates and hours through the existing public-read policies on
-- branches/courts/sessions, so nothing new is needed there. Writes stay
-- restricted to the org owner via serve_owns_org / serve_owns_branch.
