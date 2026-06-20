// PlaceholderScreen.jsx — graceful "coming soon" for tabs not yet built out
// (Discover, Bookings), so the bottom navigation stays fully tappable.

import SQLogo from '../components/SQLogo';
import { MScreen, MTabBar } from '../components/mobile';
import { Icons } from '../components/Icons';
import { useNav } from '../navigation/nav';

const META = {
  discover: { Icon: Icons.Home, title: 'Discover', blurb: 'Browse academies and courts near you — book a slot in a couple of taps.' },
  bookings: { Icon: Icons.Calendar, title: 'Bookings', blurb: 'Your upcoming sessions and match history will live here.' },
};

export default function PlaceholderScreen({ tab }) {
  const { nav } = useNav();
  const { Icon, title, blurb } = META[tab] || META.discover;

  return (
    <MScreen
      tabBar={<MTabBar active={tab} onTab={nav.switchTab} />}
      header={
        <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="sq-display" style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em' }}>
            {title}
          </h1>
          <SQLogo size={18} />
        </div>
      }
    >
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 40px', gap: 16 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'var(--sq-surface)',
            border: '1px solid var(--sq-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--sq-text-3)',
          }}
        >
          <Icon size={32} />
        </div>
        <div>
          <div className="sq-display" style={{ fontSize: 19, fontWeight: 700 }}>
            Coming soon
          </div>
          <p style={{ margin: '8px 0 0', color: 'var(--sq-text-2)', fontSize: 13.5, lineHeight: 1.5 }}>{blurb}</p>
        </div>
      </div>
    </MScreen>
  );
}
