// BookCourtScreen.jsx — reserve an available court. Pick a free court and a
// time slot, see the price, then continue to payment. Any member can book any
// court that's currently free.

import { useState } from 'react';
import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import ThemeScope from '../components/ThemeScope';
import { useNav } from '../navigation/nav';
import { useStore } from '../store';
import { TIME_SLOTS } from '../data';

export function priceFor(court) {
  return court?.type?.includes('Glass') ? 300 : 200;
}
function endOf(time) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m + 60);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function BookCourtScreen({ court: preCourt }) {
  const { nav } = useNav();
  const state = useStore();
  const freeCourts = state.courts.filter((c) => c.status === 'free');
  const [courtNo, setCourtNo] = useState(preCourt?.court ?? freeCourts[0]?.court ?? null);
  const [time, setTime] = useState('18:00');

  const court = state.courts.find((c) => c.court === courtNo);
  const price = priceFor(court);

  if (!freeCourts.length) {
    return (
      <ThemeScope accent={state.clubTheme}>
        <MScreen header={<div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}><Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill><span className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>Book a court</span></div>}>
          <div style={{ height: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--sq-text-3)', padding: 30, textAlign: 'center' }}>
            <Icons.Court size={34} />
            <div className="sq-display" style={{ fontSize: 17, fontWeight: 700, color: 'var(--sq-text)' }}>All courts are busy</div>
            <p style={{ fontSize: 13, lineHeight: 1.5 }}>Every court is in use right now. Check the live tracker — one frees up soon.</p>
          </div>
        </MScreen>
      </ThemeScope>
    );
  }

  return (
    <ThemeScope accent={state.clubTheme}>
      <MScreen
        header={
          <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill>
            <span className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>Book a court</span>
          </div>
        }
        tabBar={
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--sq-border)', background: 'rgba(7,7,7,0.95)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total · 60 min</div>
              <div className="sq-display" style={{ fontSize: 20, fontWeight: 700 }}>EGP {price}</div>
            </div>
            <button className="sq-btn-gold serve-glow-soft" style={{ padding: '15px 22px', fontSize: 14.5 }} disabled={!court || !time}
              onClick={() => nav.push('payment', { courtNo, type: court?.type, venue: 'Heliopolis SC', day: 'Today', time, endTime: endOf(time), price, secureCourt: true })}>
              Continue to pay →
            </button>
          </div>
        }
      >
        <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Available courts</div>
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
                      <span className="sq-display" style={{ fontSize: 16, fontWeight: 700 }}>Court {c.court}</span>
                      {on && <span style={{ color: 'var(--sq-gold)', display: 'inline-flex' }}><Icons.Check size={16} /></span>}
                    </div>
                    <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', marginTop: 4 }}>{c.type}</div>
                    <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-gold)', marginTop: 6 }}>EGP {priceFor(c)} / hr</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Start time · today</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TIME_SLOTS.map((t) => {
                const on = t === time;
                return (
                  <button key={t} onClick={() => setTime(t)} className="sq-mono" style={{
                    padding: '10px 14px', borderRadius: 10, fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                    border: '1px solid ' + (on ? 'transparent' : 'var(--sq-border)'),
                    background: on ? 'var(--sq-gold)' : 'var(--sq-surface)',
                    color: on ? '#0a0a0a' : 'var(--sq-text)',
                  }}>{t}</button>
                );
              })}
            </div>
          </div>
        </div>
      </MScreen>
    </ThemeScope>
  );
}
