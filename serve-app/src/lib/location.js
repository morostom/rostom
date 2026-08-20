// location.js — the player's real position, asked for politely.
//
// Browsers only hand over coordinates after an explicit user gesture, and a
// denied prompt is permanent-ish, so we never ask on load. Discover shows a
// "Use my location" button; until it's tapped we fall back to a Cairo centre
// so distances are still plausible rather than absent.
//
// The last fix is cached in localStorage, so a returning player sees real
// distances immediately without a second prompt.

import { useCallback, useEffect, useState } from 'react';

const KEY = 'serve_geo_v1';
const MAX_AGE = 1000 * 60 * 60 * 6; // a 6-hour-old fix is still useful

// central Cairo — used only until we have a real fix
export const FALLBACK = { lat: 30.0444, lng: 31.2357, fallback: true };

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (c && Date.now() - c.at < MAX_AGE) return { lat: c.lat, lng: c.lng, at: c.at };
  } catch { /* private mode */ }
  return null;
}
function writeCache(pos) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...pos, at: Date.now() })); } catch { /* ignore */ }
}

export function useLocation() {
  const [coords, setCoords] = useState(() => readCache());
  const [status, setStatus] = useState(() => (readCache() ? 'ready' : 'idle')); // idle|asking|ready|denied|unsupported

  // If permission was already granted in a previous visit, refresh silently —
  // no prompt is shown when the state is already 'granted'.
  useEffect(() => {
    if (!navigator.geolocation || !navigator.permissions?.query) return;
    let alive = true;
    navigator.permissions.query({ name: 'geolocation' }).then((p) => {
      if (!alive || p.state !== 'granted') return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!alive) return;
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          writeCache(c); setCoords(c); setStatus('ready');
        },
        () => {},
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
      );
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const request = useCallback(() => {
    if (!navigator.geolocation) return setStatus('unsupported');
    setStatus('asking');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        writeCache(c); setCoords(c); setStatus('ready');
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unsupported'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return { coords: coords || FALLBACK, exact: !!coords, status, request };
}

// How far is "out of area"? Anything past this reads as a trip, not a local.
export const NEAR_KM = 15;
export const areaOf = (km) =>
  km == null ? 'unknown' : km <= 5 ? 'close' : km <= NEAR_KM ? 'near' : 'far';
