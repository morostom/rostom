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
import { branchRates } from '../lib/pricing';
import { useT, useLang, setLang } from '../i18n';
import { signOut } from '../lib/auth';
import { mapsLink } from '../lib/geo';
import { useNow, isOpenNow, closesInLabel, dayId, sessionTiming } from '../lib/live';
import { CODES, randomCode, BRAND_COLORS } from '../data';

const SIDEBAR_W = 252;
const PAGE = { padding: '28px 36px 44px', maxWidth: 1280 };

const fieldCss = { padding: '12px 14px', border: '1px solid var(--sq-border-2)', borderRadius: 11, background: 'var(--sq-fill-2)', fontSize: 14, color: 'var(--sq-text)', outline: 'none', width: '100%', fontFamily: 'var(--sq-body)' };
const initialsOf = (n) => (n || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

// ── shared type ──────────────────────────────────────────────────────
const Eyebrow = ({ children, tone }) => (
  <div className="sq-mono" style={{ fontSize: 9.5, color: tone || 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600 }}>{children}</div>
);
const Label = ({ children }) => (
  <label className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.16em', display: 'block', marginBottom: 7, fontWeight: 600 }}>{children}</label>
);
const SectionTitle = ({ children }) => (
  <h2 className="sq-display" style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em' }}>{children}</h2>
);

function Topbar({ title, sub, trailing }) {
  return (
    <div style={{ padding: '30px 36px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, borderBottom: '1px solid var(--sq-border)' }}>
      <div style={{ minWidth: 0 }}>
        {sub && <div style={{ marginBottom: 7 }}><Eyebrow tone="var(--sq-gold)">{sub}</Eyebrow></div>}
        <h1 className="sq-display" style={{ margin: 0, fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>{trailing}</div>
    </div>
  );
}

function Stat({ label, value, tone, sub }) {
  return (
    <div className="sq-card" style={{ padding: '18px 20px', borderRadius: 16 }}>
      <Eyebrow>{label}</Eyebrow>
      <div className="sq-display" style={{ fontSize: 38, fontWeight: 800, marginTop: 8, letterSpacing: '-0.045em', lineHeight: 1, color: tone || 'var(--sq-text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--sq-text-3)', marginTop: 6 }}>{sub}</div>}
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
    .filter((s) => ['live', 'soon', 'later'].includes(s.tm.state))
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
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: open ? 'var(--sq-green)' : 'var(--sq-text-3)', marginInlineEnd: 4 }}>
              {open && <span className="sq-live-dot" />} {closesInLabel(now, undefined, t)}
            </span>
            <a href={mapsLink({ maps_url: org.maps_url, name: org.name, address: branches[0]?.location })} target="_blank" rel="noreferrer"
              className="sq-btn-ghost" style={{ padding: '10px 15px', fontSize: 12.5, textDecoration: 'none', color: 'var(--sq-text)' }}>
              <Icons.Pin size={13} /> {t('Directions')}
            </a>
            <button className="sq-btn-gold" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => onNav('profile')}>{t('Edit public page')}</button>
          </>
        }
      />
      <div style={{ ...PAGE, display: 'flex', flexDirection: 'column', gap: 26 }}>
        {/* the public page, as players see it */}
        <div className="sq-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 20, border: `1px solid color-mix(in srgb, ${org.accent || 'var(--sq-gold)'} 26%, transparent)` }}>
          <div style={{ position: 'relative', height: 190 }}>
            <div className="sq-star-field" style={{ position: 'absolute', inset: 0 }} />
            {org.cover && <img src={org.cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 15%, var(--sq-surface) 100%)' }} />
            {!org.cover && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button className="sq-btn-ghost" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => onNav('profile')}>
                  <Icons.Upload size={13} /> {t('Add a cover photo')}
                </button>
              </div>
            )}
          </div>
          <div style={{ padding: '0 28px 26px', marginTop: -46, position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 20 }}>
            <div style={{ width: 92, height: 92, borderRadius: 22, overflow: 'hidden', flexShrink: 0, border: '3px solid var(--sq-surface)', background: 'var(--sq-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: org.accent || 'var(--sq-gold)' }}>
              {org.logo ? <img src={org.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (isClub ? <Icons.Club size={40} /> : <Icons.Trophy size={40} />)}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
              <h2 className="sq-display" style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                {org.name || t(isClub ? 'Your club' : 'Your academy')}
              </h2>
              <div style={{ color: 'var(--sq-text-2)', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 7, marginTop: 7 }}>
                <Icons.Pin size={13} /> {branches[0]?.location || t('Add your location')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingBottom: 6 }}>
              <span className="sq-chip gold" style={{ fontSize: 11.5, padding: '6px 13px' }}>{t(isClub ? 'Members only' : 'Open booking')}</span>
              <span className="sq-chip" style={{ fontSize: 11.5, padding: '6px 13px' }}>{courts.length} {t('courts')}</span>
            </div>
          </div>
        </div>

        {/* live counts — no money anywhere */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <Stat label={t('Courts free now')} value={free} tone="var(--sq-green)" sub={`${t('of')} ${courts.length}`} />
          <Stat label={t('Sessions today')} value={today.length} sub={t('on the schedule')} />
          <Stat label={t(isClub ? 'Members' : 'Players')} value={players} sub={t('on SERVE')} />
          <Stat label={t('Coaches')} value={coaches.length} sub={`${branches.length} ${t('branches')}`} />
        </div>

        {/* what's on now */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <SectionTitle>{t('On court today')}</SectionTitle>
            <button onClick={() => onNav('schedule')} style={{ background: 'none', border: 0, color: 'var(--sq-gold)', cursor: 'pointer', fontSize: 12.5, fontFamily: 'var(--sq-body)', fontWeight: 500 }}>{t('Schedule')} →</button>
          </div>
          <div className="sq-card" style={{ overflow: 'hidden', borderRadius: 16 }}>
            {today.map((s, i) => {
              const live = s.tm.state === 'live';
              return (
                <div key={s.id} className="sq-row" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '16px 22px', borderBottom: i < today.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
                  <div style={{ minWidth: 66 }}>
                    <div className="sq-display" style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', color: live ? 'var(--sq-green)' : 'var(--sq-text)' }}>{s.time}</div>
                  </div>
                  <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: live ? 'var(--sq-green)' : 'var(--sq-border-2)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sq-display" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--sq-text-3)', marginTop: 3 }}>
                      {[s.coach, `${t('Court')} ${s.court}`, `${(s.players || []).length} ${t('players')}`].filter(Boolean).join('  ·  ')}
                    </div>
                  </div>
                  {live
                    ? <span className="sq-chip" style={{ fontSize: 10.5, padding: '5px 12px', color: 'var(--sq-green)', borderColor: 'color-mix(in srgb, var(--sq-green) 30%, transparent)', background: 'color-mix(in srgb, var(--sq-green) 10%, transparent)' }}><span className="sq-live-dot" /> {t('Live')}</span>
                    : s.tm.state === 'soon' ? <span className="sq-chip gold" style={{ fontSize: 10.5, padding: '5px 12px' }}>{t('in')} {s.tm.startsIn}m</span>
                    : <span className="sq-chip" style={{ fontSize: 10.5, padding: '5px 12px' }}>{s.day}</span>}
                </div>
              );
            })}
            {!today.length && (
              <div style={{ padding: '40px 22px', textAlign: 'center' }}>
                <div style={{ color: 'var(--sq-text-3)', fontSize: 13.5, marginBottom: 12 }}>{t('Nothing scheduled today.')}</div>
                <button className="sq-btn-ghost" style={{ padding: '10px 18px', fontSize: 12.5 }} onClick={() => onNav('schedule')}>{t('Build the schedule →')}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Live courts ──────────────────────────────────────────────────────
function CourtCard({ c, rates }) {
  const notify = useToast();
  const t = useT();
  const free = c.status === 'free';
  const override = c.price != null && c.price !== '' ? Number(c.price) : null;
  const ring = c.status === 'playing' ? 'var(--sq-green)' : 'var(--sq-gold)';
  const label = { lesson: t('Lesson'), playing: t('In play'), booked: t('Booked'), free: t('Open') }[c.status];
  return (
    <motion.div
      animate={free ? {} : { boxShadow: [`0 0 0 0 color-mix(in srgb, ${ring} 0%, transparent)`, `0 0 20px 1px color-mix(in srgb, ${ring} 22%, transparent)`, `0 0 0 0 color-mix(in srgb, ${ring} 0%, transparent)`] }}
      transition={free ? undefined : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        borderRadius: 18, padding: 20, minHeight: 190, display: 'flex', flexDirection: 'column', gap: 12,
        background: free ? 'var(--sq-surface)' : `linear-gradient(158deg, color-mix(in srgb, ${ring} 13%, var(--sq-surface)), var(--sq-surface) 62%)`,
        border: '1px solid ' + (free ? 'var(--sq-border)' : `color-mix(in srgb, ${ring} 32%, transparent)`),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <Eyebrow>{t('Court')}</Eyebrow>
          <div className="sq-display" style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, marginTop: 4 }}>{c.court}</div>
        </div>
        <span className={'sq-chip ' + (c.status === 'lesson' || c.status === 'booked' ? 'gold' : '')} style={c.status === 'playing' ? { fontSize: 10, padding: '4px 11px', color: 'var(--sq-green)', borderColor: 'color-mix(in srgb, var(--sq-green) 28%, transparent)', background: 'color-mix(in srgb, var(--sq-green) 10%, transparent)' } : { fontSize: 10, padding: '4px 11px' }}>
          {c.status === 'playing' && <span className="sq-live-dot" />}{label}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        {free
          ? <div style={{ fontSize: 12.5, color: 'var(--sq-text-3)' }}>{t('Next')} · {c.next || t('open')}</div>
          : (<>
              <div className="sq-display" style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: '-0.02em' }}>{c.who}</div>
              {c.coach && <div style={{ fontSize: 12.5, color: 'var(--sq-text-2)', marginTop: 3 }}>{c.coach}</div>}
              {c.until && c.until !== '—' && <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)', marginTop: 6 }}>{t('until')} {c.until}</div>}
            </>)}
      </div>
      {/* what this court costs — blank means "use the branch rate" */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--sq-border)', paddingTop: 10 }}>
        <span className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>EGP</span>
        <input
          type="number" min="0" step="10"
          defaultValue={c.price ?? ''}
          placeholder={String(rates?.rate ?? '')}
          title={t('Leave blank to use the branch rate')}
          onBlur={(e) => {
            const v = e.target.value === '' ? null : Math.max(0, parseFloat(e.target.value) || 0);
            if (v === override) return;
            store.setCourt(c.branch, c.court, { price: v });
            notify(v == null ? `${t('Court')} ${c.court} — ${t('uses the branch rate')}` : `${t('Court')} ${c.court} — EGP ${v}/${t('hr')}`);
          }}
          className="sq-mono"
          style={{ width: 76, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--sq-border-2)', background: 'var(--sq-fill-2)', color: 'var(--sq-text)', fontSize: 12.5, outline: 'none' }}
        />
        <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>
          / {t('hr')}{override == null && rates?.peak ? ` · ${t('peak')} ${rates.peak}` : ''}
        </span>
      </div>
      {free ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sq-btn-ghost" style={{ flex: 1, padding: '9px', fontSize: 12.5 }} onClick={() => { store.setCourt(c.branch, c.court, { status: 'playing', who: t('Members match'), coach: null, until: '—', left: 45 }); notify(`${t('Court')} ${c.court} — ${t('marked busy')}`); }}>{t('Mark busy')}</button>
          <button className="sq-btn-ghost" title={t('Remove court')} style={{ padding: '9px 12px', fontSize: 13, color: 'var(--sq-text-3)' }} onClick={() => { store.removeCourt(c.branch, c.court); notify(`${t('Court')} ${c.court} — ${t('removed')}`); }}>×</button>
        </div>
      ) : (
        <button className="sq-btn-ghost" style={{ padding: '9px', fontSize: 12.5 }} onClick={() => { store.freeCourt(c.branch, c.court); notify(`${t('Court')} ${c.court} — ${t('freed')}`); }}>{t('Free up')}</button>
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
  const rates = branchRates(branches?.find((b) => b.id === branch));
  const cancels = state.cancellations.filter((c) => c.status === 'cancelled').slice(-4).reverse();
  const pct = branchCourts.length ? Math.round((inUse / branchCourts.length) * 100) : 0;
  return (
    <>
      <Topbar title={t('Live courts')} sub={branchName} trailing={
        <>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--sq-text-3)', marginInlineEnd: 4 }}><span className="sq-live-dot" /> {t('Syncs to the app')}</span>
          <button className="sq-btn-ghost" style={{ padding: '10px 15px', fontSize: 12.5 }} onClick={() => { store.addCourt(branch); notify(t('Court added')); }}><Icons.Plus size={13} /> {t('Add court')}</button>
        </>
      } />
      <div style={PAGE}>
        {cancels.length > 0 && (
          <div className="sq-card" style={{ padding: '14px 18px', marginBottom: 20, borderRadius: 14, borderColor: 'color-mix(in srgb, var(--sq-danger) 30%, transparent)', background: 'color-mix(in srgb, var(--sq-danger) 6%, var(--sq-surface))' }}>
            <div style={{ marginBottom: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icons.Calendar size={13} /><Eyebrow tone="var(--sq-danger)">{t('Session cancellations')}</Eyebrow>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cancels.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 600 }}>{c.session_title}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--sq-text-3)' }}>{c.player}{c.coach ? ` · ${c.coach}` : ''}{c.reason ? ` · “${c.reason}”` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* occupancy bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div className="sq-display" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--sq-gold)' }}>{inUse}</span>
            <span style={{ color: 'var(--sq-text-3)', fontSize: 15, fontWeight: 600 }}> / {branchCourts.length} {t('courts in use')}</span>
          </div>
          <div style={{ flex: 1, maxWidth: 320, height: 6, borderRadius: 999, background: 'var(--sq-fill)', overflow: 'hidden' }}>
            <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', borderRadius: 999, background: 'var(--sq-gold)' }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--sq-text-3)' }}>{t('toggle a court and it updates live in the player app')}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(238px, 1fr))', gap: 16 }}>
          {branchCourts.map((c) => <CourtCard key={c.branch + c.court} c={c} rates={rates} />)}
        </div>
        {!branchCourts.length && <div className="sq-card" style={{ padding: 40, textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 13.5, borderRadius: 16 }}>{t('No courts on this branch yet.')}</div>}
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
        const rec = by.get(key) || { name, sessions: 0, squads: new Set(), next: null };
        rec.sessions += 1;
        if (s.title) rec.squads.add(s.title);
        const tm = sessionTiming(now, s);
        if (['live', 'soon', 'later'].includes(tm.state) && (!rec.next || (tm.start ?? 0) < (rec.next.start ?? 0))) {
          rec.next = { start: tm.start, label: `${s.day || dayId(now)} ${s.time}`, live: tm.state === 'live' };
        }
        by.set(key, rec);
      }
    }
    return [...by.values()]
      .map((r) => ({ ...r, card: state.playerCards?.[r.name.toLowerCase()] || null, squads: [...r.squads] }))
      .filter((r) => !q.trim() || r.name.toLowerCase().includes(q.trim().toLowerCase()))
      .sort((a, b) => b.sessions - a.sessions);
  }, [state.sessions, state.playerCards, branches, now, q]);

  const onCourt = rows.filter((r) => r.next?.live).length;
  const GRID = '2.2fr 1.7fr 0.8fr 1.3fr';
  return (
    <>
      <Topbar title={t(isClub ? 'Members' : 'Players')} sub={`${rows.length} ${t('on SERVE')}`} trailing={
        <button className="sq-btn-gold" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => notify(t('Share an access code to invite them'))}>
          <Icons.Plus size={14} /> {t('Invite')}
        </button>
      } />
      <div style={{ ...PAGE, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="sq-field" style={{ maxWidth: 340, padding: '11px 14px', borderRadius: 11 }}>
            <Icons.Search size={14} />
            <input className="sq-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Search by name')} style={{ fontSize: 13.5 }} />
          </div>
          {onCourt > 0 && (
            <span className="sq-chip" style={{ fontSize: 11.5, padding: '6px 13px', color: 'var(--sq-green)', borderColor: 'color-mix(in srgb, var(--sq-green) 28%, transparent)', background: 'color-mix(in srgb, var(--sq-green) 10%, transparent)' }}>
              <span className="sq-live-dot" /> {onCourt} {t('On court now')}
            </span>
          )}
        </div>

        <div className="sq-card" style={{ overflow: 'hidden', borderRadius: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 14, padding: '14px 22px', borderBottom: '1px solid var(--sq-border)', background: 'var(--sq-fill-2)' }}>
            {[isClub ? 'Member' : 'Player', 'Squads', 'Sessions', 'Next on court'].map((h) => <Eyebrow key={h}>{t(h)}</Eyebrow>)}
          </div>
          {rows.map((r, i) => (
            <div key={r.name} className="sq-row" style={{ display: 'grid', gridTemplateColumns: GRID, gap: 14, padding: '14px 22px', alignItems: 'center', borderBottom: i < rows.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, minWidth: 0 }}>
                <div style={{ width: 38, height: 38, borderRadius: 19, flexShrink: 0, background: 'var(--sq-surface-2)', border: '1px solid var(--sq-border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'var(--sq-display)' }}>{initialsOf(r.name)}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.02em' }}>{r.name}</div>
                  {r.card && <div style={{ fontSize: 11, color: 'var(--sq-text-3)', marginTop: 1 }}>{[r.card.division, r.card.rankLabel].filter(Boolean).join(' · ')}</div>}
                </div>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--sq-text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.squads.join('  ·  ') || '—'}</span>
              <span className="sq-display" style={{ fontSize: 16, fontWeight: 700 }}>{r.sessions}</span>
              <span style={{ fontSize: 12.5, color: r.next?.live ? 'var(--sq-green)' : 'var(--sq-text-3)', display: 'flex', alignItems: 'center', gap: 7 }}>
                {r.next?.live && <span className="sq-live-dot" />}
                {r.next ? (r.next.live ? t('On court now') : r.next.label) : '—'}
              </span>
            </div>
          ))}
          {!rows.length && (
            <div style={{ padding: '44px 22px', textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 13.5 }}>
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
        <button className="sq-btn-gold" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => setAdding((v) => !v)}><Icons.Plus size={14} /> {t('Add coach')}</button>
      } />
      <div style={{ ...PAGE, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <AnimatePresence>
          {adding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: DUR_FAST }} style={{ overflow: 'hidden' }}>
              <div className="sq-card sq-wash" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 660, borderRadius: 16 }}>
                <SectionTitle>{t('New coach')}</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
                  <div><Label>{t('Name')}</Label><input autoFocus style={fieldCss} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder={t('Coach name')} /></div>
                  <div><Label>{t('Role')}</Label><input style={fieldCss} value={role} onChange={(e) => setRole(e.target.value)} /></div>
                </div>
                <div><Label>{t('Squads')}</Label><input style={fieldCss} value={squads} onChange={(e) => setSquads(e.target.value)} placeholder="U15 · U17" /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="sq-btn-gold" style={{ padding: '11px 20px', fontSize: 13 }} onClick={submit}>{t('Add coach')}</button>
                  <button className="sq-btn-ghost" style={{ padding: '11px 18px', fontSize: 13 }} onClick={() => setAdding(false)}>{t('Cancel')}</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))', gap: 16 }}>
          {coaches.map((c) => (
            <div key={c.id} className="sq-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: `color-mix(in srgb, var(--sq-gold) 12%, var(--sq-surface-2))`, border: '1px solid color-mix(in srgb, var(--sq-gold) 24%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, fontFamily: 'var(--sq-display)', color: 'var(--sq-gold)' }}>{c.initials || initialsOf(c.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sq-display" style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.025em' }}>{c.name}</div>
                  <div style={{ marginTop: 3 }}><Eyebrow tone="var(--sq-gold)">{c.role}</Eyebrow></div>
                </div>
              </div>
              {c.squads && <div style={{ fontSize: 12.5, color: 'var(--sq-text-2)', paddingTop: 12, borderTop: '1px solid var(--sq-border)' }}>{c.squads}</div>}
              <button className="sq-btn-ghost" style={{ padding: '9px', fontSize: 12, color: 'var(--sq-text-3)' }} onClick={() => { store.removeStaff(c.id); notify(`${t('Removed')} ${c.name}`); }}>{t('Remove coach')}</button>
            </div>
          ))}
          {!coaches.length && <div className="sq-card" style={{ padding: 40, textAlign: 'center', fontSize: 13.5, color: 'var(--sq-text-3)', borderRadius: 16, gridColumn: '1 / -1' }}>{t('No coaches yet — add one above.')}</div>}
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
  const GRID = '1.1fr 1.6fr 1fr 1.3fr 0.6fr';
  function copy(code) { try { navigator.clipboard?.writeText(code); } catch (e) { /* ignore */ } notify(`${t('Copied')} ${code}`); }
  function generate() { const c = randomCode(); setSingle(c); setCodes((cs) => [{ code: c, to: null, status: 'open', when: t('Just now'), via: null }, ...cs]); notify(`${t('Generated')} ${c}`); }
  return (
    <>
      <Topbar title={t('Access codes')} sub={t(isClub ? 'Invite members' : 'Invite players')} trailing={
        <button className="sq-btn-gold" style={{ padding: '10px 18px', fontSize: 13 }} onClick={generate}><Icons.Plus size={14} /> {t('Generate code')}</button>
      } />
      <div style={{ ...PAGE, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="sq-card sq-wash" style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 560, borderRadius: 18, border: '1px solid color-mix(in srgb, var(--sq-gold) 24%, transparent)' }}>
          <div>
            <Eyebrow tone="var(--sq-gold)">{t('Single code')}</Eyebrow>
            <h2 className="sq-display" style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em' }}>{t(isClub ? 'Issue to one member' : 'Issue to one player')}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '20px 22px', borderRadius: 14, background: 'var(--sq-bg)', border: '1px dashed var(--sq-border-2)' }}>
            <span className="sq-display" style={{ fontSize: 32, fontWeight: 800, letterSpacing: '0.16em', color: 'var(--sq-gold)' }}>{single}</span>
            <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12 }} onClick={() => copy(single)}><Icons.Copy size={13} /> {t('Copy')}</button>
          </div>
          <button className="sq-btn-gold" style={{ padding: '13px', fontSize: 13.5 }} onClick={() => notify(`${t('Sent via WhatsApp')} · ${single}`)}><Icons.Chat size={15} /> {t('Send via WhatsApp')}</button>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--sq-text-3)', lineHeight: 1.55 }}>{t('They redeem this in the SERVE app to unlock your page.')}</p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <SectionTitle>{t('Issued codes')}</SectionTitle>
            <span style={{ fontSize: 12, color: 'var(--sq-text-3)' }}>{codes.length} {t('total')}</span>
          </div>
          <div className="sq-card" style={{ overflow: 'hidden', borderRadius: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 14, padding: '14px 22px', borderBottom: '1px solid var(--sq-border)', background: 'var(--sq-fill-2)' }}>
              {['Code', 'Issued to', 'Status', 'When', ''].map((h, i) => <Eyebrow key={i}>{h && t(h)}</Eyebrow>)}
            </div>
            {codes.map((c, i) => (
              <div key={c.code + i} className="sq-row" style={{ display: 'grid', gridTemplateColumns: GRID, gap: 14, padding: '13px 22px', alignItems: 'center', borderBottom: i < codes.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
                <span className="sq-display" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--sq-gold)' }}>{c.code}</span>
                <span style={{ fontSize: 12.5, color: 'var(--sq-text-2)' }}>{c.to || '—'}</span>
                <span className={'sq-chip' + (c.status === 'open' ? ' gold' : '')} style={{ fontSize: 10.5, padding: '4px 11px', width: 'fit-content' }}>{t(c.status === 'open' ? 'Unused' : c.status === 'redeemed' ? 'Redeemed' : 'Sent')}</span>
                <span style={{ fontSize: 12, color: 'var(--sq-text-3)' }}>{c.when}</span>
                <button className="sq-btn-ghost" style={{ padding: '6px 11px', fontSize: 11, width: 'fit-content' }} onClick={() => copy(c.code)}><Icons.Copy size={12} /></button>
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
        <button className="sq-btn-gold" style={{ padding: '10px 18px', fontSize: 13 }} onClick={save}>{t('Save changes')}</button>
      } />
      <div style={{ ...PAGE, display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 1fr)', gap: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="sq-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, borderRadius: 16 }}>
            <SectionTitle>{t('Logo & cover')}</SectionTitle>
            <div style={{ display: 'flex', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: 118, flexShrink: 0 }}>
                <Label>{t(isClub ? 'Crest' : 'Logo')}</Label>
                <UploadSlot value={org.logo} onChange={(d) => { store.updateOrg(orgId, { logo: d }); notify(t('Logo updated')); }} label={t('Drop image')} height={118} radius={18} maxDim={512} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Label>{t('Cover photo')}</Label>
                <UploadSlot value={org.cover} onChange={(d) => { store.updateOrg(orgId, { cover: d }); notify(t('Cover updated')); }} label={t('Drop a cover photo of your courts')} height={118} radius={14} />
              </div>
            </div>
          </div>

          <div className="sq-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, borderRadius: 16 }}>
            <SectionTitle>{t('Details')}</SectionTitle>
            <div><Label>{t(isClub ? 'Club name' : 'Academy name')}</Label><input style={fieldCss} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><Label>{t('Admin WhatsApp')}</Label><input style={fieldCss} value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="+20 100 585 1199" /></div>
              <div><Label>{t('Head coach WhatsApp')}</Label><input style={fieldCss} value={coachPhone} onChange={(e) => setCoachPhone(e.target.value)} placeholder="+20 10 1234 5678" /></div>
            </div>
            <div>
              <Label>{t('Google Maps link or address')}</Label>
              <input style={fieldCss} value={mapsUrl} onChange={(e) => setMapsUrl(e.target.value)} placeholder="https://maps.app.goo.gl/…" />
              <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--sq-text-3)' }}>{t('This is what puts you on the Discover map.')}</p>
            </div>
          </div>

          <div className="sq-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, borderRadius: 16 }}>
            <div>
              <SectionTitle>{t('Brand colour')}</SectionTitle>
              <p style={{ margin: '6px 0 0', fontSize: 12.5, color: 'var(--sq-text-3)' }}>{t('SERVE runs in your colour — here and in the players’ app.')}</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {BRAND_COLORS.map((c) => {
                const on = (org.accent || '#ef4a2e').toLowerCase() === c.hex.toLowerCase();
                return (
                  <button key={c.hex} onClick={() => { store.updateOrg(orgId, { accent: c.hex }); notify(`${t('Colour set to')} ${c.name}`); }} title={c.name}
                    style={{ width: 46, height: 46, borderRadius: 14, background: c.hex, cursor: 'pointer', border: 0, boxShadow: on ? `0 0 0 2px var(--sq-bg), 0 0 0 4px ${c.hex}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0e0b0a' }}>
                    {on && <Icons.Check size={19} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* live preview */}
        <div style={{ position: 'sticky', top: 0, alignSelf: 'start' }}>
          <div style={{ marginBottom: 14 }}><Eyebrow>{t('Players see this')} →</Eyebrow></div>
          <div className="sq-card" style={{ padding: 0, overflow: 'hidden', borderRadius: 18, border: `1px solid color-mix(in srgb, ${org.accent || 'var(--sq-gold)'} 26%, transparent)` }}>
            <div style={{ position: 'relative', height: 158 }}>
              <div className="sq-star-field" style={{ position: 'absolute', inset: 0 }} />
              {org.cover && <img src={org.cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 20%, var(--sq-surface) 100%)' }} />
              <span className="sq-chip gold" style={{ position: 'absolute', top: 14, insetInlineStart: 14 }}><span className="sq-live-dot" /> {t('Live courts')}</span>
            </div>
            <div style={{ padding: '0 20px 20px', marginTop: -36, position: 'relative' }}>
              <div style={{ width: 68, height: 68, borderRadius: 18, overflow: 'hidden', border: '3px solid var(--sq-surface)', background: 'var(--sq-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: org.accent || 'var(--sq-gold)' }}>
                {org.logo ? <img src={org.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (isClub ? <Icons.Club size={30} /> : <Icons.Trophy size={30} />)}
              </div>
              <h2 className="sq-display" style={{ margin: '14px 0 3px', fontSize: 24, fontWeight: 800, letterSpacing: '-0.035em' }}>{name || t(isClub ? 'Your club' : 'Your academy')}</h2>
              <div style={{ color: 'var(--sq-text-2)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}><Icons.Pin size={12} /> {city}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
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
  const pct = branchCourts ? (inUse / branchCourts) * 100 : 0;

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
    <div style={{
      width: SIDEBAR_W, flexShrink: 0, height: '100%',
      background: 'linear-gradient(180deg, color-mix(in srgb, var(--sq-gold) 7%, var(--sq-surface)), var(--sq-surface) 42%)',
      borderInlineEnd: '1px solid var(--sq-border)', display: 'flex', flexDirection: 'column', padding: '20px 14px',
    }}>
      <div style={{ padding: '4px 8px 20px' }}><SQLogo size={20} /></div>

      <button onClick={() => onNav('home')} style={{ padding: '12px 13px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'start', borderRadius: 14, background: 'var(--sq-surface-2)', border: '1px solid var(--sq-border)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, overflow: 'hidden', background: `color-mix(in srgb, ${org.accent || 'var(--sq-gold)'} 15%, transparent)`, border: `1px solid color-mix(in srgb, ${org.accent || 'var(--sq-gold)'} 28%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: org.accent || 'var(--sq-gold)' }}>
          {org.logo ? <img src={org.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (isClub ? <Icons.Club size={18} /> : <Icons.Trophy size={18} />)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sq-display" style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {org.name || t(isClub ? 'Your club' : 'Your academy')}
          </div>
          <div style={{ marginTop: 3 }}><Eyebrow>{t(isClub ? 'Club' : 'Academy')}</Eyebrow></div>
        </div>
      </button>

      {branches.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ padding: '0 10px 8px' }}><Eyebrow>{t('Branch')}</Eyebrow></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {branches.map((b) => {
              const on = b.id === branch;
              return (
                <button key={b.id} onClick={() => setBranch(b.id)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 10, cursor: 'pointer', textAlign: 'start', border: '1px solid ' + (on ? 'color-mix(in srgb, var(--sq-gold) 34%, transparent)' : 'transparent'), background: on ? 'color-mix(in srgb, var(--sq-gold) 10%, transparent)' : 'transparent', color: on ? 'var(--sq-gold)' : 'var(--sq-text-2)', fontFamily: 'var(--sq-body)' }}>
                  <Icons.Pin size={13} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: on ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>{b.courts}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ padding: '0 10px 9px' }}><Eyebrow>{t('Manage')}</Eyebrow></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map((it) => (
          <button key={it.id} className="sq-nav" data-on={it.id === active} onClick={() => onNav(it.id)}>
            {it.icon}<span style={{ flex: 1 }}>{t(it.label)}</span>
            {it.badge && <span style={{ fontSize: 11, color: it.id === active ? 'var(--sq-gold)' : 'var(--sq-text-3)' }}>{it.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div className="sq-card" style={{ padding: 15, borderRadius: 14, background: 'var(--sq-surface-2)', borderColor: 'color-mix(in srgb, var(--sq-gold) 18%, transparent)' }}>
        <Eyebrow tone="var(--sq-gold)">{t('Courts in use')}</Eyebrow>
        <div className="sq-display" style={{ fontSize: 26, fontWeight: 800, marginTop: 6, letterSpacing: '-0.04em' }}>
          {inUse} <span style={{ fontSize: 15, color: 'var(--sq-text-3)', fontWeight: 600 }}>{t('of')} {branchCourts}</span>
        </div>
        <div style={{ height: 5, borderRadius: 999, background: 'var(--sq-fill)', overflow: 'hidden', marginTop: 10 }}>
          <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', borderRadius: 999, background: 'var(--sq-gold)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="sq-btn-ghost" style={{ flex: 1, padding: '9px', fontSize: 11.5 }} onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
        <button className="sq-btn-ghost" style={{ flex: 1, padding: '9px', fontSize: 11.5, color: 'var(--sq-text-3)' }} onClick={async () => { await signOut(); window.location.reload(); }}>
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
      <div className="sq-app" style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--sq-bg)' }}>
        <Sidebar active={active} onNav={setActive} branches={branches} branch={activeBranch} setBranch={setBranch} orgId={orgId} orgType={orgType} />
        <div style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div key={active + activeBranch} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>
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
