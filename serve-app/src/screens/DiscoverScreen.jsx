// DiscoverScreen.jsx — the booking front door, rebuilt around place.
//
// Top: a map of every venue with a pin each (admins supply a Google Maps
// link or an address in their console — see lib/geo.js). Tapping a pin
// selects the venue below.
// Under it: courts free RIGHT NOW and group training, both driven by the
// real clock (lib/live.js) so "open now", "free now" and "starts in 20 min"
// are true whenever you look.

import { useMemo, useState } from 'react';
import { Icons } from '../components/Icons';
import { MScreen, MTabBar } from '../components/mobile';
import VenueMap from '../components/VenueMap';
import Stars, { venueRating } from '../components/Stars';
import { useNav } from '../navigation/nav';
import { useStore, orgInfo } from '../store';
import { useT } from '../i18n';
import { venueCoords, mapsLink, distanceKm } from '../lib/geo';
import { useNow, isOpenNow, closesInLabel, nextSlot, fmtHHMM, sessionTiming, dayId } from '../lib/live';
import { OPEN_COURTS, OPEN_SESSIONS, ACADEMIES_DIR, CLUBS_DIR } from '../data';

// where "near me" measures from until we ask for real geolocation
const HOME = { lat: 30.0880, lng: 31.3240 }; // Heliopolis · Cairo
const FILTERS = [['open', 'Open now'], ['academies', 'Academies'], ['near', 'Near me'], ['juniors', 'Juniors']];

// '20–30+' → 20 (take the first number, not every digit mashed together)
const courtNum = (c) => parseInt((String(c).match(/\d+/) || [0])[0], 10) || 0;

export default function DiscoverScreen() {
  const { nav } = useNav();
  const state = useStore();
  const t = useT();
  const now = useNow(30000);

  const [filter, setFilter] = useState('open');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState(null);

  // ── every venue SERVE knows about, seeded + console-created ──────────
  const venues = useMemo(() => {
    const dyn = (state.orgs || [])
      .filter((o) => (o.name || '').trim() && o.id !== 'heliopolis' && o.id !== 'ramyashour')
      .map((o) => {
        const br = state.branches.filter((b) => b.org_id === o.id);
        const ids = new Set(br.map((b) => b.id));
        const courts = state.courts.filter((c) => ids.has(c.branch));
        return {
          id: o.id, name: o.name, short: o.name, type: o.type || 'academy',
          city: br[0]?.location || 'Egypt', address: br[0]?.location || '',
          maps_url: o.maps_url || br[0]?.maps_url || '',
          accent: o.accent || 'var(--sq-gold)', logo: o.logo || null,
          courts: courts.length, freeNow: courts.filter((c) => c.status === 'free').length,
          minPrice: o.min_price || 200, dynamic: true,
        };
      });

    const seeded = [...ACADEMIES_DIR, ...CLUBS_DIR].map((v) => {
      const legacy = v.id === 'heliopolis' || v.id === 'ramyashour';
      const br = legacy ? state.branches.filter((b) => b.org_id === v.id) : [];
      const ids = new Set(br.map((b) => b.id));
      const courts = state.courts.filter((c) => ids.has(c.branch));
      return {
        ...v,
        maps_url: state.orgs?.find((o) => o.id === v.id)?.maps_url || '',
        courts: courts.length || courtNum(v.courts) || 0,
        freeNow: courts.length ? courts.filter((c) => c.status === 'free').length : null,
        minPrice: v.minPrice || 200,
      };
    });

    return [...seeded, ...dyn].map((v) => {
      const c = venueCoords(v);
      const open = isOpenNow(now);
      return {
        ...v,
        lat: c?.lat, lng: c?.lng,
        km: c ? distanceKm(HOME, c) : null,
        open,
        // seeded venues don't have live court rows — show a plausible count
        freeNow: v.freeNow != null ? v.freeNow : open ? Math.max(1, Math.round(v.courts * 0.35)) : 0,
        rating: venueRating(state.reviews, v.id),
      };
    });
  }, [state.orgs, state.branches, state.courts, state.reviews, now]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = venues;
    if (q) list = list.filter((v) => `${v.name} ${v.city}`.toLowerCase().includes(q));
    if (filter === 'open') list = list.filter((v) => v.open);
    if (filter === 'academies') list = list.filter((v) => v.type === 'academy');
    if (filter === 'juniors') list = list.filter((v) => v.type === 'academy');
    const sorted = [...list];
    if (filter === 'near') sorted.sort((a, b) => (a.km ?? 999) - (b.km ?? 999));
    else sorted.sort((a, b) => (b.freeNow || 0) - (a.freeNow || 0));
    return sorted;
  }, [venues, filter, query]);

  const hero = shown.find((v) => v.id === picked) || shown[0] || null;
  const rest = shown.filter((v) => v.id !== hero?.id);

  // ── courts free right now ────────────────────────────────────────────
  const slot = nextSlot(now);
  const liveCourts = useMemo(() => {
    const real = [];
    for (const c of state.courts) {
      if (c.status !== 'free') continue;
      const br = state.branches.find((b) => b.id === c.branch);
      if (!br) continue;
      const org = orgInfo(state, br.org_id);
      if (!org?.name) continue;
      real.push({
        id: `${c.branch}-${c.court}`, court: c.court, type: c.type || 'Standard',
        venue: org.name, venueId: br.org_id, branch: c.branch,
        price: 200, time: slot != null ? fmtHHMM(slot) : '—',
      });
    }
    const demo = OPEN_COURTS.map((c) => ({ ...c, time: slot != null ? fmtHHMM(slot) : c.time }));
    return [...real, ...demo].slice(0, 8);
  }, [state.courts, state.branches, state.orgs, slot]);

  // ── group training, ordered by what's happening soonest ──────────────
  const sessions = useMemo(() => {
    const live = (state.sessions || []).filter((s) => s.open).map((s) => {
      const br = state.branches.find((x) => x.id === s.branch);
      const org = br ? orgInfo(state, br.org_id) : null;
      const left = s.spots ? s.spots - (s.players?.length || 0) : null;
      return {
        id: s.id, title: s.title, coach: s.coach, price: s.price || 0,
        players: s.players || [], day: s.day, time: s.time,
        venue: org?.name || br?.name || '', left,
      };
    }).filter((s) => s.left == null || s.left > 0);

    const demo = OPEN_SESSIONS.map((s) => ({
      ...s, day: (s.time || '').startsWith('Today') ? dayId(now) : (s.time || '').slice(0, 3),
      time: (s.time.match(/\d{1,2}:\d{2}/) || ['18:00'])[0],
      left: parseInt(s.spots, 10) || null,
    }));

    const rank = { live: 0, soon: 1, later: 2, other: 3, done: 4 };
    return [...live, ...demo]
      .map((s) => ({ ...s, t: sessionTiming(now, s) }))
      .sort((a, b) => (rank[a.t.state] - rank[b.t.state]) || ((a.t.start ?? 0) - (b.t.start ?? 0)))
      .slice(0, 6);
  }, [state.sessions, state.branches, state.orgs, now]);

  function openVenue(v) {
    if (v.type === 'club' && v.id === 'heliopolis') return nav.push('clubBio');
    if (v.type === 'club') return nav.push('joinClub', v.dynamic ? { club: v } : undefined);
    nav.push('academy', { academy: v });
  }

  const Label = ({ children, tone }) => (
    <div className="sq-mono" style={{ fontSize: 10, color: tone || 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>{children}</div>
  );

  return (
    <MScreen
      tabBar={<MTabBar active="discover" onTab={nav.switchTab} />}
      header={
        <div style={{ padding: '2px 20px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.16em' }}>Cairo</div>
            <h1 className="sq-display" style={{ margin: '2px 0 0', fontSize: 32, fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1 }}>{t('Discover')}</h1>
          </div>
          <span className="sq-chip" style={{ flexShrink: 0, padding: '8px 13px', fontSize: 12 }}>
            <span style={{ color: 'var(--sq-gold)', display: 'inline-flex' }}><Icons.Pin size={12} /></span>
            {hero?.city?.split('·')[0]?.trim() || 'Egypt'}
          </span>
        </div>
      }
    >
      <div style={{ padding: '0 20px 26px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* search */}
        <div className="sq-field" style={{ padding: '12px 14px', borderRadius: 12 }}>
          <Icons.Search size={15} />
          <input className="sq-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('Academies, clubs, courts…')} style={{ fontSize: 14 }} />
        </div>

        {/* filters */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {FILTERS.map(([id, label]) => (
            <button key={id} onClick={() => { setFilter(id); setPicked(null); }} className={'sq-chip' + (filter === id ? ' gold' : '')}
              style={{ cursor: 'pointer', padding: '9px 15px', fontSize: 13, flexShrink: 0, fontWeight: filter === id ? 600 : 500 }}>
              {t(label)}
            </button>
          ))}
        </div>

        {/* the map */}
        <VenueMap venues={shown} height={196} activeId={hero?.id} onPick={(p) => setPicked(p.id)} />

        {/* hero venue */}
        {hero && (
          <div className="sq-card" style={{ padding: 0, overflow: 'hidden', border: `1px solid color-mix(in srgb, ${hero.accent || 'var(--sq-gold)'} 35%, transparent)` }}>
            <div style={{ position: 'relative', height: 132, background: 'var(--sq-surface-2)' }}>
              <div className="sq-star-field" style={{ position: 'absolute', inset: 0 }} />
              {hero.logo && <img src={hero.logo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, var(--sq-surface) 100%)' }} />
              <span className="sq-chip" style={{ position: 'absolute', top: 12, left: 12, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: hero.open ? 'var(--sq-green)' : 'var(--sq-text-2)', borderColor: hero.open ? 'color-mix(in srgb, var(--sq-green) 34%, transparent)' : undefined, background: hero.open ? 'color-mix(in srgb, var(--sq-green) 12%, transparent)' : undefined }}>
                {hero.open && <span className="sq-live-dot" />} {hero.open ? t('Open now') : t('Closed')}
              </span>
            </div>
            <div style={{ padding: '2px 16px 16px' }}>
              <h2 className="sq-display" style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{hero.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5, fontSize: 12, color: 'var(--sq-text-2)', flexWrap: 'wrap' }}>
                <Icons.Pin size={12} /> {hero.city}
                {hero.km != null && <span>· {hero.km.toFixed(1)} km</span>}
                {hero.rating?.count > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>· <Stars value={hero.rating.avg} size={11} /> {hero.rating.avg.toFixed(1)}</span>}
              </div>
              <div className="sq-mono" style={{ fontSize: 10.5, color: hero.open ? 'var(--sq-green)' : 'var(--sq-text-3)', marginTop: 6, letterSpacing: '0.08em' }}>{closesInLabel(now, undefined, t)}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
                {[['Courts', hero.courts || '—', null], ['Free now', hero.freeNow ?? '—', 'var(--sq-green)'], ['From', `${hero.minPrice}`, null]].map(([l, v, c]) => (
                  <div key={l} style={{ padding: '10px 11px', borderRadius: 11, background: 'var(--sq-fill-2)', border: '1px solid var(--sq-border)', textAlign: 'center' }}>
                    <div className="sq-mono" style={{ fontSize: 9, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t(l)}</div>
                    <div className="sq-display" style={{ fontSize: 18, fontWeight: 700, marginTop: 3, color: c || 'var(--sq-text)' }}>{v}</div>
                  </div>
                ))}
              </div>

              <button className="sq-btn-gold serve-glow-soft" style={{ width: '100%', padding: '14px', fontSize: 14.5, marginTop: 14 }} onClick={() => openVenue(hero)}>
                {hero.type === 'club' ? t('View club') : t('Book a court')} →
              </button>
              <a href={mapsLink(hero)} target="_blank" rel="noreferrer" className="sq-btn-ghost"
                style={{ width: '100%', padding: '11px', fontSize: 12.5, marginTop: 8, textDecoration: 'none', color: 'var(--sq-text)' }}>
                <Icons.Pin size={13} /> {t('Directions')}
              </a>
            </div>
          </div>
        )}

        {/* the rest of the venues */}
        {rest.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rest.map((v) => (
              <button key={v.id} onClick={() => setPicked(v.id)} className="sq-card"
                style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, overflow: 'hidden', background: `color-mix(in srgb, ${v.accent || 'var(--sq-gold)'} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${v.accent || 'var(--sq-gold)'} 26%, transparent)`, color: v.accent || 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {v.logo ? <img src={v.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : v.type === 'club' ? <Icons.Club size={19} /> : <Icons.Trophy size={19} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sq-display" style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--sq-text-2)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <Icons.Pin size={10} /> {v.city}{v.km != null ? ` · ${v.km.toFixed(1)} km` : ''}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="sq-mono" style={{ fontSize: 9, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('From')}</div>
                  <div className="sq-display" style={{ fontSize: 14, fontWeight: 700 }}>EGP {v.minPrice}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* free right now */}
        <div>
          <Label tone="var(--sq-green)">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><span className="sq-live-dot" /> {t('Free right now')} · {slot != null ? fmtHHMM(slot) : '—'}</span>
          </Label>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 2 }}>
            {liveCourts.map((c) => (
              <div key={c.id} className="sq-card" style={{ flex: '0 0 186px', padding: 13, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="sq-chip gold" style={{ fontSize: 10, padding: '3px 9px' }}>Court {c.court}</span>
                  {c.guest && <span className="sq-chip" style={{ fontSize: 9.5, padding: '3px 8px' }}>{t('Guest pass')}</span>}
                </div>
                <div className="sq-display" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>{c.venue}</div>
                <div style={{ fontSize: 11, color: 'var(--sq-text-2)' }}>{c.time} · {c.type}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                  <span className="sq-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--sq-gold)' }}>EGP {c.price}</span>
                  <button className="sq-btn-gold" style={{ padding: '8px 15px', fontSize: 12.5 }}
                    onClick={() => nav.push('payment', { courtNo: c.court, type: c.type, venue: c.venue, day: 'Today', time: c.time, endTime: fmtHHMM((slot ?? 0) + 60), price: c.price, guest: c.guest, branch: c.branch })}>
                    {t('Book')}
                  </button>
                </div>
              </div>
            ))}
            {!liveCourts.length && <div className="sq-card" style={{ padding: 16, fontSize: 12.5, color: 'var(--sq-text-3)' }}>{t('Nothing free at this hour.')}</div>}
          </div>
        </div>

        {/* group training */}
        <div>
          <Label>{t('Group training')}</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {sessions.map((s) => {
              const joined = state.openJoins?.[s.id] || [];
              const count = (s.players?.length || 0) + joined.length;
              const st = s.t.state;
              const badge = st === 'live' ? { text: `Live · ${s.t.endsIn}m left`, col: 'var(--sq-green)' }
                : st === 'soon' ? { text: `Starts in ${s.t.startsIn}m`, col: 'var(--sq-gold)' }
                : { text: `${s.day || ''} ${s.time}`.trim(), col: 'var(--sq-text-2)' };
              return (
                <div key={s.id} className="sq-card" style={{ padding: 13, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div onClick={() => nav.push('sessionPlayers', { session: s })} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="sq-mono" style={{ fontSize: 9.5, color: badge.col, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        {st === 'live' && <span className="sq-live-dot" />}{badge.text}
                      </span>
                    </div>
                    <div className="sq-display" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.15 }}>{s.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 3 }}>{[s.coach, s.venue].filter(Boolean).join(' · ')}</div>
                    <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icons.Users size={10} /> {count} {t('players')}{s.left != null ? ` · ${s.left} ${t('left')}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="sq-display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--sq-gold)', marginBottom: 7 }}>EGP {s.price}</div>
                    <button className="sq-btn-gold" style={{ padding: '8px 15px', fontSize: 12.5 }}
                      onClick={() => nav.push('payment', { title: s.title, venue: s.venue, day: s.day, time: s.time, price: s.price, sessionId: s.id })}>
                      {t('Join')}
                    </button>
                  </div>
                </div>
              );
            })}
            {!sessions.length && <div className="sq-card" style={{ padding: 16, fontSize: 12.5, color: 'var(--sq-text-3)' }}>{t('No sessions open right now.')}</div>}
          </div>
        </div>
      </div>
    </MScreen>
  );
}
