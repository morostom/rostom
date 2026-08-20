// export.mjs — build each surface as a self-contained single HTML file.
// Produces two things per surface:
//   1. export/serve-<surface>.html      — the bare single file
//   2. netlify/serve-<surface>/index.html — a drop-ready Netlify site folder
//
// Drag any one folder in netlify/ onto https://app.netlify.com/drop to get a
// standalone URL for that surface.

import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SURFACES = [
  { id: 'player', page: 'player.html', name: 'serve-player', label: 'Mobile player app', pwa: true },
  { id: 'admin', page: 'admin.html', name: 'serve-admin', label: 'Academy owner console' },
  { id: 'club', page: 'club.html', name: 'serve-club', label: 'Club coordinator console' },
  { id: 'demo', page: 'index.html', name: 'serve-demo', label: 'Connected demo (all 3 + live sync)', pwa: true },
];

// A service worker CANNOT be inlined — the browser will only register a real
// file, and its scope is its own directory. So push notifications work from
// the netlify/ FOLDER build and not from the bare single-file export. These
// ride alongside index.html rather than inside it.
const PWA_FILES = ['sw.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

mkdirSync(resolve(root, 'export'), { recursive: true });

for (const { id, page, name, label, pwa } of SURFACES) {
  console.log(`\n▸ Building ${id} …`);
  execSync('npm run build:surface', { cwd: root, stdio: 'inherit', env: { ...process.env, SURFACE: id } });
  const src = resolve(root, `dist/${id}/${page}`);

  // 1. bare single file
  const flat = resolve(root, `export/${name}.html`);
  copyFileSync(src, flat);

  // 2. drop-ready Netlify site folder (file becomes index.html)
  const siteDir = resolve(root, `netlify/${name}`);
  mkdirSync(siteDir, { recursive: true });
  copyFileSync(src, resolve(siteDir, 'index.html'));

  const kb = (statSync(src).size / 1024).toFixed(0);
  console.log(`  ✓ export/${name}.html  +  netlify/${name}/index.html  (${kb} KB, self-contained)`);

  // 3. the worker + icons, for the surfaces that can be installed
  if (pwa) {
    let copied = 0;
    for (const f of PWA_FILES) {
      const from = resolve(root, 'public', f);
      if (!existsSync(from)) continue;
      copyFileSync(from, resolve(siteDir, f));
      copied++;
    }
    if (copied) console.log(`  ✓ netlify/${name}/ + ${copied} PWA files (push needs the FOLDER, not the .html)`);
  }
}

// a tiny index page listing the three sites (handy if the whole netlify/
// folder is dropped at once)
writeFileSync(
  resolve(root, 'netlify/README.txt'),
  'SERVE — Netlify drop folders\n\n' +
    SURFACES.map((s) => `netlify/${s.name}/  →  ${s.label}${s.pwa ? '  (installable + push)' : ''}`).join('\n') +
    '\n\nDrag ONE folder (e.g. netlify/serve-player) onto https://app.netlify.com/drop\n' +
    'to deploy that surface to its own URL. Repeat for the other two.\n\n' +
    'IMPORTANT — push notifications:\n' +
    'Drag the FOLDER, not export/serve-player.html. The service worker that\n' +
    'wakes a closed app is a separate file (sw.js) and cannot be inlined into\n' +
    'the single-file build. The .html on its own still works — it just falls\n' +
    'back to in-app alerts.\n\n' +
    'On iPhone, push additionally requires the parent to install the app:\n' +
    'Share → "Add to Home Screen", then open SERVE from the home screen.\n'
);

console.log('\nDone. Drag any folder in netlify/ onto https://app.netlify.com/drop.');
