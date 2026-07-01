// ProfileHomeScreen.jsx — the player's dashboard: their card (with a Tier that
// levels up as they play), next session, booking History, and quick actions.

import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import { MScreen, MTabBar, Pill } from '../components/mobile';
import PlayerCard from '../components/PlayerCard';
import FlipReveal from '../components/FlipReveal';
import { useNav } from '../navigation/nav';
import { useStore } from '../store';
import { useToast } from '../components/Toast';
import { tierForActivity } from '../data';

export default function ProfileHomeScreen({ justCreated }) {
  const { nav, player, setCardType } = useNav();
  const state = useStore();
  const notify = useToast();
  const recreational = player.cardType === 'recreational';
  const accent = recreational ? 'var(--sq-blue)' : 'var(--sq-gold)';

  const mine = state.sessions.filter((s) => s.mine || (player?.name && s.players?.includes(player.name)));
  const next = mine[0];
  // Tier levels up with activity (bookings + sessions the player is in).
  const tier = tierForActivity(state.bookings.length + mine.length);

  function editCard() {
    setCardType(player.cardType);
    nav.push('build');
  }
  function share() {
    const text = `${player.name || 'My'} — SERVE player card`;
    if (navigator.share) navigator.share({ title: 'SERVE', text }).catch(() => {});
    else notify('Card link copied');
  }

  return (
    <MScreen
      tabBar={<MTabBar active="profile" onTab={nav.switchTab} />}
      header={
        <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SQLogo size={20} accent />
          <div style={{ display: 'flex', gap: 8 }}>
            <Pill onClick={editCard}><Icons.Edit size={15} /></Pill>
            <Pill onClick={() => nav.push('settings')}><Icons.Settings size={15} /></Pill>
          </div>
        </div>
      }
    >
      <div style={{ padding: '6px 20px 8px' }}>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          {justCreated ? 'Welcome to SERVE' : 'My player card'}
        </div>
      </div>

      <div style={{ padding: '4px 20px 18px' }}>
        <FlipReveal play={!!justCreated}>
          <div onClick={() => nav.push('cardCloseup', { player, tier })} style={{ cursor: 'pointer' }}>
            <PlayerCard player={player} accent={accent} tier={tier} />
          </div>
        </FlipReveal>
      </div>

      {/* up next — from the live schedule */}
      {next && (
        <div style={{ padding: '0 20px 16px' }}>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Up next</div>
          <button onClick={() => nav.switchTab('clubs')} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', padding: 15, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg, color-mix(in srgb, var(--sq-gold) 14%, transparent) 0%, color-mix(in srgb, var(--sq-gold) 3%, transparent) 50%, var(--sq-surface) 100%)', border: '1px solid color-mix(in srgb, var(--sq-gold) 25%, transparent)' }}>
            <div style={{ width: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', borderRadius: 10, background: 'rgba(7,7,7,0.4)', border: '1px solid color-mix(in srgb, var(--sq-gold) 20%, transparent)' }}>
              <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-gold)', letterSpacing: '0.1em' }}>{next.day.toUpperCase()}</div>
              <div className="sq-display" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{next.time.split(':')[0]}</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{next.title}</div>
              <div className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-2)' }}>{next.time} · {next.type} · {next.coach}</div>
            </div>
            <Icons.Chevron size={16} />
          </button>
        </div>
      )}

      {/* History — previous bookings */}
      <div style={{ padding: '0 20px 18px' }}>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>History</div>
        {state.bookings.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...state.bookings].reverse().map((b) => (
              <div key={b.id} className="sq-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--sq-surface-2)', color: 'var(--sq-text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {b.title ? <Icons.Users size={17} /> : <Icons.Court size={17} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{b.title || `Court ${b.court}`}</div>
                  <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>{b.venue} · {b.day} {b.time}</div>
                </div>
                <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>EGP {b.price}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="sq-card" style={{ padding: 18, textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 12.5 }}>
            No history yet — your past bookings will show here.
          </div>
        )}
      </div>

      {/* actions */}
      <div style={{ padding: '0 20px 28px', display: 'flex', gap: 10 }}>
        <button className="sq-btn-ghost" style={{ padding: '13px 16px', fontSize: 13.5, flex: 1 }} onClick={editCard}>
          <Icons.Edit size={14} /> Edit card
        </button>
        <button className="sq-btn-ghost" style={{ padding: '13px 16px', fontSize: 13.5, flex: 1 }} onClick={share}>
          <Icons.Share size={14} /> Share
        </button>
      </div>
    </MScreen>
  );
}
