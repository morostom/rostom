// Toast.jsx — a tiny transient notifier so console actions always give
// feedback (nothing is a silent dead end). useToast() returns notify(msg).

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from './Icons';

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);
  const notify = useCallback((m) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 1900);
  }, []);

  return (
    <ToastCtx.Provider value={notify}>
      {children}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed',
              bottom: 28,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '11px 16px',
              borderRadius: 12,
              background: 'rgba(18,18,18,0.96)',
              border: '1px solid color-mix(in srgb, var(--sq-gold) 35%, transparent)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              color: 'var(--sq-text)',
              fontSize: 13,
              fontFamily: 'var(--sq-body)',
            }}
          >
            <span style={{ color: 'var(--sq-gold)', display: 'inline-flex' }}>
              <Icons.Check size={15} />
            </span>
            {msg}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastCtx.Provider>
  );
}
