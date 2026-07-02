// AdminConsole.jsx — the academy owner's desktop console (Wadi Degla, Cairo).
// Every sidebar tab routes to a real, populated section; toggles and CTAs are
// interactive; the 5-step setup wizard is fully steppable with pre-filled
// Egyptian data so it demos without typing.

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../../components/Icons';
import SQLogo from '../../components/SQLogo';
import ImgPlaceholder from '../../components/ImgPlaceholder';
import UploadSlot from '../../components/UploadSlot';
import { ToastProvider, useToast } from '../../components/Toast';
import ThemeScope from '../../components/ThemeScope';
import { DUR_FAST } from '../../motion';
import { useStore, store } from '../../store';
import { useT } from '../../i18n';
import {
  ACADEMY, ADMIN_COURTS, ADMIN_COACHES, ADMIN_PLAYERS,
  REVENUE_7D, REVENUE_DAYS, SETUP_STEPS, OPERATING_HOURS, REVENUE_BREAKDOWN, BRAND_COLORS,
} from '../../data';

const SIDEBAR_W = 232;

// ── sidebar ──────────────────────────────────────────────────────────
function Sidebar({ active, onNav }) {
  const state = useStore();
  const t = useT();
  const coachCount = state.staff.filter((s) => s.org_id === 'ramyashour').length;
  const items = [
    { id: 'dashboard', icon: <Icons.Home size={16} />, label: 'Dashboard' },
    { id: 'profile', icon: <Icons.Trophy size={16} />, label: 'Academy profile' },
    { id: 'schedule', icon: <Icons.Calendar size={16} />, label: 'Court schedule' },
    { id: 'courts', icon: <Icons.Court size={16} />, label: 'Courts', badge: String(ADMIN_COURTS.length) },
    { id: 'coaches', icon: <Icons.Users size={16} />, label: 'Coaches', badge: String(coachCount) },
    { id: 'players', icon: <Icons.User size={16} />, label: 'Players', badge: String(ADMIN_PLAYERS.length) },
    { id: 'clinics', icon: <Icons.Bolt size={16} />, label: 'Group training' },
    { id: 'payments', icon: <Icons.Wallet size={16} />, label: 'Payments' },
    { id: 'revenue', icon: <Icons.TrendUp size={16} />, label: 'Revenue' },
  ];
  return (
    <div style={{ width: SIDEBAR_W, flexShrink: 0, height: '100%', background: '#0a0a0a', borderRight: '1px solid var(--sq-border)', display: 'flex', flexDirection: 'column', padding: '18px 12px' }}>
      <div style={{ padding: '4px 8px 18px' }}>
        <SQLogo size={20} accent />
      </div>
      <div className="sq-card" style={{ padding: '10px 12px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-gold)' }}>
          {state.images?.academyLogo ? <img src={state.images.academyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icons.Trophy size={16} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sq-display" style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.1 }}>{state.academyName || ACADEMY.short}</div>
          <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', letterSpacing: '0.05em' }}>Admin · {ACADEMY.district}</div>
        </div>
        <Icons.Chevron size={12} dir="down" />
      </div>
      <div className="sq-mono" style={{ padding: '8px 10px 6px', fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('Manage')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map((it) => (
          <button key={it.id} onClick={() => onNav(it.id)} style={navBtn(it.id === active)}>
            {it.id === active && <span style={activeBar} />}
            {it.icon}
            <span style={{ flex: 1 }}>{t(it.label)}</span>
            {it.badge && <span className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>{it.badge}</span>}
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <button onClick={() => onNav('setup')} className="sq-card" style={{ padding: 12, textAlign: 'left', cursor: 'pointer', background: 'linear-gradient(135deg, color-mix(in srgb, var(--sq-gold) 10%, transparent), transparent)', borderColor: 'color-mix(in srgb, var(--sq-gold) 20%, transparent)' }}>
        <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-gold)', letterSpacing: '0.1em' }}>SETUP WIZARD</div>
        <div className="sq-display" style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>Finish setup →</div>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>5 quick steps</div>
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', marginTop: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: 13, background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{ACADEMY.ownerInitials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500 }}>{ACADEMY.owner}</div>
          <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)' }}>Owner</div>
        </div>
        <Icons.Settings size={14} />
      </div>
    </div>
  );
}
const navBtn = (on) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: on ? 'color-mix(in srgb, var(--sq-gold) 8%, transparent)' : 'transparent', color: on ? 'var(--sq-gold)' : 'var(--sq-text-2)', fontSize: 13, fontWeight: on ? 500 : 400, cursor: 'pointer', position: 'relative', border: 0, textAlign: 'left', fontFamily: 'var(--sq-body)' });
const activeBar = { position: 'absolute', left: -12, top: 8, bottom: 8, width: 2, borderRadius: 1, background: 'var(--sq-gold)' };

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
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: dot }} />{children}</span>;
}
function Seg({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--sq-surface)', borderRadius: 8, border: '1px solid var(--sq-border)' }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--sq-display)', fontWeight: 600, border: 0, cursor: 'pointer', background: o === value ? 'var(--sq-gold)' : 'transparent', color: o === value ? '#0a0a0a' : 'var(--sq-text-2)' }}>{o}</button>
      ))}
    </div>
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
  const courts = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6'];
  const SCHED = [
    [{ s: 1, len: 2, type: 'coach', label: 'Coach Karim' }, { s: 6, len: 3, type: 'clinic', label: 'Drill Squad' }, { s: 10, len: 2, type: 'booked', label: 'Salma I.' }],
    [{ s: 0, len: 2, type: 'booked', label: 'Hany M.' }, { s: 3, len: 1, type: 'booked', label: 'Ali M.' }, { s: 8, len: 4, type: 'peak' }],
    [{ s: 0, len: 1, type: 'playing', label: '● Yusuf' }, { s: 1, len: 2, type: 'booked', label: 'Mostafa A.' }, { s: 7, len: 2, type: 'booked', label: 'Omar K.' }],
    [{ s: 2, len: 2, type: 'booked', label: 'Maged' }, { s: 6, len: 2, type: 'booked', label: 'Nada S.' }, { s: 12, len: 2, type: 'peak' }],
    [{ s: 1, len: 1, type: 'playing', label: '● R. Adel' }, { s: 4, len: 2, type: 'booked' }, { s: 8, len: 2, type: 'booked' }],
    [{ s: 0, len: 1, type: 'booked' }, { s: 5, len: 2, type: 'booked' }, { s: 11, len: 3, type: 'peak' }],
  ];
  const HOURS = 14, NOW = 1;
  const color = (t) => ({
    booked: { bg: 'color-mix(in srgb, var(--sq-gold) 18%, transparent)', border: 'color-mix(in srgb, var(--sq-gold) 35%, transparent)', color: 'var(--sq-gold)' },
    coach: { bg: 'rgba(78,168,255,0.15)', border: 'rgba(78,168,255,0.35)', color: 'var(--sq-blue)' },
    clinic: { bg: 'rgba(78,168,255,0.15)', border: 'rgba(78,168,255,0.35)', color: 'var(--sq-blue)' },
    playing: { bg: 'rgba(74,222,128,0.18)', border: 'rgba(74,222,128,0.4)', color: 'var(--sq-green)' },
    peak: { bg: 'repeating-linear-gradient(135deg, color-mix(in srgb, var(--sq-gold) 6%, transparent) 0 4px, transparent 4px 10px)', border: 'color-mix(in srgb, var(--sq-gold) 18%, transparent)', color: 'var(--sq-gold)' },
  })[t];
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', paddingLeft: 100, marginBottom: 6 }}>
        {[...Array(8)].map((_, i) => <div key={i} style={{ flex: 1, fontSize: 10, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)' }}>{15 + i}:00</div>)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
        <div style={{ position: 'absolute', top: -6, bottom: 0, left: `calc(100px + ${(NOW / HOURS) * 100}% - ${(100 / HOURS) * NOW}px)`, width: 1, background: 'var(--sq-gold)', zIndex: 3 }}>
          <div style={{ position: 'absolute', top: -6, left: -3, width: 7, height: 7, borderRadius: 4, background: 'var(--sq-gold)' }} />
        </div>
        {courts.map((c, idx) => (
          <div key={c} style={{ display: 'flex', alignItems: 'center', height: 30 }}>
            <div style={{ width: 100, paddingRight: 10, flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{c}</div>
            </div>
            <div style={{ flex: 1, position: 'relative', height: 26, background: 'rgba(255,255,255,0.025)', borderRadius: 6, border: '1px solid var(--sq-border)' }}>
              {SCHED[idx].map((b, i) => {
                const c2 = color(b.type);
                return <div key={i} style={{ position: 'absolute', top: 2, bottom: 2, left: `${(b.s / HOURS) * 100}%`, width: `${(b.len / HOURS) * 100}%`, background: c2.bg, border: `1px solid ${c2.border}`, borderRadius: 4, padding: '0 6px', display: 'flex', alignItems: 'center', fontFamily: 'var(--sq-mono)', fontSize: 9.5, fontWeight: 500, color: c2.color, overflow: 'hidden', whiteSpace: 'nowrap' }}>{b.label}</div>;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueChart({ range = '7d' }) {
  const mult = range === '30d' ? 4.3 : range === '90d' ? 12.8 : 1;
  const data = REVENUE_7D;
  const max = 5500;
  const w = 540, h = 160, pl = 30, pt = 8, pb = 22;
  const cw = w - pl, ch = h - pt - pb;
  const pts = data.map((v, i) => [pl + (i / (data.length - 1)) * cw, pt + (1 - v / max) * ch]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const fill = path + ` L${pl + cw} ${pt + ch} L${pl} ${pt + ch} Z`;
  const total = Math.round(data.reduce((a, b) => a + b, 0) * mult).toLocaleString();
  return (
    <div className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Revenue · last {range}</h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--sq-text-3)' }}>{ACADEMY.short} · EGP {total} total</p>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--sq-gold) 25%, transparent)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((g) => <line key={g} x1={pl} x2={w} y1={pt + g * ch} y2={pt + g * ch} stroke="rgba(255,255,255,0.05)" />)}
        <path d={fill} fill="url(#rev-fill)" />
        <path d={path} fill="none" stroke="var(--sq-gold)" strokeWidth="1.6" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4 : 2.5} fill={i === pts.length - 1 ? 'var(--sq-gold)' : '#0a0a0a'} stroke="var(--sq-gold)" strokeWidth="1.4" />)}
        {REVENUE_DAYS.map((d, i) => <text key={i} x={pts[i][0]} y={h - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9.5" fontFamily="var(--sq-mono)">{d}</text>)}
      </svg>
    </div>
  );
}

function Dashboard() {
  const notify = useToast();
  return (
    <>
      <Topbar title={`Welcome back, ${ACADEMY.owner.split(' ')[0]}.`} sub="Wednesday · 14 May 2026 · 15:24" trailing={
        <>
          <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5 }} onClick={() => notify('Filters applied')}>Filters</button>
          <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('New booking started')}>
            <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> New booking
          </button>
        </>
      } />
      <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <KPI label="Today's revenue" value="EGP 84,200" delta="+18%" sub="vs last Wed" tone="gold" />
          <KPI label="Bookings today" value="22 of 32" delta="69%" sub="utilization" />
          <KPI label="Active group trainings" value="4" sub="32 players signed up" />
          <KPI label="Court hours sold" value="26.5h" delta="+4.5h" sub="vs last week" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <div className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="sq-live-dot" />
                <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Live court schedule</h2>
              </div>
              <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>15:00 — 22:00</span>
            </div>
            <MiniSchedule />
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--sq-text-3)', paddingTop: 10, borderTop: '1px solid var(--sq-border)' }}>
              <Legend dot="var(--sq-gold)">Booked</Legend>
              <Legend dot="var(--sq-blue)">Coach priority</Legend>
              <Legend dot="rgba(74,222,128,0.7)">In-play</Legend>
            </div>
          </div>
          <div className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Up next today</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { t: '15:30', name: 'Yusuf Hamdi', court: 'Court 3' },
                { t: '16:00', name: 'Salma Ibrahim', court: 'Court 5' },
                { t: '16:30', name: 'Coach Karim · drill', court: 'Court 1' },
                { t: '17:00', name: 'Ali Mansour', court: 'Court 2' },
                { t: '17:30', name: 'Maged Family · doubles', court: 'Court 4' },
                { t: '18:00', name: 'Friday Drill Squad', court: 'Court 1' },
              ].map((r) => (
                <div key={r.t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--sq-border)' }}>
                  <div className="sq-mono" style={{ width: 42, fontSize: 13, fontWeight: 500 }}>{r.t}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                    <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>{r.court}</div>
                  </div>
                  <button className="sq-btn-ghost" style={{ padding: '4px 10px', fontSize: 10.5 }} onClick={() => notify(`Opened ${r.name}`)}>View</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Court schedule (full grid, view toggle) ──────────────────────────
function FullSchedule() {
  const HOURS = 15, COURT_W = 120, ROW_H = 56;
  const courts = ADMIN_COURTS;
  const BK = [
    { c: 0, s: 1.5, l: 1, type: 'booked', who: 'Mostafa A.', sub: 'paid · 280' },
    { c: 0, s: 9.5, l: 1.5, type: 'coach', who: 'Coach Karim', sub: 'priority' },
    { c: 0, s: 11, l: 1.5, type: 'clinic', who: 'Drill Squad', sub: '8/8' },
    { c: 1, s: 0.5, l: 1, type: 'booked', who: 'Hany Mostafa', sub: 'paid · 280' },
    { c: 1, s: 3, l: 1, type: 'booked', who: 'Ali Mansour', sub: 'pending' },
    { c: 2, s: 0, l: 1, type: 'playing', who: 'Yusuf Hamdi', sub: '22m left' },
    { c: 2, s: 2, l: 1, type: 'booked', who: 'Omar Khaled', sub: 'paid · 180' },
    { c: 3, s: 4, l: 2, type: 'booked', who: 'Maged Family', sub: 'doubles' },
    { c: 3, s: 8, l: 1, type: 'block', who: 'Maintenance', sub: 'resurfacing' },
    { c: 4, s: 1.5, l: 1, type: 'playing', who: 'R. Adel', sub: '8m left' },
    { c: 4, s: 10, l: 2, type: 'booked', who: 'Karim H.', sub: 'peak' },
    { c: 5, s: 5, l: 1, type: 'booked', who: 'Mona N.', sub: 'paid · 180' },
  ];
  const color = (t) => ({
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
          {[...Array(HOURS + 1)].map((_, i) => <div key={i} style={{ flex: 1, padding: '8px 0 8px 6px', fontSize: 11, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)', borderLeft: i ? '1px solid var(--sq-border)' : 'none' }}>{(7 + i).toString().padStart(2, '0')}</div>)}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `calc(${COURT_W}px + ${(NOW / HOURS) * 100}% - ${(COURT_W * NOW) / HOURS}px)`, width: 2, background: 'var(--sq-gold)', zIndex: 5, opacity: 0.7 }}>
          <div style={{ position: 'absolute', top: -5, left: -4, padding: '2px 5px', background: 'var(--sq-gold)', color: '#0a0a0a', borderRadius: 4, fontSize: 9, fontWeight: 700, fontFamily: 'var(--sq-mono)' }}>15:30</div>
        </div>
        {courts.map((c, ci) => (
          <div key={c.n} style={{ display: 'flex', height: ROW_H, borderBottom: ci < courts.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
            <div style={{ width: COURT_W, padding: '10px 14px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{c.n}</div>
              <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>{c.type}</div>
            </div>
            <div style={{ flex: 1, position: 'relative', background: ci % 2 ? 'rgba(255,255,255,0.005)' : 'transparent' }}>
              {[...Array(HOURS)].map((_, i) => <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(i / HOURS) * 100}%`, width: 1, background: 'rgba(255,255,255,0.03)' }} />)}
              {BK.filter((b) => b.c === ci).map((b, i) => {
                const c2 = color(b.type);
                return (
                  <div key={i} style={{ position: 'absolute', top: 4, bottom: 4, left: `${(b.s / HOURS) * 100}%`, width: `${(b.l / HOURS) * 100}%`, background: c2.bg, border: `1px ${c2.dashed ? 'dashed' : 'solid'} ${c2.border}`, borderRadius: 6, padding: '4px 7px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
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
  const notify = useToast();
  const [view, setView] = useState('Day');
  return (
    <>
      <Topbar title="Court schedule" sub="Live · auto-refresh 30s" trailing={
        <>
          <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5 }} onClick={() => notify('Jumped to today')}>Today</button>
          <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('Block / reserve dialog')}>
            <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Block / reserve
          </button>
        </>
      } />
      <div style={{ padding: '20px 32px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 11.5, color: 'var(--sq-text-2)' }}>
            <Legend dot="var(--sq-gold)">Paid booking</Legend>
            <Legend dot="var(--sq-blue)">Coach priority</Legend>
            <Legend dot="rgba(74,222,128,0.7)">In play</Legend>
            <Legend dot="rgba(239,85,96,0.6)">Blocked</Legend>
          </div>
          <Seg options={['Day', 'Week', 'Month']} value={view} onChange={(v) => { setView(v); notify(`${v} view`); }} />
        </div>
        {view === 'Day' ? (
          <FullSchedule />
        ) : (
          <div className="sq-card" style={{ padding: 60, textAlign: 'center', color: 'var(--sq-text-3)' }}>
            <Icons.Calendar size={28} />
            <div className="sq-display" style={{ fontSize: 16, fontWeight: 600, color: 'var(--sq-text)', marginTop: 10 }}>{view} view</div>
            <p style={{ fontSize: 12.5, marginTop: 6 }}>Switch back to Day for the live court grid.</p>
          </div>
        )}
      </div>
    </>
  );
}

// ── Courts ───────────────────────────────────────────────────────────
function Courts() {
  const notify = useToast();
  const [courts, setCourts] = useState(ADMIN_COURTS);
  const togglePeak = (i) => setCourts((cs) => cs.map((c, j) => (j === i ? { ...c, peakOn: !c.peakOn } : c)));
  return (
    <>
      <Topbar title="Courts" sub="Courts & pricing" trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('Add court')}>
          <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Add court
        </button>
      } />
      <div style={{ padding: '24px 32px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {courts.map((c, i) => (
          <div key={c.n} className="sq-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: 'color-mix(in srgb, var(--sq-gold) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 25%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Court size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{c.n}</div>
              <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{c.type}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="sq-mono" style={{ fontSize: 14, color: 'var(--sq-text)' }}>EGP {c.base}<span style={{ color: 'var(--sq-text-3)', fontSize: 10.5, marginLeft: 3 }}>/hr</span></div>
              <button onClick={() => togglePeak(i)} className="sq-mono" style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: 10.5, color: c.peakOn ? 'var(--sq-gold)' : 'var(--sq-text-3)', marginTop: 2 }}>
                {c.peakOn ? `peak EGP ${c.peak} ⚡` : 'peak off'}
              </button>
            </div>
            <button className="sq-btn-ghost" style={{ padding: '7px 12px', fontSize: 11.5 }} onClick={() => notify(`Editing ${c.n}`)}>Edit</button>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Coaches (add / remove → persists to Supabase) ────────────────────
function Coaches() {
  const notify = useToast();
  const state = useStore();
  const coaches = state.staff.filter((s) => s.org_id === 'ramyashour');
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Coach');
  const [squads, setSquads] = useState('');
  const fieldCss = { padding: '10px 12px', border: '1px solid var(--sq-border-2)', borderRadius: 8, background: 'rgba(255,255,255,0.02)', fontSize: 13.5, color: 'var(--sq-text)', outline: 'none', width: '100%', fontFamily: 'var(--sq-body)' };
  const Label = ({ children }) => <label className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{children}</label>;

  function submit() {
    if (!name.trim()) return notify('Enter a name');
    store.addStaff('ramyashour', { name, role, squads });
    notify(`Added ${name.trim()}`);
    setName(''); setRole('Coach'); setSquads(''); setAdding(false);
  }
  return (
    <>
      <Topbar title="Coaches" sub={`${coaches.length} on the team`} trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => setAdding((v) => !v)}>
          <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Add coach
        </button>
      } />
      <div style={{ padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
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
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="sq-btn-ghost" style={{ flex: 1, padding: '8px', fontSize: 12 }} onClick={() => notify(`Messaging ${c.name.split(' ')[0]}`)}>Message</button>
                <button className="sq-btn-ghost" style={{ padding: '8px', fontSize: 12, color: 'var(--sq-text-3)' }} onClick={() => { store.removeStaff(c.id); notify(`Removed ${c.name}`); }}>Remove</button>
              </div>
            </div>
          ))}
          {!coaches.length && <div className="sq-mono" style={{ fontSize: 12.5, color: 'var(--sq-text-3)' }}>No coaches yet — add one above.</div>}
        </div>
      </div>
    </>
  );
}

// ── Players ──────────────────────────────────────────────────────────
function Players() {
  const notify = useToast();
  const [filter, setFilter] = useState('All');
  const segs = ['All', 'active', 'trial', 'inactive'];
  const rows = filter === 'All' ? ADMIN_PLAYERS : ADMIN_PLAYERS.filter((p) => p.status === filter);
  const GRID = '2fr 1fr 1.4fr 1fr 1fr';
  const pill = (s) => ({ active: 'green', trial: 'gold', inactive: '' })[s];
  return (
    <>
      <Topbar title="Players" sub="184 registered" trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('Invite players')}>
          <Icons.Plus size={14} style={{ marginRight: 6, verticalAlign: -3 }} /> Invite players
        </button>
      } />
      <div style={{ padding: '20px 32px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {segs.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={'sq-chip' + (filter === s ? ' gold' : '')} style={{ cursor: 'pointer', padding: '8px 14px', fontSize: 12.5, textTransform: 'capitalize' }}>
              {s === 'All' ? 'All players' : s}
            </button>
          ))}
        </div>
        <div className="sq-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--sq-border)', background: 'rgba(255,255,255,0.015)' }}>
            {['Player', 'Division', 'Coach', 'Status', 'Spend (EGP)'].map((h) => <span key={h} className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>)}
          </div>
          {rows.map((p, i) => (
            <div key={p.name} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '13px 20px', alignItems: 'center', borderBottom: i < rows.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: 'linear-gradient(135deg, #2a2a2a, #161616)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 600 }}>{p.initials}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.name}</div>
                  <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>Joined {p.joined}</div>
                </div>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--sq-text-2)' }}>{p.division}</span>
              <span style={{ fontSize: 12.5, color: 'var(--sq-text-2)' }}>{p.coach}</span>
              <span className={'sq-chip ' + (pill(p.status) === 'gold' ? 'gold' : '')} style={{ width: 'fit-content', padding: '3px 10px', fontSize: 10.5, textTransform: 'capitalize', ...(pill(p.status) === 'green' ? { color: 'var(--sq-green)', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.1)' } : {}) }}>{p.status}</span>
              <span className="sq-mono" style={{ fontSize: 12.5 }}>{p.spend}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Revenue ──────────────────────────────────────────────────────────
function Revenue() {
  const [range, setRange] = useState('7d');
  const breakdown = REVENUE_BREAKDOWN;
  return (
    <>
      <Topbar title="Revenue" sub="Income & breakdown" trailing={<Seg options={['7d', '30d', '90d']} value={range} onChange={setRange} />} />
      <div style={{ padding: '24px 32px 40px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>
        <RevenueChart range={range} />
        <div className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Where it comes from</h2>
          {breakdown.map(([label, pct, amt]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                <span style={{ color: 'var(--sq-text-2)' }}>{label}</span>
                <span className="sq-mono">{amt}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ width: pct, height: '100%', background: 'var(--sq-gold)', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Academy profile ──────────────────────────────────────────────────
function FormCard({ title, step, children }) {
  return (
    <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
        {step && <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{step}</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{children}</div>
    </div>
  );
}
function Field({ label, value, mono }) {
  const [v, setV] = useState(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      <input value={v} onChange={(e) => setV(e.target.value)} style={{ padding: '10px 12px', border: '1px solid var(--sq-border-2)', borderRadius: 8, background: 'rgba(255,255,255,0.02)', fontFamily: mono ? 'var(--sq-mono)' : 'var(--sq-body)', fontSize: 13.5, color: 'var(--sq-text)', outline: 'none' }} />
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
function AcademyProfile() {
  const notify = useToast();
  const state = useStore();
  const [name, setName] = useState(state.academyName || ACADEMY.name);
  function save() { store.setOrgName('academy', name); notify('Changes saved'); }
  return (
    <>
      <Topbar title="Academy profile" sub="Branding · public page" trailing={
        <>
          <button className="sq-btn-ghost" style={{ padding: '9px 14px', fontSize: 12.5 }} onClick={() => notify('Opening public page')}>Preview public page</button>
          <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={save}>Save changes</button>
        </>
      } />
      <div style={{ padding: '24px 32px 40px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <FormCard title="Brand" step="Logo & cover">
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 110, flexShrink: 0 }}>
                <label style={{ fontSize: 11, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Logo</label>
                <UploadSlot value={state.images.academyLogo} onChange={(d) => { store.setImage('academyLogo', d); notify('Logo updated'); }} label="Drop logo" height={110} radius={16} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                <label style={{ fontSize: 11, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cover image</label>
                <UploadSlot value={state.images.academyCover} onChange={(d) => { store.setImage('academyCover', d); notify('Cover updated'); }} label="Drop a cover photo of your courts" height={110} radius={12} />
              </div>
            </div>
          </FormCard>
          <FormCard title="Details" step="Public info">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Academy name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '10px 12px', border: '1px solid var(--sq-border-2)', borderRadius: 8, background: 'rgba(255,255,255,0.02)', fontFamily: 'var(--sq-body)', fontSize: 13.5, color: 'var(--sq-text)', outline: 'none' }} />
            </div>
            <Field label="Tagline" value={ACADEMY.tagline} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="City" value="Cairo" />
              <Field label="District" value={ACADEMY.district} />
            </div>
            <Field label="Contact" value={ACADEMY.contact} mono />
          </FormCard>
          <FormCard title="Brand color" step="Accent">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {BRAND_COLORS.map((c) => {
                const on = state.academyTheme.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button key={c.hex} title={c.name} onClick={() => { store.setAcademyTheme(c.hex); notify(`Theme set to ${c.name}`); }} style={{ width: 38, height: 38, borderRadius: 10, background: c.hex, cursor: 'pointer', border: 0, color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: on ? `0 0 0 2px var(--sq-bg), 0 0 0 4px ${c.hex}` : 'none' }}>
                    {on && <Icons.Check size={16} />}
                  </button>
                );
              })}
              <span style={{ fontSize: 12, color: 'var(--sq-text-3)', marginLeft: 4 }}>SERVE runs in your colour, everywhere.</span>
            </div>
          </FormCard>
        </div>
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Players see this →</div>
          <div className="sq-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 150 }}>
              {state.images.academyCover ? <img src={state.images.academyCover} alt="" style={{ width: '100%', height: 150, objectFit: 'cover' }} /> : <ImgPlaceholder label="cover" height={150} radius={0} hue="gold" style={{ borderRadius: 0, border: 0 }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(7,7,7,0.95) 100%)' }} />
              <span className="sq-chip gold" style={{ position: 'absolute', top: 12, left: 12 }}><span className="sq-live-dot" /> Open now</span>
            </div>
            <div style={{ padding: '0 18px 18px', marginTop: -34, position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, overflow: 'hidden', border: '2px solid var(--sq-bg)', background: 'var(--sq-surface-2)' }}>
                {state.images.academyLogo ? <img src={state.images.academyLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImgPlaceholder label="logo" height={64} radius={16} hue="gold" />}
              </div>
              <h2 className="sq-display" style={{ margin: '12px 0 2px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{ACADEMY.name}</h2>
              <div style={{ color: 'var(--sq-text-2)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icons.Pin size={12} /> {ACADEMY.city}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, margin: '14px 0 0' }}>
                <PreviewStat label="Courts" value={ACADEMY.courts} />
                <PreviewStat label="Juniors" value={ACADEMY.juniors} />
                <PreviewStat label="From" value={`EGP ${ACADEMY.minPrice}`} />
              </div>
              <button className="sq-btn-gold" style={{ marginTop: 14, padding: '11px 16px', fontSize: 13, width: '100%' }} onClick={() => notify('Booking flow')}>Book a court</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Create team training ─────────────────────────────────────────────
function CreateClinic() {
  const notify = useToast();
  return (
    <>
      <Topbar title="Create a team training" sub="Group training" trailing={
        <>
          <button className="sq-btn-ghost" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('Draft saved')}>Save draft</button>
          <button className="sq-btn-gold" style={{ padding: '9px 18px', fontSize: 12.5 }} onClick={() => notify('Published to players')}>Publish to players →</button>
        </>
      } />
      <div style={{ padding: '24px 32px 40px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <FormCard title="Session" step="1 / 3">
            <Field label="Title" value="Friday Night Drill Squad" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Type" value="Drill clinic" />
              <Field label="Level" value="Intermediate · 3.5–4.5" />
            </div>
          </FormCard>
          <FormCard title="Schedule" step="2 / 3">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Coach" value="Karim El-Hosary" />
              <Field label="Court" value="Court 1 · Glass" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Start" value="18:00" mono />
              <Field label="Duration" value="90 min" mono />
              <Field label="Sessions" value="8" mono />
            </div>
          </FormCard>
          <FormCard title="Players" step="3 / 3">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Max players" value="8" mono />
              <Field label="Price / player (EGP)" value="350" mono />
            </div>
          </FormCard>
        </div>
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Players see this →</div>
          <div className="sq-card" style={{ padding: 0, overflow: 'hidden' }}>
            <ImgPlaceholder label="coach_karim_action.jpg" height={140} hue="navy" radius={0} style={{ borderRadius: 0, border: 0 }} />
            <div style={{ padding: 18 }}>
              <span className="sq-chip" style={{ color: 'var(--sq-blue)', borderColor: 'rgba(78,168,255,0.25)', background: 'rgba(78,168,255,0.1)' }}><Icons.Users size={11} /> Team Training · 8 players</span>
              <h2 className="sq-display" style={{ margin: '10px 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Friday Night Drill Squad</h2>
              <div style={{ color: 'var(--sq-text-2)', fontSize: 12.5 }}>{ACADEMY.name} · Court 1 (glass)</div>
              <div style={{ paddingTop: 14, marginTop: 14, borderTop: '1px solid var(--sq-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-gold)' }}>3 OF 8 SPOTS LEFT</div>
                  <div className="sq-display" style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>EGP 350</div>
                </div>
                <button className="sq-btn-gold" style={{ padding: '10px 16px', fontSize: 12.5 }} onClick={() => notify('Joined (player view)')}>Join</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Setup wizard (5 steps, fully steppable, pre-filled) ──────────────
function Wizard({ onExit }) {
  const notify = useToast();
  const [step, setStep] = useState(0);
  const cur = SETUP_STEPS[step];
  const pct = ((step + 1) / SETUP_STEPS.length) * 100;

  const next = () => (step < SETUP_STEPS.length - 1 ? setStep(step + 1) : (notify('Academy is live 🎉'), onExit()));
  const back = () => (step > 0 ? setStep(step - 1) : onExit());

  return (
    <div className="sq-app" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--sq-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SQLogo size={20} accent />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Step {step + 1} of {SETUP_STEPS.length}</span>
          <div style={{ width: 160, height: 4, borderRadius: 2, background: 'var(--sq-surface-2)' }}>
            <motion.div animate={{ width: pct + '%' }} transition={{ duration: 0.25 }} style={{ height: '100%', background: 'var(--sq-gold)', borderRadius: 2 }} />
          </div>
          <button className="sq-btn-ghost" style={{ padding: '7px 12px', fontSize: 11.5 }} onClick={onExit}>Skip</button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 0 }}>
        <div style={{ padding: '32px 24px', borderRight: '1px solid var(--sq-border)', background: 'var(--sq-surface)', overflowY: 'auto' }}>
          <h2 className="sq-display" style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Set up your academy</h2>
          <p style={{ margin: '4px 0 20px', fontSize: 12, color: 'var(--sq-text-3)' }}>{ACADEMY.name}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SETUP_STEPS.map((s, i) => (
              <button key={s.key} onClick={() => setStep(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8, background: i === step ? 'color-mix(in srgb, var(--sq-gold) 8%, transparent)' : 'transparent', border: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--sq-body)' }}>
                <div style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, background: i < step ? 'var(--sq-gold)' : i === step ? 'color-mix(in srgb, var(--sq-gold) 15%, transparent)' : 'var(--sq-surface-2)', border: '1px solid', borderColor: i <= step ? 'color-mix(in srgb, var(--sq-gold) 40%, transparent)' : 'var(--sq-border)', color: i < step ? '#0a0a0a' : i === step ? 'var(--sq-gold)' : 'var(--sq-text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--sq-display)', fontSize: 11.5, fontWeight: 700 }}>
                  {i < step ? <Icons.Check size={13} /> : s.n}
                </div>
                <span style={{ fontSize: 13, color: i === step ? 'var(--sq-text)' : i < step ? 'var(--sq-text-2)' : 'var(--sq-text-3)', fontWeight: i === step ? 500 : 400 }}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
            <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 12 }}>0{cur.n} — {cur.label}</div>
            <AnimatePresence mode="wait">
              <motion.div key={cur.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>
                <WizardStep step={cur.key} notify={notify} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div style={{ padding: '18px 40px', borderTop: '1px solid var(--sq-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="sq-btn-ghost" style={{ padding: '12px 18px', fontSize: 13 }} onClick={back}>← {step === 0 ? 'Exit' : 'Back'}</button>
            <button className="sq-btn-gold" style={{ padding: '12px 22px', fontSize: 13 }} onClick={next}>
              {step === SETUP_STEPS.length - 1 ? 'Finish & go live →' : `Continue to ${SETUP_STEPS[step + 1].label.toLowerCase()} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WizardStep({ step }) {
  if (step === 'details') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
        <h1 className="sq-display" style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em' }}>Tell us about your academy.</h1>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ width: 80, flexShrink: 0 }}><UploadSlot value={store.get().images.academyLogo} onChange={(d) => store.setImage('academyLogo', d)} label="Logo" height={80} radius={16} /></div>
          <div style={{ flex: 1 }}><Field label="Academy name" value={ACADEMY.name} /></div>
        </div>
        <Field label="Tagline" value={ACADEMY.tagline} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="City" value="Cairo" />
          <Field label="District" value={ACADEMY.district} />
        </div>
        <Field label="Contact" value={ACADEMY.contact} mono />
      </div>
    );
  }
  if (step === 'hours') {
    return (
      <div style={{ maxWidth: 560 }}>
        <h1 className="sq-display" style={{ margin: '0 0 16px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em' }}>When are you open?</h1>
        <div className="sq-card" style={{ overflow: 'hidden' }}>
          {OPERATING_HOURS.map((d, i) => (
            <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: i < OPERATING_HOURS.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{d.day}</span>
              <span className="sq-mono" style={{ fontSize: 13, color: 'var(--sq-text-2)' }}>{d.open} — {d.close}</span>
              <span className="sq-chip" style={{ color: 'var(--sq-green)', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.1)', fontSize: 10.5 }}>Open</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (step === 'courts') {
    return (
      <div style={{ maxWidth: 560 }}>
        <h1 className="sq-display" style={{ margin: '0 0 16px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em' }}>Add your courts & pricing.</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ADMIN_COURTS.map((c) => (
            <div key={c.n} className="sq-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'color-mix(in srgb, var(--sq-gold) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 25%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Court size={18} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{c.n}</div>
                <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{c.type}</div>
              </div>
              <div className="sq-mono" style={{ fontSize: 13 }}>EGP {c.base}<span style={{ color: 'var(--sq-text-3)', fontSize: 10.5, marginLeft: 4 }}>/hr</span></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (step === 'coaches') {
    return (
      <div style={{ maxWidth: 620 }}>
        <h1 className="sq-display" style={{ margin: '0 0 16px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em' }}>Add your coaches.</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {ADMIN_COACHES.slice(0, 4).map((c) => (
            <div key={c.name} className="sq-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 19, background: 'linear-gradient(135deg, #2a2a2a, #161616)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{c.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-gold)' }}>{c.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  // open
  return (
    <div style={{ maxWidth: 520, textAlign: 'center', margin: '20px auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: 'radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--sq-gold) 26%, transparent), var(--sq-surface) 70%)', border: '1px solid color-mix(in srgb, var(--sq-gold) 35%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icons.Trophy size={38} />
      </div>
      <h1 className="sq-display" style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em' }}>You're ready to go live.</h1>
      <p style={{ margin: 0, color: 'var(--sq-text-2)', fontSize: 14, lineHeight: 1.55 }}>
        {ACADEMY.name} will be visible to players across Cairo. They can book courts, join training, and follow your academy on SERVE.
      </p>
    </div>
  );
}

// ── Payments (academy only — mark paid by cash or card) ──────────────
function Payments() {
  const notify = useToast();
  const state = useStore();
  const [filter, setFilter] = useState('all');
  const rows = filter === 'all' ? state.payments : state.payments.filter((p) => p.status === filter);
  const outstanding = state.payments.filter((p) => p.status === 'unpaid').reduce((s, p) => s + p.amount, 0);
  const segs = [['all', 'All'], ['unpaid', 'Unpaid'], ['paid', 'Paid']];
  const GRID = '1.6fr 2fr 0.9fr 1.2fr 1.4fr';
  return (
    <>
      <Topbar title="Payments" sub="Mark cash or card — manual reconciliation" trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => notify('Add a charge')}>
          <Icons.Plus size={14} /> Add charge
        </button>
      } />
      <div style={{ padding: '20px 32px 40px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            {segs.map(([id, label]) => (
              <button key={id} onClick={() => setFilter(id)} className={'sq-chip' + (filter === id ? ' gold' : '')} style={{ cursor: 'pointer', padding: '8px 14px', fontSize: 12.5 }}>{label}</button>
            ))}
          </div>
          <div className="sq-mono" style={{ fontSize: 12.5, color: 'var(--sq-text-2)' }}>Outstanding: <span style={{ color: 'var(--sq-gold)', fontWeight: 600 }}>EGP {outstanding.toLocaleString()}</span></div>
        </div>
        <div className="sq-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--sq-border)', background: 'rgba(255,255,255,0.015)' }}>
            {['Player', 'Charge', 'Amount', 'Status', 'Mark paid'].map((h) => <span key={h} className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>)}
          </div>
          {rows.map((p, i) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: GRID, gap: 12, padding: '13px 20px', alignItems: 'center', borderBottom: i < rows.length - 1 ? '1px solid var(--sq-border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 30, height: 30, borderRadius: 15, background: 'linear-gradient(135deg, #2a2a2a, #161616)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 600 }}>{p.player.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{p.player}</span>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--sq-text-2)' }}>{p.item}</span>
              <span className="sq-mono" style={{ fontSize: 13 }}>EGP {p.amount}</span>
              <div>
                {p.status === 'paid'
                  ? <span className="sq-chip" style={{ fontSize: 10.5, color: 'var(--sq-green)', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.1)' }}><Icons.Check size={11} /> {p.method === 'cash' ? 'Cash' : 'Card'}</span>
                  : <span className="sq-chip" style={{ fontSize: 10.5 }}>Unpaid</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {p.status === 'unpaid' ? (
                  <>
                    <button className="sq-btn-gold" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => { store.setPayment(p.id, { status: 'paid', method: 'cash' }); notify(`${p.player.split(' ')[0]} marked paid — cash`); }}>Cash</button>
                    <button className="sq-btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => { store.setPayment(p.id, { status: 'paid', method: 'card' }); notify(`${p.player.split(' ')[0]} marked paid — card`); }}>Card</button>
                  </>
                ) : (
                  <button className="sq-btn-ghost" style={{ padding: '6px 12px', fontSize: 11, color: 'var(--sq-text-3)' }} onClick={() => { store.setPayment(p.id, { status: 'unpaid', method: null }); notify('Marked unpaid'); }}>Undo</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── shell ────────────────────────────────────────────────────────────
const SECTIONS = {
  dashboard: Dashboard, profile: AcademyProfile, schedule: Schedule,
  courts: Courts, coaches: Coaches, players: Players, clinics: CreateClinic, payments: Payments, revenue: Revenue,
};

function ConsoleInner() {
  const state = useStore();
  const [active, setActive] = useState('dashboard');
  const body = active === 'setup' ? <Wizard onExit={() => setActive('dashboard')} /> : (
    <div className="sq-app" style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Sidebar active={active} onNav={setActive} />
      <div style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>
            {(() => { const Section = SECTIONS[active] || Dashboard; return <Section />; })()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
  return <ThemeScope accent={state.academyTheme}>{body}</ThemeScope>;
}

export default function AdminConsole() {
  return (
    <ToastProvider>
      <ConsoleInner />
    </ToastProvider>
  );
}
