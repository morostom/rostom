// sw.js — SERVE's service worker. Its only job is Web Push: waking a parent's
// phone when their child asks them to pay, or asks to cancel a session, even
// when the app is fully closed.
//
// Deliberately NOT a caching/offline worker. The app already ships as one
// self-contained HTML file, so there is nothing useful to pre-cache, and a
// stale cache would be a great way to serve people a months-old build.
//
// This file MUST be served as a real file at the site root — a service worker
// can't be inlined into the HTML, and its scope is limited to its own
// directory. That's why push works from the netlify/serve-player FOLDER but
// not from the bare single-file export.

// Take over as soon as we're installed, rather than waiting for every tab to
// close. A push subscription is useless until a worker is actually in control.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  // The payload is JSON we send ourselves from the Edge Function. If anything
  // is malformed, still show something rather than swallowing the alert.
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { d = {}; }

  const title = d.title || 'SERVE';
  const options = {
    body: d.body || '',
    icon: d.icon || './icon-192.png',
    badge: './icon-192.png',
    // tag groups by kind, so three payment requests replace each other
    // instead of stacking into a wall of banners
    tag: d.tag || 'serve',
    renotify: true,
    requireInteraction: d.urgent === true,
    vibrate: [140, 70, 140],
    data: { url: d.url || './', kind: d.kind || 'general' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || './';
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Prefer focusing a tab that's already open — opening a second copy of
    // the app loses whatever the parent was in the middle of.
    for (const c of all) {
      if ('focus' in c) {
        await c.focus();
        // tell the app which alert was tapped so it can route
        c.postMessage({ type: 'serve-notification-click', data: event.notification.data });
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
