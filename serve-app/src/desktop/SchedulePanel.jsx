// SchedulePanel.jsx — the schedule builder both consoles share (club + academy).
// Three ways to build a schedule:
//   · Manual — pick players, MULTIPLE days and MULTIPLE times; one session is
//     created per selected day × time (bulk), with the open-to-players option.
//   · Auto — pick a coach, block out the slots they don't work, pick players,
//     and SERVE places every session on a free court inside the coach's
//     availability, spread across the week.
//   · PDF — upload a schedule PDF; the table inside is converted to sessions
//     (unknown coaches are auto-created).

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../components/Icons';
import { useToast } from '../components/Toast';
import { DUR_FAST } from '../motion';
import { useStore, store } from '../store';
import { useT } from '../i18n';
import { parsePdfSchedule } from '../lib/pdfImport';
import { ROSTER, SESSION_TYPES, TIME_SLOTS, WEEK_DAYS } from '../data';

const DAY_IDS = WEEK_DAYS.map((d) => d[0]);
const fieldCss = { padding: '10px 12px', border: '1px solid var(--sq-border-2)', borderRadius: 8, background: 'rgba(255,255,255,0.02)', fontSize: 13.5, color: 'var(--sq-text)', outline: 'none', width: '100%', fontFamily: 'var(--sq-body)' };
const Label = ({ children }) => <label className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{children}</label>;

function Chip({ on, onClick, children, small }) {
  return (
    <button onClick={onClick} className={'sq-chip' + (on ? ' gold' : '')} style={{ cursor: 'pointer', padding: small ? '5px 9px' : '6px 11px', fontSize: small ? 11 : 12 }}>
      {on && <Icons.Check size={11} />}{children}
    </button>
  );
}

// which court numbers are taken at branch/day/time (existing + pending rows)
function busyCourts(sessions, pending, branch, day, time) {
  const taken = new Set();
  for (const s of sessions) if (s.branch === branch && s.day === day && s.time === time) taken.add(Number(s.court));
  for (const s of pending) if (s.day === day && s.time === time) taken.add(Number(s.court));
  return taken;
}

export default function SchedulePanel({ orgId, branch, branches, Topbar }) {
  const t = useT();
  const notify = useToast();
  const state = useStore();
  const coaches = state.staff.filter((s) => s.org_id === orgId);
  const branchCourts = state.courts.filter((c) => c.branch === branch);
  const courtNos = branchCourts.map((c) => c.court);
  const branchName = branches?.find((b) => b.id === branch)?.name || '';
  const mySessions = state.sessions.filter((s) => s.branch === branch);

  const [mode, setMode] = useState('manual'); // manual | auto | pdf

  // player pool: the demo club uses its roster; other orgs mix known player
  // cards with names the admin adds by hand
  const known = orgId === 'heliopolis'
    ? ROSTER.map((r) => r.name)
    : [...new Set(Object.values(state.playerCards || {}).map((c) => c.name).filter(Boolean))];
  const [extraNames, setExtraNames] = useState([]);
  const pool = [...new Set([...known, ...extraNames])];
  const [players, setPlayers] = useState([]);
  const [nameDraft, setNameDraft] = useState('');
  const togglePlayer = (n) => setPlayers((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  function addName() {
    const clean = nameDraft.trim();
    if (!clean) return;
    if (!pool.some((n) => n.toLowerCase() === clean.toLowerCase())) setExtraNames((xs) => [...xs, clean]);
    if (!players.some((n) => n.toLowerCase() === clean.toLowerCase())) setPlayers((p) => [...p, clean]);
    setNameDraft('');
  }

  // ── manual (bulk) ──────────────────────────────────────────────────
  const [coach, setCoach] = useState(coaches[0]?.name || '');
  const [court, setCourt] = useState(courtNos[0] || 1);
  const [days, setDays] = useState(['Wed']);
  const [times, setTimes] = useState(['17:00']);
  const [type, setType] = useState('Group training');
  const [title, setTitle] = useState('U17 Squad');
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState('250');
  const [spots, setSpots] = useState('8');
  const toggleIn = (set) => (v) => set((xs) => (xs.includes(v) ? xs.filter((x) => x !== v) : [...xs, v]));

  function addManual() {
    if (!days.length || !times.length) return notify('Pick at least one day and one time');
    if (!open && !players.length) return notify('Pick at least one player — or open the session to the app');
    const extra = open ? { open: true, price: Math.max(0, Number(price) || 0), spots: Math.max(players.length, Number(spots) || 8) } : {};
    let n = 0;
    for (const d of days) for (const tm of times) {
      store.addSession({ day: d, time: tm, type, title: title || type, coach, court, players, branch, mine: players.includes('Nour Hassan'), ...extra });
      n++;
    }
    notify(n === 1
      ? (open ? `${title || type} is live — players can join from the app` : `Added ${title || type}`)
      : `Added ${n} sessions (${days.join(' · ')} × ${times.join(' · ')})`);
    setPlayers([]);
  }

  // ── auto-schedule ──────────────────────────────────────────────────
  const [autoCoach, setAutoCoach] = useState(coaches[0]?.name || '');
  const [blocked, setBlocked] = useState(new Set()); // 'Mon|17:00'
  const [perPlayer, setPerPlayer] = useState('1');
  const [preview, setPreview] = useState(null); // null | rows[]
  const slotKey = (d, tm) => `${d}|${tm}`;
  const toggleBlock = (d, tm) => setBlocked((b) => {
    const next = new Set(b);
    const k = slotKey(d, tm);
    if (next.has(k)) next.delete(k); else next.add(k);
    return next;
  });

  function generate() {
    const picked = players;
    if (!picked.length) return notify('Pick the players to schedule');
    const coachName = autoCoach || coaches[0]?.name || 'Coach';
    const per = Math.max(1, Math.min(7, Number(perPlayer) || 1));
    // free slots in week order, skipping blocked ones
    const slots = [];
    for (const tm of TIME_SLOTS) for (const d of DAY_IDS) if (!blocked.has(slotKey(d, tm))) slots.push({ day: d, time: tm });
    // round-robin: walk the slots, giving each player one session per pass so
    // the week fills evenly instead of front-loading Monday
    const rows = [];
    const quota = new Map(picked.map((p) => [p, per]));
    let cursor = 0;
    for (let pass = 0; pass < per; pass++) {
      for (const p of picked) {
        if (!quota.get(p)) continue;
        let placed = false;
        for (let step = 0; step < slots.length && !placed; step++) {
          const sl = slots[(cursor + step) % slots.length];
          // the coach can only be in one place at a time
          if (rows.some((r) => r.day === sl.day && r.time === sl.time)) continue;
          if (mySessions.some((s) => s.day === sl.day && s.time === sl.time && s.coach === coachName)) continue;
          // one player, one session per day
          if (rows.some((r) => r.day === sl.day && r.players.includes(p))) continue;
          const taken = busyCourts(mySessions, rows, branch, sl.day, sl.time);
          const free = courtNos.find((c) => !taken.has(Number(c)));
          if (free == null) continue;
          rows.push({ day: sl.day, time: sl.time, coach: coachName, court: free, title: `${p.split(' ')[0]} · private`, type: 'Lesson', players: [p] });
          cursor = (cursor + step + 1) % slots.length;
          placed = true;
        }
        if (placed) quota.set(p, quota.get(p) - 1);
      }
    }
    if (!rows.length) return notify('No free slots left — unblock some times');
    setPreview(rows);
  }

  function commitAuto() {
    for (const r of preview) store.addSession({ ...r, branch, mine: false });
    notify(`Scheduled ${preview.length} session${preview.length !== 1 ? 's' : ''} for ${autoCoach || 'the coach'}`);
    setPreview(null);
    setPlayers([]);
  }

  // ── PDF import ─────────────────────────────────────────────────────
  const [importing, setImporting] = useState(false);
  async function onPdf(file) {
    if (!file) return;
    setImporting(true);
    try {
      const { rows, skipped } = await parsePdfSchedule(file);
      if (!rows.length) {
        notify(skipped ? `No usable rows (${skipped} skipped) — the PDF needs Day / Time / Coach columns` : "Couldn't read a schedule table in that PDF");
        return;
      }
      let newCoaches = 0;
      const knownCoaches = new Set(store.get().staff.filter((s) => s.org_id === orgId).map((s) => s.name.toLowerCase()));
      for (const r of rows) {
        if (!knownCoaches.has(r.coach.toLowerCase())) {
          store.addStaff(orgId, { name: r.coach, role: 'Coach' });
          knownCoaches.add(r.coach.toLowerCase());
          newCoaches++;
        }
        store.addSession({ ...r, branch, mine: false });
      }
      notify(`Imported ${rows.length} session${rows.length !== 1 ? 's' : ''}${newCoaches ? ` · added ${newCoaches} coach${newCoaches !== 1 ? 'es' : ''}` : ''}${skipped ? ` · ${skipped} row${skipped !== 1 ? 's' : ''} skipped` : ''}`);
    } catch (e) {
      console.error('PDF import failed:', e);
      notify("Couldn't read that PDF — is it a schedule export?");
    } finally {
      setImporting(false);
    }
  }

  const playerPicker = (
    <div>
      <Label>{t('Players')} ({players.length})</Label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {pool.map((n) => <Chip key={n} on={players.includes(n)} onClick={() => togglePlayer(n)}>{n}</Chip>)}
        {!pool.length && <span className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-3)' }}>No players yet — add names below.</span>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={{ ...fieldCss, flex: 1 }} value={nameDraft} placeholder={t('Add a player by name')} onChange={(e) => setNameDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addName()} />
        <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5 }} onClick={addName}>{t('Add')}</button>
      </div>
    </div>
  );

  const coachField = (value, set) => (
    coaches.length
      ? <select style={fieldCss} value={value} onChange={(e) => set(e.target.value)}>{coaches.map((c) => <option key={c.id}>{c.name}</option>)}</select>
      : <input style={fieldCss} value={value} onChange={(e) => set(e.target.value)} placeholder={t('Coach name')} />
  );

  return (
    <>
      <Topbar title={t('Schedule')} sub={t('Manual · auto · PDF import')} trailing={
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--sq-surface)', borderRadius: 8, border: '1px solid var(--sq-border)' }}>
          {[['manual', t('Manual')], ['auto', t('Auto-schedule')], ['pdf', t('PDF import')]].map(([id, label]) => (
            <button key={id} onClick={() => setMode(id)} style={{ padding: '7px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--sq-display)', fontWeight: 600, border: 0, cursor: 'pointer', background: id === mode ? 'var(--sq-gold)' : 'transparent', color: id === mode ? '#0e0b0a' : 'var(--sq-text-2)' }}>{label}</button>
          ))}
        </div>
      } />

      <div style={{ padding: '22px 30px 36px', display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>

              {mode === 'manual' && (
                <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{t('New sessions')}</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><Label>{t('Session type')}</Label>
                      <select style={fieldCss} value={type} onChange={(e) => setType(e.target.value)}>{SESSION_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                    </div>
                    <div><Label>{t('Title')}</Label><input style={fieldCss} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><Label>{t('Coach')}</Label>{coachField(coach, setCoach)}</div>
                    <div><Label>{t('Court')}</Label>
                      {courtNos.length
                        ? <select style={fieldCss} value={court} onChange={(e) => setCourt(Number(e.target.value))}>{courtNos.map((c) => <option key={c} value={c}>Court {c}</option>)}</select>
                        : <input style={fieldCss} type="number" min="1" value={court} onChange={(e) => setCourt(Number(e.target.value) || 1)} />}
                    </div>
                  </div>
                  <div><Label>{t('Days — pick as many as you need')}</Label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {DAY_IDS.map((d) => <Chip key={d} on={days.includes(d)} onClick={() => toggleIn(setDays)(d)}>{d}</Chip>)}
                    </div>
                  </div>
                  <div><Label>{t('Times — every day × time becomes a session')}</Label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {TIME_SLOTS.map((tm) => <Chip key={tm} on={times.includes(tm)} onClick={() => toggleIn(setTimes)(tm)}>{tm}</Chip>)}
                    </div>
                  </div>
                  {playerPicker}
                  <div style={{ borderTop: '1px solid var(--sq-border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button onClick={() => setOpen((v) => !v)} className={'sq-chip' + (open ? ' gold' : '')} style={{ cursor: 'pointer', padding: '9px 14px', fontSize: 12.5, width: 'fit-content' }}>
                      {open && <Icons.Check size={12} />} {t('Open to players — anyone can join from the app')}
                    </button>
                    {open && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><Label>{t('Price / player (EGP)')}</Label><input style={fieldCss} type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
                        <div><Label>{t('Max players')}</Label><input style={fieldCss} type="number" min="1" max="40" value={spots} onChange={(e) => setSpots(e.target.value)} /></div>
                      </div>
                    )}
                  </div>
                  <button className="sq-btn-gold serve-glow-soft" style={{ padding: '13px', fontSize: 14 }} onClick={addManual}>
                    Publish {days.length * times.length > 1 ? `${days.length * times.length} sessions` : 'session'} →
                  </button>
                </div>
              )}

              {mode === 'auto' && (
                <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{t('Auto-schedule')}</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--sq-text-3)' }}>Block the times the coach is NOT working, pick players, and SERVE fills the week — free courts, no clashes, spread evenly.</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><Label>{t('Coach')}</Label>{coachField(autoCoach, setAutoCoach)}</div>
                    <div><Label>{t('Sessions per player / week')}</Label><input style={fieldCss} type="number" min="1" max="7" value={perPlayer} onChange={(e) => setPerPlayer(e.target.value)} /></div>
                  </div>
                  <div>
                    <Label>Coach availability — tap the slots they DON'T work ({blocked.size} blocked)</Label>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ borderCollapse: 'separate', borderSpacing: 3 }}>
                        <thead>
                          <tr>
                            <th />
                            {DAY_IDS.map((d) => <th key={d} className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', fontWeight: 500, padding: '2px 4px' }}>{d}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {TIME_SLOTS.map((tm) => (
                            <tr key={tm}>
                              <td className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', paddingRight: 6 }}>{tm}</td>
                              {DAY_IDS.map((d) => {
                                const off = blocked.has(slotKey(d, tm));
                                return (
                                  <td key={d}>
                                    <button onClick={() => toggleBlock(d, tm)} title={`${d} ${tm}`}
                                      style={{ width: 34, height: 24, borderRadius: 6, cursor: 'pointer', border: '1px solid ' + (off ? 'color-mix(in srgb, var(--sq-danger) 45%, transparent)' : 'var(--sq-border)'), background: off ? 'color-mix(in srgb, var(--sq-danger) 22%, transparent)' : 'rgba(255,255,255,0.03)' }} />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {playerPicker}
                  <button className="sq-btn-gold serve-glow-soft" style={{ padding: '13px', fontSize: 14 }} onClick={generate}>{t('Generate schedule')} →</button>

                  {preview && (
                    <div style={{ borderTop: '1px solid var(--sq-border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preview · {preview.length} sessions</div>
                      {preview.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                          <span className="sq-mono" style={{ minWidth: 74, fontWeight: 600 }}>{r.day} {r.time}</span>
                          <span style={{ flex: 1 }}>{r.players[0]}</span>
                          <span className="sq-mono" style={{ color: 'var(--sq-text-3)', fontSize: 11 }}>Court {r.court}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="sq-btn-gold" style={{ padding: '11px 18px', fontSize: 13 }} onClick={commitAuto}>Add {preview.length} to schedule</button>
                        <button className="sq-btn-ghost" style={{ padding: '11px 16px', fontSize: 13 }} onClick={() => setPreview(null)}>{t('Discard')}</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mode === 'pdf' && (
                <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{t('Import a schedule PDF')}</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--sq-text-3)', lineHeight: 1.55 }}>
                      Upload the PDF of your schedule — the table inside becomes SERVE sessions on this branch. Columns it looks for: Day, Time, Coach, Court, Title, Type, Players. Coaches SERVE doesn't know yet are created automatically.
                    </p>
                  </div>
                  <label className="sq-card" style={{ padding: '36px 20px', textAlign: 'center', cursor: importing ? 'wait' : 'pointer', border: '1px dashed var(--sq-border-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <Icons.Upload size={26} />
                    <span className="sq-display" style={{ fontSize: 15, fontWeight: 600 }}>{importing ? 'Reading your PDF…' : 'Drop your schedule PDF here or click to browse'}</span>
                    <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>.pdf · exported from Excel, Sheets, Word or a scan with text</span>
                    <input type="file" accept="application/pdf,.pdf" style={{ display: 'none' }} disabled={importing}
                      onChange={(e) => { onPdf(e.target.files?.[0]); e.target.value = ''; }} />
                  </label>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* current schedule (this branch) */}
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>{branchName} · {mySessions.length}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {mySessions.map((s) => (
              <div key={s.id} className="sq-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="sq-mono" style={{ fontSize: 13, fontWeight: 600, minWidth: 64 }}>{s.day} {s.time}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sq-display" style={{ fontSize: 13.5, fontWeight: 600 }}>{s.title}</div>
                  <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>{s.coach} · Court {s.court} · {s.players.length} player{s.players.length !== 1 ? 's' : ''}</div>
                </div>
                <span className="sq-chip" style={{ fontSize: 9.5 }}>{s.type}</span>
                <button onClick={() => { const patch = s.open ? { open: false } : { open: true, price: s.price ?? Math.max(0, Number(price) || 0), spots: s.spots ?? Math.max(s.players.length, Number(spots) || 8) }; store.updateSession(s.id, patch); notify(s.open ? 'Session is now private' : `Open on the app · EGP ${patch.price}`); }}
                  className={'sq-chip' + (s.open ? ' gold' : '')} style={{ cursor: 'pointer', fontSize: 9.5 }} title={s.open ? 'Players can join from the app — click to make private' : 'Click to open this session to players on the app'}>
                  {s.open ? <>{t('Open')}{s.price ? ` · ${s.price}` : ''}</> : t('Private')}
                </button>
                <button onClick={() => { store.removeSession(s.id); notify('Removed'); }} style={{ background: 'none', border: 0, color: 'var(--sq-text-3)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            ))}
            {!mySessions.length && <div className="sq-card" style={{ padding: 18, textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 12.5 }}>{t('Nothing scheduled on this branch yet.')}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
