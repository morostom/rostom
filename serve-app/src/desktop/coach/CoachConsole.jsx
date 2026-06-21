// CoachConsole.jsx — the club squash-coordinator's desktop console (Heliopolis
// SC). Every tab routes to real content; member filters, code copy/generate,
// and CTAs are interactive with toast feedback. Occupied courts pulse.

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../../components/Icons';
import SQLogo from '../../components/SQLogo';
import { ToastProvider, useToast } from '../../components/Toast';
import { DUR_FAST } from '../../motion';
import { CLUB, COURTS, SCHEDULE, MEMBERS, CODES, ADMIN_COACHES, randomCode } from '../../data';

const SIDEBAR_W = 240;

function ClubCrest({ size = 32, radius = 8 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, background: 'var(--sq-surface-2)', border: '1px solid var(--sq-border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-gold)' }}>
      <Icons.Club size={size * 0.55} />
    </div>
  );
}

function Sidebar({ active, onNav }) {
  const items = [
    { id: 'board', icon: <Icons.Activity size={16} />, label: 'Live courts' },
    { id: 'members', icon: <Icons.Users size={16} />, label: 'Members', badge: '186' },
    { id: 'codes', icon: <Icons.Ticket size={16} />, label: 'Access codes', badge: '2' },
    { id: 'sheet', icon: <Icons.Calendar size={16} />, label: 'Lesson sheet' },
    { id: 'coaches', icon: <Icons.Trophy size={16} />, label: 'Coaches' },
    { id: 'renewals', icon: <Icons.Wallet size={16} />, label: 'Renewals' },
  ];
  return (
    <div style={{ width: SIDEBAR_W, flexShrink: 0, height: '100%', background: '#0a0a0a', borderRight: '1px solid var(--sq-border)', display: 'flex', flexDirection: 'column', padding: '18px 12px' }}>
      <div style={{ padding: '4px 8px 16px' }}><SQLogo size={20} accent /></div>
      <div className="sq-card" style={{ padding: '10px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ClubCrest size={32} radius={8} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sq-display" style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.1 }}>{CLUB.short}</div>
          <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', letterSpacing: '0.04em' }}>Squash · Cairo</div>
        </div>
        <Icons.Chevron size={12} dir="down" />
      </div>
      <div className="sq-mono" style={{ padding: '8px 10px 6px', fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Section</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => (
          <button key={it.id} onClick={() => onNav(it.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: it.id === active ? 'color-mix(in srgb, var(--sq-gold) 8%, transparent)' : 'transparent', color: it.id === active ? 'var(--sq-gold)' : 'var(--sq-text-2)', fontSize: 13, fontWeight: it.id === active ? 500 : 400, position: 'relative', border: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--sq-body)' }}>
            {it.id === active && <span style={{ position: 'absolute', left: -12, top: 8, bottom: 8, width: 2, borderRadius: 1, background: 'var(--sq-gold)' }} />}
            {it.icon}
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.badge && <span className="sq-mono" style={{ fontSize: 10, color: it.id === active ? 'var(--sq-gold)' : 'var(--sq-text-3)' }}>{it.badge}</span>}
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div className="sq-card" style={{ padding: 12, background: 'linear-gradient(135deg, color-mix(in srgb, var(--sq-gold) 10%, transparent), transparent)', borderColor: 'color-mix(in srgb, var(--sq-gold) 20%, transparent)' }}>
        <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-gold)', letterSpacing: '0.1em' }}>ON COURT NOW</div>
        <div className="sq-display" style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>3 of 4</div>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>14 members on site</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px 2px' }}>
        <div style={{ width: 28, height: 28, borderRadius: 14, background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>TM</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500 }}>Coach Tarek Mansour</div>
          <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)' }}>Squash coordinator</div>
        </div>
        <Icons.Settings size={14} />
      </div>
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
  const map = { active: 'green', pending: 'gold', expired: '', redeemed: 'green', sent: 'blue', open: 'gold' };
  const label = { active: 'Active', pending: 'Pending', expired: 'Expired', redeemed: 'Redeemed', sent: 'Sent', open: 'Unused' }[status] || status;
  const cls = map[status];
  const extra = cls === 'blue' ? { color: 'var(--sq-blue)', borderColor: 'rgba(78,168,255,0.25)', background: 'rgba(78,168,255,0.1)' } : cls === 'green' ? { color: 'var(--sq-green)', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.1)' } : {};
  return <span className={'sq-chip ' + (cls === 'gold' ? 'gold' : '')} style={{ padding: '3px 10px', fontSize: 10.5, ...extra }}>{label}</span>;
}

// ── Live court board ─────────────────────────────────────────────────
function CourtBoardCard({ c }) {
  const ring = c.status === 'lesson' ? 'var(--sq-gold)' : c.status === 'playing' ? 'var(--sq-green)' : 'var(--sq-border-2)';
  const isFree = c.status === 'free';
  const pct = isFree ? 0 : Math.max(8, Math.round((1 - c.left / 60) * 100));
  return (
    <motion.div
      animate={isFree ? {} : { boxShadow: [`0 0 0 0 color-mix(in srgb, ${ring} 0%, transparent)`, `0 0 18px 1px color-mix(in srgb, ${ring} 26%, transparent)`, `0 0 0 0 color-mix(in srgb, ${ring} 0%, transparent)`] }}
      transition={isFree ? undefined : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ borderRadius: 16, padding: 18, minHeight: 188, display: 'flex', flexDirection: 'column', gap: 12, background: isFree ? 'var(--sq-surface)' : `linear-gradient(155deg, color-mix(in srgb, ${ring} 13%, var(--sq-surface)), var(--sq-surface) 65%)`, border: '1px solid ' + (isFree ? 'var(--sq-border)' : `color-mix(in srgb, ${ring} 32%, transparent)`) }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="sq-display" style={{ fontSize: 19, fontWeight: 700 }}>Court {c.court}</div>
          <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', letterSpacing: '0.04em', marginTop: 2 }}>{c.type.toUpperCase()}</div>
        </div>
        <span className={'sq-chip ' + (c.status === 'lesson' ? 'gold' : '')} style={c.status === 'playing' ? { fontSize: 10.5, color: 'var(--sq-green)', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.1)' } : { fontSize: 10.5 }}>
          {c.status === 'playing' && <span className="sq-live-dot" style={{ background: 'var(--sq-green)' }} />}
          {c.status === 'lesson' ? 'Lesson' : c.status === 'playing' ? 'In play' : 'Open'}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        {isFree ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 4 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--sq-text-2)' }}>Available</div>
            <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>Next · {c.next}</div>
          </div>
        ) : (
          <>
            <div className="sq-display" style={{ fontSize: 16, fontWeight: 600 }}>{c.who}</div>
            {c.coach && <div style={{ fontSize: 12.5, color: 'var(--sq-text-2)', marginTop: 4 }}>{c.coach}</div>}
          </>
        )}
      </div>
      {!isFree && (
        <div>
          <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ width: pct + '%', height: '100%', background: ring, borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
            <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>until {c.until}</span>
            <span className="sq-mono" style={{ fontSize: 11, color: ring, fontWeight: 600 }}>{c.left} min left</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
function MiniStat({ label, value, sub, tone }) {
  return (
    <div className="sq-card" style={{ padding: 15 }}>
      <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div className="sq-display" style={{ fontSize: 24, fontWeight: 700, marginTop: 5, color: tone === 'gold' ? 'var(--sq-gold)' : 'var(--sq-text)' }}>{value}</div>
      {sub && <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function LiveCourts() {
  const notify = useToast();
  const free = COURTS.filter((c) => c.status === 'free').length;
  return (
    <>
      <Topbar title="Live courts" sub="Wednesday · 14 May 2026 · 16:33" trailing={
        <>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--sq-text-3)' }}><span className="sq-live-dot" /> Live · 30s</span>
          <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('Assign court')}>
            <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Assign court
          </button>
        </>
      } />
      <div style={{ padding: '22px 30px 36px', display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {COURTS.map((c) => <CourtBoardCard key={c.court} c={c} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <MiniStat label="In use" value={`${4 - free} / 4`} tone="gold" />
            <MiniStat label="On site" value="14" sub="members" />
          </div>
          <div className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 13 }}>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Up next today</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {SCHEDULE.slice(2).map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="sq-mono" style={{ fontSize: 12, color: 'var(--sq-text-2)', minWidth: 38 }}>{s.time}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.group}</div>
                    <div style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{s.coach}</div>
                  </div>
                  <span className="sq-chip" style={{ padding: '2px 8px', fontSize: 10 }}>Court {s.court}</span>
                </div>
              ))}
            </div>
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
  const counts = { all: MEMBERS.length, active: MEMBERS.filter((m) => m.status === 'active').length, pending: MEMBERS.filter((m) => m.status === 'pending').length, expired: MEMBERS.filter((m) => m.status === 'expired').length };
  const segs = [['all', 'All members'], ['active', 'Active'], ['pending', 'Pending'], ['expired', 'Expired']];
  const rows = filter === 'all' ? MEMBERS : MEMBERS.filter((m) => m.status === filter);
  const GRID = '2.2fr 1.3fr 1fr 1.1fr 1.4fr';
  return (
    <>
      <Topbar title="Members" sub="186 registered · squash section" trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('Invite members')}>
          <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Invite members
        </button>
      } />
      <div style={{ padding: '20px 30px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {segs.map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999, background: filter === id ? 'var(--sq-surface-2)' : 'transparent', border: '1px solid ' + (filter === id ? 'var(--sq-border-2)' : 'var(--sq-border)'), color: filter === id ? 'var(--sq-text)' : 'var(--sq-text-2)', fontSize: 13, fontWeight: filter === id ? 600 : 400, cursor: 'pointer', fontFamily: 'var(--sq-body)' }}>
              {label}<span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>{counts[id]}</span>
            </button>
          ))}
        </div>
        <div className="sq-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--sq-border)', background: 'rgba(255,255,255,0.015)' }}>
            {['Member', 'Squad', 'Status', 'Renewal', 'Last seen'].map((h) => <span key={h} className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>)}
          </div>
          {rows.map((m, i) => (
            <div key={m.name} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '13px 20px', alignItems: 'center', borderBottom: i < rows.length - 1 ? '1px solid var(--sq-border)' : 'none', cursor: 'pointer' }} onClick={() => notify(`Opened ${m.name}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: 'linear-gradient(135deg, #2a2a2a, #161616)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 600, flexShrink: 0 }}>{m.initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                  <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>{m.since !== '—' ? 'Since ' + m.since : 'Not yet joined'}</div>
                </div>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--sq-text-2)' }}>{m.group}</span>
              <div><StatusPill status={m.status} /></div>
              <span className="sq-mono" style={{ fontSize: 12, color: m.status === 'expired' ? 'var(--sq-danger)' : 'var(--sq-text-2)' }}>{m.expires}</span>
              <span style={{ fontSize: 12, color: m.last === 'On court now' ? 'var(--sq-green)' : 'var(--sq-text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {m.last === 'On court now' && <span className="sq-live-dot" style={{ background: 'var(--sq-green)' }} />}{m.last}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Access codes (copy + generate work) ──────────────────────────────
function AccessCodes() {
  const notify = useToast();
  const [single, setSingle] = useState('K5R2WQ');
  const [codes, setCodes] = useState(CODES);
  const GRID = '1.2fr 1.6fr 1fr 1.4fr 0.8fr';

  function copy(code) {
    try { navigator.clipboard?.writeText(code); } catch (e) { /* ignore */ }
    notify(`Copied ${code}`);
  }
  function generate() {
    const c = randomCode();
    setSingle(c);
    setCodes((cs) => [{ code: c, to: null, status: 'open', when: 'Generated just now', via: null }, ...cs]);
    notify(`Generated ${c}`);
  }

  return (
    <>
      <Topbar title="Access codes" sub="Invite registered members to SERVE" trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={generate}>
          <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Generate code
        </button>
      } />
      <div style={{ padding: '22px 30px 36px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div className="sq-card serve-glow-soft" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Single code</div>
              <h2 className="sq-display" style={{ margin: '6px 0 0', fontSize: 16, fontWeight: 600 }}>Issue to one member</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 18px', borderRadius: 13, background: 'var(--sq-bg)', border: '1px dashed var(--sq-border-2)' }}>
              <span className="sq-mono" style={{ fontSize: 28, fontWeight: 600, letterSpacing: '0.22em', color: 'var(--sq-gold)' }}>{single}</span>
              <button className="sq-btn-ghost" style={{ padding: '8px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => copy(single)}>
                <Icons.Copy size={13} /> Copy
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="sq-btn-gold" style={{ flex: 1, padding: '12px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => notify(`Sent ${single} via WhatsApp`)}>
                <Icons.Chat size={15} /> Send via WhatsApp
              </button>
              <button className="sq-btn-ghost" style={{ padding: '12px 16px', fontSize: 13 }} onClick={() => notify(`Sent ${single} via SMS`)}>SMS</button>
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--sq-text-3)', lineHeight: 1.5 }}>
              Members redeem this code in the SERVE player app to unlock the club.
            </p>
          </div>
          <div className="sq-card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-blue)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Bulk invite</div>
              <h2 className="sq-display" style={{ margin: '6px 0 0', fontSize: 16, fontWeight: 600 }}>Import your roster</h2>
            </div>
            <div style={{ flex: 1, borderRadius: 13, border: '1.5px dashed var(--sq-border-2)', background: 'var(--sq-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 22, textAlign: 'center', minHeight: 120 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sq-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-text-2)' }}><Icons.Upload size={18} /></div>
              <div style={{ fontSize: 13, color: 'var(--sq-text-2)' }}>Drop your member list (CSV) or paste phone numbers</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12.5, color: 'var(--sq-text-2)' }}><strong style={{ color: 'var(--sq-text)' }}>42</strong> numbers detected</span>
              <button className="sq-btn-gold" style={{ padding: '10px 16px', fontSize: 12.5 }} onClick={() => notify('Generated 42 codes')}>Generate 42 codes</button>
            </div>
          </div>
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
                <span className="sq-mono" style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.1em', color: c.status === 'expired' ? 'var(--sq-text-3)' : 'var(--sq-text)' }}>{c.code}</span>
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

// ── Lesson sheet ─────────────────────────────────────────────────────
function LessonSheet() {
  const notify = useToast();
  return (
    <>
      <Topbar title="Lesson sheet" sub="Today · published to members" trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('Add a lesson')}>
          <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Add lesson
        </button>
      } />
      <div style={{ padding: '22px 30px 36px', maxWidth: 760 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SCHEDULE.map((s) => (
            <div key={s.id} className="sq-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="sq-mono" style={{ fontSize: 16, fontWeight: 600, minWidth: 52, color: s.you ? 'var(--sq-gold)' : 'var(--sq-text)' }}>{s.time}</div>
              <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--sq-border)' }} />
              <div style={{ flex: 1 }}>
                <div className="sq-display" style={{ fontSize: 15, fontWeight: 600 }}>{s.group}</div>
                <div style={{ fontSize: 12, color: 'var(--sq-text-2)', marginTop: 2 }}>{s.coach}</div>
              </div>
              <span className="sq-chip" style={{ fontSize: 10.5 }}>Court {s.court}</span>
              <span className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-2)', minWidth: 56, textAlign: 'right' }}>{s.spots}</span>
              <button className="sq-btn-ghost" style={{ padding: '6px 12px', fontSize: 11.5 }} onClick={() => notify(`Editing ${s.group}`)}>Edit</button>
            </div>
          ))}
        </div>
        <p style={{ margin: '16px 2px 0', fontSize: 12, color: 'var(--sq-text-3)', display: 'flex', gap: 7, alignItems: 'center' }}>
          <Icons.Chat size={14} /> Published straight to members — no more WhatsApp screenshots.
        </p>
      </div>
    </>
  );
}

// ── Coaches ──────────────────────────────────────────────────────────
function CoachesTab() {
  const notify = useToast();
  return (
    <>
      <Topbar title="Coaches" sub="Squash section staff" trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('Add coach')}>
          <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Add coach
        </button>
      } />
      <div style={{ padding: '24px 30px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        {ADMIN_COACHES.map((c) => (
          <div key={c.name} className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: 'linear-gradient(135deg, #2a2a2a, #161616)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>{c.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sq-display" style={{ fontSize: 15, fontWeight: 600 }}>{c.name}</div>
                <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)' }}>{c.role}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--sq-text-2)', paddingTop: 10, borderTop: '1px solid var(--sq-border)' }}>
              <span>{c.squads}</span>
              <span className="sq-mono"><Icons.Star size={11} filled /> {c.rating}</span>
            </div>
            <button className="sq-btn-ghost" style={{ padding: '8px', fontSize: 12 }} onClick={() => notify(`${c.name.split(' ')[0]}'s schedule`)}>View schedule</button>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Renewals ─────────────────────────────────────────────────────────
function Renewals() {
  const notify = useToast();
  const expiring = MEMBERS.filter((m) => m.status !== 'pending');
  return (
    <>
      <Topbar title="Renewals" sub="Membership status" trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('Reminders sent')}>Send all reminders</button>
      } />
      <div style={{ padding: '22px 30px 36px', maxWidth: 820, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {expiring.map((m) => {
          const exp = m.status === 'expired';
          return (
            <div key={m.name} className="sq-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, borderColor: exp ? 'color-mix(in srgb, var(--sq-danger) 30%, transparent)' : 'var(--sq-border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: 'linear-gradient(135deg, #2a2a2a, #161616)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{m.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.name}</div>
                <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>{m.group}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="sq-mono" style={{ fontSize: 12.5, color: exp ? 'var(--sq-danger)' : 'var(--sq-text-2)' }}>{m.expires}</div>
                <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>{exp ? 'expired' : 'renews'}</div>
              </div>
              <button className="sq-btn-ghost" style={{ padding: '7px 12px', fontSize: 11.5 }} onClick={() => notify(`Reminder sent to ${m.name.split(' ')[0]}`)}>Remind</button>
            </div>
          );
        })}
      </div>
    </>
  );
}

const SECTIONS = { board: LiveCourts, members: Members, codes: AccessCodes, sheet: LessonSheet, coaches: CoachesTab, renewals: Renewals };

function ConsoleInner() {
  const [active, setActive] = useState('board');
  const Section = SECTIONS[active] || LiveCourts;
  return (
    <div className="sq-app" style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Sidebar active={active} onNav={setActive} />
      <div style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>
            <Section />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CoachConsole() {
  return (
    <ToastProvider>
      <ConsoleInner />
    </ToastProvider>
  );
}
