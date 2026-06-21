// DesktopFrame.jsx — renders a desktop console at full width (min 1280px) and,
// on narrow screens, swaps in a "best viewed on desktop" notice instead.

import SQLogo from '../components/SQLogo';
import { Icons } from '../components/Icons';

function MobileNotice() {
  return (
    <div
      className="serve-mobile-notice"
      style={{
        position: 'fixed',
        inset: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 18,
        padding: 32,
        background: 'var(--sq-bg)',
        zIndex: 5,
      }}
    >
      <SQLogo size={30} accent est align="center" />
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: 'var(--sq-surface)',
          border: '1px solid var(--sq-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--sq-gold)',
          marginTop: 8,
        }}
      >
        <Icons.Court size={30} />
      </div>
      <div>
        <h1 className="sq-display" style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Best viewed on desktop
        </h1>
        <p style={{ margin: '10px 0 0', color: 'var(--sq-text-2)', fontSize: 14, lineHeight: 1.55, maxWidth: 320 }}>
          This is the academy management console — built for a laptop or desktop screen. Open it on a wider display to manage courts, schedules, and members.
        </p>
      </div>
    </div>
  );
}

export default function DesktopFrame({ children }) {
  return (
    <>
      <div className="serve-desktop">
        <div className="serve-desktop-inner">{children}</div>
      </div>
      <MobileNotice />
    </>
  );
}
