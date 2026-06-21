// ProfileHomeScreen.jsx — the player's dashboard: their card, season stats,
// next session, and quick actions. When reached straight from signup
// (justCreated) the card plays its flip-reveal.

import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import { MScreen, MTabBar, Pill, StatTile } from '../components/mobile';
import PlayerCard from '../components/PlayerCard';
import FlipReveal from '../components/FlipReveal';
import { useNav } from '../navigation/nav';
import { SEASON_STATS, REC_STATS, UP_NEXT } from '../data';

export default function ProfileHomeScreen({ justCreated }) {
  const { nav, player } = useNav();
  const recreational = player.cardType === 'recreational';
  const stats = recreational ? REC_STATS : SEASON_STATS;
  const accent = recreational ? 'var(--sq-blue)' : 'var(--sq-gold)';

  return (
    <MScreen
      tabBar={<MTabBar active="profile" onTab={nav.switchTab} />}
      header={
        <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SQLogo size={20} accent />
          <div style={{ display: 'flex', gap: 8 }}>
            <Pill>
              <Icons.Share size={15} />
            </Pill>
            <Pill>
              <Icons.Settings size={15} />
            </Pill>
          </div>
        </div>
      }
    >
      <div style={{ padding: '6px 20px 8px' }}>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          {justCreated ? 'Welcome to SERVE' : 'My player card'}
        </div>
      </div>

      {/* the card — tap to open the closeup */}
      <div style={{ padding: '4px 20px 18px' }}>
        <FlipReveal play={!!justCreated}>
          <div onClick={() => nav.push('cardCloseup', { player })} style={{ cursor: 'pointer' }}>
            <PlayerCard player={player} accent={accent} />
          </div>
        </FlipReveal>
      </div>

      {/* stats */}
      <div style={{ padding: '0 20px 18px' }}>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
          {recreational ? 'Your squash' : 'This season'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {stats.map((s) => (
            <StatTile key={s.label} label={s.label} value={s.value} hint={s.hint} />
          ))}
        </div>
      </div>

      {/* up next */}
      <div style={{ padding: '0 20px 16px' }}>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
          Up next
        </div>
        <div
          style={{
            padding: 15,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background:
              'linear-gradient(135deg, color-mix(in srgb, var(--sq-gold) 14%, transparent) 0%, color-mix(in srgb, var(--sq-gold) 3%, transparent) 50%, var(--sq-surface) 100%)',
            border: '1px solid color-mix(in srgb, var(--sq-gold) 25%, transparent)',
          }}
        >
          <div
            style={{
              width: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '8px 0',
              borderRadius: 10,
              background: 'rgba(7,7,7,0.4)',
              border: '1px solid color-mix(in srgb, var(--sq-gold) 20%, transparent)',
            }}
          >
            <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-gold)', letterSpacing: '0.1em' }}>
              {UP_NEXT.day}
            </div>
            <div className="sq-display" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
              {UP_NEXT.date}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{UP_NEXT.title}</div>
            <div className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-2)' }}>
              {UP_NEXT.meta}
            </div>
          </div>
          <Icons.Chevron size={16} />
        </div>
      </div>

      {/* actions */}
      <div style={{ padding: '0 20px 28px', display: 'flex', gap: 10 }}>
        <button className="sq-btn-ghost" style={{ padding: '13px 16px', fontSize: 13.5, flex: 1 }} onClick={() => nav.push('cardCloseup', { player })}>
          <Icons.Edit size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          View card
        </button>
        <button className="sq-btn-ghost" style={{ padding: '13px 16px', fontSize: 13.5, flex: 1 }}>
          <Icons.Share size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Share
        </button>
      </div>
    </MScreen>
  );
}
