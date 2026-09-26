// security.test.js — the adversarial cases. These are regression tests for
// real findings, not hypotheticals: each block names the hole it keeps shut.
//
//   node --test tests/

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeColor, isSafeColor } from '../src/lib/color.js';
import { coordsFromMapsUrl, venueCoords, mapsLink, distanceKm } from '../src/lib/geo.js';

// ── stored XSS through a venue's brand colour ────────────────────────
// Any signed-up club can set org_settings.accent. On the map that string is
// interpolated into a style attribute in raw Leaflet HTML, so a break-out is
// stored XSS on every player's Discover screen.
test('safeColor rejects everything that is not a colour', () => {
  const attacks = [
    'red;"></span><img src=x onerror=alert(1)>',
    '#fff;"><script>alert(1)</script>',
    'url(javascript:alert(1))',
    'expression(alert(1))',
    '}</style><script>alert(1)</script>',
    'var(--sq-gold); background:url(//evil.tld/x)',
    '#12345',        // wrong length
    '#gggggg',       // not hex
    'rgb(255,0,0)',  // valid CSS, deliberately unsupported
    'red',
    '',
    null,
    undefined,
    '   ',
  ];
  for (const a of attacks) {
    assert.equal(safeColor(a), 'var(--sq-gold)', `should have rejected: ${String(a).slice(0, 40)}`);
    assert.equal(isSafeColor(a), false);
  }
});

test('safeColor passes real colours through unchanged', () => {
  for (const good of ['#ef4a2e', '#2E8CF0', '#fff', '#FFF', 'var(--sq-gold)', 'var(--sq-blue)']) {
    assert.equal(safeColor(good), good);
    assert.equal(isSafeColor(good), true);
  }
  // surrounding whitespace is trimmed, not a reason to reject
  assert.equal(safeColor('  #ef4a2e  '), '#ef4a2e');
});

test('safeColor honours an explicit fallback', () => {
  assert.equal(safeColor('nonsense', '#000000'), '#000000');
});

// ── coordinates from untrusted paste ─────────────────────────────────
// Admins paste whatever their phone gave them. Nothing here should throw,
// and nothing should produce an off-planet coordinate.
test('coordsFromMapsUrl handles the shapes people actually paste', () => {
  const cases = [
    ['https://www.google.com/maps/@30.0444,31.2357,15z', 30.0444, 31.2357],
    ['https://www.google.com/maps/place/X/data=!3d30.088!4d31.324', 30.088, 31.324],
    ['https://maps.google.com/?q=29.96,31.26', 29.96, 31.26],
    ['geo:30.05,31.23', 30.05, 31.23],
    ['30.0444, 31.2357', 30.0444, 31.2357],
  ];
  for (const [url, lat, lng] of cases) {
    const r = coordsFromMapsUrl(url);
    assert.ok(r, `no coords from ${url}`);
    assert.ok(Math.abs(r.lat - lat) < 0.001 && Math.abs(r.lng - lng) < 0.001, `wrong coords for ${url}`);
  }
});

test('coordsFromMapsUrl refuses junk instead of throwing', () => {
  for (const bad of ['', null, undefined, 'not a url', 'https://example.com', '999,999',
                     '<script>alert(1)</script>', 'javascript:alert(1)', 'A'.repeat(10000)]) {
    assert.doesNotThrow(() => coordsFromMapsUrl(bad));
    const r = coordsFromMapsUrl(bad);
    if (r) {
      assert.ok(Math.abs(r.lat) <= 90 && Math.abs(r.lng) <= 180, `off-planet from ${String(bad).slice(0,20)}`);
    }
  }
});

test('venueCoords never throws on missing or hostile fields', () => {
  for (const v of [{}, null, undefined,
                   { address: null, maps_url: undefined },
                   { address: '<img src=x onerror=alert(1)>' },
                   { city: 'A'.repeat(5000) }]) {
    assert.doesNotThrow(() => venueCoords(v || {}));
  }
});

test('mapsLink always produces a real https URL', () => {
  for (const v of [{}, { name: 'Test "quoted" Club' }, { maps_url: 'javascript:alert(1)' },
                   { name: '<script>alert(1)</script>' }]) {
    const link = mapsLink(v);
    assert.ok(link.startsWith('https://'), `not https: ${link}`);
    // a javascript: url must never survive as the href
    assert.ok(!link.toLowerCase().startsWith('javascript:'));
  }
});

test('distanceKm is sane and symmetric', () => {
  const cairo = { lat: 30.0444, lng: 31.2357 };
  const alex = { lat: 31.2001, lng: 29.9187 };
  const d = distanceKm(cairo, alex);
  assert.ok(d > 150 && d < 250, `Cairo→Alexandria should be ~180km, got ${d}`);
  assert.ok(Math.abs(d - distanceKm(alex, cairo)) < 0.001);
  assert.equal(distanceKm(cairo, cairo), 0);
  assert.equal(distanceKm(null, cairo), null);
  assert.equal(distanceKm(cairo, null), null);
});
