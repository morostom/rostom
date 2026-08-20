-- migration_push.sql — Web Push subscriptions.
--
-- One row per DEVICE, not per user: a parent with a phone and a tablet gets
-- alerted on both, and the endpoint URL the browser hands us is the natural
-- primary key.
--
-- `identifier` is the parent's normalised phone/email — the same value
-- payment_requests.parent_identifier carries — so the Edge Function can find
-- who to wake without joining through auth.
--
-- Safe to run more than once.

create table if not exists public.push_subscriptions (
  endpoint    text primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  identifier  text,
  p256dh      text,
  auth        text,
  user_agent  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists push_subscriptions_identifier_idx on public.push_subscriptions (identifier);
create index if not exists push_subscriptions_user_idx       on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

-- A device may only ever see or touch its OWN subscription rows. Nobody can
-- read the endpoint list — an endpoint is a capability: anyone holding it can
-- push to that phone.
drop policy if exists "push own read" on public.push_subscriptions;
create policy "push own read" on public.push_subscriptions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "push own write" on public.push_subscriptions;
create policy "push own write" on public.push_subscriptions
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "push own update" on public.push_subscriptions;
create policy "push own update" on public.push_subscriptions
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "push own delete" on public.push_subscriptions;
create policy "push own delete" on public.push_subscriptions
  for delete to authenticated using (user_id = auth.uid());

-- The send-push Edge Function runs with the service-role key and bypasses RLS,
-- which is what lets a CHILD's request reach their PARENT's device without the
-- child ever being able to read that parent's endpoints.
