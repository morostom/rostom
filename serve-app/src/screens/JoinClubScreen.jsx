// JoinClubScreen.jsx — paste a 6-character access code. When it matches, the
// resolved club preview reveals and the Join button is armed. Tapping Join
// plays a satisfying unlock animation (lock springs open + green ripple), then
// drops you into My Club.

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../components/Icons';
import { MScreen } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { CLUB, resolveAccessCode } from '../data';
import { EASE_IOS } from '../motion';

// ── the unlock animation, choreographed in sub-300ms beats ──
function UnlockOverlay({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1150); // total sequence, each beat < 300ms
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        background: 'var(--sq-scrim)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 22,
      }}
    >
      <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* expanding green ripple */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0.7 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut', delay: 0.22 }}
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--sq-green)' }}
        />
        {/* lock badge: springs in, then swaps to open */}
        <motion.div
          initial={{ scale: 0, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 600, damping: 18 }}
          style={{
            width: 96,
            height: 96,
            borderRadius: 28,
            background: 'radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--sq-gold) 30%, transparent), var(--sq-surface) 75%)',
            border: '1px solid color-mix(in srgb, var(--sq-gold) 45%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--sq-gold)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="locked"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, delay: 0.2 }}
              style={{ position: 'absolute' }}
            >
              <Icons.Lock size={40} />
            </motion.div>
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.26, ease: EASE_IOS }}
            style={{ position: 'absolute', color: 'var(--sq-green)' }}
          >
            <Icons.Unlock size={42} />
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.4, ease: EASE_IOS }}
        style={{ textAlign: 'center' }}
      >
        <div className="sq-display" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Club unlocked
        </div>
        <div className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 6, letterSpacing: '0.04em' }}>
          Welcome to {CLUB.short}
        </div>
      </motion.div>
    </motion.div>
  );
}

const CELLS = 6;

export default function JoinClubScreen() {
  const { nav, setClubJoined, player } = useNav();
  const [code, setCode] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Validate against the same codes the coordinator issued in the coach console.
  const result = code.length === CELLS ? resolveAccessCode(code) : null;
  const matched = !!result?.ok;
  const wrong = !!result && !result.ok;
  // a matched code may be assigned to a specific member — join as them
  const joiningAs = result?.record?.to || player?.name || 'you';

  function onType(e) {
    const v = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, CELLS);
    setCode(v);
  }

  function finishUnlock() {
    setClubJoined(true);
    nav.replaceRoot('clubs');
  }

  return (
    <MScreen
      header={
        <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => nav.pop()}
            style={{ width: 38, height: 38, borderRadius: 19, background: 'var(--sq-surface)', border: '1px solid var(--sq-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-text-2)', cursor: 'pointer' }}
          >
            <Icons.Chevron dir="left" size={18} />
          </button>
          <span className="sq-display" style={{ fontSize: 17, fontWeight: 600 }}>
            Join a club
          </span>
        </div>
      }
    >
      <div style={{ padding: '10px 22px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div>
          <h1 className="sq-display" style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            Enter your
            <br />
            access code
          </h1>
          <p style={{ margin: '10px 0 0', color: 'var(--sq-text-2)', fontSize: 14, lineHeight: 1.5, textWrap: 'pretty' }}>
            Your club's squash office issues a 6-character code to each registered member. Paste the one they sent you.
          </p>
        </div>

        {/* segmented code input */}
        <div>
          <motion.div
            style={{ display: 'flex', gap: 9, position: 'relative', cursor: 'text' }}
            onClick={() => inputRef.current?.focus()}
            animate={wrong ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.28 }}
          >
            {Array.from({ length: CELLS }).map((_, i) => {
              const ch = code[i];
              const active = i === code.length;
              const border = wrong
                ? 'color-mix(in srgb, var(--sq-danger) 60%, transparent)'
                : matched
                ? 'color-mix(in srgb, var(--sq-green) 60%, transparent)'
                : ch || active
                ? 'color-mix(in srgb, var(--sq-gold) 55%, transparent)'
                : 'var(--sq-border-2)';
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    aspectRatio: '0.82',
                    borderRadius: 12,
                    background: 'var(--sq-surface)',
                    border: '1.5px solid ' + border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--sq-mono)',
                    fontSize: 24,
                    fontWeight: 600,
                    color: wrong ? 'var(--sq-danger)' : 'var(--sq-text)',
                    boxShadow: ch || active ? '0 0 0 3px color-mix(in srgb, var(--sq-gold) 9%, transparent)' : 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                >
                  {ch || ''}
                </div>
              );
            })}
            <input
              ref={inputRef}
              value={code}
              onChange={onType}
              inputMode="text"
              autoCapitalize="characters"
              maxLength={CELLS}
              style={{ position: 'absolute', opacity: 0, inset: 0, width: '100%', height: '100%', cursor: 'text' }}
            />
          </motion.div>

          {/* status line */}
          <div style={{ marginTop: 12, minHeight: 18 }}>
            {matched && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--sq-green)' }}>
                <Icons.Check size={14} />
                <span style={{ fontSize: 12.5, color: 'var(--sq-text-2)' }}>Code matched to a club</span>
              </div>
            )}
            {wrong && (
              <span style={{ fontSize: 12.5, color: 'var(--sq-danger)' }}>
                {result.reason === 'expired'
                  ? 'This code has expired — ask your squash office for a new one.'
                  : "That code didn't match. Check it and try again."}
              </span>
            )}
            {!matched && !wrong && (
              <button
                onClick={() => setCode('9F4K2A')}
                style={{ background: 'none', border: 0, color: 'var(--sq-text-3)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sq-mono)', letterSpacing: '0.04em' }}
              >
                Demo · tap to fill {'9F4K2A'}
              </button>
            )}
          </div>
        </div>

        {/* resolved club preview — only once matched */}
        <AnimatePresence>
          {matched && (
            <motion.div
              initial={{ opacity: 0, y: 14, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.28, ease: EASE_IOS }}
              className="sq-card serve-glow-soft"
              style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 13,
                    flexShrink: 0,
                    background: 'var(--sq-surface-2)',
                    border: '1px solid var(--sq-border-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--sq-gold)',
                  }}
                >
                  <Icons.Club size={26} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sq-display" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.15 }}>
                    {CLUB.name}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--sq-text-2)', marginTop: 3 }}>
                    {CLUB.section} · Est. {CLUB.est}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--sq-border)', paddingTop: 13 }}>
                {[
                  [String(CLUB.members), 'members'],
                  [String(CLUB.courts), 'courts'],
                  ['U11–Elite', 'squads'],
                ].map(([v, l]) => (
                  <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                    <div className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>
                      {v}
                    </div>
                    <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                      {l}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--sq-text-2)', background: 'rgba(255,255,255,0.03)', padding: '9px 11px', borderRadius: 9 }}>
                <Icons.User size={13} /> Joining as <strong style={{ color: 'var(--sq-text)', fontWeight: 600 }}>{joiningAs}</strong>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="sq-btn-gold"
            style={{ padding: '15px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}
            disabled={!matched || unlocking}
            onClick={() => setUnlocking(true)}
          >
            Join {CLUB.short} <Icons.ArrowRight size={16} />
          </button>
          <button className="sq-btn-ghost" style={{ padding: '13px', fontSize: 13.5, color: 'var(--sq-text-2)' }}>
            Don't have a code? Ask your squash office
          </button>
        </div>
      </div>

      <AnimatePresence>{unlocking && <UnlockOverlay onDone={finishUnlock} />}</AnimatePresence>
    </MScreen>
  );
}
