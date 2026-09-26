// behaviour.test.js — the rules that decide what people see and pay.
//
//   npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHHMM, closesInLabel, nextSlot, isAlwaysOpen, sessionTiming } from '../src/lib/live.js';
import { TIME_SLOTS, slotsInPeriod, TIME_PERIODS, resolveAccessCode } from '../src/data.js';

// ── 24/7 ─────────────────────────────────────────────────────────────
// Egyptian courts get booked at 06:00 before work and 23:00 after it, and
// weekend squads train early. Every half hour has to be reachable.
test('the day is 48 bookable half-hours, 00:00 to 23:30', () => {
  assert.equal(TIME_SLOTS.length, 48);
  assert.equal(TIME_SLOTS[0], '00:00');
  assert.equal(TIME_SLOTS[1], '00:30');
  assert.equal(TIME_SLOTS.at(-1), '23:30');
  assert.equal(new Set(TIME_SLOTS).size, 48, 'slots must be unique');
});

test('every slot belongs to exactly one period', () => {
  const seen = new Map();
  for (const p of TIME_PERIODS) {
    for (const s of slotsInPeriod(p)) {
      assert.ok(!seen.has(s), `${s} is in both ${seen.get(s)} and ${p.key}`);
      seen.set(s, p.key);
    }
  }
  assert.equal(seen.size, 48, 'every slot needs a period, including the small hours');
});

test('early morning slots exist — weekend squads train at 06:00', () => {
  const early = slotsInPeriod(TIME_PERIODS.find((p) => p.key === 'early'));
  assert.ok(early.includes('06:00'));
  assert.ok(early.includes('07:00'));
});

test('a 24/7 venue never reads as closing', () => {
  const t = (s) => s;
  assert.equal(isAlwaysOpen({ open: 0, close: 24 }), true);
  assert.equal(closesInLabel(new Date(), { open: 0, close: 24 }, t), 'Open 24/7');
  // and its next slot always exists, rolling past midnight
  const late = new Date(2026, 0, 1, 23, 45);
  assert.notEqual(nextSlot(late, { open: 0, close: 24 }), null);
});

test('a venue that does close reports no slot after closing', () => {
  const late = new Date(2026, 0, 1, 23, 45);
  assert.equal(nextSlot(late, { open: 8, close: 22 }), null);
});

test('parseHHMM accepts real times and refuses the rest', () => {
  assert.equal(parseHHMM('06:00'), 360);
  assert.equal(parseHHMM('23:30'), 23 * 60 + 30);
  assert.equal(parseHHMM('00:00'), 0);
  for (const bad of ['', null, undefined, 'nope', '99', '<script>']) {
    assert.equal(parseHHMM(bad), null, `should reject ${String(bad)}`);
  }
});

// ── session timing ───────────────────────────────────────────────────
test('sessionTiming separates live, soon, later and done', () => {
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(2026, 0, 7, 12, 0).getDay()];
  const noon = new Date(2026, 0, 7, 12, 0);
  assert.equal(sessionTiming(noon, { day, time: '11:30' }, 60).state, 'live');   // started 30m ago
  assert.equal(sessionTiming(noon, { day, time: '12:45' }, 60).state, 'soon');   // within 90m
  assert.equal(sessionTiming(noon, { day, time: '20:00' }, 60).state, 'later');
  assert.equal(sessionTiming(noon, { day, time: '08:00' }, 60).state, 'done');
  // a different day is not today's business
  const other = day === 'Mon' ? 'Tue' : 'Mon';
  assert.equal(sessionTiming(noon, { day: other, time: '12:00' }, 60).state, 'other');
});

test('a 90-minute session is still live at the 75-minute mark', () => {
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(2026, 0, 7, 12, 0).getDay()];
  const noon = new Date(2026, 0, 7, 12, 0);
  assert.equal(sessionTiming(noon, { day, time: '10:45' }, 90).state, 'live');
  assert.equal(sessionTiming(noon, { day, time: '10:45' }, 60).state, 'done');
});

// ── access codes ─────────────────────────────────────────────────────
test('an access code names the venue it opens', () => {
  const club = resolveAccessCode('K5R2WQ');
  assert.equal(club.ok, true);
  assert.equal(club.type, 'club');
  assert.equal(club.orgId, 'heliopolis');

  const academy = resolveAccessCode('A4X9TD');
  assert.equal(academy.ok, true);
  assert.equal(academy.type, 'academy');
  assert.equal(academy.orgId, 'ramyashour');
});

test('a wrong code is refused, whatever shape it arrives in', () => {
  for (const bad of ['', null, undefined, 'ZZZZZZ', '123', 'K5R2WQ-extra',
                     "' OR 1=1 --", '<script>alert(1)</script>']) {
    assert.equal(resolveAccessCode(bad).ok, false, `should refuse ${String(bad)}`);
  }
});

test('access codes are matched case- and whitespace-insensitively', () => {
  assert.equal(resolveAccessCode('  k5r2wq  ').ok, true);
});
