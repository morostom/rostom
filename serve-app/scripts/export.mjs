// export.mjs — build each surface as a self-contained single HTML file.
// Produces two things per surface:
//   1. export/serve-<surface>.html      — the bare single file
//   2. netlify/serve-<surface>/index.html — a drop-ready Netlify site folder
//
// Drag any one folder in netlify/ onto https://app.netlify.com/drop to get a
// standalone URL for that surface.

import { execSync } from 'node:child_process';
import { copyFileSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SURFACES = [
  { id: 'player', name: 'serve-player', label: 'Mobile player app' },
  { id: 'admin', name: 'serve-admin', label: 'Academy owner console' },
  { id: 'club', name: 'serve-club', label: 'Club coordinator console' },
];

mkdirSync(resolve(root, 'export'), { recursive: true });

for (const { id, name, label } of SURFACES) {
  console.log(`\n▸ Building ${id} …`);
  execSync('npm run build:surface', { cwd: root, stdio: 'inherit', env: { ...process.env, SURFACE: id } });
  const src = resolve(root, `dist/${id}/${id}.html`);

  // 1. bare single file
  const flat = resolve(root, `export/${name}.html`);
  copyFileSync(src, flat);

  // 2. drop-ready Netlify site folder (file becomes index.html)
  const siteDir = resolve(root, `netlify/${name}`);
  mkdirSync(siteDir, { recursive: true });
  copyFileSync(src, resolve(siteDir, 'index.html'));

  const kb = (statSync(src).size / 1024).toFixed(0);
  console.log(`  ✓ export/${name}.html  +  netlify/${name}/index.html  (${kb} KB, self-contained)`);
}

// a tiny index page listing the three sites (handy if the whole netlify/
// folder is dropped at once)
writeFileSync(
  resolve(root, 'netlify/README.txt'),
  'SERVE — Netlify drop folders\n\n' +
    SURFACES.map((s) => `netlify/${s.name}/  →  ${s.label}`).join('\n') +
    '\n\nDrag ONE folder (e.g. netlify/serve-player) onto https://app.netlify.com/drop\nto deploy that surface to its own URL. Repeat for the other two.\n'
);

console.log('\nDone. Drag any folder in netlify/ onto https://app.netlify.com/drop.');
