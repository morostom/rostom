// ClubScheduleScreen.jsx — the full club schedule & logistics, reachable from
// My Club. Lists every session (live from the store), with the member's own
// sessions highlighted.

import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import ThemeScope from '../components/ThemeScope';
import { useNav } from '../navigation/nav';
import { useStore, sessionAccent } from '../store';
import { CLUB, WEEK_DAYS } from '../data';
import { durationOf, endTime } from '../lib/pricing';

export default function ClubScheduleScreen() {
  const { nav, player } = useNav();
  const state = useStore();
  // whichever club this member actually belongs to drives the colour
  const myFirst = state.sessions.find((x) => x.mine || (player?.name && x.players?.includes(player.name)));
  const clubAccent = myFirst ? sessionAccent(state, myFirst) : state.clubTheme;
  const days = [...new Set(state.sessions.map((s) => s.day))];

  return (
    <ThemeScope accent={clubAccent}>
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
                  {rows.map((s) => {
                    const hasPlayers = (s.players?.length || 0) > 0;
                    return (
                    <button key={s.id} onClick={hasPlayers ? () => nav.push('sessionPlayers', { session: s }) : undefined} style={{
                      textAlign: 'left', width: '100%', cursor: hasPlayers ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 13,
                      background: s.mine ? 'linear-gradient(120deg, color-mix(in srgb, var(--sq-gold) 14%, var(--sq-surface)), var(--sq-surface) 75%)' : 'var(--sq-surface)',
                      border: '1px solid ' + (s.mine ? 'color-mix(in srgb, var(--sq-gold) 38%, transparent)' : 'var(--sq-border)'),
                    }}>
                      <div style={{ minWidth: 52 }}>
                        <div className="sq-mono" style={{ fontSize: 14, fontWeight: 600, color: s.mine ? 'var(--sq-gold)' : 'var(--sq-text)' }}>{s.time}</div>
                        <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', marginTop: 1 }}>{endTime(s.time, durationOf(s))}</div>
                      </div>
                      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--sq-border)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sq-display" style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
                          {s.mine && <span className="sq-chip gold" style={{ padding: '1px 7px', fontSize: 9 }}>YOU</span>}
                          {s.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 2 }}>{s.coach} · {s.type}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                        <span className="sq-chip" style={{ fontSize: 10, padding: '2px 8px' }}>Court {s.court}</span>
                        {hasPlayers && (
                          <span className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Icons.Users size={10} /> {s.players.length}
                          </span>
                        )}
                      </div>
                    </button>
                    );
                  })}
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
