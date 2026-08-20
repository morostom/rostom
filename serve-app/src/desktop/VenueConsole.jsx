// VenueConsole.jsx — ONE console for both clubs and academies.
//
// SERVE's console is a venue's digital home: the public page players see,
// the live court board, the schedule, and the people (players + coaches).
// There is deliberately NO money in here — no payments, no revenue, no
// pricing tables. Venues take money however they already do; SERVE runs
// the courts, the schedule and the roster.
//
// Club and academy get the SAME sections. The only differences are wording
// ("Members" vs "Players", "Club" vs "Academy") which comes from orgType.
// Every string goes through t() so the whole console works in Arabic.

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import ThemeScope from '../components/ThemeScope';
import ImgPlaceholder from '../components/ImgPlaceholder';
import UploadSlot from '../components/UploadSlot';
import { ToastProvider, useToast } from '../components/Toast';
import BranchesPanel from './BranchesPanel';
import SchedulePanel from './SchedulePanel';
import { DUR_FAST } from '../motion';
import { useStore, store, orgInfo } from '../store';
import { useT, useLang, setLang } from '../i18n';
import { signOut } from '../lib/auth';
import { mapsLink } from '../lib/geo';
import { useNow, isOpenNow, closesInLabel, dayId, sessionTiming } from '../lib/live';
import { CODES, randomCode, BRAND_COLORS } from '../data';

const SIDEBAR_W = 244;

const fieldCss = { padding: '11px 13px', border: '1px solid var(--sq-border-2)', borderRadius: 9, background: 'var(--sq-fill-2)', fontSize: 14, color: 'var(--sq-text)', outline: 'none', width: '100%', fontFamily: 'var(--sq-body)' };
const Label = ({ children }) => <label className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>{children}</label>;
const initialsOf = (n) => (n || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

// ── chrome ───────────────────────────────────────────────────────────
function Topbar({ title, sub, trailing }) {
  return (
    <div style={{ padding: '22px 30px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, borderBottom: '1px solid var(--sq-border)' }}>
      <div style={{ minWidth: 0 }}>
        {sub && <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 5 }}>{sub}</div>}
        <h1 className="sq-display" style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: '-0.035em' }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>{trailing}</div>
    </div>
  );
}

function Stat({ label, value, tone, sub }) {
  return (
    <div className="sq-card" style={{ padding: 16 }}>
      <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{label}</div>
      <div className="sq-display" style={{ fontSize: 30, fontWeight: 800, marginTop: 6, letterSpacing: '-0.03em', color: tone || 'var(--sq-text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--sq-text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Home — the venue's digital front page ────────────────────────────
function Home({ orgId, orgType, branches, onNav }) {
  const state = useStore();
  const t = useT();
  const now = useNow(30000);
  const org = orgInfo(state, orgId);
  const isClub = orgType === 'club';

  const branchIds = new Set(branches.map((b) => b.id));
  const courts = state.courts.filter((c) => branchIds.has(c.branch));
  const free = courts.filter((c) => c.status === 'free').length;
  const coaches = state.staff.filter((s) => s.org_id === orgId);
  const sessions = state.sessions.filter((s) => branchIds.has(s.branch));
  const today = sessions
    .map((s) => ({ ...s, tm: sessionTiming(now, s) }))
    .filter((s) => s.tm.state === 'live' || s.tm.state === 'soon' || s.tm.state === 'later')
    .sort((a, b) => (a.tm.start ?? 0) - (b.tm.start ?? 0))
    .slice(0, 6);

  const players = useMemo(() => {
    const set = new Set();
    for (const s of sessions) for (const p of s.players || []) set.add(p);
    return set.size;
  }, [sessions]);

  const open = isOpenNow(now);

  return (
    <>
      <Topbar
        title={org.name || t(isClub ? 'Your club' : 'Your academy')}
        sub={t('Your page on SERVE')}
        trailing={
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: open ? 'var(--sq-green)' : 'var(--sq-text-3)' }}>
              {open && <span className="sq-live-dot" />} {closesInLabel(now)}
            </span>
            <a href={mapsLink({ maps_url: org.maps_url, name: org.name, address: branches[0]?.location })} target="_blank" rel="noreferrer"
              className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5, textDecoration: 'none', color: 'var(--sq-text)' }}>
              <Icons.Pin size={13} /> {t('Directions')}
            </a>
            <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => onNav('profile')}>{t('Edit public page')}</button>
          </>
        }
      />
      <div style={{ padding: '24px 30px 40px', display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1180 }}>
        {/* the public page, as players see it */}
        <div className="sq-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ position: 'relative', height: 150 }}>
            {org.cover
              ? <img src={org.cover} alt="" style={{ width: '100%', height: 150, objectFit: 'cover' }} />
              : <ImgPlaceholder label={t('cover photo')} height={150} radius={0} hue="gold" style={{ borderRadius: 0, border: 0 }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, var(--sq-surface) 100%)' }} />
          </div>
          <div style={{ padding: '0 24px 22px', marginTop: -38, position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 18 }}>
            <div style={{ width: 76, height: 76, borderRadius: 18, overflow: 'hidden', flexShrink: 0, border: '2px solid var(--sq-surface)', background: 'var(--sq-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-gold)' }}>
              {org.logo ? <img src={org.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (isClub ? <Icons.Club size={34} /> : <Icons.Trophy size={34} />)}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
              <h2 className="sq-display" style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-0.035em' }}>{org.name || t(isClub ? 'Your club' : 'Your academy')}</h2>
              <div style={{ color: 'var(--sq-text-2)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Icons.Pin size={13} /> {branches[0]?.location || t('Add your location')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingBottom: 4 }}>
              <span className="sq-chip gold" style={{ fontSize: 11.5 }}>{t(isClub ? 'Members only' : 'Open booking')}</span>
              <span className="sq-chip" style={{ fontSize: 11.5 }}>{courts.length} {t('courts')}</span>
            </div>
          </div>
        </div>

        {/* live counts — no money anywhere */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <Stat label={t('Courts free now')} value={free} tone="var(--sq-green)" sub={`${t('of')} ${courts.length}`} />
          <Stat label={t('Sessions today')} value={today.length} sub={t('on the schedule')} />
          <Stat label={t(isClub ? 'Members' : 'Players')} value={players} sub={t('on SERVE')} />
          <Stat label={t('Coaches')} value={coaches.length} sub={`${branches.length} ${t('branches')}`} />
        </div>

        {/* what's on now */}
        <div>
          <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 12 }}>{t('On court today')}</div>
          <div className="sq-card" style={{ overflow: 'hidden' }}>
            {today.map((s, i) => {
              const live = s.tm.state === 'live';
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 20px', borderBottom: i < today.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
                  <span className="sq-mono" style={{ minWidth: 58, fontSize: 13, fontWeight: 600, color: live ? 'var(--sq-green)' : 'var(--sq-text)' }}>{s.time}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sq-display" style={{ fontSize: 14, fontWeight: 600 }}>{s.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--sq-text-3)', marginTop: 1 }}>
                      {[s.coach, `${t('Court')} ${s.court}`, `${(s.players || []).length} ${t('players')}`].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  {live
                    ? <span className="sq-chip" style={{ fontSize: 10.5, color: 'var(--sq-green)', borderColor: 'color-mix(in srgb, var(--sq-green) 30%, transparent)', background: 'color-mix(in srgb, var(--sq-green) 10%, transparent)' }}><span className="sq-live-dot" /> {t('Live')}</span>
                    : s.tm.state === 'soon' ? <span className="sq-chip gold" style={{ fontSize: 10.5 }}>{t('in')} {s.tm.startsIn}m</span>
                    : <span className="sq-chip" style={{ fontSize: 10.5 }}>{s.day}</span>}
                </div>
              );
            })}
            {!today.length && (
              <div style={{ padding: '26px 20px', textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 13 }}>
                {t('Nothing scheduled today.')}{' '}
                <button onClick={() => onNav('schedule')} style={{ background: 'none', border: 0, color: 'var(--sq-gold)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--sq-body)' }}>{t('Build the schedule →')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Live courts ──────────────────────────────────────────────────────
function CourtCard({ c }) {
  const notify = useToast();
  const t = useT();
  const free = c.status === 'free';
  const ring = c.status === 'playing' ? 'var(--sq-green)' : 'var(--sq-gold)';
  const label = { lesson: t('Lesson'), playing: t('In play'), booked: t('Booked'), free: t('Open') }[c.status];
  return (
    <motion.div
      animate={free ? {} : { boxShadow: [`0 0 0 0 color-mix(in srgb, ${ring} 0%, transparent)`, `0 0 16px 1px color-mix(in srgb, ${ring} 24%, transparent)`, `0 0 0 0 color-mix(in srgb, ${ring} 0%, transparent)`] }}
      transition={free ? undefined : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ borderRadius: 16, padding: 16, minHeight: 168, display: 'flex', flexDirection: 'column', gap: 10, background: free ? 'var(--sq-surface)' : `linear-gradient(155deg, color-mix(in srgb, ${ring} 12%, var(--sq-surface)), var(--sq-surface) 65%)`, border: '1px solid ' + (free ? 'var(--sq-border)' : `color-mix(in srgb, ${ring} 30%, transparent)`) }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="sq-display" style={{ fontSize: 19, fontWeight: 700 }}>{t('Court')} {c.court}</div>
        <span className={'sq-chip ' + (c.status === 'lesson' || c.status === 'booked' ? 'gold' : '')} style={c.status === 'playing' ? { fontSize: 10, color: 'var(--sq-green)', borderColor: 'color-mix(in srgb, var(--sq-green) 28%, transparent)', background: 'color-mix(in srgb, var(--sq-green) 10%, transparent)' } : { fontSize: 10 }}>
          {c.status === 'playing' && <span className="sq-live-dot" />}{label}
        </span>
      </div>
      <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>{c.type}</div>
      <div style={{ flex: 1 }}>
        {free
          ? <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{t('Next')} · {c.next || t('open')}</div>
          : (<><div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{c.who}</div>
              {c.coach && <div style={{ fontSize: 12, color: 'var(--sq-text-2)', marginTop: 2 }}>{c.coach}</div>}</>)}
      </div>
      {free ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sq-btn-ghost" style={{ flex: 1, padding: '8px', fontSize: 12 }} onClick={() => { store.setCourt(c.branch, c.court, { status: 'playing', who: t('Members match'), coach: null, until: '—', left: 45 }); notify(`${t('Court')} ${c.court} — ${t('marked busy')}`); }}>{t('Mark busy')}</button>
          <button className="sq-btn-ghost" title={t('Remove court')} style={{ padding: '8px 11px', fontSize: 13, color: 'var(--sq-text-3)' }} onClick={() => { store.removeCourt(c.branch, c.court); notify(`${t('Court')} ${c.court} — ${t('removed')}`); }}>×</button>
        </div>
      ) : (
        <button className="sq-btn-ghost" style={{ padding: '8px', fontSize: 12 }} onClick={() => { store.freeCourt(c.branch, c.court); notify(`${t('Court')} ${c.court} — ${t('freed')}`); }}>{t('Free up')}</button>
      )}
    </motion.div>
  );
}

function LiveCourts({ branch, branches }) {
  const notify = useToast();
  const state = useStore();
  const t = useT();
  const branchCourts = state.courts.filter((c) => c.branch === branch);
  const inUse = branchCourts.filter((c) => c.status !== 'free').length;
  const branchName = branches?.find((b) => b.id === branch)?.name || '';
  const cancels = state.cancellations.filter((c) => c.status === 'cancelled').slice(-4).reverse();
  return (
    <>
      <Topbar title={t('Live courts')} sub={branchName} trailing={
        <>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--sq-text-3)' }}><span className="sq-live-dot" /> {t('Syncs to the app')}</span>
          <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5 }} onClick={() => { store.addCourt(branch); notify(t('Court added')); }}><Icons.Plus size={13} /> {t('Add court')}</button>
        </>
      } />
      <div style={{ padding: '22px 30px 36px' }}>
        {cancels.length > 0 && (
          <div className="sq-card" style={{ padding: '12px 16px', marginBottom: 16, borderColor: 'color-mix(in srgb, var(--sq-danger) 30%, transparent)', background: 'color-mix(in srgb, var(--sq-danger) 6%, var(--sq-surface))' }}>
            <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-danger)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7 }}><Icons.Calendar size={13} /> {t('Session cancellations')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cancels.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 600 }}>{c.session_title}</span>
                  <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{c.player}{c.coach ? ` · ${c.coach}` : ''}{c.reason ? ` · “${c.reason}”` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, fontSize: 12.5 }}>
          <span className="sq-mono" style={{ color: 'var(--sq-gold)' }}>{inUse} {t('of')} {branchCourts.length} {t('courts in use')}</span>
          <span style={{ color: 'var(--sq-text-3)' }}>· {t('toggle a court and it updates live in the player app')}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {branchCourts.map((c) => <CourtCard key={c.branch + c.court} c={c} />)}
        </div>
        {!branchCourts.length && <div className="sq-card" style={{ padding: 30, textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 13 }}>{t('No courts on this branch yet.')}</div>}
      </div>
    </>
  );
}

// ── People — real player tracking, built from the schedule ───────────
function People({ orgId, orgType, branches }) {
  const state = useStore();
  const t = useT();
  const now = useNow(60000);
  const notify = useToast();
  const isClub = orgType === 'club';
  const [q, setQ] = useState('');

  const branchIds = new Set(branches.map((b) => b.id));
  const rows = useMemo(() => {
    const sessions = state.sessions.filter((s) => branchIds.has(s.branch));
    const by = new Map();
    for (const s of sessions) {
      for (const name of s.players || []) {
        const key = name.toLowerCase();
        const rec = by.get(key) || { name, sessions: 0, squads: new Set(), coaches: new Set(), next: null };
        rec.sessions += 1;
        if (s.title) rec.squads.add(s.title);
        if (s.coach) rec.coaches.add(s.coach);
        const tm = sessionTiming(now, s);
        if ((tm.state === 'live' || tm.state === 'soon' || tm.state === 'later') &&
            (!rec.next || (tm.start ?? 0) < (rec.next.start ?? 0))) {
          rec.next = { start: tm.start, label: `${s.day || dayId(now)} ${s.time}`, live: tm.state === 'live' };
        }
        by.set(key, rec);
      }
    }
    return [...by.values()]
      .map((r) => ({ ...r, card: state.playerCards?.[r.name.toLowerCase()] || null, squads: [...r.squads], coaches: [...r.coaches] }))
      .filter((r) => !q.trim() || r.name.toLowerCase().includes(q.trim().toLowerCase()))
      .sort((a, b) => b.sessions - a.sessions);
  }, [state.sessions, state.playerCards, branches, now, q]);

  const GRID = '2.2fr 1.6fr 1fr 1.4fr';
  return (
    <>
      <Topbar title={t(isClub ? 'Members' : 'Players')} sub={`${rows.length} ${t('on SERVE')}`} trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify(t('Share an access code to invite them'))}>
          <Icons.Plus size={14} /> {t('Invite')}
        </button>
      } />
      <div style={{ padding: '20px 30px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="sq-field" style={{ maxWidth: 340, padding: '10px 13px', borderRadius: 10 }}>
          <Icons.Search size={14} />
          <input className="sq-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search by name')} style={{ fontSize: 13.5 }} />
        </div>
        <div className="sq-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--sq-border)', background: 'var(--sq-fill-2)' }}>
            {[isClub ? 'Member' : 'Player', 'Squads', 'Sessions', 'Next on court'].map((h) => (
              <span key={h} className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t(h)}</span>
            ))}
          </div>
          {rows.map((r, i) => (
            <div key={r.name} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '13px 20px', alignItems: 'center', borderBottom: i < rows.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: 17, flexShrink: 0, background: 'var(--sq-surface-2)', border: '1px solid var(--sq-border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700 }}>{initialsOf(r.name)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.name}</div>
                  {r.card && <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>{[r.card.division, r.card.rankLabel].filter(Boolean).join(' · ')}</div>}
                </div>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--sq-text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.squads.join(' · ') || '—'}</span>
              <span className="sq-mono" style={{ fontSize: 13 }}>{r.sessions}</span>
              <span style={{ fontSize: 12, color: r.next?.live ? 'var(--sq-green)' : 'var(--sq-text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {r.next?.live && <span className="sq-live-dot" />}
                {r.next ? (r.next.live ? t('On court now') : r.next.label) : '—'}
              </span>
            </div>
          ))}
          {!rows.length && (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 13 }}>
              {t('Nobody on the schedule yet — add sessions and players appear here.')}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Coaches ──────────────────────────────────────────────────────────
function Coaches({ orgId }) {
  const notify = useToast();
  const state = useStore();
  const t = useT();
  const coaches = state.staff.filter((s) => s.org_id === orgId);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Coach');
  const [squads, setSquads] = useState('');

  function submit() {
    if (!name.trim()) return notify(t('Enter a name'));
    store.addStaff(orgId, { name, role, squads });
    notify(`${t('Added')} ${name.trim()}`);
    setName(''); setRole('Coach'); setSquads(''); setAdding(false);
  }
  return (
    <>
      <Topbar title={t('Coaches')} sub={`${coaches.length} ${t('on the team')}`} trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => setAdding((v) => !v)}><Icons.Plus size={14} /> {t('Add coach')}</button>
      } />
      <div style={{ padding: '24px 30px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <AnimatePresence>
          {adding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: DUR_FAST }} style={{ overflow: 'hidden' }}>
              <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 }}>
                <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t('New coach')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
                  <div><Label>{t('Name')}</Label><input autoFocus style={fieldCss} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder={t('Coach name')} /></div>
                  <div><Label>{t('Role')}</Label><input style={fieldCss} value={role} onChange={(e) => setRole(e.target.value)} /></div>
                </div>
                <div><Label>{t('Squads')}</Label><input style={fieldCss} value={squads} onChange={(e) => setSquads(e.target.value)} placeholder="U15 · U17" /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="sq-btn-gold" style={{ padding: '10px 18px', fontSize: 13 }} onClick={submit}>{t('Add coach')}</button>
                  <button className="sq-btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }} onClick={() => setAdding(false)}>{t('Cancel')}</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {coaches.map((c) => (
            <div key={c.id} className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--sq-surface-2)', border: '1px solid var(--sq-border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{c.initials || initialsOf(c.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sq-display" style={{ fontSize: 15.5, fontWeight: 700 }}>{c.name}</div>
                  <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', letterSpacing: '0.1em' }}>{c.role}</div>
                </div>
              </div>
              {c.squads && <div style={{ fontSize: 11.5, color: 'var(--sq-text-2)', paddingTop: 10, borderTop: '1px solid var(--sq-border)' }}>{c.squads}</div>}
              <button className="sq-btn-ghost" style={{ padding: '8px', fontSize: 12, color: 'var(--sq-text-3)' }} onClick={() => { store.removeStaff(c.id); notify(`${t('Removed')} ${c.name}`); }}>{t('Remove coach')}</button>
            </div>
          ))}
          {!coaches.length && <div className="sq-mono" style={{ fontSize: 12.5, color: 'var(--sq-text-3)' }}>{t('No coaches yet — add one above.')}</div>}
        </div>
      </div>
    </>
  );
}

// ── Access codes ─────────────────────────────────────────────────────
function AccessCodes({ orgType }) {
  const notify = useToast();
  const t = useT();
  const [single, setSingle] = useState('K5R2WQ');
  const [codes, setCodes] = useState(CODES);
  const isClub = orgType === 'club';
  const GRID = '1.2fr 1.6fr 1fr 1.4fr 0.8fr';
  function copy(code) { try { navigator.clipboard?.writeText(code); } catch (e) { /* ignore */ } notify(`${t('Copied')} ${code}`); }
  function generate() { const c = randomCode(); setSingle(c); setCodes((cs) => [{ code: c, to: null, status: 'open', when: t('Just now'), via: null }, ...cs]); notify(`${t('Generated')} ${c}`); }
  return (
    <>
      <Topbar title={t('Access codes')} sub={t(isClub ? 'Invite members' : 'Invite players')} trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={generate}><Icons.Plus size={14} /> {t('Generate code')}</button>
      } />
      <div style={{ padding: '22px 30px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="sq-card serve-glow-soft" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 540 }}>
          <div>
            <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{t('Single code')}</div>
            <h2 className="sq-display" style={{ margin: '6px 0 0', fontSize: 17, fontWeight: 700 }}>{t(isClub ? 'Issue to one member' : 'Issue to one player')}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 18px', borderRadius: 13, background: 'var(--sq-bg)', border: '1px dashed var(--sq-border-2)' }}>
            <span className="sq-mono" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '0.22em', color: 'var(--sq-gold)' }}>{single}</span>
            <button className="sq-btn-ghost" style={{ padding: '8px 12px', fontSize: 12 }} onClick={() => copy(single)}><Icons.Copy size={13} /> {t('Copy')}</button>
          </div>
          <button className="sq-btn-gold" style={{ padding: '12px', fontSize: 13 }} onClick={() => notify(`${t('Sent via WhatsApp')} · ${single}`)}><Icons.Chat size={15} /> {t('Send via WhatsApp')}</button>
          <p style={{ margin: 0, fontSize: 11.5, color: 'var(--sq-text-3)', lineHeight: 1.5 }}>{t('They redeem this in the SERVE app to unlock your page.')}</p>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{t('Issued codes')}</h2>
            <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{codes.length} {t('total')}</span>
          </div>
          <div className="sq-card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--sq-border)', background: 'var(--sq-fill-2)' }}>
              {['Code', 'Issued to', 'Status', 'When', ''].map((h, i) => <span key={i} className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{h && t(h)}</span>)}
            </div>
            {codes.map((c, i) => (
              <div key={c.code + i} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '12px 20px', alignItems: 'center', borderBottom: i < codes.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
                <span className="sq-mono" style={{ fontSize: 13, letterSpacing: '0.12em', color: 'var(--sq-gold)' }}>{c.code}</span>
                <span style={{ fontSize: 12.5, color: 'var(--sq-text-2)' }}>{c.to || '—'}</span>
                <span className={'sq-chip' + (c.status === 'open' ? ' gold' : '')} style={{ fontSize: 10.5, width: 'fit-content' }}>{t(c.status === 'open' ? 'Unused' : c.status === 'redeemed' ? 'Redeemed' : 'Sent')}</span>
                <span className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-3)' }}>{c.when}</span>
                <button className="sq-btn-ghost" style={{ padding: '5px 10px', fontSize: 11, width: 'fit-content' }} onClick={() => copy(c.code)}><Icons.Copy size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Public page (branding + details) ─────────────────────────────────
function PublicPage({ orgId, orgType, branches }) {
  const notify = useToast();
  const state = useStore();
  const t = useT();
  const org = orgInfo(state, orgId);
  const isClub = orgType === 'club';
  const [name, setName] = useState(org.name || '');
  const [ownerPhone, setOwnerPhone] = useState(org.owner_phone || '');
  const [coachPhone, setCoachPhone] = useState(org.coach_phone || '');
  const [mapsUrl, setMapsUrl] = useState(org.maps_url || org.address || '');
  const branchIds = new Set((branches || []).map((b) => b.id));
  const courtCount = state.courts.filter((c) => branchIds.has(c.branch)).length;
  const city = branches?.[0]?.location || t('Add your location');

  function save() {
    store.updateOrg(orgId, { name, owner_phone: ownerPhone, coach_phone: coachPhone, maps_url: mapsUrl });
    notify(t('Public page saved'));
  }
  return (
    <>
      <Topbar title={t('Public page')} sub={t('This is what players see')} trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={save}>{t('Save changes')}</button>
      } />
      <div style={{ padding: '24px 30px 40px', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, maxWidth: 1060 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{t('Logo & cover')}</h2>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: 110, flexShrink: 0 }}>
                <Label>{t(isClub ? 'Crest' : 'Logo')}</Label>
                <UploadSlot value={org.logo} onChange={(d) => { store.updateOrg(orgId, { logo: d }); notify(t('Logo updated')); }} label={t('Drop image')} height={110} radius={16} maxDim={512} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Label>{t('Cover photo')}</Label>
                <UploadSlot value={org.cover} onChange={(d) => { store.updateOrg(orgId, { cover: d }); notify(t('Cover updated')); }} label={t('Drop a cover photo of your courts')} height={110} radius={12} />
              </div>
            </div>
          </div>

          <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{t('Details')}</h2>
            <div><Label>{t(isClub ? 'Club name' : 'Academy name')}</Label><input style={fieldCss} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><Label>{t('Admin WhatsApp')}</Label><input style={fieldCss} value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="+20 100 585 1199" /></div>
              <div><Label>{t('Head coach WhatsApp')}</Label><input style={fieldCss} value={coachPhone} onChange={(e) => setCoachPhone(e.target.value)} placeholder="+20 10 1234 5678" /></div>
            </div>
            <div>
              <Label>{t('Google Maps link or address')}</Label>
              <input style={fieldCss} value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.app.goo.gl/…" />
              <p style={{ margin: '6px 0 0', fontSize: 11.5, color: 'var(--sq-text-3)' }}>{t('This is what puts you on the Discover map.')}</p>
            </div>
          </div>

          <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <h2 className="sq-display" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{t('Brand colour')}</h2>
              <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--sq-text-3)' }}>{t('SERVE runs in your colour — here and in the players’ app.')}</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {BRAND_COLORS.map((c) => {
                const on = (org.accent || '#ef4a2e').toLowerCase() === c.hex.toLowerCase();
                return (
                  <button key={c.hex} onClick={() => { store.updateOrg(orgId, { accent: c.hex }); notify(`${t('Colour set to')} ${c.name}`); }} title={c.name}
                    style={{ width: 44, height: 44, borderRadius: 12, background: c.hex, cursor: 'pointer', border: 0, boxShadow: on ? `0 0 0 2px var(--sq-bg), 0 0 0 4px ${c.hex}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e0b0a' }}>
                    {on && <Icons.Check size={18} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* live preview */}
        <div>
          <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 12 }}>{t('Players see this')} →</div>
          <div className="sq-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 150 }}>
              {org.cover ? <img src={org.cover} alt="" style={{ width: '100%', height: 150, objectFit: 'cover' }} /> : <ImgPlaceholder label={t('cover photo')} height={150} radius={0} hue="gold" style={{ borderRadius: 0, border: 0 }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, var(--sq-surface) 100%)' }} />
              <span className="sq-chip gold" style={{ position: 'absolute', top: 12, left: 12 }}><span className="sq-live-dot" /> {t('Live courts')}</span>
            </div>
            <div style={{ padding: '0 18px 18px', marginTop: -34, position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', border: '2px solid var(--sq-surface)', background: 'var(--sq-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-gold)' }}>
                {org.logo ? <img src={org.logo} alt="" style={{ width: 64, height: 64, objectFit: 'cover' }} /> : (isClub ? <Icons.Club size={30} /> : <Icons.Trophy size={30} />)}
              </div>
              <h2 className="sq-display" style={{ margin: '12px 0 2px', fontSize: 23, fontWeight: 800, letterSpacing: '-0.03em' }}>{name || t(isClub ? 'Your club' : 'Your academy')}</h2>
              <div style={{ color: 'var(--sq-text-2)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}><Icons.Pin size={12} /> {city}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <span className="sq-chip gold" style={{ fontSize: 11 }}>{t(isClub ? 'Members only' : 'Open booking')}</span>
                <span className="sq-chip" style={{ fontSize: 11 }}>{courtCount} {t('courts')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── sidebar ──────────────────────────────────────────────────────────
function Sidebar({ active, onNav, branches, branch, setBranch, orgId, orgType }) {
  const state = useStore();
  const t = useT();
  const lang = useLang();
  const org = orgInfo(state, orgId);
  const isClub = orgType === 'club';
  const coachCount = state.staff.filter((s) => s.org_id === orgId).length;
  const inUse = state.courts.filter((c) => c.branch === branch && c.status !== 'free').length;
  const branchCourts = state.courts.filter((c) => c.branch === branch).length;

  const items = [
    { id: 'home', icon: <Icons.Home size={16} />, label: 'Home' },
    { id: 'board', icon: <Icons.Activity size={16} />, label: 'Live courts' },
    { id: 'schedule', icon: <Icons.Calendar size={16} />, label: 'Schedule' },
    { id: 'people', icon: <Icons.Users size={16} />, label: isClub ? 'Members' : 'Players' },
    { id: 'coaches', icon: <Icons.Trophy size={16} />, label: 'Coaches', badge: String(coachCount) },
    { id: 'branches', icon: <Icons.Pin size={16} />, label: 'Branches', badge: String(branches.length) },
    { id: 'codes', icon: <Icons.Ticket size={16} />, label: 'Access codes' },
    { id: 'profile', icon: <Icons.Settings size={16} />, label: 'Public page' },
  ];

  return (
    <div style={{ width: SIDEBAR_W, flexShrink: 0, height: '100%', background: 'var(--sq-surface)', borderInlineEnd: '1px solid var(--sq-border)', display: 'flex', flexDirection: 'column', padding: '18px 12px' }}>
      <div style={{ padding: '4px 8px 16px' }}><SQLogo size={20} /></div>

      <button onClick={() => onNav('home')} className="sq-card" style={{ padding: '10px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'start', background: 'var(--sq-surface-2)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, overflow: 'hidden', background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 28%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-gold)' }}>
          {org.logo ? <img src={org.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (isClub ? <Icons.Club size={17} /> : <Icons.Trophy size={17} />)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sq-display" style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{org.name || t(isClub ? 'Your club' : 'Your academy')}</div>
          <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t(isClub ? 'Club' : 'Academy')}</div>
        </div>
      </button>

      {branches.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="sq-mono" style={{ padding: '2px 10px 6px', fontSize: 9, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{t('Branch')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {branches.map((b) => (
              <button key={b.id} onClick={() => setBranch(b.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'start', border: '1px solid ' + (b.id === branch ? 'color-mix(in srgb, var(--sq-gold) 40%, transparent)' : 'transparent'), background: b.id === branch ? 'color-mix(in srgb, var(--sq-gold) 10%, transparent)' : 'transparent', color: b.id === branch ? 'var(--sq-gold)' : 'var(--sq-text-2)', fontFamily: 'var(--sq-body)' }}>
                <Icons.Pin size={13} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: b.id === branch ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</span>
                <span className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)' }}>{b.courts}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="sq-mono" style={{ padding: '8px 10px 6px', fontSize: 9, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{t('Manage')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => (
          <button key={it.id} onClick={() => onNav(it.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, background: it.id === active ? 'color-mix(in srgb, var(--sq-gold) 10%, transparent)' : 'transparent', color: it.id === active ? 'var(--sq-gold)' : 'var(--sq-text-2)', fontSize: 13, fontWeight: it.id === active ? 600 : 400, position: 'relative', border: 0, cursor: 'pointer', textAlign: 'start', fontFamily: 'var(--sq-body)' }}>
            {it.icon}<span style={{ flex: 1 }}>{t(it.label)}</span>
            {it.badge && <span className="sq-mono" style={{ fontSize: 10, color: it.id === active ? 'var(--sq-gold)' : 'var(--sq-text-3)' }}>{it.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div className="sq-card" style={{ padding: 12, background: 'linear-gradient(135deg, color-mix(in srgb, var(--sq-gold) 10%, transparent), transparent)', borderColor: 'color-mix(in srgb, var(--sq-gold) 20%, transparent)' }}>
        <div className="sq-mono" style={{ fontSize: 9, color: 'var(--sq-gold)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{t('Courts in use')}</div>
        <div className="sq-display" style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{inUse} {t('of')} {branchCourts}</div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button className="sq-btn-ghost" style={{ flex: 1, padding: '8px', fontSize: 11.5 }}
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
        <button className="sq-btn-ghost" style={{ flex: 1, padding: '8px', fontSize: 11.5, color: 'var(--sq-text-3)' }}
          onClick={async () => { await signOut(); window.location.reload(); }}>
          {t('Log out')}
        </button>
      </div>
    </div>
  );
}

// ── shell ────────────────────────────────────────────────────────────
function Inner({ orgId, orgType }) {
  const state = useStore();
  const [active, setActive] = useState('home');
  const branches = state.branches.filter((b) => b.org_id === orgId);
  const [branch, setBranch] = useState(branches[0]?.id || null);
  const activeBranch = branches.some((b) => b.id === branch) ? branch : (branches[0]?.id || null);

  const common = { orgId, orgType, branches, branch: activeBranch, onNav: setActive };
  const body =
      active === 'board' ? <LiveCourts {...common} />
    : active === 'schedule' ? <SchedulePanel orgId={orgId} branch={activeBranch} branches={branches} Topbar={Topbar} />
    : active === 'people' ? <People {...common} />
    : active === 'coaches' ? <Coaches {...common} />
    : active === 'branches' ? <BranchesPanel orgId={orgId} Topbar={Topbar} />
    : active === 'codes' ? <AccessCodes {...common} />
    : active === 'profile' ? <PublicPage {...common} />
    : <Home {...common} />;

  return (
    <ThemeScope accent={orgInfo(state, orgId).accent}>
      <div className="sq-app" style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
        <Sidebar active={active} onNav={setActive} branches={branches} branch={activeBranch} setBranch={setBranch} orgId={orgId} orgType={orgType} />
        <div style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div key={active + activeBranch} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>
              {body}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ThemeScope>
  );
}

export default function VenueConsole({ orgId = 'heliopolis', orgType = 'club' }) {
  return (
    <ToastProvider>
      <Inner orgId={orgId} orgType={orgType} />
    </ToastProvider>
  );
}
