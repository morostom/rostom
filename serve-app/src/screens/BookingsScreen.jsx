// BookingsScreen.jsx — the player's upcoming court reservations (from the store)
// plus their club sessions, in one place.

import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import { MScreen, MTabBar } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { useStore } from '../store';

const TYPE_ICON = { Lesson: Icons.Medal, 'Group training': Icons.Users, Fitness: Icons.Bolt };

export default function BookingsScreen() {
  const { nav } = useNav();
  const state = useStore();
  const mine = state.sessions.filter((s) => s.mine);
  const empty = !state.bookings.length && !mine.length;

  return (
    <MScreen
      tabBar={<MTabBar active="bookings" onTab={nav.switchTab} />}
      header={
        <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="sq-display" style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em' }}>Bookings</h1>
          <SQLogo size={18} accent />
        </div>
      }
    >
      <div style={{ padding: '8px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {empty && (
          <div className="sq-card" style={{ padding: 26, textAlign: 'center', color: 'var(--sq-text-3)' }}>
            <Icons.Calendar size={30} />
            <div className="sq-display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--sq-text)', marginTop: 10 }}>Nothing booked yet</div>
            <p style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>Reserve a court from your club to see it here.</p>
            <button className="sq-btn-gold" style={{ padding: '11px 18px', fontSize: 13, marginTop: 14 }} onClick={() => nav.switchTab('clubs')}>Book a court</button>
          </div>
        )}

        {state.bookings.length > 0 && (
          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Reservations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {state.bookings.map((b) => (
                <div key={b.id} className="sq-card serve-glow-soft" style={{ padding: 15, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 28%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {b.title ? <Icons.Users size={20} /> : <Icons.Court size={22} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sq-display" style={{ fontSize: 15, fontWeight: 600 }}>{b.title || `Court ${b.court}`}</div>
                    <div className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 2 }}>{b.venue} · {b.day} · {b.time}{b.endTime ? ` – ${b.endTime}` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="sq-chip" style={{ fontSize: 9.5, color: 'var(--sq-green)', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.1)' }}><Icons.Check size={10} /> Paid</span>
                    <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)', marginTop: 6 }}>EGP {b.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mine.length > 0 && (
          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Club sessions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mine.map((s) => {
                const Ic = TYPE_ICON[s.type] || Icons.Calendar;
                return (
                  <div key={s.id} className="sq-card" style={{ padding: 15, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--sq-surface-2)', color: 'var(--sq-text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Ic size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{s.title}</div>
                      <div className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 2 }}>{s.day} · {s.time} · {s.coach} · Court {s.court}</div>
                    </div>
                    <span className="sq-chip" style={{ fontSize: 9.5 }}>{s.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MScreen>
  );
}
