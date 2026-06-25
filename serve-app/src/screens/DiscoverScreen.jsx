// DiscoverScreen.jsx — browse Egypt's clubs & academies. The member's own club
// opens straight to My Club; others show how to get access / book.

import { useState } from 'react';
import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import { MScreen, MTabBar } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { CLUBS_DIR, ACADEMIES_DIR } from '../data';

function OrgRow({ o, onOpen }) {
  return (
    <button onClick={onOpen} className="sq-card" style={{ textAlign: 'left', cursor: 'pointer', padding: 14, display: 'flex', alignItems: 'center', gap: 13, width: '100%' }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0, background: `color-mix(in srgb, ${o.accent || 'var(--sq-gold)'} 16%, transparent)`, border: `1px solid color-mix(in srgb, ${o.accent || 'var(--sq-gold)'} 30%, transparent)`, color: o.accent || 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {o.type === 'club' ? <Icons.Club size={22} /> : <Icons.Trophy size={20} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.15 }}>{o.name}</div>
        <div style={{ fontSize: 12, color: 'var(--sq-text-2)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icons.Pin size={11} /> {o.city}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="sq-mono" style={{ fontSize: 13, fontWeight: 600 }}>{o.courts}</div>
        <div className="sq-mono" style={{ fontSize: 9, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>courts</div>
      </div>
      <Icons.Chevron size={15} />
    </button>
  );
}

export default function DiscoverScreen() {
  const { nav, clubJoined } = useNav();
  const [tab, setTab] = useState('clubs');
  const list = tab === 'clubs' ? CLUBS_DIR : ACADEMIES_DIR;

  function open(o) {
    if (o.id === 'heliopolis') {
      nav.switchTab('clubs'); // the joinable demo club
    } else {
      nav.push('joinClub');
    }
  }

  return (
    <MScreen
      tabBar={<MTabBar active="discover" onTab={nav.switchTab} />}
      header={
        <div style={{ padding: '4px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h1 className="sq-display" style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em' }}>Discover</h1>
            <SQLogo size={18} accent />
          </div>
          <div style={{ display: 'flex', background: 'var(--sq-surface)', borderRadius: 11, padding: 4, border: '1px solid var(--sq-border)' }}>
            {[['clubs', `Clubs · ${CLUBS_DIR.length}`], ['academies', `Academies · ${ACADEMIES_DIR.length}`]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '9px', borderRadius: 8, border: 0, cursor: 'pointer', fontFamily: 'var(--sq-display)', fontWeight: 600, fontSize: 13, background: tab === id ? 'var(--sq-gold)' : 'transparent', color: tab === id ? '#0a0a0a' : 'var(--sq-text-2)' }}>{label}</button>
            ))}
          </div>
        </div>
      }
    >
      <div style={{ padding: '4px 20px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map((o) => <OrgRow key={o.id} o={o} onOpen={() => open(o)} />)}
        <p style={{ margin: '6px 2px 0', fontSize: 11.5, color: 'var(--sq-text-3)', lineHeight: 1.5, display: 'flex', gap: 7 }}>
          <Icons.Lock size={13} /> Clubs are members-only — open Heliopolis SC to see the live demo, or enter an access code to join another.
        </p>
      </div>
    </MScreen>
  );
}
