// ClubBioScreen.jsx — a club's history / info page (Heliopolis for the demo).
// Clubs are members-only, so this ends with an "Enter access code" CTA.

import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import ThemeScope from '../components/ThemeScope';
import ClubCrest from '../components/ClubCrest';
import { useNav } from '../navigation/nav';
import { HELIOPOLIS_BIO } from '../data';

function Section({ label, children }) {
  return (
    <div>
      <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

export default function ClubBioScreen() {
  const { nav } = useNav();
  const c = HELIOPOLIS_BIO;
  return (
    <ThemeScope accent={c.accent}>
      <MScreen
        header={
          <div style={{ padding: '6px 16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill>
            <span className="sq-display" style={{ fontSize: 16, fontWeight: 700 }}>Club</span>
          </div>
        }
        tabBar={
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--sq-border)', background: 'rgba(7,7,7,0.95)' }}>
            <button className="sq-btn-gold serve-glow-soft" style={{ width: '100%', padding: '15px', fontSize: 14.5 }} onClick={() => nav.push('joinClub')}>
              <Icons.Ticket size={16} /> Enter access code
            </button>
          </div>
        }
      >
        {/* hero */}
        <div style={{ padding: '4px 22px 18px' }}>
          <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', height: 150, border: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)', background: `linear-gradient(150deg, color-mix(in srgb, var(--sq-gold) 22%, #0d0d0d), #0d0d0d 70%)`, display: 'flex', alignItems: 'flex-end', padding: 16 }}>
            <ClubCrest size={54} radius={14} />
          </div>
          <h1 className="sq-display" style={{ margin: '14px 0 0', fontSize: 25, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>{c.name}</h1>
          <div className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.Pin size={12} /> Heliopolis · Cairo · Est. {c.established.split(', ')[1]}
          </div>
        </div>

        <div style={{ padding: '0 22px 26px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Section label="About">
            <p style={{ margin: 0, fontSize: 14, color: 'var(--sq-text-2)', lineHeight: 1.6 }}>{c.about}</p>
          </Section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="sq-card" style={{ padding: 14 }}>
              <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Courts</div>
              <div className="sq-display" style={{ fontSize: 26, fontWeight: 700, marginTop: 3, color: 'var(--sq-gold)' }}>{c.courts}</div>
            </div>
            <div className="sq-card" style={{ padding: 14 }}>
              <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Established</div>
              <div className="sq-display" style={{ fontSize: 26, fontWeight: 700, marginTop: 3 }}>{c.established.split(', ')[1]}</div>
            </div>
          </div>

          <Section label="Former champions">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {c.formerChampions.map((p) => (
                <span key={p} className="sq-chip" style={{ fontSize: 12, padding: '6px 12px' }}><Icons.Trophy size={12} /> {p}</span>
              ))}
            </div>
          </Section>

          <Section label="Head coaches">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {c.headCoaches.map((co) => (
                <div key={co} className="sq-card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 19, background: 'linear-gradient(135deg, #2a2a2a, #161616)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{co.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{co}</div>
                    <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)' }}>Head Coach</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <p style={{ margin: 0, fontSize: 12, color: 'var(--sq-text-3)', display: 'flex', gap: 7, lineHeight: 1.5 }}>
            <Icons.Lock size={13} /> Heliopolis is members-only. Enter the access code from the squash office to see live courts & your schedule.
          </p>
        </div>
      </MScreen>
    </ThemeScope>
  );
}
