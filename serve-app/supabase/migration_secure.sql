-- SERVE — migration: security tightening + verified parent links.
-- Run once in the Supabase SQL Editor (safe to re-run).
--
-- Before this, the shared tables allowed ANONYMOUS writes — anyone with the
-- public page source could edit courts/coaches. Now:
--   · live tables (courts, sessions, staff, org_settings, payments,
--     access_codes): public READ (the app shows live boards pre-login),
--     but WRITE requires a signed-in account.
--   · parent_links + payment_requests: signed-in accounts only, both ways.
--   · parent_links gains a status column — links start 'pending' and the
--     child must approve from their app before transfers work.
-- (Per-org role scoping comes with the multi-tenant work, flagged for later.)

-- 1) shared live tables: public read stays, write → authenticated only
do $$
declare t text;
begin
  foreach t in array array['org_settings','courts','sessions','payments','access_codes','staff'] loop
    execute format('drop policy if exists "%s write" on public.%I;', t, t);
    execute format('create policy "%s write" on public.%I for all to authenticated using (true) with check (true);', t, t);
  end loop;
end $$;

-- 2) parent tables: nothing anonymous, read or write
do $$
declare t text;
begin
  foreach t in array array['parent_links','payment_requests'] loop
    execute format('drop policy if exists "%s read" on public.%I;', t, t);
    execute format('create policy "%s read" on public.%I for select to authenticated using (true);', t, t);
    execute format('drop policy if exists "%s write" on public.%I;', t, t);
    execute format('create policy "%s write" on public.%I for all to authenticated using (true) with check (true);', t, t);
  end loop;
end $$;

-- 3) parent links need the child's approval
alter table public.parent_links add column if not exists status text default 'pending';
update public.parent_links set status = 'pending' where status is null;
