-- SERVE — seed data (Heliopolis SC live board + schedule, Ramy Ashour payments,
-- access codes, org themes). Run after schema.sql. Re-runnable (upserts).

-- org settings / themes
insert into public.org_settings (id, type, name, accent) values
  ('heliopolis', 'club', 'Heliopolis Sporting Club', '#4ea8ff'),
  ('ramyashour', 'academy', 'Ramy Ashour Squash Academy', '#f5453b')
on conflict (id) do update set accent = excluded.accent, name = excluded.name;

-- branches (Heliopolis runs two locations; Ramy Ashour one)
insert into public.branches (id, org_id, name, location, court_count) values
  ('hel-masr',    'heliopolis', 'Masr El Gedida', 'Heliopolis · Cairo', 7),
  ('hel-shorouk', 'heliopolis', 'El Shorouk',     'El Shorouk City',    10),
  ('ramy-main',   'ramyashour', 'Main Branch',    'New Cairo',          7)
on conflict (id) do update set name = excluded.name, location = excluded.location, court_count = excluded.court_count;

-- Masr El Gedida live courts (7) — the club_id column holds the branch id
insert into public.courts (club_id, court_no, type, status, who, coach, until, remaining, next) values
  ('hel-masr', 1, 'Standard', 'lesson',  'U17 Squad',      'Ali Ashmawy', '17:00', 18, null),
  ('hel-masr', 2, 'Standard', 'playing', 'Aly vs Taha',    null,          '16:45', 12, null),
  ('hel-masr', 3, 'Standard', 'lesson',  'Mohamed Rostom', 'Ali Ashmawy', '17:15', 33, null),
  ('hel-masr', 4, 'Standard', 'free',    null, null, null, null, '17:00 · Belal S.'),
  ('hel-masr', 5, 'Standard', 'free',    null, null, null, null, '18:30 · open'),
  ('hel-masr', 6, 'Standard', 'playing', 'Salman vs Nour', null,          '17:05', 25, null),
  ('hel-masr', 7, 'Standard', 'free',    null, null, null, null, '19:00 · open')
on conflict (club_id, court_no) do update set
  status = excluded.status, who = excluded.who, coach = excluded.coach,
  until = excluded.until, remaining = excluded.remaining, next = excluded.next;

-- El Shorouk live courts (10, mostly open)
insert into public.courts (club_id, court_no, type, status, next)
select 'hel-shorouk', g, 'Standard', 'free', 'open' from generate_series(1, 10) as g
on conflict (club_id, court_no) do nothing;

-- schedule sessions (tagged to the Masr El Gedida branch)
insert into public.sessions (club_id, day, time, type, title, coach, court, players) values
  ('hel-masr', 'Mon', '18:00', 'Lesson',         'Solo lesson 1',      'Ali Ashmawy',            3, array['Mohamed Rostom']),
  ('hel-masr', 'Wed', '18:00', 'Lesson',         'Solo lesson 2',      'Ali Ashmawy',            3, array['Mohamed Rostom']),
  ('hel-masr', 'Fri', '18:00', 'Lesson',         'Solo lesson 3',      'Ali Ashmawy',            2, array['Mohamed Rostom']),
  ('hel-masr', 'Wed', '17:00', 'Group training', 'U17 Squad',          'Abdel Rahman ElSergany', 1, array['Mohamed Rostom','Nour Hassan','Taha Ibrahim']),
  ('hel-masr', 'Thu', '19:00', 'Fitness',        'Strength & movement','Bassem Tarek',           5, array['Mohamed Rostom','Aly Kamal'])
on conflict do nothing;

-- academy payments
insert into public.payments (player, item, amount, status, method) values
  ('Mohamed Rostom', 'Private lesson · Ali Ashmawy', 250, 'unpaid', null),
  ('Aly Kamal',      'Court 3 · 1 hr', 200, 'paid', 'card'),
  ('Taha Ibrahim',   'Group training · 4 sessions', 600, 'unpaid', null),
  ('Belal Sherif',   'Court 5 · 1 hr', 200, 'paid', 'cash'),
  ('Salman Adel',    'Fitness block · 8 sessions', 960, 'unpaid', null)
on conflict do nothing;

-- staff / coaches
insert into public.staff (org_id, name, role, initials, squads)
select * from (values
  ('heliopolis','Ali Ashmawy','Head Coach','AA','Elite · U19'),
  ('heliopolis','Abdel Rahman ElSergany','Head Coach','AE','U15 · U17'),
  ('heliopolis','Mohamed Reda','Performance Coach','MR','U13 · U15'),
  ('heliopolis','Bassem Tarek','Fitness & Conditioning','BT','All squads'),
  ('heliopolis','Adham Nabil','Junior Development','AN','U11 · U13'),
  ('heliopolis','Ismail Sherif','Private Coach','IS','Privates'),
  ('ramyashour','Ali Ashmawy','Head Coach','AA','Elite · U19'),
  ('ramyashour','Mohamed Reda','Performance Coach','MR','U13 · U15'),
  ('ramyashour','Bassem Tarek','Fitness & Conditioning','BT','All squads'),
  ('ramyashour','Adham Nabil','Junior Development','AN','U11 · U13')
) as v(org_id, name, role, initials, squads)
where not exists (select 1 from public.staff);

-- access codes
insert into public.access_codes (code, assigned_to, status, via, when_label) values
  ('9F4K2A', 'Mohamed Rostom', 'redeemed', 'WhatsApp', 'Redeemed 12 May'),
  ('3T8M1P', 'Belal Sherif',   'sent',     'WhatsApp', 'Sent 18 May'),
  ('QX7L0R', 'Aly Mostafa',    'sent',     'SMS',      'Sent 19 May'),
  ('K5R2WQ', null,             'open',     null,       'Generated 19 May'),
  ('B8N3VD', null,             'open',     null,       'Generated 19 May')
on conflict (code) do nothing;
