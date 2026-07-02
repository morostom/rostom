// ParentHomeScreen.jsx — the parent account's home. Shows the linked child,
// their upcoming sessions, and "transfer to parent" payment requests with a
// live 10-minute countdown to approve & pay. New requests fire a real phone
// alert (system notification + sound) so the parent doesn't need to be told.

import { useEffect, useRef, useState } from 'react';
import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import { MScreen, MTabBar } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { useStore, store } from '../store';
import { useToast } from '../components/Toast';
import { ensureNotifyPermission, notifyPermission, phoneAlert } from '../lib/notify';
import { useT } from '../i18n';
import { normId } from '../lib/auth';

function fmtLeft(ms) {
  if (ms <= 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function ParentHomeScreen() {
  const { nav, account, child } = useNav();
  const state = useStore();
  const notify = useToast();
  const t = useT();
  const me = normId(account?.identifier) || 'parent';

  const [, setTick] = useState(0);
  const [perm, setPerm] = useState(notifyPermission());
  const seen = useRef(null);

  // tick every second for the countdowns
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const myLinks = state.parentLinks.filter((l) => normId(l.parent_identifier) === me);
  const primaryLink = myLinks.find((l) => l.status === 'approved') || myLinks[0];
  const primaryChild = primaryLink?.child_name || child;
  const approved = primaryLink?.status === 'approved';

  const myRequests = state.paymentRequests.filter((r) => normId(r.parent_identifier) === me);
  const pending = myRequests.filter((r) => r.status === 'pending');
  const settled = myRequests.filter((r) => r.status !== 'pending').slice(-4).reverse();

  // auto-expire anything past its hold
  useEffect(() => {
    const now = Date.now();
    pending.forEach((r) => { if (r.expiresAt && new Date(r.expiresAt).getTime() <= now) store.expireRequest(r.id); });
  });

  // fire a phone alert on genuinely-new pending requests (not the ones already
  // on screen when we opened). seen starts as the current set so history is quiet.
  useEffect(() => {
    if (seen.current === null) { seen.current = new Set(pending.map((r) => r.id)); return; }
    const fresh = pending.filter((r) => !seen.current.has(r.id));
    fresh.forEach((r) => {
      seen.current.add(r.id);
      phoneAlert(`${r.child_name} needs you to pay`, `${r.item} · EGP ${r.amount} — approve within 10 min`);
      notify(`New request from ${r.child_name}`);
    });
  }, [pending, notify]);

  // the child's data only unlocks once they've approved the link
  const childSessions = approved ? state.sessions.filter((s) => primaryChild && s.players?.includes(primaryChild)) : [];

  async function turnOnAlerts() {
    const res = await ensureNotifyPermission();
    setPerm(res);
    if (res === 'granted') { phoneAlert('Alerts on', 'You’ll get a notification when your child asks you to pay.'); notify('Phone alerts enabled'); }
    else if (res === 'denied') notify('Alerts blocked in browser settings');
  }

  function pay(r) { store.payRequest(r.id, 'card'); notify(`Paid — ${r.item} secured for ${r.child_name}`); }
  function decline(r) { store.declineRequest(r.id); notify('Request declined'); }

  return (
    <MScreen
      tabBar={<MTabBar active="profile" onTab={nav.switchTab} />}
      header={
        <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('Parent account')}</div>
            <h1 className="sq-display" style={{ margin: '2px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>{t('Home')}</h1>
          </div>
          <button onClick={() => nav.push('settings')} style={{ background: 'none', border: 0, color: 'var(--sq-text-2)', cursor: 'pointer' }}><Icons.Settings size={20} /></button>
        </div>
      }
    >
      <div style={{ padding: '8px 20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* enable phone alerts */}
        {perm !== 'granted' && (
          <button onClick={turnOnAlerts} className="sq-card serve-glow-soft" style={{ textAlign: 'left', cursor: 'pointer', padding: 15, display: 'flex', alignItems: 'center', gap: 13, borderColor: 'color-mix(in srgb, var(--sq-gold) 30%, transparent)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.Chat size={20} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{t('Turn on phone alerts')}</div>
              <div style={{ fontSize: 12, color: 'var(--sq-text-2)', marginTop: 2, lineHeight: 1.4 }}>{perm === 'denied' ? 'Blocked — enable notifications for this site in your browser.' : t('Get a banner + sound the moment your child asks you to pay.')}</div>
            </div>
            {perm !== 'denied' && <Icons.Chevron size={16} />}
          </button>
        )}

        {/* child */}
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('Your child')}</div>
          {primaryChild ? (
            <div className="sq-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: 'linear-gradient(135deg, #2a2a2a, #161616)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{primaryChild.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sq-display" style={{ fontSize: 16, fontWeight: 700 }}>{primaryChild}</div>
                <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 2 }}>
                  {approved ? `${childSessions.length} upcoming session${childSessions.length !== 1 ? 's' : ''}` : t('Waiting for your child to approve')}
                </div>
              </div>
              {approved ? (
                <button className="sq-btn-gold" style={{ padding: '10px 14px', fontSize: 12.5 }} onClick={() => nav.switchTab('discover')}>{t('Book a court')}</button>
              ) : (
                <span className="sq-chip gold" style={{ fontSize: 10.5 }}>{t('Pending')}</span>
              )}
            </div>
          ) : (
            <div className="sq-card" style={{ padding: 18, textAlign: 'center', color: 'var(--sq-text-3)' }}>
              <p style={{ fontSize: 13, margin: 0 }}>{t('No child linked yet.')}</p>
              <button className="sq-btn-ghost" style={{ padding: '10px 16px', fontSize: 12.5, marginTop: 12 }} onClick={() => nav.push('parentLink')}>{t('Link a child')}</button>
            </div>
          )}
        </div>

        {/* pending payment requests */}
        {pending.length > 0 && (
          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('Needs your approval')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pending.map((r) => {
                const left = r.expiresAt ? new Date(r.expiresAt).getTime() - Date.now() : 0;
                return (
                  <div key={r.id} className="sq-card serve-glow-soft" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, borderColor: 'color-mix(in srgb, var(--sq-gold) 32%, transparent)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 11, background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.Court size={20} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{r.item}</div>
                        <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 2 }}>{r.child_name} · {r.venue}{r.day ? ` · ${r.day}` : ''}{r.time ? ` ${r.time}` : ''}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>EGP {r.amount}</div>
                        <div className="sq-mono" style={{ fontSize: 11, color: left < 60000 ? 'var(--sq-danger)' : 'var(--sq-text-3)' }}>holds {fmtLeft(left)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="sq-btn-ghost" style={{ padding: '11px', fontSize: 13, color: 'var(--sq-text-2)' }} onClick={() => decline(r)}>{t('Decline')}</button>
                      <button className="sq-btn-gold" style={{ flex: 1, padding: '11px', fontSize: 13.5 }} onClick={() => pay(r)}>{t('Pay EGP')} {r.amount}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* child's upcoming sessions */}
        {childSessions.length > 0 && (
          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{primaryChild?.split(' ')[0]}’s sessions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {childSessions.map((s) => (
                <div key={s.id} className="sq-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--sq-surface-2)', color: 'var(--sq-text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.Calendar size={18} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sq-display" style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                    <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 2 }}>{s.day} · {s.time} · {s.coach} · Court {s.court}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* recently settled */}
        {settled.length > 0 && (
          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('History')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {settled.map((r) => (
                <div key={r.id} className="sq-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.item}</div>
                    <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', marginTop: 2 }}>{r.child_name} · EGP {r.amount}</div>
                  </div>
                  <span className="sq-chip" style={{ fontSize: 10, color: r.status === 'paid' ? 'var(--sq-green)' : 'var(--sq-text-3)', borderColor: r.status === 'paid' ? 'rgba(74,222,128,0.25)' : undefined, background: r.status === 'paid' ? 'rgba(74,222,128,0.1)' : undefined }}>{r.status === 'paid' ? t('Paid') : r.status === 'declined' ? t('Declined') : t('Expired')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MScreen>
  );
}
