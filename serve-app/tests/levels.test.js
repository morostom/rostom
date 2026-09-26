// levels.test.js — a player's level comes from their ranking.
//
// The rule this protects: booking count must never outrank an actual
// national ranking. Before this, a junior ranked #3 in Egypt showed
// "Beginner" on their card because they had not booked many courts.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { levelFor, parseRank, LEVELS, UNRANKED_LEVELS } from '../src/data.js';

test('parseRank reads the rank out of a label', () => {
  assert.equal(parseRank('#3 · U17 National'), 3);
  assert.equal(parseRank('#1'), 1);
  assert.equal(parseRank('#128 · Senior'), 128);
  assert.equal(parseRank('# 42 · U15'), 42);
});

test('parseRank returns null for anything that is not a rank', () => {
  for (const bad of ['', null, undefined, 'Pending', 'Unranked', 'U17 National',
                     '#0', '#99999', 'top 10', '<script>#1</script>#']) {
    const r = parseRank(bad);
    assert.ok(r === null || (r > 0 && r < 10000), `bad rank survived: ${String(bad)} -> ${r}`);
  }
  assert.equal(parseRank('Pending'), null);
  assert.equal(parseRank('#0'), null);
});

test('a national top-8 junior is Elite regardless of bookings', () => {
  const player = { name: 'Nour', rankLabel: '#3 · U17 National', rankVerified: true };
  const l = levelFor(player, 0);
  assert.equal(l.key, 'elite');
  assert.equal(l.ranked, true);
  assert.equal(l.rank, 3);
  assert.equal(l.verified, true);
  // this is the regression: zero bookings must not demote a ranked player
  assert.notEqual(l.label, 'Beginner');
  assert.notEqual(l.label, 'Newcomer');
});

test('the bands land where they should', () => {
  const at = (rank) => levelFor({ rankLabel: `#${rank}` }, 0).key;
  assert.equal(at(1), 'elite');
  assert.equal(at(8), 'elite');
  assert.equal(at(9), 'national');
  assert.equal(at(24), 'national');
  assert.equal(at(25), 'competitor');
  assert.equal(at(64), 'competitor');
  assert.equal(at(65), 'challenger');
  assert.equal(at(150), 'challenger');
  assert.equal(at(151), 'rising');
  assert.equal(at(9999), 'rising');
});

test('an unranked player is placed by how much they play', () => {
  const p = { name: 'Club Player' };
  assert.equal(levelFor(p, 0).key, 'newcomer');
  assert.equal(levelFor(p, 10).key, 'regular');
  assert.equal(levelFor(p, 40).key, 'established');
  for (const n of [0, 10, 40, 500]) assert.equal(levelFor(p, n).ranked, false);
});

test('playing a lot never reaches a ranked band', () => {
  // Turning up is not the same as being ranked. A card that blurs the two is
  // a card nobody trusts.
  const rankedKeys = new Set(LEVELS.map((l) => l.key));
  for (const n of [0, 50, 500, 100000]) {
    assert.ok(!rankedKeys.has(levelFor({}, n).key), `activity ${n} reached a ranked band`);
  }
});

test('an unverified ranking still counts but is flagged', () => {
  const l = levelFor({ rankLabel: '#5 · U15', rankVerified: false }, 0);
  assert.equal(l.key, 'elite');
  assert.equal(l.verified, false);
});

test('every level carries what the UI needs', () => {
  for (const l of [...LEVELS, ...UNRANKED_LEVELS]) {
    assert.ok(l.key && l.label && l.blurb, `incomplete level: ${JSON.stringify(l)}`);
    assert.match(l.color, /^#[0-9a-f]{6}$/i, `level ${l.key} needs a hex colour`);
  }
});

test('levelFor never throws on a malformed player', () => {
  for (const p of [null, undefined, {}, { rankLabel: null }, { rankLabel: {} }, { rankLabel: [] }]) {
    assert.doesNotThrow(() => levelFor(p, 0));
    assert.ok(levelFor(p, 0).label);
  }
});
