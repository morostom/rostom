// MyClubScreen.jsx — what a member sees on entering their club: the LIVE court
// tracker first, then THEIR OWN schedule (with a link to the full club
// schedule), plus a "Book a court" entry. Reads live state from the store, so
// a court the coordinator marks busy shows here instantly; themed in the club's
// own brand colour.

import { motion } from 'framer-motion';
import { Icons } from '../components/Icons';
import { MScreen, MTabBar } from '../components/mobile';
import ThemeScope from '../components/ThemeScope';
import { useNav } from '../navigation/nav';
import { useStore } from '../store';
import { CLUB } from '../data';

const STATUS = {
  lesson: { ring: 'var(--sq-gold)', tag: 'Lesson', cls: 'gold' },
  playing: { ring: 'var(--sq-green)', tag: 'In play', cls: 'green' },
  booked: { ring: 'var(--sq-gold)', tag: 'Booked', cls: 'gold' },
  free: { ring: 'var(--sq-border-2)', tag: 'Open', cls: '' },
};

function CourtTile({ c, onBook }) {
  const m = STATUS[c.status] || STATUS.free;
  const free = c.status === 'free';
  return (
    <motion.div
      animate={free ? {} : { boxShadow: [`0 0 0 0 color-mix(in srgb, ${m.ring} 0%, transparent)`, `0 0 16px 1px color-mix(in srgb, ${m.ring} 26%, transparent)`, `0 0 0 0 color-mix(in srgb, ${m.ring} 0%, transparent)`] }}
      transition={free ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        borderRadius: 14, padding: 13, minHeight: 112, display: 'flex', flexDirection: 'column', gap: 8,
        background: free ? 'var(--sq-surface)' : `linear-gradient(150deg, color-mix(in srgb, ${m.ring} 12%, var(--sq-surface)), var(--sq-surface) 70%)`,
        border: '1px solid ' + (free ? 'color-mix(in srgb, var(--sq-gold) 25%, transparent)' : `color-mix(in srgb, ${m.ring} 32%, transparent)`),
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', letterSpacing: '0.06em' }}>COURT {c.court}</span>
        <span className={'sq-chip ' + (m.cls === 'green' ? '' : m.cls)} style={m.cls === 'green' ? { fontSize: 9.5, padding: '2px 8px', color: 'var(--sq-green)', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.1)' } : { fontSize: 9.5, padding: '2px 8px' }}>
          {c.status === 'playing' && <span className="sq-live-dot" style={{ background: 'var(--sq-green)' }} />}{m.tag}
        </span>
      </div>
      {free ? (
        <>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--sq-text-2)' }}>Available</div>
            <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', marginTop: 3 }}>{c.type}</div>
          </div>
          <button className="sq-btn-gold" style={{ padding: '8px', fontSize: 12 }} onClick={() => onBook(c)}>Book →</button>
        </>
      ) : (
        <>
          <div style={{ flex: 1 }}>
            <div className="sq-display" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.15 }}>{c.who}</div>
            {c.coach && <div style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 2 }}>{c.coach}</div>}
          </div>
          {c.left != null && (
            <div className="sq-mono" style={{ fontSize: 10.5, color: m.ring, fontWeight: 600 }}>{c.left}m left</div>
          )}
        </>
      )}
    </motion.div>
  );
}

const TYPE_ICON = { Lesson: Icons.Medal, 'Group training': Icons.Users, Fitness: Icons.Bolt };

function MySessionRow({ s }) {
  const Ic = TYPE_ICON[s.type] || Icons.Calendar;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', borderRadius: 13, background: 'linear-gradient(120deg, color-mix(in srgb, var(--sq-gold) 12%, var(--sq-surface)), var(--sq-surface) 78%)', border: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: 'color-mix(in srgb, var(--sq-gold) 16%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ic size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{s.title}</div>
        <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 2 }}>{s.day} · {s.time} · {s.coach} · Court {s.court}</div>
      </div>
      <span className="sq-chip gold" style={{ fontSize: 9.5, padding: '2px 8px' }}>{s.type}</span>
    </div>
  );
}

export default function MyClubScreen() {
  const { nav, player } = useNav();
  const state = useStore();
  const free = state.courts.filter((c) => c.status === 'free').length;
  const mine = state.sessions.filter((s) => s.mine || (player?.name && s.players?.includes(player.name)));

  return (
    <ThemeScope accent={state.clubTheme}>
      <MScreen
        tabBar={<MTabBar active="clubs" onTab={nav.switchTab} />}
        header={
          <div style={{ padding: '4px 20px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: 'color-mix(in srgb, var(--sq-gold) 16%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-gold)' }}>
                  <Icons.Club size={22} />
                </div>
                <div>
                  <div className="sq-display" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.1 }}>{CLUB.short}</div>
                  <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', marginTop: 2 }}>SQUASH SECTION</div>
                </div>
              </div>
              <span className="sq-chip" style={{ fontSize: 10.5, color: 'var(--sq-green)', borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.1)' }}>
                <Icons.Check size={11} /> Member
              </span>
            </div>
          </div>
        }
      >
        {/* live court tracker */}
        <div style={{ padding: '2px 20px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sq-live-dot" />
              <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Courts right now</span>
            </div>
            <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-green)' }}>{free} open</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {state.courts.map((c) => <CourtTile key={c.court} c={c} onBook={(court) => nav.push('book', { court })} />)}
          </div>
          <button className="sq-btn-gold serve-glow-soft" style={{ width: '100%', padding: '14px', fontSize: 14, marginTop: 12 }} onClick={() => nav.push('book')}>
            <Icons.Plus size={15} style={{ verticalAlign: -3, marginRight: 6 }} /> Book a court
          </button>
        </div>

        {/* your schedule */}
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Your schedule</span>
            <button onClick={() => nav.push('clubSchedule')} style={{ background: 'none', border: 0, color: 'var(--sq-gold)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sq-body)' }}>
              Full club schedule →
            </button>
          </div>
          {mine.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {mine.map((s) => <MySessionRow key={s.id} s={s} />)}
            </div>
          ) : (
            <div className="sq-card" style={{ padding: 20, textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 13 }}>
              No sessions yet. Your coach's lessons & training will appear here.
            </div>
          )}
        </div>
      </MScreen>
    </ThemeScope>
  );
}
