# SERVE — backend setup (Supabase)

The app runs in two modes automatically:

- **No keys →** local store only (the offline pitch exports work unchanged).
- **With keys →** real accounts + a live Postgres backend with realtime sync
  (mark a court busy in the console and the player app updates live, across
  devices), and player cards persisted per account.

First pass implemented: **auth + live sync**. Payments are **sandbox** (the
Apple Pay / Card / TELDA UI records the booking as paid; no real money moves).

## 1. Create the project
1. Go to https://supabase.com → New project (free tier is fine). Pick a region
   near Egypt (e.g. Frankfurt / Bahrain).
2. Project Settings → **API**. Copy the **Project URL** and the **anon public** key.

## 2. Create the database
1. SQL Editor → New query → paste **`supabase/schema.sql`** → Run.
2. New query → paste **`supabase/seed.sql`** → Run. (Seeds Heliopolis' 7
   courts, the schedule, Ramy Ashour payments, access codes, themes.)

## 3. Auth settings
- Authentication → Providers → **Email**: enabled (default).
- For the demo, turn **off** "Confirm email" (Authentication → Providers →
  Email → uncheck *Confirm email*) so sign-up logs in immediately.
- Phone sign-ups are mapped to `&lt;digits&gt;@phone.serve.app` so they work
  without an SMS provider. For real phone OTP, configure a Twilio (or similar)
  provider and switch `src/lib/auth.js` to `supabase.auth` phone OTP.

## 4. Point the app at it
Create `serve-app/.env.local` (see `.env.example`):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

Then `npm run dev` (or `npm run build`). On Netlify, set the same two variables
in **Site settings → Environment variables** and let Netlify build the site
(instead of dragging the prebuilt offline file).

> Single-file build without rebuilding? You can also paste keys at runtime:
> add `<script>window.__SERVE__={supabaseUrl:'…',supabaseAnonKey:'…'}</script>`
> before the app script in the exported HTML.

## 5. Verify it's live
- Open the app in two browser windows (or two devices). Log in / sign up.
- In one, open the coach console (or run `serve-club`) and mark a court busy or
  publish a session; the other window updates within a second.

## Security note (before any real launch)
The shared live tables (`courts`, `sessions`, `org_settings`) use permissive
RLS so the coach/admin consoles — which don't have their own login yet — can
write. Lock these down to authenticated org-admin roles before launch. Player
`bookings` and `profiles` are already user-scoped.
