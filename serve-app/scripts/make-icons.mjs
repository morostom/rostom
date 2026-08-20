// make-icons.mjs — generate the PWA/notification icons from the SERVE mark.
//
// The app needs square icons (home-screen install, notification badge) but the
// brand mark is a wide wordmark, so it has to be centred on the brand ground
// rather than stretched. Rendered with headless Chromium because it's already
// here for tests — no image toolchain to install.
//
//   node scripts/make-icons.mjs
//
// Only needs re-running if src/assets/serve-mark.png changes.

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mark = readFileSync(resolve(root, 'src/assets/serve-mark.png')).toString('base64');
const BG = '#0e0b0a';

// maskable icons get cropped to a circle on Android, so the wordmark has to
// sit well inside the safe zone — hence the smaller width.
const ICONS = [
  { file: 'icon-192.png', size: 192, width: 74 },
  { file: 'icon-512.png', size: 512, width: 74 },
  { file: 'icon-maskable-512.png', size: 512, width: 56 },
];

const page = (size, width) => `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0}
  .w{width:${size}px;height:${size}px;background:${BG};display:flex;align-items:center;justify-content:center;overflow:hidden}
  .m{width:${width}%;
     -webkit-mask-image:url(data:image/png;base64,${mark});mask-image:url(data:image/png;base64,${mark});
     -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
     -webkit-mask-position:center;mask-position:center;
     -webkit-mask-size:contain;mask-size:contain;
     aspect-ratio:2.528;background-color:#ffffff}
</style>
<div class="w"><div class="m"></div></div>`;

mkdirSync(resolve(root, 'public'), { recursive: true });
const browser = await chromium.launch();
for (const { file, size, width } of ICONS) {
  const p = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await p.setContent(page(size, width));
  const buf = await p.locator('.w').screenshot({ omitBackground: false });
  writeFileSync(resolve(root, 'public', file), buf);
  console.log(`  ✓ public/${file} (${size}×${size}, ${buf.length} bytes)`);
  await p.close();
}
await browser.close();
