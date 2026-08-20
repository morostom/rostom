// pricing.js — what a court actually costs.
//
// Until now every court in SERVE was EGP 200/hour, hardcoded. Real venues
// price by branch (a New Cairo court isn't a Shorouk court), sometimes by
// individual court (the glass show court), and almost always by time of day
// — evenings are peak everywhere in Egypt.
//
// The model is deliberately small:
//   branch.price       standard rate, EGP per hour
//   branch.peak_price  optional evening rate (blank = same as standard)
//   branch.peak_from / branch.peak_to   the peak window, in hours
//   court.price        optional override for one court
//
// Everything is optional; a venue that never touches it keeps a flat rate.

export const DEFAULT_RATE = 200;
export const DEFAULT_PEAK = { from: 17, to: 22 };

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

// The rate card for one branch, with every blank filled in.
export function branchRates(branch = {}) {
  const rate = num(branch.price) ?? DEFAULT_RATE;
  const peak = num(branch.peak_price);
  return {
    rate,
    peak: peak && peak !== rate ? peak : null,
    from: num(branch.peak_from) ?? DEFAULT_PEAK.from,
    to: num(branch.peak_to) ?? DEFAULT_PEAK.to,
  };
}

// 'HH:MM' | number(hour) | Date → hour of day, or null
function hourOf(time) {
  if (time == null) return null;
  if (time instanceof Date) return time.getHours() + time.getMinutes() / 60;
  if (typeof time === 'number') return time;
  const m = String(time).match(/(\d{1,2}):(\d{2})/);
  return m ? parseInt(m[1], 10) + parseInt(m[2], 10) / 60 : null;
}

// Peak windows can wrap past midnight (20:00 → 01:00), so compare on a
// 0–24 line that we rotate rather than assuming from < to.
export function isPeak(time, rates) {
  const h = hourOf(time);
  if (h == null || !rates?.peak) return false;
  const { from, to } = rates;
  return from <= to ? h >= from && h < to : h >= from || h < to;
}

// What one hour on this court costs at this time.
export function courtRate(state, branchId, courtNo, time) {
  const branch = state?.branches?.find((b) => b.id === branchId);
  const rates = branchRates(branch);
  const court = courtNo != null && state?.courts?.find((c) => c.branch === branchId && c.court === courtNo);
  const override = court ? num(court.price) : null;
  if (override != null) return override;
  return isPeak(time, rates) ? rates.peak : rates.rate;
}

// The "from EGP …" a venue advertises: its cheapest standard rate anywhere.
export function venueFromPrice(state, orgId, fallback = DEFAULT_RATE) {
  const branches = (state?.branches || []).filter((b) => b.org_id === orgId);
  const rates = branches.map((b) => branchRates(b).rate);
  const courtOverrides = (state?.courts || [])
    .filter((c) => branches.some((b) => b.id === c.branch))
    .map((c) => num(c.price))
    .filter((n) => n != null);
  const all = [...rates, ...courtOverrides];
  return all.length ? Math.min(...all) : fallback;
}

// Price for a booking of `minutes` — courts are quoted per hour.
export const priceFor = (ratePerHour, minutes = 60) =>
  Math.round((ratePerHour * minutes) / 60);

// ── how long a session runs ────────────────────────────────────────────
// Sessions were all assumed to be an hour. 90-minute squads are the norm for
// junior squads, so duration is now a first-class field with a sane default.
export const DEFAULT_DURATION = 60;
export const DURATIONS = [30, 45, 60, 90, 120];
export const durationOf = (s) => num(s?.duration) ?? DEFAULT_DURATION;
export const durationLabel = (m) => (m % 60 === 0 ? `${m / 60}h` : m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`);

// 'HH:MM' + minutes → 'HH:MM' (wraps past midnight, because we're 24/7)
export function endTime(time, minutes = DEFAULT_DURATION) {
  const m = String(time || '').match(/(\d{1,2}):(\d{2})/);
  if (!m) return '';
  const total = (parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + minutes) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
