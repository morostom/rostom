import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// SURFACE selects a standalone single-file export build:
//   SURFACE=player|admin|club  →  one self-contained HTML in dist/<surface>/
// With no SURFACE set, this is the normal dev/preview config (the combined
// app with the surface switcher, served from index.html).
const surface = process.env.SURFACE;
const PAGES = { player: 'player.html', admin: 'admin.html', club: 'club.html', demo: 'index.html' };

export default defineConfig(() => {
  if (surface && PAGES[surface]) {
    return {
      plugins: [react(), tailwindcss(), viteSingleFile()],
      build: {
        rollupOptions: { input: PAGES[surface] },
        outDir: `dist/${surface}`,
        emptyOutDir: true,
      },
    };
  }
  return {
    plugins: [react(), tailwindcss()],
    server: { host: true, port: 5173 },
  };
});
