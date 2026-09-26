// color.js — validating colours that came from somewhere untrusted.
//
// A venue's accent is attacker-controlled: anyone can register a club and set
// org_settings.accent to any string. Most of the app puts that string in a
// React style object, which is safe. The map does not — Leaflet markers are
// raw HTML, so an accent lands inside a style="..." attribute, where
//   red;"></span><img src=x onerror=...>
// breaks out and becomes stored XSS on every player's Discover screen.
//
// So: hex or one of our own tokens, nothing else. Deliberately strict —
// rgb(), hsl() and named colours are all rejected, because none of them are
// worth the parser.

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const TOKEN = /^var\(--sq-[a-z0-9-]+\)$/i;

export function safeColor(c, fallback = 'var(--sq-gold)') {
  const s = String(c ?? '').trim();
  if (HEX.test(s)) return s;
  if (TOKEN.test(s)) return s;
  return fallback;
}

export const isSafeColor = (c) => {
  const s = String(c ?? '').trim();
  return HEX.test(s) || TOKEN.test(s);
};
