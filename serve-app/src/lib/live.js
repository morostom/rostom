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

// A branch's published hours, with the 24/7 default filled in. Hours can wrap
// past midnight (a venue open 06:00–02:00 stores close: 26).
export function hoursOf(branch) {
  const n = (v) => { const x = parseFloat(v); return Number.isFinite(x) ? x : null; };
  const open = n(branch?.open_hour);
  const close = n(branch?.close_hour);
  if (open == null || close == null) return DEFAULT_HOURS;
  return { open: Math.max(0, open), close: close <= open ? close + 24 : close };
}

// The hours a whole venue advertises: the widest window any branch keeps.
export function venueHours(state, orgId) {
  const list = (state?.branches || []).filter((b) => b.org_id === orgId);
  if (!list.length) return DEFAULT_HOURS;
  const all = list.map(hoursOf);
  if (all.some(isAlwaysOpen)) return DEFAULT_HOURS;
  return { open: Math.min(...all.map((h) => h.open)), close: Math.max(...all.map((h) => h.close)) };
}

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
  if (isAlwaysOpen(hours)) return true;
  const m = minutesOfDay(now);
  const inWindow = (x) => x >= hours.open * 60 && x < hours.close * 60;
  // a window that runs past midnight also covers this morning's small hours
  return inWindow(m) || inWindow(m + 1440);
}

// `t` is the i18n translator — passed in so this stays a pure helper.
export function closesInLabel(now, hours = DEFAULT_HOURS, t = (s) => s) {
  if (isAlwaysOpen(hours)) return t('Open 24/7');
  const m = minutesOfDay(now);
  if (!isOpenNow(now, hours)) return `${t('Opens')} ${fmtHHMM(hours.open * 60)}`;
  // if we're in the after-midnight tail, measure from tomorrow's clock
  const here = m >= hours.open * 60 ? m : m + 1440;
  const left = hours.close * 60 - here;
  if (left <= 60) return `${t('Closes in')} ${Math.max(1, Math.round(left))} ${t('min')}`;
  return `${t('Open until')} ${fmtHHMM(hours.close * 60)}`;
}

// The next bookable slot on or after now, on the half hour.
export function nextSlot(now, hours = DEFAULT_HOURS) {
  const m = minutesOfDay(now);
  if (isAlwaysOpen(hours)) return (Math.ceil(m / 30) * 30) % 1440;
  const here = isOpenNow(now, hours) && m < hours.open * 60 ? m + 1440 : m;
  const slot = Math.ceil(Math.max(here, hours.open * 60) / 30) * 30;
  return slot >= hours.close * 60 ? null : slot % 1440;
}

// How a scheduled session relates to right now.
//   'live'   — running   ·  'soon' — starts within 90 min
//   'later'  — later today          ·  'other' — a different day
export function sessionTiming(now, session, durationMin) {
  const dur = durationMin ?? (parseFloat(session?.duration) || 60);
  return timing(now, session, dur);
}
function timing(now, session, durationMin) {
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
