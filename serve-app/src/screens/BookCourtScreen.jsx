// BookCourtScreen.jsx — reserve an available court. Pick a free court, a
// start time and how long you want it, see the real price, then continue to
// payment. Any member can book any court that's currently free.
//
// Rates come from the venue's own rate card (branch standard / peak, with an
// optional per-court override), and slots outside the branch's opening hours
// are shown but not selectable.

import { useState, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import ThemeScope from '../components/ThemeScope';
import { useNav } from '../navigation/nav';
import { useStore, orgInfo } from '../store';
import { useT } from '../i18n';
import { TIME_SLOTS, TIME_PERIODS, slotsInPeriod, periodForHour } from '../data';
import { courtRate, branchRates, isPeak, priceFor as amountFor, endTime, DURATIONS, DEFAULT_DURATION } from '../lib/pricing';
import { hoursOf, isAlwaysOpen, parseHHMM } from '../lib/live';

export default function BookCourtScreen({ court: preCourt, branch }) {
  const { nav } = useNav();
  const state = useStore();
  const t = useT();
  const activeBranch = branch || preCourt?.branch || state.branches.find((b) => b.org_id === 'heliopolis')?.id;
  const branchRow = state.branches.find((b) => b.id === activeBranch);
  const org = orgInfo(state, branchRow?.org_id || 'heliopolis');
  const rates = branchRates(branchRow);
  const hours = hoursOf(branchRow);

  const freeCourts = state.courts.filter((c) => c.status === 'free' && c.branch === activeBranch);
  const [courtNo, setCourtNo] = useState(preCourt?.court ?? freeCourts[0]?.court ?? null);
  const [time, setTime] = useState('18:00');
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  // 24/7 — one period at a time so the picker stays a picker, opening on
  // whichever contains the current hour
  const [period, setPeriod] = useState(() => periodForHour(new Date().getHours()).key);
  const shownSlots = slotsInPeriod(TIME_PERIODS.find((p) => p.key === period) || TIME_PERIODS[3]);

  const court = state.courts.find((c) => c.branch === activeBranch && c.court === courtNo);
  const rate = courtRate(state, activeBranch, courtNo, time);
  const price = amountFor(rate, duration);
  const peak = isPeak(time, rates);

  // a slot the venue isn't open for can be seen but not picked
  const bookable = useMemo(() => {
    if (isAlwaysOpen(hours)) return () => true;
    return (hhmm) => {
      const m = parseHHMM(hhmm);
      if (m == null) return false;
      const inWindow = (x) => x >= hours.open * 60 && x < hours.close * 60;
      return inWindow(m) || inWindow(m + 1440);
    };
  }, [hours.open, hours.close]);

  if (!freeCourts.length) {
    return (
      <ThemeScope accent={org.accent || state.clubTheme}>
        <MScreen header={<div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}><Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill><span className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>{t('Book a court')}</span></div>}>
          <div style={{ height: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--sq-text-3)', padding: 30, textAlign: 'center' }}>
            <Icons.Court size={34} />
            <div className="sq-display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--sq-text)' }}>{t('All courts are busy')}</div>
            <p style={{ fontSize: 13, lineHeight: 1.5 }}>{t('Every court is in use right now. Check the live tracker — one frees up soon.')}</p>
          </div>
        </MScreen>
      </ThemeScope>
    );
  }

  return (
    <ThemeScope accent={org.accent || state.clubTheme}>
      <MScreen
        header={
          <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill>
            <div style={{ minWidth: 0 }}>
              <span className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>{t('Book a court')}</span>
              <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>{org.name || branchRow?.name}</div>
            </div>
          </div>
        }
        tabBar={
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--sq-border)', background: 'var(--sq-scrim)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {t('Total')} · {duration} {t('min')}{peak ? ` · ${t('peak')}` : ''}
              </div>
              <div className="sq-display" style={{ fontSize: 20, fontWeight: 700 }}>EGP {price}</div>
            </div>
            <button className="sq-btn-gold serve-glow-soft" style={{ padding: '15px 22px', fontSize: 14.5 }} disabled={!court || !time || !bookable(time)}
              onClick={() => nav.push('payment', { courtNo, branch: activeBranch, type: court?.type, venue: org.name || branchRow?.name || 'SERVE', day: 'Today', time, endTime: endTime(time, duration), duration, price, secureCourt: true })}>
              {t('Continue to pay')} →
            </button>
          </div>
        }
      >
        <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('Available courts')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {freeCourts.map((c) => {
                const on = c.court === courtNo;
                return (
                  <button key={c.court} onClick={() => setCourtNo(c.court)} style={{
                    textAlign: 'left', cursor: 'pointer', padding: 14, borderRadius: 13,
                    background: on ? 'color-mix(in srgb, var(--sq-gold) 12%, var(--sq-surface))' : 'var(--sq-surface)',
                    border: '1.5px solid ' + (on ? 'color-mix(in srgb, var(--sq-gold) 55%, transparent)' : 'var(--sq-border)'),
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="sq-display" style={{ fontSize: 16, fontWeight: 700 }}>{t('Court')} {c.court}</span>
                      {on && <span style={{ color: 'var(--sq-gold)', display: 'inline-flex' }}><Icons.Check size={16} /></span>}
                    </div>
                    <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', marginTop: 4 }}>{c.type}</div>
                    <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-gold)', marginTop: 6 }}>
                      EGP {courtRate(state, activeBranch, c.court, time)} / {t('hr')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* how long */}
          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('How long')}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DURATIONS.map((d) => {
                const on = d === duration;
                return (
                  <button key={d} onClick={() => setDuration(d)} className="sq-mono" style={{
                    padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    border: '1px solid ' + (on ? 'transparent' : 'var(--sq-border)'),
                    background: on ? 'var(--sq-gold)' : 'var(--sq-surface)',
                    color: on ? '#0e0b0a' : 'var(--sq-text)',
                  }}>{d} {t('min')}</button>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('Start time · today')}</div>
              {rates.peak && (
                <span className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>
                  {t('Peak')} {String(rates.from).padStart(2, '0')}:00–{String(rates.to).padStart(2, '0')}:00 · EGP {rates.peak}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {TIME_PERIODS.map((p) => (
                <button key={p.key} onClick={() => setPeriod(p.key)}
                  style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sq-body)', border: '1px solid ' + (p.key === period ? 'transparent' : 'var(--sq-border)'), background: p.key === period ? 'var(--sq-gold)' : 'transparent', color: p.key === period ? '#0e0b0a' : 'var(--sq-text-2)', fontWeight: p.key === period ? 600 : 400 }}>
                  {t(p.label)}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {shownSlots.map((s) => {
                const on = s === time;
                const can = bookable(s);
                return (
                  <button key={s} onClick={() => can && setTime(s)} disabled={!can} className="sq-mono"
                    title={can ? undefined : t('Closed at this hour')}
                    style={{
                      padding: '10px 14px', borderRadius: 10, fontSize: 13.5, fontWeight: 500,
                      cursor: can ? 'pointer' : 'not-allowed', opacity: can ? 1 : 0.32,
                      border: '1px solid ' + (on ? 'transparent' : 'var(--sq-border)'),
                      background: on ? 'var(--sq-gold)' : 'var(--sq-surface)',
                      color: on ? '#0e0b0a' : 'var(--sq-text)',
                    }}>{s}</button>
                );
              })}
            </div>
            {!isAlwaysOpen(hours) && (
              <p className="sq-mono" style={{ margin: '10px 2px 0', fontSize: 10.5, color: 'var(--sq-text-3)' }}>
                {org.name || branchRow?.name} · {String(hours.open).padStart(2, '0')}:00 – {String(hours.close % 24).padStart(2, '0')}:00
              </p>
            )}
          </div>
        </div>
      </MScreen>
    </ThemeScope>
  );
}
