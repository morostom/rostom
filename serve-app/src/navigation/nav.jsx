// nav.jsx — a tiny stack navigator with iOS-style slide transitions.
//
// A screen entry is { key, name, params }. The stack's last entry is current.
//  - push(name, params)  → slide in from the right   (dir +1)
//  - pop()               → slide back to the right    (dir -1)
//  - switchTab(name)     → replace root, cross-fade    (dir 0)
//  - replaceRoot(name)   → reset stack, slide forward  (dir +1)
//
// App-level state (the signed-in player, club membership) rides along in the
// same context so any screen can read/update it.

import { createContext, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { screenSlide, screenTransition } from '../motion';

const NavContext = createContext(null);
export const useNav = () => useContext(NavContext);

let _id = 0;
const entry = (name, params) => ({ key: `s${_id++}`, name, params: params || {} });

export function Navigator({ initial, render, app }) {
  const [stack, setStack] = useState(() => [entry(initial)]);
  const dir = useRef(1);

  const nav = useMemo(
    () => ({
      push(name, params) {
        dir.current = 1;
        setStack((s) => [...s, entry(name, params)]);
      },
      pop() {
        dir.current = -1;
        setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
      },
      switchTab(name) {
        setStack((s) => {
          if (s[s.length - 1].name === name && s.length === 1) return s;
          dir.current = 0;
          return [entry(name)];
        });
      },
      replaceRoot(name, params) {
        dir.current = 1;
        setStack([entry(name, params)]);
      },
    }),
    []
  );

  const current = stack[stack.length - 1];
  const ctx = useMemo(() => ({ nav, ...app }), [nav, app]);

  return (
    <NavContext.Provider value={ctx}>
      <AnimatePresence custom={dir.current} initial={false}>
        <motion.div
          key={current.key}
          custom={dir.current}
          variants={screenSlide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={screenTransition(dir.current)}
          style={{ position: 'absolute', inset: 0 }}
        >
          {render(current)}
        </motion.div>
      </AnimatePresence>
    </NavContext.Provider>
  );
}
