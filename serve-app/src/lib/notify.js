// notify.js — best-effort "reaches the phone" alerts for the parent.
//
// Phase 1 (this file): a system notification (with the user's permission) plus
// a sound + vibration, fired the instant a transfer request arrives over
// realtime. This works while the SERVE app is open or recently backgrounded —
// especially once added to the home screen — so the parent gets a real banner
// on their phone instead of the child having to call and say "check the app".
//
// Phase 2 (later): a service worker + Web Push + a Supabase Edge Function so the
// alert also wakes a fully-closed app. The call sites here won't need to change.

export function notifySupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function notifyPermission() {
  return notifySupported() ? Notification.permission : 'unsupported';
}

// Ask once. Must be called from a user gesture (a tap) on iOS/Safari.
export async function ensureNotifyPermission() {
  if (!notifySupported()) return 'unsupported';
  if (Notification.permission !== 'default') return Notification.permission;
  try { return await Notification.requestPermission(); } catch { return Notification.permission; }
}

// A short two-tone chime via WebAudio (no asset needed).
function chime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const tone = (freq, at, dur) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + dur + 0.02);
    };
    tone(784, 0, 0.18);     // G5
    tone(1047, 0.16, 0.28); // C6
  } catch { /* audio may be blocked until first interaction — ignore */ }
}

// Fire a real phone alert: system notification (if allowed) + sound + vibrate.
export function phoneAlert(title, body) {
  chime();
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([140, 70, 140]); } catch { /* ignore */ }
  }
  if (notifySupported() && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, tag: 'serve-transfer', renotify: true, badge: undefined });
    } catch { /* some browsers require a SW for Notification — ignore in phase 1 */ }
  }
}
