-- test_policies.sql — prove the row-level security actually holds.
--
-- RLS is the only access control in SERVE: the anon key ships inside the
-- published HTML and there is no server tier in front of Postgres. So the
-- policies are the perimeter, and a perimeter nobody tests is a guess.
--
-- This impersonates two ordinary players and asserts that neither can reach
-- the other's data. It runs inside a transaction and ends with ROLLBACK, so
-- it creates nothing permanent — safe to run against the live project.
--
-- Run the whole file at once in the Supabase SQL Editor. Every line should
-- print PASS. A FAIL names the hole.

begin;

-- ── two throwaway players ────────────────────────────────────────────
do $$
declare
  uid_a uuid := '00000000-0000-4000-a000-00000000000a';
  uid_b uuid := '00000000-0000-4000-b000-00000000000b';
begin
  insert into auth.users (id, email, aud, role, created_at, updated_at)
  values (uid_a, 'test-a@serve.invalid', 'authenticated', 'authenticated', now(), now()),
         (uid_b, 'test-b@serve.invalid', 'authenticated', 'authenticated', now(), now())
  on conflict (id) do nothing;

  insert into public.profiles (id, name, method, identifier, card) values
    (uid_a, 'Test Parent A', 'phone', '201000000001',
     '{"kind":"parent","name":"Test Parent A"}'::jsonb),
    (uid_b, 'Test Player B', 'phone', '201000000002',
     '{"name":"Test Player B","age":"15","club":"Heliopolis SC"}'::jsonb)
  on conflict (id) do update set identifier = excluded.identifier, card = excluded.card;

  -- A is a parent with a linked child and a pending payment request
  insert into public.parent_links (parent_identifier, parent_name, child_name, status)
  values ('201000000001', 'Test Parent A', 'Test Child A', 'approved');

  insert into public.payment_requests (parent_identifier, child_name, item, venue, amount, status)
  values ('201000000001', 'Test Child A', 'Court booking', 'Heliopolis SC', 200, 'pending');
end $$;

-- ── a tiny assertion helper ──────────────────────────────────────────
create or replace function pg_temp.expect(label text, got bigint, want bigint)
returns text language sql immutable as $$
  select case when got = want
    then 'PASS  ' || label
    else 'FAIL  ' || label || '  (expected ' || want || ', got ' || got || ')'
  end
$$;

-- ── impersonate player B ─────────────────────────────────────────────
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-b000-00000000000b","role":"authenticated"}';

select pg_temp.expect(
  'B cannot read A''s parent link',
  (select count(*) from public.parent_links where parent_identifier = '201000000001'), 0);

select pg_temp.expect(
  'B cannot read A''s payment request',
  (select count(*) from public.payment_requests where parent_identifier = '201000000001'), 0);

select pg_temp.expect(
  'B cannot read A''s profile row',
  (select count(*) from public.profiles where id = '00000000-0000-4000-a000-00000000000a'), 0);

select pg_temp.expect(
  'B can read their own profile',
  (select count(*) from public.profiles where id = '00000000-0000-4000-b000-00000000000b'), 1);

select pg_temp.expect(
  'B cannot list access codes',
  (select count(*) from public.access_codes), 0);

-- The one that matters most: can B mark A's payment request as paid?
do $$
declare n int;
begin
  update public.payment_requests set status = 'paid'
   where parent_identifier = '201000000001';
  get diagnostics n = row_count;
  raise notice '%', case when n = 0
    then 'PASS  B cannot approve A''s payment request'
    else 'FAIL  B approved ' || n || ' of A''s payment requests' end;
end $$;

-- Can B re-point A's parent link at their own number?
do $$
declare n int;
begin
  update public.parent_links set parent_identifier = '201000000002'
   where parent_identifier = '201000000001';
  get diagnostics n = row_count;
  raise notice '%', case when n = 0
    then 'PASS  B cannot hijack A''s parent link'
    else 'FAIL  B hijacked ' || n || ' parent links' end;
end $$;

-- Can B write to a venue they do not own?
do $$
declare n int;
begin
  begin
    insert into public.sessions (id, club_id, day, time, type, title, coach, court)
    values ('test-injected', 'hel-masr', 'Mon', '09:00', 'Lesson', 'Injected', 'Nobody', 1);
    get diagnostics n = row_count;
  exception when others then n := 0;
  end;
  raise notice '%', case when n = 0
    then 'PASS  B cannot add a session to a venue they do not own'
    else 'FAIL  B wrote a session into someone else''s venue' end;
end $$;

-- And to a branch that does not exist? (serve_owns_branch used to allow this)
do $$
declare n int;
begin
  begin
    insert into public.sessions (id, club_id, day, time, type, title, coach, court)
    values ('test-invented', 'branch-that-does-not-exist', 'Mon', '09:00', 'Lesson', 'Invented', 'Nobody', 1);
    get diagnostics n = row_count;
  exception when others then n := 0;
  end;
  raise notice '%', case when n = 0
    then 'PASS  B cannot write to an invented branch id'
    else 'FAIL  an invented club_id was accepted' end;
end $$;

-- ── what SHOULD still be public ──────────────────────────────────────
reset role;
set local role anon;

select pg_temp.expect(
  'anonymous can still see venues (the app needs this pre-login)',
  (select least(count(*), 1) from public.org_settings), 1);

select pg_temp.expect(
  'anonymous CANNOT see profiles',
  (select count(*) from public.profiles), 0);

select pg_temp.expect(
  'anonymous CANNOT see access codes',
  (select count(*) from public.access_codes), 0);

reset role;
rollback;
