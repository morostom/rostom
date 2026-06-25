# SERVE — standalone builds

Self-contained HTML files (all JS + CSS inlined; only Google Fonts loads from
the network). Regenerate with `npm install && npm run export`.

| File | Surface | Open on |
| --- | --- | --- |
| `serve-player.html` | Mobile player app | phone |
| `serve-admin.html` | Academy owner console | laptop/desktop |
| `serve-club.html` | Club coordinator (coach) console | laptop/desktop |
| `serve-demo.html` | **All three in one page** (surface switcher) | laptop |

## Deploy on Netlify (drag & drop)

Folders are pre-built under `netlify/`. Drag any one folder
(e.g. `netlify/serve-player`) onto https://app.netlify.com/drop for its own URL.

## Live "connected" demo

State (live courts, schedule, brand colour, bookings) is shared through the
browser. To show the platform reacting in real time:

- **Easiest:** open `serve-demo.html`, switch to **Coach console**, mark a court
  busy or change the brand colour, then switch to **Player app** — the change is
  already there.
- **Two screens, same site:** deploy `serve-demo.html` once and open it in two
  tabs/windows of that one URL; changes sync across them via the browser.

Note: three *separately* deployed Netlify sites have different origins, so they
won't sync with each other — real cross-device sync is the backend's job. The
combined `serve-demo.html` is the way to show the connection live in a pitch.

## Access codes (player ↔ club)

Codes the coach console issues are the codes the player app accepts. Working
codes: `9F4K2A`, `K5R2WQ`, `B8N3VD`, `3T8M1P`, `QX7L0R`.
