// AcademyScreen.jsx — an academy's page. Academies are open booking (no
// membership), so this lists available courts you can book right now plus any
// open group sessions.

import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import ThemeScope from '../components/ThemeScope';
import { useNav } from '../navigation/nav';
import { useStore } from '../store';
import { academyCourts, OPEN_SESSIONS } from '../data';

function endOf(time) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m + 60);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AcademyScreen({ academy }) {
  const { nav } = useNav();
  const state = useStore();
  const courts = academyCourts(academy);
  const sessions = OPEN_SESSIONS.filter((s) => s.venueId === academy.id);

  // the Ramy Ashour academy is the one backed by the admin console, so it
  // reflects the owner's uploaded logo/cover + brand colour live.
  const backed = academy.id === 'ramyashour';
  const cover = backed ? state.images?.academyCover : null;
  const logo = backed ? state.images?.academyLogo : null;
  const accent = (backed && state.academyTheme) || academy.accent || '#f5453b';

  return (
    <ThemeScope accent={accent}>
    <MScreen
      header={
        <div style={{ padding: '6px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill>
          <span className="sq-display" style={{ fontSize: 16, fontWeight: 700 }}>Academy</span>
        </div>
      }
    >
      <div style={{ padding: '4px 20px 26px' }}>
        {/* hero */}
        <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', height: 130, border: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)', background: 'linear-gradient(150deg, color-mix(in srgb, var(--sq-gold) 20%, #0d0d0d), #0d0d0d 70%)', display: 'flex', alignItems: 'flex-end', padding: 16 }}>
          {cover && <img src={cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
          {cover && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1))' }} />}
          <div style={{ position: 'relative', width: 50, height: 50, borderRadius: 13, overflow: 'hidden', background: 'color-mix(in srgb, var(--sq-gold) 18%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 35%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-gold)' }}>
            {logo ? <img src={logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icons.Trophy size={24} />}
          </div>
        </div>
        <h1 className="sq-display" style={{ margin: '14px 0 0', fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>{(backed && state.academyName) || academy.name}</h1>
        <div className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icons.Pin size={12} /> {academy.city} · {academy.courts} courts · open booking
        </div>

        {/* available courts */}
        <div style={{ marginTop: 22 }}>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Available courts · today</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {courts.map((c) => (
              <div key={c.court} className="sq-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'color-mix(in srgb, var(--sq-gold) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 25%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.Court size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600 }}>Court {c.court} · {c.type}</div>
                  <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 2 }}>From {c.time} · 60 min</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="sq-mono" style={{ fontSize: 13, color: 'var(--sq-gold)', marginBottom: 6 }}>EGP {c.price}</div>
                  <button className="sq-btn-gold" style={{ padding: '7px 14px', fontSize: 12 }}
                    onClick={() => nav.push('payment', { courtNo: c.court, type: c.type, venue: academy.name, day: 'Today', time: c.time, endTime: endOf(c.time), price: c.price })}>
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* open sessions */}
        {sessions.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Group sessions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.map((s) => (
                <div key={s.id} className="sq-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: 'var(--sq-surface-2)', color: 'var(--sq-text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icons.Users size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{s.title}</div>
                    <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 2 }}>{s.coach} · {s.time} · {s.spots}</div>
                  </div>
                  <button className="sq-btn-gold" style={{ padding: '7px 14px', fontSize: 12 }}
                    onClick={() => nav.push('payment', { title: s.title, venue: academy.name, day: s.time, time: s.time, price: s.price })}>
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MScreen>
    </ThemeScope>
  );
}
