// DesktopFrame.jsx — centers a fixed-size desktop console on the dark backdrop
// and scales it down to fit smaller viewports (keeps the 1240×804 layout intact).

import { useEffect, useState } from 'react';

const W = 1240;
const H = 804;

function useFitScale(pad = 56) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const s = Math.min((window.innerWidth - pad) / W, (window.innerHeight - pad) / H, 1);
      setScale(s > 0 ? s : 0.2);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [pad]);
  return scale;
}

export default function DesktopFrame({ children }) {
  const scale = useFitScale();
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background:
          'radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--sq-gold) 8%, transparent), transparent 60%), var(--sq-bg)',
      }}
    >
      {/* reserve the scaled footprint so the window stays centered */}
      <div style={{ width: W * scale, height: H * scale }}>
        <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
      </div>
    </div>
  );
}
