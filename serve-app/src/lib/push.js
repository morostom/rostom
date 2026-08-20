// push.js — Web Push (phase 2 of lib/notify.js).
//
// notify.js fires a banner while the app is open. This file goes further: the
// browser keeps a subscription with its own push service, so a parent gets the
// alert with SERVE fully closed and the phone in a pocket.
//
// Three things have to line up, and any of them can be missing in the wild:
//   1. a service worker at the site root  → only in the netlify/ FOLDER build,
//      never the bare single-file export (a worker can't be inlined)
//   2. a VAPID public key at build time   → VITE_VAPID_PUBLIC_KEY
//   3. on iPhone, the app installed to the Home Screen — Apple gives web push
//      to home-screen apps only, and Safari doesn't say so, it just fails
//
// Everything degrades: if push can't be set up we fall back to notify.js's
// in-app banners, which is exactly how SERVE behaved before this file.

import { hasBackend, supabase } from './supabase';

const runtime = (typeof window !== 'undefined' && window.__SERVE__) || {};
const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY || runtime.vapidPublicKey || '';

export const hasVapidKey = Boolean(VAPID_PUBLIC);

export function pushSupported() {
  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;
}

// Running as an installed app rather than a Safari/Chrome tab.
export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function isIOS() {
  if (typeof navigator === 'undefined') return false;
  // iPadOS 13+ reports as a Mac, so the touch check catches it too
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// The one case worth explaining to the user instead of silently failing:
// an iPhone in a browser tab can never subscribe.
export const iosNeedsInstall = () => isIOS() && !isStandalone();

// VAPID keys travel as base64url; PushManager wants raw bytes.
function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

let swReg = null;
export async function registerServiceWorker() {
  if (!pushSupported()) return null;
  if (swReg) return swReg;
  try {
    // relative path: each surface is deployed at its own site root
    swReg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
    await navigator.serviceWorker.ready;
    return swReg;
  } catch {
    // no sw.js next to the HTML — the single-file export, most likely
    return null;
  }
}

// Why push isn't available, in a form the UI can explain.
//   ready | unsupported | ios-needs-install | no-key | no-worker | denied | off
export async function pushState() {
  if (!pushSupported()) return 'unsupported';
  if (iosNeedsInstall()) return 'ios-needs-install';
  if (!hasVapidKey) return 'no-key';
  if (Notification.permission === 'denied') return 'denied';
  const reg = await registerServiceWorker();
  if (!reg) return 'no-worker';
  const sub = await reg.pushManager.getSubscription().catch(() => null);
  return sub ? 'ready' : 'off';
}

// Store the subscription so the Edge Function can find this parent later.
async function saveSubscription(sub, identifier) {
  if (!hasBackend || !sub) return;
  const j = sub.toJSON();
  const { data } = await supabase.auth.getUser();
  await supabase.from('push_subscriptions').upsert({
    endpoint: j.endpoint,
    user_id: data?.user?.id ?? null,
    identifier: identifier || null,
    p256dh: j.keys?.p256dh ?? null,
    auth: j.keys?.auth ?? null,
    user_agent: navigator.userAgent.slice(0, 300),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'endpoint' });
}

// Subscribe this device. Must be called from a tap — iOS requires the
// permission prompt to come from a user gesture.
// Returns the same vocabulary as pushState().
export async function enablePush(identifier) {
  if (!pushSupported()) return 'unsupported';
  if (iosNeedsInstall()) return 'ios-needs-install';
  if (!hasVapidKey) return 'no-key';

  const perm = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission().catch(() => 'denied');
  if (perm !== 'granted') return 'denied';

  const reg = await registerServiceWorker();
  if (!reg) return 'no-worker';

  try {
    const existing = await reg.pushManager.getSubscription();
    // Re-save even when one exists: the row may have been lost, or this may
    // be a different account on the same phone.
    const sub = existing || await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    });
    await saveSubscription(sub, identifier);
    return 'ready';
  } catch {
    return 'no-worker';
  }
}

export async function disablePush() {
  if (!pushSupported()) return;
  const reg = await registerServiceWorker();
  const sub = await reg?.pushManager.getSubscription().catch(() => null);
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => {});
  if (hasBackend) await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
}

// Ask the Edge Function to push to whoever owns `identifier`. Fire-and-forget:
// a failed push must never block the action that triggered it (the child still
// made their request; the parent just gets it in-app instead).
export async function sendPush({ identifier, title, body, kind, urgent }) {
  if (!hasBackend) return false;
  try {
    const { error } = await supabase.functions.invoke('send-push', {
      body: { identifier, title, body, kind: kind || 'general', urgent: !!urgent },
    });
    return !error;
  } catch {
    return false;
  }
}
