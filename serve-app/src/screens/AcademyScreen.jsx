// AcademyScreen.jsx — an academy's page. Academies are open booking (no
// membership), so this lists available courts you can book right now plus any
// open group sessions.

import { useState } from 'react';
import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import ThemeScope from '../components/ThemeScope';
import Stars, { StarPicker, venueRating } from '../components/Stars';
import { useNav } from '../navigation/nav';
import { useStore, store } from '../store';
import { useToast } from '../components/Toast';
import { useT } from '../i18n';
import { waLink } from '../lib/contact';
import { academyCourts, OPEN_SESSIONS } from '../data';

function endOf(time) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m + 60);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AcademyScreen({ academy }) {
  const { nav, player } = useNav();
  const state = useStore();
  const notify = useToast();
  const t = useT();
  const sessions = OPEN_SESSIONS.filter((s) => s.venueId === academy.id);

  // console-backed academies reflect their owner's branding live: the demo
  // (Ramy Ashour) reads the legacy store fields, dynamic sign-ups read their
  // own org row.
  const dyn = state.orgs?.find((o) => o.id === academy.id);
  const legacy = academy.id === 'ramyashour';
  const cover = dyn?.cover || (legacy ? state.images?.academyCover : null);
  const logo = dyn?.logo || (legacy ? state.images?.academyLogo : null);
  const accent = dyn?.accent || (legacy && state.academyTheme) || academy.accent || '#f5453b';
  const displayName = dyn?.name || (legacy && state.academyName) || academy.name;

  // dynamic academies list their real free courts; the seeded directory keeps
  // its demo availability
  let courts;
  if (dyn) {
    const branchIds = new Set(state.branches.filter((b) => b.org_id === academy.id).map((b) => b.id));
    courts = state.courts.filter((c) => branchIds.has(c.branch) && c.status === 'free').slice(0, 8)
      .map((c) => ({ court: c.court, type: c.type || 'Standard', time: '18:00', price: 200 }));
  } else {
    courts = academyCourts(academy);
  }

  const { avg, count } = venueRating(state.reviews, academy.id);
  const reviews = state.reviews.filter((r) => r.venue_id === academy.id).slice().reverse();
  const contact = dyn ? { owner: dyn.owner_phone, coach: dyn.coach_phone } : (state.contacts?.[academy.id] || {});
  const ownerWa = waLink(contact.owner, `Hi, I'm reaching out about ${displayName} on SERVE.`);
  const coachWa = waLink(contact.coach, `Hi Coach, a question about training at ${displayName}.`);

  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  function submitReview() {
    store.addReview({ venue_id: academy.id, venue_name: displayName, player: player?.name, rating, comment });
    notify(t('Thanks for your review'));
    setWriting(false); setComment(''); setRating(5);
  }

  return (
    <ThemeScope accent={accent}>
    <MScreen
      header={
        <div style={{ padding: '6px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill>
          <span className="sq-display" style={{ fontSize: 16, fontWeight: 700 }}>{t('Academy')}</span>
        </div>
      }
    >
      <div style={{ padding: '4px 20px 26px' }}>
        {/* hero */}
        <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', height: 130, border: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)', background: 'linear-gradient(150deg, color-mix(in srgb, var(--sq-gold) 20%, #0d0d0d), #0d0d0d 70%)', display: 'flex', alignItems: 'flex-end', padding: 16 }}>
          {cover && <img src={cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          {cover && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1))' }} />}
          <div style={{ position: 'relative', width: 50, height: 50, borderRadius: 13, overflow: 'hidden', background: 'color-mix(in srgb, var(--sq-gold) 18%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 35%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-gold)' }}>
            {logo ? <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icons.Trophy size={24} />}
          </div>
        </div>
        <h1 className="sq-display" style={{ margin: '14px 0 0', fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>{dyn ? displayName : (legacy && state.academyName) || t(academy.name)}</h1>
        <div className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icons.Pin size={12} /> {academy.city} · {academy.courts} courts · {t('open booking')}
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          {count > 0 ? <Stars value={avg} size={15} count={count} showValue /> : <span className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-3)' }}>{t('No reviews yet')}</span>}
        </div>

        {/* contact (WhatsApp) */}
        {(ownerWa || coachWa) && (
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            {ownerWa && <a href={ownerWa} target="_blank" rel="noreferrer" className="sq-btn-ghost" style={{ flex: 1, padding: '11px', fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, textDecoration: 'none', color: 'var(--sq-text)' }}><Icons.Chat size={15} /> {t('Message owner')}</a>}
            {coachWa && <a href={coachWa} target="_blank" rel="noreferrer" className="sq-btn-ghost" style={{ flex: 1, padding: '11px', fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, textDecoration: 'none', color: 'var(--sq-text)' }}><Icons.Chat size={15} /> {t('Message coach')}</a>}
          </div>
        )}

        {/* available courts */}
        <div style={{ marginTop: 22 }}>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('Available courts · today')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {courts.map((c) => (
              <div key={c.court} className="sq-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'color-mix(in srgb, var(--sq-gold) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 25%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.Court size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600 }}>Court {c.court} · {c.type}</div>
                  <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 2 }}>From {c.time} · 60 min</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="sq-mono" style={{ fontSize: 13, color: 'var(--sq-gold)', marginBottom: 6 }}>EGP {c.price}</div>
                  <button className="sq-btn-gold" style={{ padding: '7px 14px', fontSize: 12 }}
                    onClick={() => nav.push('payment', { courtNo: c.court, type: c.type, venue: displayName, day: 'Today', time: c.time, endTime: endOf(c.time), price: c.price })}>
                    {t('Book')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* open sessions */}
        {sessions.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('Group sessions')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.map((s) => {
                const count = (s.players?.length || 0) + (state.openJoins?.[s.id]?.length || 0);
                return (
                <div key={s.id} className="sq-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
                  {/* tapping the row shows who's signed up; Join goes to checkout */}
                  <div onClick={() => nav.push('sessionPlayers', { session: s })} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--sq-surface-2)', color: 'var(--sq-text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icons.Users size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{s.title}</div>
                      <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 2 }}>{s.coach} · {s.time} · {s.spots}</div>
                      <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}><Icons.Users size={10} /> {count} {t('players')} · {t('tap to view')}</div>
                    </div>
                  </div>
                  <button className="sq-btn-gold" style={{ padding: '7px 14px', fontSize: 12 }}
                    onClick={() => nav.push('payment', { title: s.title, venue: displayName, day: s.time, time: s.time, price: s.price, sessionId: s.id })}>
                    {t('Join')}
                  </button>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ratings & reviews */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('Ratings & reviews')}</div>
            <button className="sq-btn-ghost" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => setWriting((v) => !v)}>{t('Leave a review')}</button>
          </div>

          {writing && (
            <div className="sq-card" style={{ padding: 16, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <StarPicker value={rating} onChange={setRating} />
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('How was your experience?')} rows={3}
                style={{ resize: 'none', padding: '11px 13px', borderRadius: 10, border: '1px solid var(--sq-border-2)', background: 'rgba(255,255,255,0.02)', color: 'var(--sq-text)', fontFamily: 'var(--sq-body)', fontSize: 13.5, outline: 'none' }} />
              <button className="sq-btn-gold" style={{ padding: '11px', fontSize: 13.5 }} onClick={submitReview}>{t('Submit review')}</button>
            </div>
          )}

          {reviews.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map((r) => (
                <div key={r.id} className="sq-card" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.player || t('Anonymous')}</div>
                    <Stars value={r.rating} size={13} />
                  </div>
                  {r.comment && <p style={{ margin: '7px 0 0', fontSize: 13, color: 'var(--sq-text-2)', lineHeight: 1.5 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          ) : !writing && (
            <div className="sq-card" style={{ padding: 18, textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 12.5 }}>{t('Be the first to review this academy.')}</div>
          )}
        </div>
      </div>
    </MScreen>
    </ThemeScope>
  );
}
