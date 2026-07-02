// mobile.jsx — the device chrome + shared screen shell.
// PhoneFrame: the centered iOS device (rendered once, around the navigator).
// MScreen:    the per-screen column (safe areas + header + scroll + tab bar).

import { Icons } from './Icons';
import { useT } from '../i18n';

export const STATUS_TOP = 58;
export const HOME_BOTTOM = 26;

export function PhoneFrame({ children }) {
  // Fills the screen on mobile; renders as a centered device mockup ≥480px.
  return (
    <div className="serve-phone-backdrop">
      <div className="serve-phone-device">
        {/* the navigator stacks absolutely-positioned screens inside here */}
        {children}
      </div>
    </div>
  );
}

// Per-screen layout. `header` sits below the status area; `children` scroll;
// `tabBar` (or any footer node) is pinned to the bottom above the home bar.
export function MScreen({ children, bg = 'var(--sq-bg)', tabBar = null, header = null, scroll = true }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: bg,
        color: 'var(--sq-text)',
        fontFamily: 'var(--sq-body)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: STATUS_TOP, flexShrink: 0 }} />
      {header}
      <div style={{ flex: 1, overflowY: scroll ? 'auto' : 'hidden', overflowX: 'hidden' }}>{children}</div>
      {tabBar}
      <div style={{ height: HOME_BOTTOM, flexShrink: 0 }} />
    </div>
  );
}

const TABS = [
  { id: 'profile', icon: Icons.User, label: 'Profile' },
  { id: 'clubs', icon: Icons.Club, label: 'My Club' },
  { id: 'discover', icon: Icons.Search, label: 'Discover' },
  { id: 'bookings', icon: Icons.Calendar, label: 'Bookings' },
];

export function MTabBar({ active = 'profile', onTab }) {
  const t = useT();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        borderTop: '1px solid var(--sq-border)',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '10px 4px 6px',
      }}
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const on = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => onTab?.(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              color: on ? 'var(--sq-gold)' : 'var(--sq-text-3)',
              flex: 1,
              minWidth: 0,
              background: 'none',
              border: 0,
              padding: 0,
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
          >
            <Icon size={21} />
            <span style={{ fontSize: 9.5, fontWeight: 500, fontFamily: 'var(--sq-display)' }}>{t(tab.label)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Pill({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        background: 'var(--sq-surface)',
        border: '1px solid var(--sq-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--sq-text)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </button>
  );
}

export function StatTile({ label, value, hint }) {
  return (
    <div className="sq-card" style={{ padding: '12px 12px 10px' }}>
      <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div className="sq-display" style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>
        {value}
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>{hint}</div>
    </div>
  );
}
