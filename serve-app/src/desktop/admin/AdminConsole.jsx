// AdminConsole.jsx — the academy owner's desktop console. Sidebar navigation
// switches between Dashboard, Court schedule, Create team training, and Academy
// profile; a Setup wizard is reachable from the sidebar footer. Ported from the
// SERVE prototype's admin-screens.jsx and made interactive.

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../../components/Icons';
import SQLogo from '../../components/SQLogo';
import ImgPlaceholder from '../../components/ImgPlaceholder';
import { DUR_FAST } from '../../motion';

const SIDEBAR_W = 232;

// ── sidebar ──────────────────────────────────────────────────────────
function AdminSidebar({ active, onNav }) {
  const items = [
    { id: 'dashboard', icon: <Icons.Home size={16} />, label: 'Dashboard' },
    { id: 'profile', icon: <Icons.Trophy size={16} />, label: 'Academy profile' },
    { id: 'schedule', icon: <Icons.Calendar size={16} />, label: 'Court schedule' },
    { id: 'courts', icon: <Icons.Court size={16} />, label: 'Courts' },
    { id: 'coaches', icon: <Icons.Users size={16} />, label: 'Coaches', badge: '6' },
    { id: 'players', icon: <Icons.User size={16} />, label: 'Players', badge: '184' },
    { id: 'clinics', icon: <Icons.Bolt size={16} />, label: 'Group training' },
    { id: 'revenue', icon: <Icons.TrendUp size={16} />, label: 'Revenue' },
  ];
  return (
    <div style={{ width: SIDEBAR_W, flexShrink: 0, height: '100%', background: '#0a0a0a', borderRight: '1px solid var(--sq-border)', display: 'flex', flexDirection: 'column', padding: '18px 12px' }}>
      <div style={{ padding: '4px 8px 18px' }}>
        <SQLogo size={20} accent />
      </div>

      <div className="sq-card" style={{ padding: '10px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          <ImgPlaceholder label="↑" height={30} radius={8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sq-display" style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.1 }}>Apex Squash Club</div>
          <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', letterSpacing: '0.05em' }}>Admin · Riverside</div>
        </div>
        <Icons.Chevron size={12} dir="down" />
      </div>

      <div className="sq-mono" style={{ padding: '8px 10px 6px', fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Manage</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onNav(it.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              background: it.id === active ? 'color-mix(in srgb, var(--sq-gold) 8%, transparent)' : 'transparent',
              color: it.id === active ? 'var(--sq-gold)' : 'var(--sq-text-2)',
              fontSize: 13,
              fontWeight: it.id === active ? 500 : 400,
              cursor: 'pointer',
              position: 'relative',
              border: 0,
              textAlign: 'left',
              fontFamily: 'var(--sq-body)',
            }}
          >
            {it.id === active && <span style={{ position: 'absolute', left: -12, top: 8, bottom: 8, width: 2, borderRadius: 1, background: 'var(--sq-gold)' }} />}
            {it.icon}
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.badge && <span className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>{it.badge}</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <button onClick={() => onNav('setup')} className="sq-card" style={{ padding: 12, textAlign: 'left', cursor: 'pointer', background: 'linear-gradient(135deg, color-mix(in srgb, var(--sq-gold) 10%, transparent), transparent)', borderColor: 'color-mix(in srgb, var(--sq-gold) 20%, transparent)' }}>
        <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-gold)', letterSpacing: '0.1em' }}>TODAY · LIVE</div>
        <div className="sq-display" style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>$4,180</div>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>22 bookings · 4 trainings</div>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', marginTop: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>HM</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500 }}>Hisham Maged</div>
          <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)' }}>Owner</div>
        </div>
        <Icons.Settings size={14} />
      </div>
    </div>
  );
}

function Topbar({ title, sub, trailing }) {
  return (
    <div style={{ padding: '20px 32px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--sq-border)' }}>
      <div>
        {sub && <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>{sub}</div>}
        <h1 className="sq-display" style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em' }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{trailing}</div>
    </div>
  );
}

function Legend({ dot, children }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: dot }} />
      {children}
    </span>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────
function KPI({ label, value, delta, sub, tone }) {
  return (
    <div className="sq-card" style={{ padding: 16 }}>
      <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
      <div className="sq-display" style={{ fontSize: 26, fontWeight: 700, marginTop: 6, color: tone === 'gold' ? 'var(--sq-gold)' : 'var(--sq-text)', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        {delta && <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-green)', fontWeight: 500 }}>{delta}</span>}
        <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{sub}</span>
      </div>
    </div>
  );
}

function MiniSchedule() {
  const COURTS = [
    { name: 'Court 1', type: 'Glass' },
    { name: 'Court 2', type: 'Glass' },
    { name: 'Court 3', type: 'Standard' },
    { name: 'Court 4', type: 'Standard' },
    { name: 'Court 5', type: 'Standard' },
    { name: 'Court 6', type: 'Standard' },
  ];
  const SCHED = [
    [{ s: 1, len: 2, type: 'coach', label: 'Coach K · drill' }, { s: 6, len: 3, type: 'clinic', label: 'Friday Drill Squad' }, { s: 10, len: 2, type: 'booked', label: 'Salma I.' }],
    [{ s: 0, len: 2, type: 'booked', label: 'Hany M.' }, { s: 3, len: 1, type: 'booked', label: 'Ali M.' }, { s: 8, len: 4, type: 'peak' }],
    [{ s: 0, len: 1, type: 'playing', label: '● Yusuf · 22m' }, { s: 1, len: 2, type: 'booked', label: 'Mostafa A.' }, { s: 7, len: 2, type: 'booked', label: 'Omar K.' }],
    [{ s: 2, len: 2, type: 'booked', label: 'Maged · doubles' }, { s: 6, len: 2, type: 'booked', label: 'Nada S.' }, { s: 12, len: 2, type: 'peak' }],
    [{ s: 1, len: 1, type: 'playing', label: '● R. Adel · 8m' }, { s: 4, len: 2, type: 'booked' }, { s: 8, len: 2, type: 'booked' }],
    [{ s: 0, len: 1, type: 'booked' }, { s: 5, len: 2, type: 'booked' }, { s: 11, len: 3, type: 'peak' }],
  ];
  const HOURS = 14;
  const NOW = 1;
  const color = (type) =>
    ({
      booked: { bg: 'color-mix(in srgb, var(--sq-gold) 18%, transparent)', border: 'color-mix(in srgb, var(--sq-gold) 35%, transparent)', color: 'var(--sq-gold)' },
      coach: { bg: 'rgba(78,168,255,0.15)', border: 'rgba(78,168,255,0.35)', color: 'var(--sq-blue)' },
      clinic: { bg: 'rgba(78,168,255,0.15)', border: 'rgba(78,168,255,0.35)', color: 'var(--sq-blue)' },
      playing: { bg: 'rgba(74,222,128,0.18)', border: 'rgba(74,222,128,0.4)', color: 'var(--sq-green)' },
      peak: { bg: 'repeating-linear-gradient(135deg, color-mix(in srgb, var(--sq-gold) 6%, transparent) 0 4px, transparent 4px 10px)', border: 'color-mix(in srgb, var(--sq-gold) 18%, transparent)', color: 'var(--sq-gold)' },
    })[type];

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', paddingLeft: 100, marginBottom: 6 }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ flex: 1, fontSize: 10, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)' }}>{15 + i}:00</div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -6, bottom: 0, left: `calc(100px + ${(NOW / HOURS) * 100}% - ${(100 / HOURS) * NOW}px)`, width: 1, background: 'var(--sq-gold)', zIndex: 3 }}>
          <div style={{ position: 'absolute', top: -6, left: -3, width: 7, height: 7, borderRadius: 4, background: 'var(--sq-gold)' }} />
        </div>
        {COURTS.map((c, idx) => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', height: 30 }}>
            <div style={{ width: 100, paddingRight: 10, flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{c.name}</div>
              <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)' }}>{c.type}</div>
            </div>
            <div style={{ flex: 1, position: 'relative', height: 26, background: 'rgba(255,255,255,0.025)', borderRadius: 6, border: '1px solid var(--sq-border)' }}>
              {[...Array(HOURS - 1)].map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${((i + 1) / HOURS) * 100}%`, width: 1, background: 'rgba(255,255,255,0.04)' }} />
              ))}
              {SCHED[idx].map((b, i) => {
                const c2 = color(b.type);
                return (
                  <div key={i} style={{ position: 'absolute', top: 2, bottom: 2, left: `${(b.s / HOURS) * 100}%`, width: `${(b.len / HOURS) * 100}%`, background: c2.bg, border: `1px solid ${c2.border}`, borderRadius: 4, padding: '0 6px', display: 'flex', alignItems: 'center', fontFamily: 'var(--sq-mono)', fontSize: 9.5, fontWeight: 500, color: c2.color, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {b.label}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReservationRow({ t, name, court, tag }) {
  const chips = {
    paid: <span className="sq-chip gold" style={{ fontSize: 9.5 }}>Paid</span>,
    pending: <span className="sq-chip" style={{ fontSize: 9.5 }}>Pending</span>,
    coach: <span className="sq-chip" style={{ fontSize: 9.5, color: 'var(--sq-blue)', borderColor: 'rgba(78,168,255,0.25)', background: 'rgba(78,168,255,0.1)' }}>Coach</span>,
    clinic: <span className="sq-chip" style={{ fontSize: 9.5, color: 'var(--sq-blue)', borderColor: 'rgba(78,168,255,0.25)', background: 'rgba(78,168,255,0.1)' }}><Icons.Users size={9} /> Training</span>,
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--sq-border)' }}>
      <div className="sq-mono" style={{ width: 42, fontSize: 13, fontWeight: 500 }}>{t}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>{court}</div>
      </div>
      {chips[tag]}
    </div>
  );
}

function RevenueChart() {
  const data = [2400, 3100, 2700, 4200, 3800, 5100, 4180];
  const max = 5500;
  const w = 540, h = 160, pl = 30, pr = 0, pt = 8, pb = 22;
  const cw = w - pl - pr, ch = h - pt - pb;
  const pts = data.map((v, i) => [pl + (i / (data.length - 1)) * cw, pt + (1 - v / max) * ch]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const fill = path + ` L${pl + cw} ${pt + ch} L${pl} ${pt + ch} Z`;
  const days = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
  return (
    <div className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Revenue · last 7 days</h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--sq-text-3)' }}>$25,480 total · 142 bookings</p>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--sq-surface-2)', borderRadius: 8 }}>
          {['7d', '30d', '90d'].map((t) => (
            <span key={t} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontFamily: 'var(--sq-display)', fontWeight: 600, background: t === '7d' ? 'var(--sq-surface)' : 'transparent', color: t === '7d' ? 'var(--sq-text)' : 'var(--sq-text-3)', border: '1px solid', borderColor: t === '7d' ? 'var(--sq-border)' : 'transparent' }}>{t}</span>
          ))}
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--sq-gold) 25%, transparent)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((g) => (
          <line key={g} x1={pl} x2={w - pr} y1={pt + g * ch} y2={pt + g * ch} stroke="rgba(255,255,255,0.05)" />
        ))}
        <path d={fill} fill="url(#rev-fill)" />
        <path d={path} fill="none" stroke="var(--sq-gold)" strokeWidth="1.6" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 2.5} fill={i === pts.length - 1 ? 'var(--sq-gold)' : '#0a0a0a'} stroke="var(--sq-gold)" strokeWidth="1.4" />
        ))}
        {days.map((d, i) => (
          <text key={i} x={pts[i][0]} y={h - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9.5" fontFamily="var(--sq-mono)">{d}</text>
        ))}
        {[0, 0.5, 1].map((g, i) => (
          <text key={i} x={pl - 6} y={pt + g * ch + 3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="var(--sq-mono)">{Math.round((max * (1 - g)) / 1000)}k</text>
        ))}
      </svg>
    </div>
  );
}

function AlertRow({ icon, title, detail, tone }) {
  const c = tone === 'gold' ? { bg: 'color-mix(in srgb, var(--sq-gold) 10%, transparent)', col: 'var(--sq-gold)' } : { bg: 'rgba(78,168,255,0.1)', col: 'var(--sq-blue)' };
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--sq-border)' }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: c.bg, color: c.col, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--sq-text-3)', marginTop: 2 }}>{detail}</div>
      </div>
      <button className="sq-btn-ghost" style={{ padding: '4px 10px', fontSize: 10.5 }}>Act</button>
    </div>
  );
}

function Dashboard() {
  return (
    <>
      <Topbar
        title="Welcome back, Hisham."
        sub="Wednesday · 14 May 2026 · 15:24"
        trailing={
          <>
            <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5 }}>Filters</button>
            <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }}>
              <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> New booking
            </button>
          </>
        }
      />
      <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <KPI label="Today's revenue" value="$4,180" delta="+18%" sub="vs last Wed" tone="gold" />
          <KPI label="Bookings today" value="22 of 32" delta="69%" sub="utilization" />
          <KPI label="Active group trainings" value="3" sub="14 players signed up" />
          <KPI label="Court hours sold" value="26.5h" delta="+4.5h" sub="vs last week" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <div className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="sq-live-dot" />
                  <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Live court schedule</h2>
                </div>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--sq-text-3)' }}>Now playing across 6 courts · updates every 30s</p>
              </div>
              <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>15:00 — 22:00</span>
            </div>
            <MiniSchedule />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--sq-border)' }}>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--sq-text-3)' }}>
                <Legend dot="var(--sq-gold)">Booked</Legend>
                <Legend dot="var(--sq-blue)">Coach priority</Legend>
                <Legend dot="rgba(74,222,128,0.7)">In-play</Legend>
                <Legend dot="rgba(255,255,255,0.1)">Open</Legend>
              </div>
              <span style={{ fontSize: 12, color: 'var(--sq-blue)' }}>Open full schedule →</span>
            </div>
          </div>

          <div className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Up next today</h2>
              <span className="sq-chip">12 reservations</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { t: '15:30', name: 'Yusuf Hamdi', court: 'Court 3', tag: 'paid' },
                { t: '16:00', name: 'Salma Ibrahim', court: 'Court 5', tag: 'paid' },
                { t: '16:30', name: 'Coach Karim · drill', court: 'Court 1', tag: 'coach' },
                { t: '17:00', name: 'Ali Mansour', court: 'Court 2', tag: 'pending' },
                { t: '17:30', name: 'Maged Family · doubles', court: 'Court 4', tag: 'paid' },
                { t: '18:00', name: 'Friday Drill Squad', court: 'Court 1', tag: 'clinic' },
              ].map((r) => (
                <ReservationRow key={r.t} {...r} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <RevenueChart />
          <div className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Needs your attention</h2>
            <AlertRow icon={<Icons.Bolt size={14} />} tone="gold" title="Court 1 sold out for tomorrow" detail="Consider opening the 22:30 late slot · +$280 potential" />
            <AlertRow icon={<Icons.Users size={14} />} tone="blue" title="Coach Karim's Fri 18:00 has 3 spots left" detail="Notify your waitlist (12 players)?" />
            <AlertRow icon={<Icons.Wallet size={14} />} tone="gold" title="2 payments pending card confirmation" detail="Ali Mansour · 17:00 · $180" />
          </div>
        </div>
      </div>
    </>
  );
}

// ── Court schedule (full grid) ───────────────────────────────────────
function FullSchedule() {
  const HOURS = 15;
  const COURT_W = 120;
  const ROW_H = 56;
  const courts = [
    { name: 'Court 1', type: 'Glass · Pro', peak: '1.5×' },
    { name: 'Court 2', type: 'Glass · Pro', peak: '1.5×' },
    { name: 'Court 3', type: 'Standard' },
    { name: 'Court 4', type: 'Standard' },
    { name: 'Court 5', type: 'Standard' },
    { name: 'Court 6', type: 'Standard' },
  ];
  const BK = [
    { c: 0, s: 1.5, l: 1, type: 'booked', who: 'Mostafa A.', sub: 'paid · 280' },
    { c: 0, s: 9.5, l: 1.5, type: 'coach', who: 'Coach Karim', sub: 'priority · drill' },
    { c: 0, s: 11, l: 1.5, type: 'clinic', who: 'Drill Squad', sub: '8/8 players' },
    { c: 1, s: 0.5, l: 1, type: 'booked', who: 'Hany Mostafa', sub: 'paid · 280' },
    { c: 1, s: 3, l: 1, type: 'booked', who: 'Ali Mansour', sub: 'pending' },
    { c: 1, s: 13, l: 1, type: 'booked', who: 'Ahmed S.', sub: 'paid · 420 peak' },
    { c: 2, s: 0, l: 1, type: 'playing', who: 'Yusuf Hamdi', sub: '22m left' },
    { c: 2, s: 2, l: 1, type: 'booked', who: 'Omar Khaled', sub: 'paid · 180' },
    { c: 2, s: 11.5, l: 1, type: 'booked', who: 'Salma I.', sub: 'paid · 270 peak' },
    { c: 3, s: 4, l: 2, type: 'booked', who: 'Maged Family', sub: 'doubles · 360' },
    { c: 3, s: 8, l: 1, type: 'block', who: 'Maintenance', sub: 'court resurfacing' },
    { c: 3, s: 11, l: 2, type: 'booked', who: 'Nada Salem', sub: 'paid · 540 peak' },
    { c: 4, s: 1.5, l: 1, type: 'playing', who: 'R. Adel', sub: '8m left' },
    { c: 4, s: 6, l: 2, type: 'booked', who: 'Tarek Y.', sub: 'paid · 360' },
    { c: 4, s: 10, l: 2, type: 'booked', who: 'Karim H.', sub: 'paid · 540 peak' },
    { c: 5, s: 0, l: 1, type: 'booked', who: 'Mona N.', sub: 'paid · 180' },
    { c: 5, s: 5, l: 1, type: 'booked', who: 'Hisham A.', sub: 'paid · 180' },
    { c: 5, s: 11.5, l: 2, type: 'booked', who: 'Yara M.', sub: 'paid · 540 peak' },
  ];
  const color = (t) =>
    ({
      booked: { bg: 'color-mix(in srgb, var(--sq-gold) 15%, transparent)', border: 'color-mix(in srgb, var(--sq-gold) 40%, transparent)', col: 'var(--sq-gold)' },
      coach: { bg: 'rgba(78,168,255,0.15)', border: 'rgba(78,168,255,0.4)', col: 'var(--sq-blue)' },
      clinic: { bg: 'rgba(78,168,255,0.12)', border: 'rgba(78,168,255,0.35)', col: 'var(--sq-blue)', dashed: true },
      playing: { bg: 'rgba(74,222,128,0.18)', border: 'rgba(74,222,128,0.45)', col: 'var(--sq-green)' },
      block: { bg: 'rgba(239,85,96,0.12)', border: 'rgba(239,85,96,0.4)', col: 'var(--sq-danger)', dashed: true },
    })[t];
  const NOW = 8.5;

  return (
    <div className="sq-card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--sq-border)' }}>
        <div style={{ width: COURT_W, padding: '8px 14px', flexShrink: 0 }}>
          <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Court</div>
        </div>
        <div style={{ display: 'flex', flex: 1 }}>
          {[...Array(HOURS + 1)].map((_, i) => (
            <div key={i} style={{ flex: 1, padding: '8px 0 8px 6px', fontSize: 11, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)', borderLeft: i ? '1px solid var(--sq-border)' : 'none' }}>{(7 + i).toString().padStart(2, '0')}</div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${COURT_W}px + ${(NOW / HOURS) * 100}% - ${(COURT_W * NOW) / HOURS}px)`, width: 2, background: 'var(--sq-gold)', zIndex: 5, opacity: 0.7 }}>
          <div style={{ position: 'absolute', top: -5, left: -4, padding: '2px 5px', background: 'var(--sq-gold)', color: '#0a0a0a', borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: 'var(--sq-mono)' }}>15:30</div>
        </div>
        {courts.map((c, ci) => (
          <div key={c.name} style={{ display: 'flex', height: ROW_H, borderBottom: ci < courts.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
            <div style={{ width: COURT_W, padding: '10px 14px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
              <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>{c.type}{c.peak ? ` · ${c.peak}` : ''}</div>
            </div>
            <div style={{ flex: 1, position: 'relative', background: ci % 2 ? 'rgba(255,255,255,0.005)' : 'transparent' }}>
              {[...Array(HOURS)].map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(i / HOURS) * 100}%`, width: 1, background: 'rgba(255,255,255,0.03)' }} />
              ))}
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(10 / HOURS) * 100}%`, width: `${(5 / HOURS) * 100}%`, background: 'repeating-linear-gradient(135deg, color-mix(in srgb, var(--sq-gold) 3%, transparent) 0 4px, transparent 4px 12px)' }} />
              {BK.filter((b) => b.c === ci).map((b, i) => {
                const c2 = color(b.type);
                return (
                  <div key={i} style={{ position: 'absolute', top: 4, bottom: 4, left: `${(b.s / HOURS) * 100}%`, width: `${(b.l / HOURS) * 100}%`, background: c2.bg, border: `1px ${c2.dashed ? 'dashed' : 'solid'} ${c2.border}`, borderRadius: 6, padding: '4px 7px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}>
                    <div style={{ fontSize: 11.5, fontWeight: 500, color: c2.col, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.who}</div>
                    <div className="sq-mono" style={{ fontSize: 9, color: c2.col, opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.sub}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Schedule() {
  return (
    <>
      <Topbar
        title="Court schedule"
        sub="Live · auto-refresh 30s"
        trailing={
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 999, background: 'var(--sq-surface)', border: '1px solid var(--sq-border)', fontSize: 12.5 }}>
              <Icons.Chevron dir="left" size={12} />
              <span className="sq-mono">Wed · 14 May 2026</span>
              <Icons.Chevron dir="right" size={12} />
            </div>
            <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5 }}>Today</button>
            <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }}>
              <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Block / reserve
            </button>
          </>
        }
      />
      <div style={{ padding: '20px 32px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 11.5, color: 'var(--sq-text-2)' }}>
            <Legend dot="var(--sq-gold)">Paid booking</Legend>
            <Legend dot="var(--sq-blue)">Coach priority</Legend>
            <Legend dot="rgba(74,222,128,0.7)">In play</Legend>
            <Legend dot="rgba(255,85,96,0.6)">Blocked</Legend>
          </div>
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--sq-surface)', borderRadius: 8, border: '1px solid var(--sq-border)' }}>
            {['Day', 'Week', 'Month'].map((v) => (
              <span key={v} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--sq-display)', fontWeight: 600, background: v === 'Day' ? 'var(--sq-gold)' : 'transparent', color: v === 'Day' ? '#0a0a0a' : 'var(--sq-text-2)' }}>{v}</span>
            ))}
          </div>
        </div>
        <FullSchedule />
      </div>
    </>
  );
}

// ── Create team training ─────────────────────────────────────────────
function FormCard({ title, step, children }) {
  return (
    <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
        <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{step}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}
function Field({ label, value, multiline, mono }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      <div style={{ padding: multiline ? 12 : '10px 12px', border: '1px solid var(--sq-border-2)', borderRadius: 8, background: 'rgba(255,255,255,0.02)', fontFamily: mono ? 'var(--sq-mono)' : 'inherit', fontSize: 13.5, color: 'var(--sq-text)', minHeight: multiline ? 60 : undefined }}>{value}</div>
    </div>
  );
}
function Select({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      <div style={{ padding: '10px 12px', border: '1px solid var(--sq-border-2)', borderRadius: 8, background: 'rgba(255,255,255,0.02)', fontSize: 13.5, color: 'var(--sq-text)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{value}</span>
        <Icons.Chevron dir="down" size={13} />
      </div>
    </div>
  );
}
function PreviewStat({ label, value }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--sq-surface-2)' }}>
      <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div style={{ fontSize: 12.5, fontWeight: 500, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function CreateClinic() {
  return (
    <>
      <Topbar
        title="Create a team training"
        sub="Group training · group session"
        trailing={
          <>
            <button className="sq-btn-ghost" style={{ padding: '9px 16px', fontSize: 12.5 }}>Save draft</button>
            <button className="sq-btn-gold" style={{ padding: '9px 18px', fontSize: 12.5 }}>Publish to players →</button>
          </>
        }
      />
      <div style={{ padding: '24px 32px 40px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <FormCard title="Session" step="1 / 4">
            <Field label="Title" value="Friday Night Drill Squad" />
            <Field label="Description" multiline value="High-intensity solo drills, ghosting, and conditioned games. Bring a towel — you'll need it." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Select label="Type" value="Drill clinic" />
              <Select label="Level" value="Intermediate · 3.5–4.5" />
            </div>
          </FormCard>
          <FormCard title="Schedule" step="2 / 4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Select label="Coach" value="Karim El-Hosary" />
              <Select label="Court" value="Court 1 · Glass" />
            </div>
            <Field label="Recurrence" value="Every Friday · until 27 June" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Start time" value="18:00" mono />
              <Field label="Duration" value="90 min" mono />
              <Field label="Sessions" value="8" mono />
            </div>
          </FormCard>
          <FormCard title="Players" step="3 / 4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Max players" value="8" mono />
              <Field label="Waitlist size" value="12" mono />
            </div>
            <Field label="Price per player" value="$350" mono />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(78,168,255,0.06)', border: '1px solid rgba(78,168,255,0.18)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(78,168,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-blue)' }}><Icons.Bolt size={14} /></div>
              <div style={{ flex: 1, fontSize: 12.5, color: 'var(--sq-text-2)' }}>Players see this in the app and sign up directly. Payment held with <b style={{ color: 'var(--sq-text)' }}>card</b>.</div>
            </div>
          </FormCard>
        </div>
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Players see this →</div>
          <div className="sq-card" style={{ padding: 0, overflow: 'hidden' }}>
            <ImgPlaceholder label="coach_karim_action.jpg" height={140} hue="navy" radius={0} style={{ borderRadius: 0, border: 0 }} />
            <div style={{ padding: 18 }}>
              <span className="sq-chip" style={{ color: 'var(--sq-blue)', borderColor: 'rgba(78,168,255,0.25)', background: 'rgba(78,168,255,0.1)' }}><Icons.Users size={11} /> Team Training · 8 players</span>
              <h2 className="sq-display" style={{ margin: '10px 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Friday Night Drill Squad</h2>
              <div style={{ color: 'var(--sq-text-2)', fontSize: 12.5, marginTop: 4 }}>Apex Squash Club · Court 1 (glass)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '14px 0' }}>
                <PreviewStat label="Coach" value="K. El-Hosary" />
                <PreviewStat label="Level" value="Intermediate" />
                <PreviewStat label="Next session" value="Fri 16 · 18:00" />
                <PreviewStat label="Duration" value="90 min" />
              </div>
              <div style={{ paddingTop: 12, borderTop: '1px solid var(--sq-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-gold)' }}>3 OF 8 SPOTS LEFT</div>
                  <div className="sq-display" style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>$350</div>
                </div>
                <button className="sq-btn-gold" style={{ padding: '10px 16px', fontSize: 12.5 }}>Join</button>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, padding: 14, background: 'color-mix(in srgb, var(--sq-gold) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 20%, transparent)', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'color-mix(in srgb, var(--sq-gold) 15%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-gold)' }}><Icons.TrendUp size={14} /></div>
            <div style={{ flex: 1, fontSize: 12.5 }}>
              <div style={{ fontWeight: 500 }}>Estimated revenue · $22,400</div>
              <div style={{ color: 'var(--sq-text-3)', fontSize: 11.5, marginTop: 2 }}>8 spots × 8 sessions × $350</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Academy profile / branding ───────────────────────────────────────
function AcademyProfile() {
  const BRAND = ['#f5453b', '#4ea8ff', '#4ade80', '#a779f0', '#ff8a3d', '#d4a64f'];
  return (
    <>
      <Topbar
        title="Academy profile"
        sub="Branding · public page"
        trailing={
          <>
            <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5 }}>Preview public page</button>
            <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }}>Save changes</button>
          </>
        }
      />
      <div style={{ padding: '24px 32px 40px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <FormCard title="Brand" step="Logo & cover">
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 110, flexShrink: 0 }}>
                <label style={{ fontSize: 11, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Logo</label>
                <ImgPlaceholder label="Drop logo" height={110} radius={16} />
                <span className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)' }}>PNG · square</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cover image</label>
                <ImgPlaceholder label="Drop a cover photo of your courts" height={110} radius={12} hue="gold" />
                <span className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)' }}>Wide · shown behind your academy name</span>
              </div>
            </div>
          </FormCard>
          <FormCard title="Details" step="Public info">
            <Field label="Academy name" value="Apex Squash Club" />
            <Field label="Tagline" value="Where Riverside juniors level up." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="City" value="Riverside" />
              <Field label="District" value="Harbour District" />
            </div>
            <Field label="Contact" value="play@apexsquash.club" mono />
          </FormCard>
          <FormCard title="Brand color" step="Accent">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {BRAND.map((c, i) => (
                <div key={c} style={{ width: 38, height: 38, borderRadius: 10, background: c, cursor: 'pointer', boxShadow: i === 0 ? `0 0 0 2px var(--sq-bg), 0 0 0 4px ${c}` : 'none' }} />
              ))}
              <span style={{ fontSize: 12, color: 'var(--sq-text-3)', marginLeft: 4 }}>Players see your academy in this color.</span>
            </div>
          </FormCard>
        </div>
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Players see this →</div>
          <div className="sq-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 150 }}>
              <ImgPlaceholder label="cover" height={150} radius={0} hue="gold" style={{ borderRadius: 0, border: 0 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(7,7,7,0.95) 100%)', pointerEvents: 'none' }} />
              <span className="sq-chip gold" style={{ position: 'absolute', top: 12, left: 12 }}><span className="sq-live-dot" /> Open now</span>
            </div>
            <div style={{ padding: '0 18px 18px', marginTop: -34, position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', border: '2px solid var(--sq-bg)' }}>
                <ImgPlaceholder label="logo" height={64} radius={16} />
              </div>
              <h2 className="sq-display" style={{ margin: '12px 0 2px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Apex Squash Club</h2>
              <div style={{ color: 'var(--sq-text-2)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icons.Pin size={12} /> Harbour District, Riverside · ★ 4.9
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, margin: '14px 0 0' }}>
                <PreviewStat label="Courts" value="6" />
                <PreviewStat label="Juniors" value="184" />
                <PreviewStat label="From" value="$180" />
              </div>
              <button className="sq-btn-gold" style={{ marginTop: 14, padding: '11px 16px', fontSize: 13, width: '100%' }}>Book a court</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Setup wizard (full-bleed, own chrome) ────────────────────────────
function SetupStep({ n, label, active, done }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, background: active ? 'color-mix(in srgb, var(--sq-gold) 8%, transparent)' : 'transparent' }}>
      <div style={{ width: 26, height: 26, borderRadius: 13, background: done ? 'var(--sq-gold)' : active ? 'color-mix(in srgb, var(--sq-gold) 15%, transparent)' : 'var(--sq-surface-2)', border: '1px solid', borderColor: done ? 'var(--sq-gold)' : active ? 'color-mix(in srgb, var(--sq-gold) 40%, transparent)' : 'var(--sq-border)', color: done ? '#0a0a0a' : active ? 'var(--sq-gold)' : 'var(--sq-text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--sq-display)', fontSize: 11.5, fontWeight: 700 }}>
        {done ? <Icons.Check size={13} /> : n}
      </div>
      <span style={{ fontSize: 13, color: active ? 'var(--sq-text)' : done ? 'var(--sq-text-2)' : 'var(--sq-text-3)', fontWeight: active ? 500 : 400 }}>{label}</span>
    </div>
  );
}
function SetupCourtRow({ n, type, base, peak, peakOn }) {
  return (
    <div className="sq-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 38, height: 38, borderRadius: 9, background: 'color-mix(in srgb, var(--sq-gold) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 25%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icons.Court size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{n}</div>
        <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{type}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
        <div className="sq-mono" style={{ fontSize: 13, color: 'var(--sq-text)' }}>${base}<span style={{ color: 'var(--sq-text-3)', fontSize: 10.5, marginLeft: 4 }}>/ hr</span></div>
        {peakOn && <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)' }}>peak ${peak} ⚡</div>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="sq-btn-ghost" style={{ padding: '6px 10px', fontSize: 11 }}>Edit</button>
        <button className="sq-btn-ghost" style={{ padding: '6px 10px', fontSize: 11, color: 'var(--sq-text-3)' }}>···</button>
      </div>
    </div>
  );
}
function Setup({ onExit }) {
  return (
    <div className="sq-app" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--sq-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SQLogo size={20} accent />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Step 3 of 5</span>
          <div style={{ width: 120, height: 4, borderRadius: 2, background: 'var(--sq-surface-2)', marginLeft: 8 }}>
            <div style={{ width: '60%', height: '100%', background: 'var(--sq-gold)', borderRadius: 2 }} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 0 }}>
        <div style={{ padding: '32px 24px', borderRight: '1px solid var(--sq-border)', background: 'var(--sq-surface)', overflowY: 'auto' }}>
          <h2 className="sq-display" style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Set up your academy</h2>
          <p style={{ margin: '4px 0 20px', fontSize: 12, color: 'var(--sq-text-3)' }}>~ 8 minutes</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, padding: 12, borderRadius: 12, border: '1px dashed var(--sq-border-2)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
              <ImgPlaceholder label="Logo" height={48} radius={12} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Academy logo</div>
              <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', marginTop: 2 }}>Drop a PNG · shows on every page</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <SetupStep n="1" label="Academy details & logo" done />
            <SetupStep n="2" label="Operating hours" done />
            <SetupStep n="3" label="Courts & pricing" active />
            <SetupStep n="4" label="Coaches & priority times" />
            <SetupStep n="5" label="Open to players" />
          </div>
        </div>
        <div style={{ padding: '32px 40px', overflowY: 'auto' }}>
          <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>03 — Courts & pricing</div>
          <h1 className="sq-display" style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: '-0.025em' }}>Add your courts.</h1>
          <p style={{ margin: '8px 0 28px', fontSize: 14, color: 'var(--sq-text-2)', maxWidth: 540 }}>Set hourly pricing and optional peak hours. You can rename, reorder, or add courts anytime later.</p>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Added · 4 of 6</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
            {[
              { n: 'Court 1', type: 'Glass back · Pro', base: 280, peak: 420, peakOn: true },
              { n: 'Court 2', type: 'Glass back · Pro', base: 280, peak: 420, peakOn: true },
              { n: 'Court 3', type: 'Standard', base: 180, peak: 270, peakOn: true },
              { n: 'Court 4', type: 'Standard', base: 180, peakOn: false },
            ].map((c) => (
              <SetupCourtRow key={c.n} {...c} />
            ))}
          </div>
          <button className="sq-btn-ghost" style={{ padding: '14px 18px', fontSize: 13, width: '100%', borderStyle: 'dashed' }}>
            <Icons.Plus size={14} style={{ marginRight: 8, verticalAlign: -3 }} /> Add court 5
          </button>
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, borderTop: '1px solid var(--sq-border)' }}>
            <button className="sq-btn-ghost" style={{ padding: '12px 18px', fontSize: 13 }} onClick={onExit}>← Back to dashboard</button>
            <button className="sq-btn-gold" style={{ padding: '12px 22px', fontSize: 13 }} onClick={onExit}>Continue to coaches →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── placeholder for unbuilt sections ─────────────────────────────────
function Placeholder({ label }) {
  return (
    <>
      <Topbar title={label} sub="Module" />
      <div style={{ height: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--sq-text-3)' }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--sq-surface)', border: '1px solid var(--sq-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.Settings size={28} />
        </div>
        <div className="sq-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--sq-text)' }}>{label} — coming soon</div>
        <p style={{ fontSize: 13, maxWidth: 320, textAlign: 'center', lineHeight: 1.5 }}>This module is part of the SERVE admin roadmap.</p>
      </div>
    </>
  );
}

const SECTIONS = {
  dashboard: <Dashboard />,
  schedule: <Schedule />,
  clinics: <CreateClinic />,
  profile: <AcademyProfile />,
  courts: <Placeholder label="Courts" />,
  coaches: <Placeholder label="Coaches" />,
  players: <Placeholder label="Players" />,
  revenue: <Placeholder label="Revenue" />,
};

export default function AdminConsole() {
  const [active, setActive] = useState('dashboard');

  if (active === 'setup') return <Setup onExit={() => setActive('dashboard')} />;

  return (
    <div className="sq-app" style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      <AdminSidebar active={active} onNav={setActive} />
      <div style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>
            {SECTIONS[active]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
