// CoachConsole.jsx — club squash-coordinator console (Heliopolis SC).
// Live court board (editable → reflects in the player app), a mix-and-match
// schedule builder, members, coaches, access codes, and an editable club
// profile (incl. brand colour, which re-themes the whole platform).

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../../components/Icons';
import SQLogo from '../../components/SQLogo';
import ThemeScope from '../../components/ThemeScope';
import ImgPlaceholder from '../../components/ImgPlaceholder';
import UploadSlot from '../../components/UploadSlot';
import ClubCrest from '../../components/ClubCrest';
import { ToastProvider, useToast } from '../../components/Toast';
import BranchesPanel from '../BranchesPanel';
import { parseSchedule } from '../../lib/scheduleImport';
import { DUR_FAST } from '../../motion';
import { useStore, store } from '../../store';
import { useT } from '../../i18n';
import { signOut } from '../../lib/auth';
import { CLUB, ROSTER, CODES, randomCode, SESSION_TYPES, TIME_SLOTS, WEEK_DAYS, BRAND_COLORS } from '../../data';

const SIDEBAR_W = 240;

// crest badge (shows the uploaded image from the store when present)
const Crest = ClubCrest;

function Sidebar({ active, onNav, branches = [], branch, setBranch }) {
  const state = useStore();
  const t = useT();
  const coachCount = state.staff.filter((s) => s.org_id === 'heliopolis').length;
  const items = [
    { id: 'board', icon: <Icons.Activity size={16} />, label: 'Live courts' },
    { id: 'schedule', icon: <Icons.Calendar size={16} />, label: 'Schedule builder' },
    { id: 'members', icon: <Icons.Users size={16} />, label: 'Members', badge: String(ROSTER.length) },
    { id: 'coaches', icon: <Icons.Trophy size={16} />, label: 'Coaches', badge: String(coachCount) },
    { id: 'codes', icon: <Icons.Ticket size={16} />, label: 'Access codes' },
    { id: 'branches', icon: <Icons.Pin size={16} />, label: 'Branches', badge: String(branches.length) },
    { id: 'profile', icon: <Icons.Settings size={16} />, label: 'Club profile' },
  ];
  const inUse = state.courts.filter((c) => c.branch === branch && c.status !== 'free').length;
  const branchCourts = state.courts.filter((c) => c.branch === branch).length;
  return (
    <div style={{ width: SIDEBAR_W, flexShrink: 0, height: '100%', background: '#0a0a0a', borderRight: '1px solid var(--sq-border)', display: 'flex', flexDirection: 'column', padding: '18px 12px' }}>
      <div style={{ padding: '4px 8px 16px' }}><SQLogo size={20} accent /></div>
      <div className="sq-card" style={{ padding: '10px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Crest size={32} radius={8} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sq-display" style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.1 }}>{state.clubName || CLUB.short}</div>
          <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', letterSpacing: '0.04em' }}>Squash · Cairo</div>
        </div>
        <Icons.Chevron size={12} dir="down" />
      </div>
      {branches.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="sq-mono" style={{ padding: '2px 10px 6px', fontSize: 9, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('Branch')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {branches.map((b) => (
              <button key={b.id} onClick={() => setBranch(b.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, cursor: 'pointer', textAlign: 'left', border: '1px solid ' + (b.id === branch ? 'color-mix(in srgb, var(--sq-gold) 40%, transparent)' : 'transparent'), background: b.id === branch ? 'color-mix(in srgb, var(--sq-gold) 10%, transparent)' : 'transparent', color: b.id === branch ? 'var(--sq-gold)' : 'var(--sq-text-2)', fontFamily: 'var(--sq-body)' }}>
                <Icons.Pin size={13} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: b.id === branch ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                </div>
                <span className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)' }}>{b.courts}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="sq-mono" style={{ padding: '8px 10px 6px', fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('Section')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => (
          <button key={it.id} onClick={() => onNav(it.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: it.id === active ? 'color-mix(in srgb, var(--sq-gold) 8%, transparent)' : 'transparent', color: it.id === active ? 'var(--sq-gold)' : 'var(--sq-text-2)', fontSize: 13, fontWeight: it.id === active ? 500 : 400, position: 'relative', border: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--sq-body)' }}>
            {it.id === active && <span style={{ position: 'absolute', left: -12, top: 8, bottom: 8, width: 2, borderRadius: 1, background: 'var(--sq-gold)' }} />}
            {it.icon}<span style={{ flex: 1 }}>{t(it.label)}</span>
            {it.badge && <span className="sq-mono" style={{ fontSize: 10, color: it.id === active ? 'var(--sq-gold)' : 'var(--sq-text-3)' }}>{it.badge}</span>}
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div className="sq-card" style={{ padding: 12, background: 'linear-gradient(135deg, color-mix(in srgb, var(--sq-gold) 10%, transparent), transparent)', borderColor: 'color-mix(in srgb, var(--sq-gold) 20%, transparent)' }}>
        <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-gold)', letterSpacing: '0.1em' }}>COURTS IN USE</div>
        <div className="sq-display" style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{inUse} of {branchCourts}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px 2px' }}>
        <div style={{ width: 28, height: 28, borderRadius: 14, background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>MR</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500 }}>Coach Mohamed Reda</div>
          <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)' }}>Squash coordinator</div>
        </div>
      </div>
      <button className="sq-btn-ghost" style={{ margin: '8px 8px 0', padding: '8px', fontSize: 11.5, color: 'var(--sq-text-3)' }}
        onClick={async () => { await signOut(); window.location.reload(); }}>
        {t('Log out')}
      </button>
    </div>
  );
}

function Topbar({ title, sub, trailing }) {
  return (
    <div style={{ padding: '20px 30px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--sq-border)' }}>
      <div>
        {sub && <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>{sub}</div>}
        <h1 className="sq-display" style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: '-0.025em' }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{trailing}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = { active: 'green', pending: 'gold', redeemed: 'green', sent: 'blue', open: 'gold' };
  const label = { active: 'Active', pending: 'Pending', redeemed: 'Redeemed', sent: 'Sent', open: 'Unused' }[status] || status;
  const cls = map[status];
  const extra = cls === 'blue' ? { color: 'var(--sq-blue)', borderColor: 'rgba(78,168,255,0.25)', background: 'rgba(78,168,255,0.1)' } : cls === 'green' ? { color: 'var(--sq-green)', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.1)' } : {};
  return <span className={'sq-chip ' + (cls === 'gold' ? 'gold' : '')} style={{ padding: '3px 10px', fontSize: 10.5, ...extra }}>{label}</span>;
}

// ── Live courts (editable → reflects in the player app) ──────────────
function CourtCard({ c }) {
  const notify = useToast();
  const free = c.status === 'free';
  const ring = c.status === 'lesson' ? 'var(--sq-gold)' : c.status === 'booked' ? 'var(--sq-gold)' : c.status === 'playing' ? 'var(--sq-green)' : 'var(--sq-border-2)';
  const label = { lesson: 'Lesson', playing: 'In play', booked: 'Booked', free: 'Open' }[c.status];
  return (
    <motion.div
      animate={free ? {} : { boxShadow: [`0 0 0 0 color-mix(in srgb, ${ring} 0%, transparent)`, `0 0 16px 1px color-mix(in srgb, ${ring} 24%, transparent)`, `0 0 0 0 color-mix(in srgb, ${ring} 0%, transparent)`] }}
      transition={free ? undefined : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ borderRadius: 16, padding: 16, minHeight: 168, display: 'flex', flexDirection: 'column', gap: 10, background: free ? 'var(--sq-surface)' : `linear-gradient(155deg, color-mix(in srgb, ${ring} 12%, var(--sq-surface)), var(--sq-surface) 65%)`, border: '1px solid ' + (free ? 'var(--sq-border)' : `color-mix(in srgb, ${ring} 30%, transparent)`) }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="sq-display" style={{ fontSize: 18, fontWeight: 700 }}>Court {c.court}</div>
        <span className={'sq-chip ' + (c.status === 'lesson' || c.status === 'booked' ? 'gold' : '')} style={c.status === 'playing' ? { fontSize: 10, color: 'var(--sq-green)', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.1)' } : { fontSize: 10 }}>
          {c.status === 'playing' && <span className="sq-live-dot" style={{ background: 'var(--sq-green)' }} />}{label}
        </span>
      </div>
      <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>{c.type}</div>
      <div style={{ flex: 1 }}>
        {free ? (
          <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>Next · {c.next || 'open'}</div>
        ) : (
          <>
            <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{c.who}</div>
            {c.coach && <div style={{ fontSize: 12, color: 'var(--sq-text-2)', marginTop: 2 }}>{c.coach}</div>}
          </>
        )}
      </div>
      {free ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="sq-btn-ghost" style={{ flex: 1, padding: '8px', fontSize: 12 }} onClick={() => { store.setCourt(c.branch, c.court, { status: 'playing', who: 'Members match', coach: null, until: '—', left: 45 }); notify(`Court ${c.court} marked busy`); }}>Mark busy</button>
          <button className="sq-btn-ghost" title="Remove court" style={{ padding: '8px 11px', fontSize: 13, color: 'var(--sq-text-3)' }} onClick={() => { store.removeCourt(c.branch, c.court); notify(`Court ${c.court} removed`); }}>×</button>
        </div>
      ) : (
        <button className="sq-btn-ghost" style={{ padding: '8px', fontSize: 12 }} onClick={() => { store.freeCourt(c.branch, c.court); notify(`Court ${c.court} freed`); }}>Free up</button>
      )}
    </motion.div>
  );
}

function LiveCourts({ branch, branches }) {
  const notify = useToast();
  const state = useStore();
  const branchCourts = state.courts.filter((c) => c.branch === branch);
  const inUse = branchCourts.filter((c) => c.status !== 'free').length;
  const branchName = branches?.find((b) => b.id === branch)?.name || '';
  const cancels = state.cancellations.filter((c) => c.status === 'cancelled').slice(-4).reverse();
  return (
    <>
      <Topbar title="Live courts" sub={branchName ? `${branchName} · syncs to the app` : 'Wednesday · 14 May 2026 · 16:33'} trailing={
        <>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--sq-text-3)' }}><span className="sq-live-dot" /> Live · syncs to the app</span>
          <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5 }} onClick={() => { store.addCourt(branch); notify('Court added'); }}><Icons.Plus size={13} style={{ marginRight: 6, verticalAlign: -2 }} /> Add court</button>
          <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5 }} onClick={() => { store.reset(); notify('Board reset'); }}>Reset board</button>
        </>
      } />
      <div style={{ padding: '22px 30px 36px' }}>
        {cancels.length > 0 && (
          <div className="sq-card" style={{ padding: '12px 16px', marginBottom: 16, borderColor: 'color-mix(in srgb, var(--sq-danger) 30%, transparent)', background: 'color-mix(in srgb, var(--sq-danger) 6%, var(--sq-surface))' }}>
            <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-danger)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7 }}><Icons.Calendar size={13} /> Session cancellations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {cancels.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                  <span style={{ fontWeight: 600 }}>{c.session_title}</span>
                  <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{c.player}{c.coach ? ` · ${c.coach}` : ''}{c.reason ? ` · "${c.reason}"` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, fontSize: 12.5, color: 'var(--sq-text-2)' }}>
          <span className="sq-mono" style={{ color: 'var(--sq-gold)' }}>{inUse} of {branchCourts.length} courts in use</span>
          <span style={{ color: 'var(--sq-text-3)' }}>· {branchName} · toggle a court and watch it update live in the player app</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {branchCourts.map((c) => <CourtCard key={c.branch + c.court} c={c} />)}
        </div>
      </div>
    </>
  );
}

// ── Schedule builder (mix & match) ───────────────────────────────────
function ScheduleBuilder({ branch, branches }) {
  const notify = useToast();
  const state = useStore();
  const coaches = state.staff.filter((s) => s.org_id === 'heliopolis');
  const branchCourts = state.courts.filter((c) => c.branch === branch);
  const branchName = branches?.find((b) => b.id === branch)?.name || '';
  const [coach, setCoach] = useState(coaches[0]?.name || '');
  const [court, setCourt] = useState(branchCourts[0]?.court || 1);
  const [day, setDay] = useState('Wed');
  const [time, setTime] = useState('17:00');
  const [type, setType] = useState('Group training');
  const [title, setTitle] = useState('U17 Squad');
  const [players, setPlayers] = useState([]);

  const toggle = (n) => setPlayers((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  function add() {
    if (!players.length) return notify('Pick at least one player');
    store.addSession({ day, time, type, title: title || type, coach, court, players, branch, mine: players.includes('Nour Hassan') });
    notify(`Added ${title} → published to ${players.length} player${players.length > 1 ? 's' : ''}`);
    setPlayers([]);
  }

  // smart import — paste a whole schedule; unknown coaches are auto-created
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');
  function runImport() {
    const { rows, skipped } = parseSchedule(importText);
    if (!rows.length) return notify(skipped ? `No valid rows (${skipped} skipped) — check the format` : 'Paste your schedule first');
    let newCoaches = 0;
    const known = new Set(store.get().staff.filter((s) => s.org_id === 'heliopolis').map((s) => s.name.toLowerCase()));
    for (const r of rows) {
      if (!known.has(r.coach.toLowerCase())) {
        store.addStaff('heliopolis', { name: r.coach, role: 'Coach' });
        known.add(r.coach.toLowerCase());
        newCoaches++;
      }
      store.addSession({ ...r, branch, mine: false });
    }
    notify(`Imported ${rows.length} session${rows.length !== 1 ? 's' : ''}${newCoaches ? ` · added ${newCoaches} coach${newCoaches !== 1 ? 'es' : ''}` : ''}${skipped ? ` · ${skipped} row${skipped !== 1 ? 's' : ''} skipped` : ''}`);
    setImportText(''); setImporting(false);
  }
  const fieldCss = { padding: '10px 12px', border: '1px solid var(--sq-border-2)', borderRadius: 8, background: 'rgba(255,255,255,0.02)', fontSize: 13.5, color: 'var(--sq-text)', outline: 'none', width: '100%' };
  const Label = ({ children }) => <label className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{children}</label>;

  return (
    <>
      <Topbar title="Schedule builder" sub="Mix & match · publishes straight to players" trailing={
        <>
          <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5 }} onClick={() => setImporting((v) => !v)}><Icons.Upload size={13} style={{ marginRight: 6, verticalAlign: -2 }} /> Smart import</button>
          <button className="sq-btn-gold" style={{ padding: '9px 18px', fontSize: 12.5 }} onClick={add}><Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Add to schedule</button>
        </>
      } />
      <AnimatePresence>
        {importing && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: DUR_FAST }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 30px 0' }}>
              <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <h2 className="sq-display" style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Smart import</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--sq-text-3)' }}>Paste your schedule (from Excel, Sheets, or CSV). Columns: Day, Time, Coach, Court, Title, Type, Players. Coaches SERVE doesn't know yet are created automatically.</p>
                </div>
                <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={6}
                  placeholder={'Day, Time, Coach, Court, Title, Type, Players\nMon, 17:00, Ali Ashmawy, 3, U15 Squad, Group training, Nour Hassan; Taha Ibrahim\nWed, 18:30, Karim Darwish, 1, Private lesson, Lesson, Mohamed Rostom'}
                  style={{ resize: 'vertical', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--sq-border-2)', background: 'rgba(255,255,255,0.02)', color: 'var(--sq-text)', fontFamily: 'var(--sq-mono)', fontSize: 12, outline: 'none', lineHeight: 1.6 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="sq-btn-gold" style={{ padding: '11px 18px', fontSize: 13 }} onClick={runImport}>Import schedule</button>
                  <button className="sq-btn-ghost" style={{ padding: '11px 16px', fontSize: 13 }} onClick={() => setImporting(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ padding: '22px 30px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* builder */}
        <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>New session</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><Label>Session type</Label>
              <select style={fieldCss} value={type} onChange={(e) => setType(e.target.value)}>{SESSION_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div><Label>Title</Label><input style={fieldCss} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div><Label>Coach</Label><select style={fieldCss} value={coach} onChange={(e) => setCoach(e.target.value)}>{coaches.map((c) => <option key={c.id}>{c.name}</option>)}</select></div>
            <div><Label>Court</Label><select style={fieldCss} value={court} onChange={(e) => setCourt(Number(e.target.value))}>{branchCourts.map((c) => <option key={c.court} value={c.court}>Court {c.court}</option>)}</select></div>
            <div><Label>Day</Label><select style={fieldCss} value={day} onChange={(e) => setDay(e.target.value)}>{WEEK_DAYS.map((d) => <option key={d[0]}>{d[0]}</option>)}</select></div>
          </div>
          <div><Label>Time</Label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TIME_SLOTS.map((t) => <button key={t} onClick={() => setTime(t)} className="sq-mono" style={{ padding: '7px 11px', borderRadius: 8, fontSize: 12, cursor: 'pointer', border: '1px solid ' + (t === time ? 'transparent' : 'var(--sq-border)'), background: t === time ? 'var(--sq-gold)' : 'var(--sq-surface)', color: t === time ? '#0a0a0a' : 'var(--sq-text-2)' }}>{t}</button>)}
            </div>
          </div>
          <div><Label>Players ({players.length} selected)</Label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ROSTER.map((r) => {
                const on = players.includes(r.name);
                return <button key={r.name} onClick={() => toggle(r.name)} className={'sq-chip' + (on ? ' gold' : '')} style={{ cursor: 'pointer', padding: '6px 11px', fontSize: 12 }}>{on && <Icons.Check size={11} />}{r.name}</button>;
              })}
            </div>
          </div>
          <button className="sq-btn-gold serve-glow-soft" style={{ padding: '13px', fontSize: 14 }} onClick={add}>Publish session →</button>
        </div>

        {/* current schedule (this branch) */}
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>{branchName} · {state.sessions.filter((s) => s.branch === branch).length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {state.sessions.filter((s) => s.branch === branch).map((s) => (
              <div key={s.id} className="sq-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="sq-mono" style={{ fontSize: 13, fontWeight: 600, minWidth: 64 }}>{s.day} {s.time}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sq-display" style={{ fontSize: 13.5, fontWeight: 600 }}>{s.title}</div>
                  <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>{s.coach} · Court {s.court} · {s.players.length} player{s.players.length !== 1 ? 's' : ''}</div>
                </div>
                <span className="sq-chip" style={{ fontSize: 9.5 }}>{s.type}</span>
                <button onClick={() => { store.removeSession(s.id); notify('Removed'); }} style={{ background: 'none', border: 0, color: 'var(--sq-text-3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Members ──────────────────────────────────────────────────────────
function Members() {
  const notify = useToast();
  const [filter, setFilter] = useState('all');
  const counts = { all: ROSTER.length, active: ROSTER.filter((m) => m.status === 'active').length, pending: ROSTER.filter((m) => m.status === 'pending').length };
  const segs = [['all', 'All members'], ['active', 'Active'], ['pending', 'Pending']];
  const rows = filter === 'all' ? ROSTER : ROSTER.filter((m) => m.status === filter);
  const GRID = '2.4fr 1.3fr 1fr 1.6fr';
  return (
    <>
      <Topbar title="Members" sub={`${ROSTER.length} on SERVE · squash section`} trailing={<button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('Invite members')}><Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Invite members</button>} />
      <div style={{ padding: '20px 30px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {segs.map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: filter === id ? 'var(--sq-surface-2)' : 'transparent', border: '1px solid ' + (filter === id ? 'var(--sq-border-2)' : 'var(--sq-border)'), color: filter === id ? 'var(--sq-text)' : 'var(--sq-text-2)', fontSize: 13, fontWeight: filter === id ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--sq-body)' }}>{label}<span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>{counts[id]}</span></button>
          ))}
        </div>
        <div className="sq-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--sq-border)', background: 'rgba(255,255,255,0.015)' }}>
            {['Member', 'Squad', 'Status', 'Last seen'].map((h) => <span key={h} className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>)}
          </div>
          {rows.map((m, i) => (
            <div key={m.name} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '13px 20px', alignItems: 'center', borderBottom: i < rows.length - 1 ? '1px solid var(--sq-border)' : 'none', cursor: 'pointer' }} onClick={() => notify(`Opened ${m.name}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: 'linear-gradient(135deg, #2a2a2a, #161616)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 600, flexShrink: 0 }}>{m.initials}</div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.name}</div>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--sq-text-2)' }}>{m.group}</span>
              <div><StatusPill status={m.status} /></div>
              <span style={{ fontSize: 12, color: m.last === 'On court now' ? 'var(--sq-green)' : 'var(--sq-text-3)' }}>{m.last}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Coaches (add / remove → persists to Supabase) ────────────────────
function CoachesTab() {
  const notify = useToast();
  const state = useStore();
  const coaches = state.staff.filter((s) => s.org_id === 'heliopolis');
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Coach');
  const [squads, setSquads] = useState('');
  const fieldCss = { padding: '10px 12px', border: '1px solid var(--sq-border-2)', borderRadius: 8, background: 'rgba(255,255,255,0.02)', fontSize: 13.5, color: 'var(--sq-text)', outline: 'none', width: '100%', fontFamily: 'var(--sq-body)' };
  const Label = ({ children }) => <label className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{children}</label>;

  function submit() {
    if (!name.trim()) return notify('Enter a name');
    store.addStaff('heliopolis', { name, role, squads });
    notify(`Added ${name.trim()}`);
    setName(''); setRole('Coach'); setSquads(''); setAdding(false);
  }
  return (
    <>
      <Topbar title="Coaches" sub="Squash section staff" trailing={<button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => setAdding((v) => !v)}><Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Add coach</button>} />
      <div style={{ padding: '24px 30px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <AnimatePresence>
          {adding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: DUR_FAST }} style={{ overflow: 'hidden' }}>
              <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 }}>
                <h2 className="sq-display" style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>New coach</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
                  <div><Label>Name</Label><input autoFocus style={fieldCss} value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Coach name" /></div>
                  <div><Label>Role</Label><input style={fieldCss} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Head Coach" /></div>
                </div>
                <div><Label>Squads</Label><input style={fieldCss} value={squads} onChange={(e) => setSquads(e.target.value)} placeholder="e.g. U15 · U17" /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="sq-btn-gold" style={{ padding: '10px 18px', fontSize: 13 }} onClick={submit}>Add coach</button>
                  <button className="sq-btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }} onClick={() => setAdding(false)}>Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {coaches.map((c) => (
            <div key={c.id} className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: 'linear-gradient(135deg, #2a2a2a, #161616)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>{c.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sq-display" style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</div>
                  <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)' }}>{c.role}</div>
                </div>
              </div>
              {c.squads && <div style={{ fontSize: 11.5, color: 'var(--sq-text-2)', paddingTop: 10, borderTop: '1px solid var(--sq-border)' }}>{c.squads}</div>}
              <button className="sq-btn-ghost" style={{ padding: '8px', fontSize: 12, color: 'var(--sq-text-3)' }} onClick={() => { store.removeStaff(c.id); notify(`Removed ${c.name}`); }}>Remove coach</button>
            </div>
          ))}
          {!coaches.length && <div className="sq-mono" style={{ fontSize: 12.5, color: 'var(--sq-text-3)' }}>No coaches yet — add one above.</div>}
        </div>
      </div>
    </>
  );
}

// ── Access codes ─────────────────────────────────────────────────────
function AccessCodes() {
  const notify = useToast();
  const [single, setSingle] = useState('K5R2WQ');
  const [codes, setCodes] = useState(CODES);
  const GRID = '1.2fr 1.6fr 1fr 1.4fr 0.8fr';
  function copy(code) { try { navigator.clipboard?.writeText(code); } catch (e) { /* ignore */ } notify(`Copied ${code}`); }
  function generate() { const c = randomCode(); setSingle(c); setCodes((cs) => [{ code: c, to: null, status: 'open', when: 'Just now', via: null }, ...cs]); notify(`Generated ${c}`); }
  return (
    <>
      <Topbar title="Access codes" sub="Invite members to SERVE" trailing={<button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={generate}><Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Generate code</button>} />
      <div style={{ padding: '22px 30px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="sq-card serve-glow-soft" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
          <div><div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Single code</div>
            <h2 className="sq-display" style={{ margin: '6px 0 0', fontSize: 16, fontWeight: 600 }}>Issue to one member</h2></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 18px', borderRadius: 13, background: 'var(--sq-bg)', border: '1px dashed var(--sq-border-2)' }}>
            <span className="sq-mono" style={{ fontSize: 28, fontWeight: 600, letterSpacing: '0.22em', color: 'var(--sq-gold)' }}>{single}</span>
            <button className="sq-btn-ghost" style={{ padding: '8px 12px', fontSize: 12 }} onClick={() => copy(single)}><Icons.Copy size={13} /> Copy</button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="sq-btn-gold" style={{ flex: 1, padding: '12px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => notify(`Sent ${single} via WhatsApp`)}><Icons.Chat size={15} /> Send via WhatsApp</button>
            <button className="sq-btn-ghost" style={{ padding: '12px 16px', fontSize: 13 }} onClick={() => notify(`Sent ${single} via SMS`)}>SMS</button>
          </div>
          <p style={{ margin: 0, fontSize: 11.5, color: 'var(--sq-text-3)', lineHeight: 1.5 }}>Members redeem this in the SERVE app to unlock the club.</p>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Issued codes</h2>
            <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{codes.length} total</span>
          </div>
          <div className="sq-card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--sq-border)', background: 'rgba(255,255,255,0.015)' }}>
              {['Code', 'Assigned to', 'Status', 'Activity', 'Action'].map((h) => <span key={h} className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>)}
            </div>
            {codes.map((c, i) => (
              <div key={c.code + i} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '13px 20px', alignItems: 'center', borderBottom: i < codes.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
                <span className="sq-mono" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.1em' }}>{c.code}</span>
                <span style={{ fontSize: 13, color: c.to ? 'var(--sq-text)' : 'var(--sq-text-3)' }}>{c.to || 'Unassigned'}</span>
                <div><StatusPill status={c.status} /></div>
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

// ── Club profile (logo + cover + name + brand colour) ────────────────
function ClubProfile() {
  const notify = useToast();
  const state = useStore();
  const [name, setName] = useState(state.clubName || CLUB.name);
  const cc = state.contacts?.heliopolis || {};
  const [ownerPhone, setOwnerPhone] = useState(cc.owner || '');
  const [coachPhone, setCoachPhone] = useState(cc.coach || '');
  const fieldCss = { padding: '11px 13px', border: '1px solid var(--sq-border-2)', borderRadius: 9, background: 'rgba(255,255,255,0.02)', fontSize: 14, color: 'var(--sq-text)', outline: 'none', width: '100%', fontFamily: 'var(--sq-body)' };
  const Label = ({ children }) => <label className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{children}</label>;
  function save() { store.setOrgName('club', name); store.setContact('heliopolis', { owner: ownerPhone, coach: coachPhone }); notify('Profile saved'); }
  return (
    <>
      <Topbar title="Club profile" sub="Branding · public page" trailing={<button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={save}>Save changes</button>} />
      <div style={{ padding: '24px 30px 40px', display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, maxWidth: 1000 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Brand · crest & cover</h2>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: 110, flexShrink: 0 }}>
                <Label>Crest / logo</Label>
                <UploadSlot value={state.images.clubCrest} onChange={(d) => { store.setImage('clubCrest', d); notify('Crest updated'); }} label="Drop crest" height={110} radius={16} maxDim={512} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Label>Cover photo</Label>
                <UploadSlot value={state.images.clubCover} onChange={(d) => { store.setImage('clubCover', d); notify('Cover updated'); }} label="Drop a cover photo of your courts" height={110} radius={12} />
              </div>
            </div>
          </div>
          <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Details</h2>
            <div><Label>Club name</Label><input style={fieldCss} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><Label>Admin WhatsApp</Label><input style={fieldCss} value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} placeholder="+20 100 585 1199" /></div>
              <div><Label>Head coach WhatsApp</Label><input style={fieldCss} value={coachPhone} onChange={(e) => setCoachPhone(e.target.value)} placeholder="+20 10 1234 5678" /></div>
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--sq-text-3)', lineHeight: 1.5 }}>Members can message you here, and you'll be notified when a session is cancelled.</p>
          </div>
          <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Brand colour</h2>
              <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--sq-text-3)' }}>SERVE runs in your colour — across this console and your members' app.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              {BRAND_COLORS.map((c) => {
                const on = state.clubTheme.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button key={c.hex} onClick={() => { store.setClubTheme(c.hex); notify(`Theme set to ${c.name}`); }} title={c.name}
                    style={{ width: 44, height: 44, borderRadius: 12, background: c.hex, cursor: 'pointer', border: 0, boxShadow: on ? `0 0 0 2px var(--sq-bg), 0 0 0 4px ${c.hex}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0a0a' }}>
                    {on && <Icons.Check size={18} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* live preview — mirrors what members see on the app */}
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Members see this →</div>
          <div className="sq-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 150 }}>
              {state.images.clubCover ? <img src={state.images.clubCover} alt="" style={{ width: '100%', height: 150, objectFit: 'cover' }} /> : <ImgPlaceholder label="cover" height={150} radius={0} hue="gold" style={{ borderRadius: 0, border: 0 }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(7,7,7,0.95) 100%)' }} />
              <span className="sq-chip gold" style={{ position: 'absolute', top: 12, left: 12 }}><span className="sq-live-dot" /> Live courts</span>
            </div>
            <div style={{ padding: '0 18px 18px', marginTop: -34, position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', border: '2px solid var(--sq-bg)' }}><Crest size={64} radius={16} /></div>
              <h2 className="sq-display" style={{ margin: '12px 0 2px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{name}</h2>
              <div style={{ color: 'var(--sq-text-2)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}><Icons.Pin size={12} /> {CLUB.city}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <span className="sq-chip gold" style={{ fontSize: 11 }}>Members only</span>
                <span className="sq-chip" style={{ fontSize: 11 }}>{state.courts.length} courts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Branches (locations) — shared panel ─────────────────────────────
function Branches() {
  return <BranchesPanel orgId="heliopolis" Topbar={Topbar} />;
}

const SECTIONS = { board: LiveCourts, schedule: ScheduleBuilder, members: Members, coaches: CoachesTab, codes: AccessCodes, branches: Branches, profile: ClubProfile };

function ConsoleInner() {
  const state = useStore();
  const [active, setActive] = useState('board');
  const clubBranches = state.branches.filter((b) => b.org_id === 'heliopolis');
  const [branch, setBranch] = useState(clubBranches[0]?.id || null);
  // keep the active branch valid as branches change
  const activeBranch = clubBranches.some((b) => b.id === branch) ? branch : (clubBranches[0]?.id || null);
  const Section = SECTIONS[active] || LiveCourts;
  return (
    <ThemeScope accent={state.clubTheme}>
      <div className="sq-app" style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
        <Sidebar active={active} onNav={setActive} branches={clubBranches} branch={activeBranch} setBranch={setBranch} />
        <div style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div key={active + activeBranch} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>
              <Section branch={activeBranch} branches={clubBranches} onNav={setActive} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ThemeScope>
  );
}

export default function CoachConsole() {
  return (
    <ToastProvider>
      <ConsoleInner />
    </ToastProvider>
  );
}
