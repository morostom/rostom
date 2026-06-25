// ClubScheduleScreen.jsx — the full club schedule & logistics, reachable from
// My Club. Lists every session (live from the store), with the member's own
// sessions highlighted.

import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import ThemeScope from '../components/ThemeScope';
import { useNav } from '../navigation/nav';
import { useStore } from '../store';
import { CLUB, WEEK_DAYS } from '../data';

export default function ClubScheduleScreen() {
  const { nav } = useNav();
  const state = useStore();
  const days = [...new Set(state.sessions.map((s) => s.day))];

  return (
    <ThemeScope accent={state.clubTheme}>
      <MScreen
        header={
          <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill>
            <div>
              <span className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>Club schedule</span>
              <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>{CLUB.short} · all sessions</div>
            </div>
          </div>
        }
      >
        <div style={{ padding: '6px 20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {days.map((day) => {
            const rows = state.sessions.filter((s) => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
            const full = WEEK_DAYS.find((d) => d[0] === day);
            return (
              <div key={day}>
                <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>
                  {day}{full ? ` ${full[1]}` : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {rows.map((s) => (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 13,
                      background: s.mine ? 'linear-gradient(120deg, color-mix(in srgb, var(--sq-gold) 14%, var(--sq-surface)), var(--sq-surface) 75%)' : 'var(--sq-surface)',
                      border: '1px solid ' + (s.mine ? 'color-mix(in srgb, var(--sq-gold) 38%, transparent)' : 'var(--sq-border)'),
                    }}>
                      <div className="sq-mono" style={{ fontSize: 14, fontWeight: 600, minWidth: 46, color: s.mine ? 'var(--sq-gold)' : 'var(--sq-text)' }}>{s.time}</div>
                      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--sq-border)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sq-display" style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
                          {s.mine && <span className="sq-chip gold" style={{ padding: '1px 7px', fontSize: 9 }}>YOU</span>}
                          {s.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 2 }}>{s.coach} · {s.type}</div>
                      </div>
                      <span className="sq-chip" style={{ fontSize: 10, padding: '2px 8px' }}>Court {s.court}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <p style={{ margin: '2px 2px 0', fontSize: 11.5, color: 'var(--sq-text-3)', display: 'flex', gap: 7, alignItems: 'center', lineHeight: 1.5 }}>
            <Icons.Chat size={14} /> Published live by the club's squash office — always up to date.
          </p>
        </div>
      </MScreen>
    </ThemeScope>
  );
}
