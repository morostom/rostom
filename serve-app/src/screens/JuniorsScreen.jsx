// JuniorsScreen.jsx — the Players tab. A grid of every signed-up junior's
// card. Tapping a card opens its closeup. A filter row narrows by age group.

import { useState } from 'react';
import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import { MScreen, MTabBar, Pill } from '../components/mobile';
import PlayerCard from '../components/PlayerCard';
import { useNav } from '../navigation/nav';
import { JUNIORS, JUNIOR_FILTERS } from '../data';

export default function JuniorsScreen() {
  const { nav } = useNav();
  const [filter, setFilter] = useState('All');

  const roster = filter === 'All' ? JUNIORS : JUNIORS.filter((j) => j.division.startsWith(filter));

  return (
    <MScreen
      tabBar={<MTabBar active="players" onTab={nav.switchTab} />}
      header={
        <div style={{ padding: '4px 20px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <SQLogo size={20} accent />
            <Pill>
              <Icons.Search size={15} />
            </Pill>
          </div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {JUNIORS.length * 30 + 4} signed up
          </div>
          <h1 className="sq-display" style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>
            Junior players
          </h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto' }}>
            {JUNIOR_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={'sq-chip' + (filter === f ? ' gold' : '')}
                style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div style={{ padding: '2px 20px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {roster.map((p) => (
          <div key={p.id} onClick={() => nav.push('cardCloseup', { player: p })} style={{ cursor: 'pointer' }}>
            <PlayerCard player={p} variant="compact" />
          </div>
        ))}
      </div>
    </MScreen>
  );
}
