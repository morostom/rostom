// DiscoverScreen.jsx — the booking front door. A glimpse of courts available
// right now and open group sessions, then the full directory: academies (open
// booking) on the left, clubs (members-only) on the right.

import { useState } from 'react';
import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import { MScreen, MTabBar } from '../components/mobile';
import Stars, { venueRating } from '../components/Stars';
import { useNav } from '../navigation/nav';
import { useStore } from '../store';
import { useT } from '../i18n';
import { OPEN_COURTS, OPEN_SESSIONS, ACADEMIES_DIR, CLUBS_DIR } from '../data';

const courtNum = (c) => parseInt(String(c).replace(/\D/g, ''), 10) || 0;

function endOf(time) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m + 60);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function DiscoverScreen() {
  const { nav } = useNav();
  const state = useStore();
  const t = useT();
  const [sort, setSort] = useState('near'); // near | best | courts

  const academies = [...ACADEMIES_DIR].sort((a, b) => {
    if (sort === 'best') return venueRating(state.reviews, b.id).avg - venueRating(state.reviews, a.id).avg;
    if (sort === 'courts') return courtNum(b.courts) - courtNum(a.courts);
    // "near me": Cairo-area venues first (no geolocation yet), stable otherwise
    const near = (x) => (/cairo/i.test(x.city) ? 0 : 1);
    return near(a) - near(b);
  });

  function openCourt(c) {
    nav.push('payment', { courtNo: c.court, type: c.type, venue: c.venue, day: 'Today', time: c.time, endTime: endOf(c.time), price: c.price, guest: c.guest });
  }
  function openSession(s) {
    nav.push('payment', { title: s.title, venue: s.venue, day: s.time, time: s.time, price: s.price, sessionId: s.id });
  }
  function openAcademy(a) {
    nav.push('academy', { academy: a });
  }
  function openClub(c) {
    if (c.id === 'heliopolis') nav.push('clubBio');
    else nav.push('joinClub');
  }

  return (
    <MScreen
      tabBar={<MTabBar active="discover" onTab={nav.switchTab} />}
      header={
        <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="sq-display" style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>{t('Discover')}</h1>
            <div style={{ fontSize: 12.5, color: 'var(--sq-text-2)', marginTop: 2 }}>{t('Book a court anywhere in Egypt')}</div>
          </div>
          <SQLogo size={18} accent />
        </div>
      }
    >
      {/* available now — horizontal scroll */}
      <div style={{ padding: '12px 0 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 20px', marginBottom: 10 }}>
          <span className="sq-live-dot" />
          <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('Available now')}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px' }}>
          {OPEN_COURTS.map((c) => (
            <div key={c.id} className="sq-card" style={{ flex: '0 0 200px', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="sq-chip gold" style={{ fontSize: 9.5, padding: '2px 8px' }}>Court {c.court}</span>
                {c.guest && <span className="sq-chip" style={{ fontSize: 9, padding: '2px 7px' }}>Guest pass</span>}
              </div>
              <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.2 }}>{c.venue}</div>
              <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)' }}>Today {c.time} · {c.type}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <span className="sq-mono" style={{ fontSize: 13, color: 'var(--sq-gold)' }}>EGP {c.price}</span>
                <button className="sq-btn-gold" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => openCourt(c)}>{t('Book')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* open group sessions */}
      <div style={{ padding: '0 0 20px' }}>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 20px', marginBottom: 10 }}>Open group sessions</div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 20px' }}>
          {OPEN_SESSIONS.map((s) => {
            const joined = state.openJoins?.[s.id] || [];
            const count = (s.players?.length || 0) + joined.length;
            return (
            <div key={s.id} className="sq-card" style={{ flex: '0 0 210px', padding: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {/* tapping the card shows who's signed up; Join goes to checkout */}
              <div onClick={() => nav.push('sessionPlayers', { session: s })} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 7 }}>
                <span className="sq-chip" style={{ fontSize: 9.5, padding: '2px 8px', width: 'fit-content', color: 'var(--sq-blue)', borderColor: 'rgba(78,168,255,0.25)', background: 'rgba(78,168,255,0.1)' }}><Icons.Users size={10} /> {s.spots}</span>
                <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.2 }}>{s.title}</div>
                <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)' }}>{s.coach} · {s.time}</div>
                <div style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{s.venue}</div>
                <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icons.Users size={10} /> {count} {t('players')} · {t('tap to view')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <span className="sq-mono" style={{ fontSize: 13, color: 'var(--sq-gold)' }}>EGP {s.price}</span>
                <button className="sq-btn-gold" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => openSession(s)}>{t('Join')}</button>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* academy sort — dropdown */}
      <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0 }}>{t('Sort')}</span>
        <div className="sq-field" style={{ padding: '9px 12px', borderRadius: 10, flex: 1, maxWidth: 220 }}>
          <Icons.Search size={13} />
          <select className="sq-input sq-select" value={sort} onChange={(e) => setSort(e.target.value)} style={{ fontSize: 13 }}>
            <option value="near">{t('Near me')}</option>
            <option value="best">{t('Best rated')}</option>
            <option value="courts">{t('Most courts')}</option>
          </select>
        </div>
      </div>

      {/* directory — academies left, clubs right */}
      <div style={{ padding: '0 20px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{t('Academies')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {academies.map((a) => {
                const r = venueRating(state.reviews, a.id);
                return (
                <button key={a.id} onClick={() => openAcademy(a)} className="sq-card" style={{ textAlign: 'left', cursor: 'pointer', padding: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, overflow: 'hidden', background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 28%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {a.id === 'ramyashour' && state.images?.academyLogo ? <img src={state.images.academyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icons.Trophy size={17} />}
                  </div>
                  <div className="sq-display" style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.2 }}>{t(a.short)}</div>
                  {r.count > 0 ? <Stars value={r.avg} size={11} count={r.count} /> : <span className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)' }}>{a.courts} {t('courts')} · {t('book')}</span>}
                </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-blue)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{t('Clubs')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CLUBS_DIR.map((c) => (
                <button key={c.id} onClick={() => openClub(c)} className="sq-card" style={{ textAlign: 'left', cursor: 'pointer', padding: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, overflow: 'hidden', background: `color-mix(in srgb, ${c.accent} 16%, transparent)`, border: `1px solid color-mix(in srgb, ${c.accent} 30%, transparent)`, color: c.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.id === 'heliopolis' && state.images?.clubCrest ? <img src={state.images.clubCrest} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icons.Club size={17} />}
                  </div>
                  <div className="sq-display" style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.2 }}>{t(c.short)}</div>
                  <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {c.guestPass ? t('Guest passes') : <><Icons.Lock size={9} /> {t('members')}</>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MScreen>
  );
}
