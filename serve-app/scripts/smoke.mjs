// smoke.mjs — drive the real app in a browser and check the journeys that
// matter still work. Catches the class of break that a unit test cannot: a
// screen that renders black because of an undefined variable.
//
//   npm run dev -- --port 5199      (in one terminal)
//   node scripts/smoke.mjs          (in another)
//
// Runs against the keyless build, so everything lives in the in-memory store
// and no Supabase project is touched.

import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE || 'http://localhost:5199';
const results = [];
const check = (label, ok) => { results.push({ label, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`); };

const browser = await chromium.launch();
const errors = [];

async function page(width = 430, height = 932) {
  const p = await browser.newPage({ viewport: { width, height } });
  p.on('pageerror', (e) => errors.push(`${e.message.slice(0, 160)}`));
  p.on('console', (m) => {
    // the sandbox cannot reach Google Fonts or OSM tiles; those are expected
    if (m.type() === 'error' && !/net::|ERR_|Failed to load resource/.test(m.text())) {
      errors.push(m.text().slice(0, 160));
    }
  });
  return p;
}

// Sign up and build a card. This is every player's first two minutes.
async function onboard(p, { name = 'Smoke Tester', phone = '1009998880' } = {}) {
  await p.goto(`${BASE}/player.html`);
  await p.waitForTimeout(1200);
  await p.locator('input').first().fill(phone);
  await p.locator('input[type=password]').first().fill('serve1234');
  await p.getByRole('button', { name: /Create account/i }).click();
  await p.waitForTimeout(1400);
  await p.getByText('For myself', { exact: false }).first().click();
  await p.waitForTimeout(900);
  await p.getByText('Yes, I compete', { exact: false }).first().click();
  await p.waitForTimeout(900);
  await p.locator('input[placeholder="Your full name"]').fill(name);
  await p.locator('input[type=number]').first().fill('16');
  for (const sel of await p.locator('select:visible').all()) {
    for (const o of await sel.locator('option').all()) {
      const v = await o.getAttribute('value');
      if (v) { await sel.selectOption(v); break; }
    }
  }
  await p.getByRole('button', { name: /Create my card/i }).click();
  await p.waitForTimeout(1800);
}

async function redeem(p, code) {
  await p.getByText(/^My (Venue|Club|Academy)$/).first().click();
  await p.waitForTimeout(1100);
  await p.getByRole('button', { name: /Enter access code/i }).click();
  await p.waitForTimeout(700);
  await p.locator('input:visible').first().fill(code);
  await p.waitForTimeout(1300);
  const unlock = p.getByRole('button', { name: /Unlock|Continue|Join/i }).first();
  if (await unlock.count()) await unlock.click().catch(() => {});
  await p.waitForTimeout(2000);
}

// ── 1. player onboarding ─────────────────────────────────────────────
{
  const p = await page();
  await onboard(p);
  const body = await p.innerText('body');
  check('signup builds a player card', /Smoke Tester/.test(body));
  await p.close();
}

// ── 2. a club code opens the club home ───────────────────────────────
{
  const p = await page();
  await onboard(p);
  await redeem(p, 'K5R2WQ');
  const body = await p.innerText('body');
  check('club code opens the club home', body.includes('SQUASH SECTION'));
  check('club home lists live courts', /COURTS RIGHT NOW/i.test(body));
  check('venue tab reads "My Club"', body.includes('My Club'));
  await p.close();
}

// ── 3. an academy code opens the academy home ────────────────────────
{
  const p = await page();
  await onboard(p);
  await redeem(p, 'A4X9TD');
  const body = await p.innerText('body');
  check('academy code opens the academy home', body.includes('SQUASH ACADEMY'));
  check('academy home shows a coach rail', /YOUR COACHES/i.test(body));
  check('venue tab reads "My Academy"', body.includes('My Academy'));
  await p.close();
}

// ── 4. every tab renders (this is what catches a black screen) ───────
{
  const p = await page();
  await onboard(p);
  await redeem(p, 'K5R2WQ');
  for (const tab of ['Discover', 'Bookings', 'Profile', 'My Club']) {
    await p.getByText(tab, { exact: true }).first().click();
    await p.waitForTimeout(1300);
    const txt = (await p.innerText('body')).trim();
    check(`${tab} tab renders content`, txt.length > 40);
    // check the map while Discover is actually on screen, not after moving on
    if (tab === 'Discover') {
      check('Discover shows a real map', await p.locator('.leaflet-container').count() > 0);
    }
  }
  await p.close();
}

// ── 5. the consoles, both kinds, every section ───────────────────────
for (const [surface, demoName] of [['club.html', /Heliopolis SC/], ['admin.html', /Ramy Ashour/]]) {
  const p = await page(1440, 950);
  await p.goto(`${BASE}/${surface}`);
  await p.waitForTimeout(1800);
  const demo = p.getByRole('button', { name: demoName });
  if (await demo.count()) { await demo.click(); await p.waitForTimeout(1800); }
  const sections = ['Home', 'Live courts', 'Schedule', 'Freed slots', 'Coaches', 'Branches', 'Access codes', 'Public page'];
  for (const s of sections) {
    const item = p.getByText(s, { exact: true }).first();
    if (!(await item.count())) { check(`${surface}: ${s} in sidebar`, false); continue; }
    await item.click();
    await p.waitForTimeout(900);
    const txt = (await p.innerText('body')).trim();
    check(`${surface}: ${s} renders`, txt.length > 60);
  }
  await p.close();
}

// ── 6. freed slots, console to player ────────────────────────────────
{
  const p = await page(1500, 1000);
  await p.goto(`${BASE}/index.html`);
  await p.waitForTimeout(1800);
  await p.getByRole('button', { name: /Coach console/ }).click();
  await p.waitForTimeout(1600);
  const demo = p.getByRole('button', { name: /Heliopolis SC/ });
  if (await demo.count()) { await demo.click(); await p.waitForTimeout(1800); }
  await p.getByText('Freed slots', { exact: true }).first().click();
  await p.waitForTimeout(1100);
  const row = p.locator('button').filter({ hasText: /Solo lesson 1/ }).first();
  await row.click();
  await p.waitForTimeout(600);
  await p.getByText('Players in this session', { exact: false }).first().click();
  await p.waitForTimeout(400);
  await p.getByRole('button', { name: /Offer the slot/i }).click();
  await p.waitForTimeout(1300);
  check('console offers a freed slot', /Offered to \d+ (person|people)/.test(await p.innerText('body')));

  await p.getByRole('button', { name: /^Player app$/ }).click();
  await p.waitForTimeout(1500);
  await p.getByRole('button', { name: /^Log in$/ }).click();
  await p.waitForTimeout(800);
  for (const i of await p.locator('input:visible').all()) {
    const tp = await i.getAttribute('type');
    await i.fill(tp === 'password' ? 'serve1234' : '1001234567').catch(() => {});
  }
  await p.locator('button:visible').last().click().catch(() => {});
  await p.waitForTimeout(2200);
  await redeem(p, '9F4K2A');
  let body = await p.innerText('body');
  check('player sees the freed slot', /just opened up/i.test(body));
  const claim = p.getByRole('button', { name: /^Claim$/ });
  if (await claim.count()) {
    await claim.first().click();
    await p.waitForTimeout(1500);
    body = await p.innerText('body');
    check('player claims the slot', /Court claimed/i.test(body));
  } else {
    check('player claims the slot', false);
  }
  await p.close();
}

// ── 7. the legal documents are reachable ─────────────────────────────
{
  const p = await page();
  await p.goto(`${BASE}/player.html`);
  await p.waitForTimeout(1200);
  await p.getByRole('button', { name: /Terms & Privacy Policy/i }).first().click();
  await p.waitForTimeout(1200);
  const body = await p.innerText('body');
  check('signup links to real terms', /SERVE is an intermediary/.test(body));
  await p.getByRole('button', { name: /^Privacy Policy$/ }).first().click();
  await p.waitForTimeout(900);
  check('privacy policy renders its table', await p.locator('table tbody tr').count() > 4);
  await p.close();
}

await browser.close();

// ── summary ──────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
if (errors.length) {
  console.log(`\n${errors.length} console/page errors:`);
  for (const e of [...new Set(errors)].slice(0, 10)) console.log('  -', e);
}
if (failed.length || errors.length) process.exit(1);
console.log('No console errors.');
