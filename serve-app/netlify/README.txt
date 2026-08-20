SERVE — Netlify drop folders

netlify/serve-player/  →  Mobile player app  (installable + push)
netlify/serve-admin/  →  Academy owner console
netlify/serve-club/  →  Club coordinator console
netlify/serve-demo/  →  Connected demo (all 3 + live sync)  (installable + push)

Drag ONE folder (e.g. netlify/serve-player) onto https://app.netlify.com/drop
to deploy that surface to its own URL. Repeat for the other two.

IMPORTANT — push notifications:
Drag the FOLDER, not export/serve-player.html. The service worker that
wakes a closed app is a separate file (sw.js) and cannot be inlined into
the single-file build. The .html on its own still works — it just falls
back to in-app alerts.

On iPhone, push additionally requires the parent to install the app:
Share → "Add to Home Screen", then open SERVE from the home screen.
