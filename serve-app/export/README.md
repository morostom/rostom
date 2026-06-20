# SERVE — standalone builds

Three self-contained HTML files, one per surface. Each has all JS + CSS
inlined (only the Google Fonts stylesheet loads from the network), so any
one file can be deployed on its own.

| File | Surface | Open on |
| --- | --- | --- |
| `serve-player.html` | Mobile player app | phone |
| `serve-admin.html` | Academy owner console | laptop/desktop |
| `serve-club.html` | Club coordinator (coach) console | laptop/desktop |

## Regenerate

```bash
npm install
npm run export   # rebuilds all three into export/
```

## Deploy on Netlify (separate URL each)

Netlify serves a site's root `index.html`. Easiest path per surface:

1. Make a folder, copy the file in as `index.html`, e.g.
   `mkdir player && cp serve-player.html player/index.html`
2. Drag that folder onto https://app.netlify.com/drop (or `netlify deploy --dir player --prod`).

Repeat for admin and club to get three independent URLs.

## Access codes (player ↔ club connection)

The club console issues access codes; the player join flow validates against
that same list. Codes that work in the player app right now:

- `9F4K2A` — issued to Omar Khaled (redeemed)
- `K5R2WQ`, `B8N3VD` — open/unused
- `3T8M1P`, `QX7L0R` — sent
- `M2W9HF` — **expired** (intentionally refused, to show validation)
