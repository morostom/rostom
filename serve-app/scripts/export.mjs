// export.mjs — build each surface as a self-contained single HTML file and
// collect them into export/ for separate Netlify deploys.
//
//   export/serve-player.html  (mobile player app)
//   export/serve-admin.html   (academy owner desktop console)
//   export/serve-club.html    (club coordinator desktop console)

import { execSync } from 'node:child_process';
import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SURFACES = [
  { id: 'player', out: 'serve-player.html' },
  { id: 'admin', out: 'serve-admin.html' },
  { id: 'club', out: 'serve-club.html' },
];

mkdirSync(resolve(root, 'export'), { recursive: true });

for (const { id, out } of SURFACES) {
  console.log(`\n▸ Building ${id} …`);
  execSync('npm run build:surface', { cwd: root, stdio: 'inherit', env: { ...process.env, SURFACE: id } });
  const src = resolve(root, `dist/${id}/${id}.html`);
  const dest = resolve(root, `export/${out}`);
  copyFileSync(src, dest);
  const kb = (statSync(dest).size / 1024).toFixed(0);
  console.log(`  ✓ export/${out} (${kb} KB, self-contained)`);
}

console.log('\nDone. Each file in export/ is a single self-contained HTML — drop any one onto Netlify.');
