// UndoBar.jsx — a floating "Undo" bar that appears after a cancellation and
// stays until its window elapses (60s for a court booking, 15 min for a club
// session). Reads the store's one-slot undo and lets the user restore.

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../components/Icons';
import { useStore, store } from '../store';
import { useT } from '../i18n';

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s >= 60) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return `${s}s`;
}

export default function UndoBar() {
  const state = useStore();
  const t = useT();
  const [, tick] = useState(0);
  const u = state.undo;

  useEffect(() => {
    if (!u) return undefined;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [u]);

  // auto-clear once the window elapses
  useEffect(() => {
    if (u && u.expiresAt && u.expiresAt <= Date.now()) store.clearUndo();
  });

  const left = u ? u.expiresAt - Date.now() : 0;
  const show = !!u && left > 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)', zIndex: 2100,
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px 11px 16px', borderRadius: 14,
            background: 'rgba(18,18,18,0.97)', border: '1px solid var(--sq-border-2)', boxShadow: '0 14px 40px rgba(0,0,0,0.6)',
            maxWidth: 'calc(100% - 40px)',
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--sq-text)', whiteSpace: 'nowrap' }}>{t(u.label)}</span>
          <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{fmt(left)}</span>
          <button
            className="sq-btn-gold"
            style={{ padding: '7px 14px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => store.performUndo()}
          >
            <Icons.Refresh size={13} /> {t('Undo')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
