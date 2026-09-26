# SERVE — Privacy Policy

**DRAFT — not reviewed by a lawyer. See `README.md` in this folder.**

Last updated: [DATE] · Contact for data requests: [EMAIL]

SERVE is used by children as well as adults. This policy is written to be
read by a parent, so it says plainly what is collected and who can see it.

## What SERVE collects

**When you sign up:** your name, and either a phone number or an email
address. A password, which SERVE never sees in readable form — it is handled
by our authentication provider.

**Your player card:** age, club or academy, division, ranking, and optionally
a photo and details like your racket or favourite player.

**When you use SERVE:** your bookings, the sessions you join, reviews you
write, and cancellation requests.

**If you are a parent:** which child you are linked to, and the payment
requests they send you.

**Technical:** SERVE does not run advertising or third-party analytics. If you
turn on notifications, your device's push subscription is stored so alerts can
reach you.

**Location:** only if you tap "use my location" on Discover, and only to sort
venues by distance. It is kept on your own device and is never sent to SERVE's
servers.

## Who can see what

This is the part most worth reading.

| | Who can see it |
|---|---|
| Your name, age, division, ranking, club | Other SERVE users, on session rosters |
| Your phone number or email | **Only you.** Never shown to other users. |
| Your photo | **Only you.** Not shown on rosters. |
| Your bookings | You, and the venue you booked |
| Your training schedule | You, your venue, and your parent if you are linked |
| A parent's phone number | That parent, their linked child, and the venue |
| Reviews you write | Everyone, with your name |
| Your password | Nobody, including us |

Anyone can browse venues, court availability, published schedules and ratings
without an account. None of that identifies a person.

## Children

If a player is under 18, a parent or guardian may link to their account. The
link only works once the child approves it from their own app — a parent
cannot attach themselves to a child without the child agreeing.

A guardian may ask at any time to see, correct or delete their child's
information, using the contact address above.

*[Decision needed: minimum age for an unaided account, and how guardian
consent is recorded as a timestamped event rather than inferred from the link
approval.]*

## Why SERVE uses this information

To run your account; to book courts and show you your schedule; to tell your
venue who is coming; to let a parent approve a request; to send notifications
you asked for; and to keep the platform secure.

SERVE does not sell your information. SERVE does not use it for advertising.

## Who it is shared with

**Your club or academy** — the venue you belong to or book with sees your
name and your bookings with them. It does not see your activity at other
venues.

**Service providers** — Supabase (database, authentication and file storage)
and Netlify (hosting). They process data on SERVE's instructions.

**When required by law.**

## How long it is kept

Your information is kept while your account is open.

*[Decision needed: retention period after an account is closed, and how long
booking records are kept for the venue's own accounting.]*

## Your rights

Under Egypt's Personal Data Protection Law (Law 151/2020) you may ask to see
what SERVE holds about you, correct anything wrong, delete your account and
its data, or object to a particular use. Write to the address above.

*[Deletion is not yet automated in the app. Until it is, requests are handled
manually — which is a gap that should close before real users.]*

## Security

Passwords are handled by Supabase Auth and are never stored by SERVE. All
traffic is encrypted in transit. The database enforces row-level access
control on every table, so one user cannot read another's data even by
querying directly. See `SECURITY.md` in the repository for detail.

No system is perfectly secure. If you believe your account has been accessed
by someone else, contact us at the address above.

## Changes

If this policy changes materially, SERVE will say so in the app before the
change takes effect.
