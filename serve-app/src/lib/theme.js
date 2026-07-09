// theme.js — light/dark appearance for the player app. Mirrors i18n.js:
// a tiny module store persisted to localStorage, applied as a data-theme
// attribute on <html> so the CSS token overrides kick in.

import { useSyncExternalStore } from 'react';

const KEY = 'serve_theme';

function load() {
  try { return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'; } catch { return 'dark'; }
}

let theme = load();
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

function apply() {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.dataset.theme = theme;
  }
}
apply();

export function setTheme(t) {
  theme = t === 'light' ? 'light' : 'dark';
  try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
  apply();
  emit();
}
export function getTheme() { return theme; }

function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); }
export function useTheme() { return useSyncExternalStore(subscribe, () => theme, () => theme); }
