# SERVE — security notes

Who this is for: whoever is maintaining SERVE. It records what the threat
model actually is, what was found and fixed, and what is still open. Keep it
current — a stale threat model is worse than none, because it gets trusted.

## What makes SERVE different from a normal booking app

**Most of the people in this database are children.** Junior squads, U13
through U17, are the core of Egyptian squash. That single fact drives
everything below:

- A row joining a child's name to a parent's phone number, a venue and a time
  is not "user data". It tells a stranger where a named child will be, and
  when. Treat every table that can produce that join as sensitive.
- A photo on a player card is a photo of a minor.
- "Any signed-in user can read this" is not a safe default here. Signing up is
  free and takes ten seconds.

The second structural fact: **SERVE is multi-tenant.** Clubs and academies
compete with each other. A venue that can read or edit another venue's
schedule, roster or reviews is a commercial problem as well as a privacy one.

## Trust boundaries

| Actor | Should reach |
|---|---|
| Anonymous visitor | Venue pages, live court boards, published schedules, ratings. Nothing that identifies a person. |
| Player | The above, plus their own profile, bookings and sessions, and the roster of sessions they are in. |
| Parent | Their own account, plus the child they are linked to — after the child approves. |
| Venue owner | Everything under the orgs they own. Nothing under anyone else's. |
| Edge Function (service role) | Everything. It is the only component that bypasses RLS, so its authorization checks are load-bearing. |

Anything reachable by the anon key is public. The anon key ships in the
bundle; it is not a secret and was never meant to be one. **RLS is the only
access control in this system.** A policy that says `using (true)` is a
decision to publish that table.

## Findings — September 2026 audit

Full detail in `supabase/migration_hardening.sql`. Severity is about what an
attacker gets, not how clever they have to be — all of these were reachable
with the public anon key and, at most, a free account.

| # | Issue | Severity |
|---|---|---|
| 1 | `profiles` readable by anonymous users: every player's name, phone/email and card | **Critical** |
| 2 | `access_codes` publicly readable, codes included — the membership gate was bypassable by anyone | **Critical** |
| 3 | `parent_links`, `payment_requests`, `cancellations` readable by any signed-in account: child name + parent phone + venue + time | **Critical** |
| 4 | Those same tables writable by any account — mark a request paid, re-point a parent link at your own number | **High** |
| 5 | `send-push` would notify any identifier for any signed-in caller | **High** |
| 6 | Stored XSS: venue-controlled accent colour interpolated raw into a style attribute on the Discover map | **High** |
| 7 | `reviews` editable and deletable by any account | **Medium** |
| 8 | `serve_owns_branch` returned `true` for unknown branches — invent a `club_id`, write anywhere | **Medium** |
| 9 | `payments` publicly readable | **Medium** |

All nine are fixed. Run `migration_hardening.sql` — the app depends on it now
(the client reads the `player_cards` view that migration creates).

### Note on #1

The old code fetched every profile and filtered to "public-safe fields"
in the browser. That is not a control. The filtering happened *after* the
phone numbers had already been sent to the client. The fix moves the
filtering into a database view, so the data never leaves Postgres.

This is worth remembering as a pattern: **client-side filtering of a
server-side response is presentation, not security.**

## Still open

Ranked by what I would do next.

1. **No rate limiting anywhere.** Signup, login, access-code redemption and
   `send-push` can all be hammered. Code redemption is the one that matters:
   6 characters from a 32-character alphabet is ~10⁹ combinations, fine
   against a human and thin against a script. Supabase has built-in auth rate
   limits; the Edge Function and the redeem RPC need their own.
2. **No audit log.** If a venue claims their schedule was tampered with there
   is currently no way to answer the question.
3. **`serve_owns_org` treats an unclaimed org as writable by any admin.** This
   is what lets a first signup claim its org, and it means any signed-in admin
   can edit any org that has not been claimed yet — including the demo orgs.
   Acceptable while the demos are the only unclaimed rows; revisit before
   onboarding venues at volume.
4. **Account deletion is not implemented.** Required under Egypt's PDPL and
   under GDPR if SERVE ever has EU users. See the legal notes.
5. **Storage bucket is public.** Correct for venue logos. It would be wrong for
   anything with a person in it — do not put player photos in `serve-media`
   without switching to signed URLs.
6. **Push endpoints are capabilities.** Anyone holding one can notify that
   phone. They are RLS-protected per device; keep it that way.

## Rules of thumb for future changes

- A new table starts with RLS on and **no** permissive policy. Add the narrow
  policy the feature needs.
- Before writing `using (true)`, say out loud what it means to publish that
  table to the internet. If that sentence is uncomfortable, write a real
  policy.
- Anything with `security definer` must pin `set search_path = public`, or a
  caller can shadow `public` and hijack it.
- Any string that reaches an `innerHTML`, a `divIcon` or a style attribute must
  be escaped or validated first. React escapes for you; Leaflet does not.
- The Edge Function bypasses RLS. Every new code path in it needs its own
  authorization check — being signed in is not authorization.
