// motion.js — shared Framer Motion timing + variants.
// Everything is tuned to feel like native iOS and stay under 300ms.

// iOS-style ease (UINavigationController push curve) and snappy duration.
export const EASE_IOS = [0.32, 0.72, 0, 1];
export const DUR = 0.22; // seconds — snappy screen transitions, well under 300ms
export const DUR_FAST = 0.12;

// Screen stack slide: forward (dir +1) pushes in from the right with the
// outgoing screen parallaxing left; back (dir -1) reverses it. Tab switches
// (dir 0) cross-fade instead of sliding.
export const screenSlide = {
  enter: (dir) => ({
    x: dir > 0 ? '100%' : dir < 0 ? '-28%' : 0,
    opacity: dir === 0 ? 0 : 1,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({
    x: dir > 0 ? '-28%' : dir < 0 ? '100%' : 0,
    opacity: dir === 0 ? 0 : 1,
  }),
};

export const screenTransition = (dir) =>
  dir === 0
    ? { duration: DUR_FAST, ease: 'easeInOut' }
    : { duration: DUR, ease: EASE_IOS };
