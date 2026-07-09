// CardCloseupScreen.jsx — full-bleed hero of a single player card. Reached by
// tapping a card (own card from Profile, or any junior from the gallery).

import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import PlayerCard from '../components/PlayerCard';
import { useNav } from '../navigation/nav';
import { useToast } from '../components/Toast';

export default function CardCloseupScreen({ player, ownCard, tier }) {
  const { nav } = useNav();
  const notify = useToast();
  const ac = player.accent || 'var(--sq-gold)';
  function share() {
    const text = `${player.name || 'My'} — SERVE player card`;
    if (navigator.share) navigator.share({ title: 'SERVE', text }).catch(() => {});
    else notify('Card link copied');
  }

  return (
    <MScreen
      scroll={false}
      header={
        <div style={{ padding: '4px 20px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pill onClick={() => nav.pop()}>
            <Icons.Chevron dir="left" size={16} />
          </Pill>
          <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            Card · #SRV-0317
          </span>
          <Pill>
            <Icons.More size={15} />
          </Pill>
        </div>
      }
      tabBar={
        <div style={{ padding: '12px 20px 8px', borderTop: '1px solid var(--sq-border)', background: 'var(--sq-scrim)', display: 'flex', gap: 10 }}>
          <button className="sq-btn-ghost" style={{ padding: '14px 16px', fontSize: 13.5, flex: 1 }} onClick={ownCard ? () => nav.push('build') : share}>
            <Icons.Upload size={15} />
            {ownCard ? 'Edit card' : 'Save card'}
          </button>
          <button className="sq-btn-gold serve-glow-soft" style={{ padding: '14px 18px', fontSize: 13.5, flex: 1 }} onClick={share}>
            Share card
          </button>
        </div>
      }
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(120% 60% at 50% 30%, color-mix(in srgb, ${ac} 13%, transparent), transparent 70%)`,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', padding: '8px 26px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100%' }}>
        <PlayerCard player={player} accent={ac} tier={tier} />
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', letterSpacing: '0.06em' }}>
            {ownCard ? 'Drop a photo on the card to make it yours · double-tap to reframe' : `${player.name.split(' ')[0]}'s official SERVE card`}
          </span>
        </div>
      </div>
    </MScreen>
  );
}
