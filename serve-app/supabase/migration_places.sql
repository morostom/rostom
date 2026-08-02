-- migration_places.sql — put every venue on the Discover map.
--
-- Admins paste a Google Maps link (or just an address) in their console
-- profile; SERVE reads the coordinates out of the link and plots a pin.
-- Safe to re-run.

alter table public.org_settings add column if not exists maps_url text;
alter table public.org_settings add column if not exists address text;

-- branches can carry their own pin too, so a club with several locations
-- shows up once per branch
alter table public.branches add column if not exists maps_url text;
alter table public.branches add column if not exists address text;
