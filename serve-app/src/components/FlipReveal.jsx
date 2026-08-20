// FlipReveal.jsx — the hero moment. When `play` is true the card flips from
// its back face to the front in a single snappy 3D rotation (<300ms), with a
// neon glow that flashes as the front lands. When false it just shows the card.

import { motion } from 'framer-motion';
import { EASE_IOS } from '../motion';
import SQLogo from './SQLogo';

function CardBack() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'repeating-linear-gradient(135deg, rgba(245,69,59,0.08) 0 10px, transparent 10px 22px), linear-gradient(165deg, #1e1917 0%, #0e0b0a 100%)',
        border: '1px solid color-mix(in srgb, var(--sq-gold) 45%, transparent)',
        // the back is the side facing us before the flip
        transform: 'rotateY(180deg)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <SQLogo size={34} align="center" />
    </div>
  );
}

export default function FlipReveal({ children, play }) {
  if (!play) return children;

  return (
    <div style={{ perspective: 1400, position: 'relative' }}>
      <motion.div
        style={{ position: 'relative', transformStyle: 'preserve-3d' }}
        initial={{ rotateY: 180, scale: 0.92 }}
        animate={{ rotateY: 0, scale: 1 }}
        transition={{ duration: 0.29, ease: EASE_IOS }}
      >
        {/* front face */}
        <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>{children}</div>
        <CardBack />
      </motion.div>

      {/* glow flash that fades as the front settles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.29, ease: 'easeOut', times: [0, 0.7, 1] }}
        style={{
          position: 'absolute',
          inset: -6,
          borderRadius: 22,
          pointerEvents: 'none',
          boxShadow: '0 0 50px 6px color-mix(in srgb, var(--sq-gold) 55%, transparent)',
        }}
      />
    </div>
  );
}
