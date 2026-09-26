# Legal — what SERVE needs, and what only a lawyer can settle

**These are drafts written by an engineer, not legal advice.** They describe
accurately how the software behaves, which is the part engineering can get
right, and they are structured so an Egyptian lawyer can review them quickly
rather than starting from a blank page. Do not publish them as final.

The most urgent item is not a document. It is this:

> The signup screen already says *"By continuing you agree to SERVE's terms."*
> Those terms did not exist. Promising users a document you do not have is
> worse than having no notice at all — it is a representation you cannot
> support. Either ship terms or remove the sentence.

`terms.md` and `privacy.md` in this folder are the draft. The app now links
to them from Settings → Legal.

---

## The five things that actually create exposure

### 1. Children are the core users, and the law treats that specially

SERVE onboards minors by design — there is a "For my child" path and an
under-16 parental approval flow. That triggers:

- **Egypt's Personal Data Protection Law (Law 151/2020)**: processing a
  child's personal data requires guardian consent. SERVE collects a child's
  name, age, photo, club and training schedule.
- **GDPR Article 8** if SERVE ever has users in the EU/UK — including an
  Egyptian family on holiday, depending on how targeting is assessed.

**What the code does today:** a parent account links to a child by name, and
the child approves the link from their own app. That is a reasonable
technical basis for consent, but the consent is never *recorded* as such —
there is no timestamped record of a guardian agreeing to specific processing.

**Decision you need:** the minimum age to hold a SERVE account at all. Right
now a 9-year-old can sign up unaided with a phone number. Most platforms set
13 and require a parent account below that.

### 2. Duty of care for what happens on court

SERVE books courts and publishes training sessions. If a child is injured at
a session found through SERVE, the question is whether SERVE presented itself
as responsible for supervision or vetting.

Nothing in the app currently says it isn't. `terms.md` contains a draft clause
positioning SERVE as an intermediary, with the venue responsible for
supervision, coach vetting, facilities and insurance. **A lawyer should
confirm that clause actually holds under Egyptian consumer law** — disclaimers
of liability for personal injury are limited or void in many jurisdictions.

**Decision you need:** whether venues must warrant, in their own agreement
with SERVE, that their coaches are vetted and they carry insurance. That is a
venue-side contract this folder does not cover.

### 3. Photos of minors

A player card carries a photo. The `player_cards` view deliberately excludes
it, so photos are not broadcast to other users — but they are stored, and a
photo of a child is sensitive.

**Decision you need:** whether a photo is optional (recommended), who can see
it, and how long it is kept after an account goes inactive.

### 4. Data rights you cannot currently honour

Under PDPL and GDPR a user can demand access, correction and deletion.
**SERVE has no delete-account path.** If someone asks today, the answer is
manual SQL. Before real users, there needs to be a working deletion route and
a stated retention period.

### 5. Payments, when they arrive

Parked until SERVE is registered, per your call — the right sequence. When
they land: a refund and cancellation policy is legally required, not optional,
and the parent-pays-for-child flow needs care, because the payer and the
beneficiary are different people.

---

## Checklist before real users

- [ ] Ship terms and a privacy policy, or remove the signup sentence
- [ ] Register SERVE as a legal entity (also gates payments)
- [ ] Have an Egyptian lawyer review both documents, the liability clause in particular
- [ ] Decide and enforce a minimum age
- [ ] Record guardian consent as a timestamped event, not an inference
- [ ] Build account deletion and state a retention period
- [ ] Make the player-card photo optional
- [ ] Register as a data controller with the Egyptian DPA if required at your size
- [ ] Put a venue agreement in place covering vetting, supervision and insurance
- [ ] Name a contact address for data requests — the documents leave a placeholder

## What the engineering side already does

Not a substitute for any of the above, but worth knowing when the lawyer asks
what technical measures are in place. Full detail in `../../SECURITY.md`.

- Children's names, parents' phone numbers, venues and times are readable only
  by the parent, the child and the venue — not by other users, and not
  anonymously
- Player rosters expose name, age, division, ranking and club, and never a
  phone number, email or photo
- A child cannot be linked to a parent without approving it from their own app
- Access codes cannot be enumerated
- Passwords are handled by Supabase Auth; SERVE never stores one
- All traffic is HTTPS; the database enforces row-level security on every table
