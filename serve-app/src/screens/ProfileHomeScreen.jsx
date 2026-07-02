// ProfileHomeScreen.jsx — the player's dashboard: their card (with a Tier that
// levels up as they play), next session, booking History, and quick actions.

import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import { MScreen, MTabBar, Pill } from '../components/mobile';
import PlayerCard from '../components/PlayerCard';
import FlipReveal from '../components/FlipReveal';
import { useNav } from '../navigation/nav';
import { useStore, store } from '../store';
import { useToast } from '../components/Toast';
import { tierForActivity } from '../data';
import { useT } from '../i18n';

export default function ProfileHomeScreen({ justCreated }) {
  const { nav, player, setCardType } = useNav();
  const state = useStore();
  const notify = useToast();
  const t = useT();
  const recreational = player.cardType === 'recreational';
  const accent = recreational ? 'var(--sq-blue)' : 'var(--sq-gold)';

  const mine = state.sessions.filter((s) => s.mine || (player?.name && s.players?.includes(player.name)));
  const next = mine[0];
  // Tier levels up with bookings only: every 10 to Semi-pro, then every 20.
  const tier = tierForActivity(state.bookings.length);

  // parent link requests waiting for this player's approval
  const linkRequests = state.parentLinks.filter((l) => l.status === 'pending' && player?.name && l.child_name.toLowerCase() === player.name.toLowerCase());

  function editCard() {
    setCardType(player.cardType);
    nav.push('build');
  }
  function share() {
    const text = `${player.name || 'My'} — SERVE player card`;
    if (navigator.share) navigator.share({ title: 'SERVE', text }).catch(() => {});
    else notify(t('Card link copied'));
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
          {justCreated ? t('Welcome to SERVE') : t('My player card')}
        </div>
      </div>

      <div style={{ padding: '4px 20px 18px' }}>
        <FlipReveal play={!!justCreated}>
          <div onClick={() => nav.push('cardCloseup', { player, tier })} style={{ cursor: 'pointer' }}>
            <PlayerCard player={player} accent={accent} tier={tier} />
          </div>
        </FlipReveal>
      </div>

      {/* parent link requests — the child approves who can pay for them */}
      {linkRequests.map((l) => (
        <div key={l.id} style={{ padding: '0 20px 16px' }}>
          <div className="sq-card serve-glow-soft" style={{ padding: 15, borderColor: 'color-mix(in srgb, var(--sq-gold) 32%, transparent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.Heart size={19} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sq-display" style={{ fontSize: 14, fontWeight: 600 }}>{t('Parent link request')}</div>
                <div style={{ fontSize: 12, color: 'var(--sq-text-2)', marginTop: 2, lineHeight: 1.4 }}>{(l.parent_name || t('A parent'))} {t('wants to link to your account to pay for your bookings.')}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="sq-btn-ghost" style={{ padding: '10px', fontSize: 12.5, flex: 1, color: 'var(--sq-text-2)' }} onClick={() => { store.declineLink(l.id); notify(t('Request declined')); }}>{t('Decline')}</button>
              <button className="sq-btn-gold" style={{ padding: '10px', fontSize: 12.5, flex: 1 }} onClick={() => { store.approveLink(l.id); notify(t('Parent linked')); }}>{t('Approve')}</button>
            </div>
          </div>
        </div>
      ))}

      {/* up next — from the live schedule */}
      {next && (
        <div style={{ padding: '0 20px 16px' }}>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{t('Up next')}</div>
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
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('History')}</div>
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
            {t('No history yet — your past bookings will show here.')}
          </div>
        )}
      </div>

      {/* actions */}
      <div style={{ padding: '0 20px 28px', display: 'flex', gap: 10 }}>
        <button className="sq-btn-ghost" style={{ padding: '13px 16px', fontSize: 13.5, flex: 1 }} onClick={editCard}>
          <Icons.Edit size={14} /> {t('Edit card')}
        </button>
        <button className="sq-btn-ghost" style={{ padding: '13px 16px', fontSize: 13.5, flex: 1 }} onClick={share}>
          <Icons.Share size={14} /> {t('Share')}
        </button>
      </div>
    </MScreen>
  );
}
