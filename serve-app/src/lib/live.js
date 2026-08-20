// live.js — the clock everything on Discover reacts to.
//
// One shared ticker (not one per component) so the whole screen re-renders
// together: open/closed, "free now", and which sessions are next all follow
// the real time of day.

import { useEffect, useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// SERVE is 24/7. A venue can still publish its own hours later; until
// then every court is bookable at every hour.
export const DEFAULT_HOURS = { open: 0, close: 24 };
export const isAlwaysOpen = (h = DEFAULT_HOURS) => h.open <= 0 && h.close >= 24;

// Re-render on a cadence (default every 30s) and hand back "now".
export function useNow(everyMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}

export const minutesOfDay = (d) => d.getHours() * 60 + d.getMinutes();
export const dayId = (d) => DAYS[d.getDay()];

export function parseHHMM(s) {
  const m = String(s || '').match(/^(\d{1,2})[:.](\d{2})/);
  if (!m) return null;
  return Math.min(23, parseInt(m[1], 10)) * 60 + parseInt(m[2], 10);
}

export const fmtHHMM = (mins) =>
  `${String(Math.floor((mins % 1440) / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

// Is the venue open right now?
export function isOpenNow(now, hours = DEFAULT_HOURS) {
  const m = minutesOfDay(now);
  return m >= hours.open * 60 && m < hours.close * 60;
}

// `t` is the i18n translator — passed in so this stays a pure helper.
export function closesInLabel(now, hours = DEFAULT_HOURS, t = (s) => s) {
  if (isAlwaysOpen(hours)) return t('Open 24/7');
  const m = minutesOfDay(now);
  if (m < hours.open * 60 || m >= hours.close * 60) return `${t('Opens')} ${fmtHHMM(hours.open * 60)}`;
  const left = hours.close * 60 - m;
  if (left <= 60) return `${t('Closes in')} ${left} ${t('min')}`;
  return `${t('Open until')} ${fmtHHMM(hours.close * 60)}`;
}

// The next bookable slot on or after now, on the half hour.
export function nextSlot(now, hours = DEFAULT_HOURS) {
  const m = minutesOfDay(now);
  const start = Math.max(m, hours.open * 60);
  const slot = Math.ceil(start / 30) * 30;
  if (isAlwaysOpen(hours)) return slot % 1440;   // rolls into tomorrow
  return slot >= hours.close * 60 ? null : slot;
}

// How a scheduled session relates to right now.
//   'live'   — running   ·  'soon' — starts within 90 min
//   'later'  — later today          ·  'other' — a different day
export function sessionTiming(now, session, durationMin = 60) {
  const start = parseHHMM(session.time);
  if (start == null) return { state: 'other' };
  const sameDay = !session.day || session.day === dayId(now);
  if (!sameDay) return { state: 'other', start };
  const m = minutesOfDay(now);
  if (m >= start && m < start + durationMin) {
    return { state: 'live', start, endsIn: start + durationMin - m };
  }
  if (start > m && start - m <= 90) return { state: 'soon', start, startsIn: start - m };
  if (start > m) return { state: 'later', start };
  return { state: 'done', start };
}
