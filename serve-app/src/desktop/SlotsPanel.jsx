// SlotsPanel.jsx — freed court time, and who hears about it.
//
// A cancellation leaves a court empty and, today, silent. This panel is the
// other half: pick a session that is not going ahead, choose who the slot is
// offered to, and it reaches their phones.
//
// The audience choice is the point of the screen, not a detail. Offering a
// U13 squad's freed slot to "everyone" publishes where a group of children
// will be, to every player at the venue. So the picker states who each option
// actually reaches, and "everyone" is never preselected.

import { useMemo, useState } from 'react';
import { Icons } from '../components/Icons';
import { useToast } from '../components/Toast';
import { useStore, store } from '../store';
import { useT } from '../i18n';
import { useNow, sessionTiming } from '../lib/live';

const fieldCss = { padding: '10px 12px', border: '1px solid var(--sq-border-2)', borderRadius: 10, background: 'var(--sq-fill-2)', fontSize: 13.5, color: 'var(--sq-text)', outline: 'none', fontFamily: 'var(--sq-body)' };

const Eyebrow = ({ children, tone }) => (
  <div className="sq-mono" style={{ fontSize: 9.5, color: tone || 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600 }}>{children}</div>
);

function AudiencePicker({ session, value, onChange, refValue, onRefChange, t }) {
  const state = useStore();
  const options = [
    { id: 'coach', label: 'The coach only', hint: session?.coach || t('No coach on this session'), disabled: !session?.coach },
    { id: 'players', label: 'Players in this session', hint: `${session?.players?.length || 0} ${t('players')}` },
    { id: 'squad', label: 'A whole squad', hint: t('Everyone the venue lists in that squad') },
    { id: 'all', label: 'Everyone at the venue', hint: t('Publishes the court and time to every player') },
  ];
  // squads the venue actually runs, for the squad option
  const squads = useMemo(() => {
    const set = new Set();
    for (const s of state.sessions) if (s.title) set.add(s.title);
    return [...set].slice(0, 40);
  }, [state.sessions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            disabled={o.disabled}
            onClick={() => onChange(o.id)}
            style={{
              textAlign: 'start', padding: '11px 13px', borderRadius: 11, cursor: o.disabled ? 'not-allowed' : 'pointer',
              opacity: o.disabled ? 0.45 : 1,
              background: on ? 'color-mix(in srgb, var(--sq-gold) 12%, var(--sq-surface))' : 'var(--sq-surface)',
              border: '1px solid ' + (on ? 'color-mix(in srgb, var(--sq-gold) 42%, transparent)' : 'var(--sq-border)'),
              display: 'flex', alignItems: 'center', gap: 11,
            }}
          >
            <span style={{
              width: 15, height: 15, borderRadius: 999, flexShrink: 0,
              border: '2px solid ' + (on ? 'var(--sq-gold)' : 'var(--sq-border-2)'),
              background: on ? 'var(--sq-gold)' : 'transparent',
            }} />
            <span style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{t(o.label)}</span>
              <span style={{ display: 'block', fontSize: 11.5, color: 'var(--sq-text-3)', marginTop: 2 }}>{o.hint}</span>
            </span>
          </button>
        );
      })}
      {value === 'squad' && (
        <select value={refValue || ''} onChange={(e) => onRefChange(e.target.value)} style={{ ...fieldCss, marginTop: 2 }}>
          <option value="" disabled>{t('Pick a squad…')}</option>
          {squads.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      )}
      {value === 'all' && (
        <div style={{ fontSize: 11.5, color: 'var(--sq-gold)', lineHeight: 1.5, padding: '8px 2px 0', display: 'flex', gap: 7 }}>
          <Icons.Bolt size={13} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{t('Everyone at the venue will see this court and time. Avoid this for junior squads.')}</span>
        </div>
      )}
    </div>
  );
}

export default function SlotsPanel({ orgId, branch, branches, Topbar }) {
  const state = useStore();
  const notify = useToast();
  const t = useT();
  const now = useNow(30000);

  const branchIds = new Set(branches.map((b) => b.id));
  const [picked, setPicked] = useState(null);       // the session being released
  const [audience, setAudience] = useState('players');
  const [squad, setSquad] = useState('');

  const offers = state.slotOffers.filter((o) => o.org_id === orgId);
  const open = offers.filter((o) => o.status === 'open');

  // Sessions still to come THIS WEEK, nearest first. sessionTiming only
  // classifies same-day sessions, which would leave this panel empty six days
  // out of seven — a venue cancelling Thursday's squad on a Tuesday needs to
  // find it. Only today's already-finished sessions are dropped.
  const upcoming = useMemo(() => {
    const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayIdx = now.getDay();
    return state.sessions
      .filter((s) => branchIds.has(s.branch))
      .map((s) => {
        const tm = sessionTiming(now, s, s.duration || 60);
        const idx = order.indexOf(s.day);
        // days from today, wrapping to next week
        const away = idx < 0 ? 0 : (idx - todayIdx + 7) % 7;
        return { ...s, tm, away };
      })
      .filter((s) => !(s.away === 0 && s.tm.state === 'done'))
      .sort((a, b) => (a.away - b.away) || String(a.time).localeCompare(String(b.time)));
  }, [state.sessions, now]);

  function release() {
    if (!picked) return;
    if (audience === 'squad' && !squad) { notify(t('Pick a squad first')); return; }
    const court = state.courts.find((c) => c.branch === picked.branch && String(c.court) === String(picked.court));
    const row = store.releaseSlot({
      orgId, branch: picked.branch, court: picked.court,
      day: picked.day, time: picked.time, duration: picked.duration || 60,
      price: court?.price ?? null,
      session: picked, audience, audienceRef: audience === 'squad' ? squad : null,
    });
    const n = row.recipients.length;
    notify(n ? `${t('Offered to')} ${n} ${t(n === 1 ? 'person' : 'people')}` : t('Nobody to offer it to yet'));
    setPicked(null); setAudience('players'); setSquad('');
  }

  return (
    <>
      <Topbar
        title={t('Freed slots')}
        sub={t('Court time that came free')}
        trailing={<span className="sq-mono" style={{ fontSize: 12, color: 'var(--sq-text-3)' }}>{open.length} {t('open')}</span>}
      />
      <div style={{ padding: '28px 36px 44px', maxWidth: 1280, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 26, alignItems: 'start' }}>

        {/* release a slot */}
        <div className="sq-card" style={{ padding: 22, borderRadius: 18 }}>
          <Eyebrow tone="var(--sq-gold)">{t('Release a slot')}</Eyebrow>
          <p style={{ margin: '8px 0 16px', fontSize: 13, color: 'var(--sq-text-2)', lineHeight: 1.55 }}>
            {t('Pick the session that is not going ahead, then choose who the court time is offered to. The first person to claim it takes it.')}
          </p>

          {!upcoming.length && (
            <div style={{ padding: 18, textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 13 }}>{t('Nothing upcoming to release.')}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
            {upcoming.map((s) => {
              const on = picked?.id === s.id;
              return (
                <button key={s.id} onClick={() => setPicked(on ? null : s)} style={{
                  textAlign: 'start', padding: '11px 13px', borderRadius: 11, cursor: 'pointer',
                  background: on ? 'color-mix(in srgb, var(--sq-gold) 12%, var(--sq-surface))' : 'var(--sq-surface-2)',
                  border: '1px solid ' + (on ? 'color-mix(in srgb, var(--sq-gold) 42%, transparent)' : 'var(--sq-border)'),
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <span className="sq-mono" style={{ fontSize: 12.5, fontWeight: 600, minWidth: 74, color: on ? 'var(--sq-gold)' : 'var(--sq-text-2)' }}>{s.day} {s.time}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{s.title}</span>
                    <span style={{ display: 'block', fontSize: 11.5, color: 'var(--sq-text-3)', marginTop: 2 }}>
                      {s.coach} · {t('Court')} {s.court} · {s.players?.length || 0} {t('players')}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {picked && (
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--sq-border)' }}>
              <Eyebrow>{t('Who gets told')}</Eyebrow>
              <div style={{ marginTop: 10 }}>
                <AudiencePicker session={picked} value={audience} onChange={setAudience} refValue={squad} onRefChange={setSquad} t={t} />
              </div>
              <button className="sq-btn-gold" style={{ width: '100%', padding: '13px', fontSize: 14, marginTop: 16 }} onClick={release}>
                <Icons.Bolt size={15} style={{ verticalAlign: -3, marginInlineEnd: 6 }} />
                {t('Offer the slot')}
              </button>
            </div>
          )}
        </div>

        {/* what is out there */}
        <div className="sq-card" style={{ padding: 22, borderRadius: 18 }}>
          <Eyebrow>{t('Offered')}</Eyebrow>
          {!offers.length && (
            <div style={{ padding: '22px 0', textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 13 }}>
              {t('No slots offered yet.')}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {offers.slice(0, 20).map((o) => {
              const claimed = o.status === 'claimed';
              const dead = o.status === 'withdrawn' || o.status === 'expired';
              return (
                <div key={o.id} style={{
                  padding: '12px 14px', borderRadius: 12, background: 'var(--sq-surface-2)',
                  border: '1px solid ' + (claimed ? 'color-mix(in srgb, var(--sq-green) 32%, transparent)' : 'var(--sq-border)'),
                  opacity: dead ? 0.5 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span className="sq-display" style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {t('Court')} {o.court} · {o.day} {o.time}
                    </span>
                    <span className="sq-chip" style={claimed
                      ? { fontSize: 9.5, padding: '2px 8px', color: 'var(--sq-green)', borderColor: 'rgba(47,179,122,0.25)', background: 'rgba(47,179,122,0.1)' }
                      : { fontSize: 9.5, padding: '2px 8px' }}>
                      {t(claimed ? 'Claimed' : o.status === 'open' ? 'Open' : o.status)}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--sq-text-3)', marginTop: 4 }}>
                    {o.session_title ? `${o.session_title} · ` : ''}
                    {claimed ? `${t('Taken by')} ${o.claimed_by}` : `${t('Offered to')} ${o.recipients.length} ${t(o.recipients.length === 1 ? 'person' : 'people')}`}
                  </div>
                  {o.status === 'open' && (
                    <button className="sq-btn-ghost" style={{ padding: '7px 11px', fontSize: 11.5, marginTop: 9 }}
                      onClick={() => { store.withdrawSlot(o.id); notify(t('Offer withdrawn')); }}>
                      {t('Withdraw')}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
