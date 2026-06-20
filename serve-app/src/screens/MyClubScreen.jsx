// MyClubScreen.jsx — the members-only hero: a live court board (occupied
// courts gently pulse) and today's lesson sheet, replacing the club's
// photographed paper schedule.

import { motion } from 'framer-motion';
import { Icons } from '../components/Icons';
import { MScreen, MTabBar } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { CLUB, COURTS, SCHEDULE, WEEK_DAYS } from '../data';

const STATUS = {
  lesson: { ring: 'var(--sq-gold)', tag: 'Lesson', tagCls: 'gold', dot: false },
  playing: { ring: 'var(--sq-green)', tag: 'In play', tagCls: 'green', dot: true },
  free: { ring: 'var(--sq-border-2)', tag: 'Open', tagCls: '', dot: false },
};

function CourtNow({ c }) {
  const m = STATUS[c.status];
  const isFree = c.status === 'free';

  return (
    <motion.div
      // occupied courts breathe: a subtle, looping glow pulse
      animate={
        isFree
          ? {}
          : {
              boxShadow: [
                `0 0 0 0 color-mix(in srgb, ${m.ring} 0%, transparent)`,
                `0 0 16px 1px color-mix(in srgb, ${m.ring} 28%, transparent)`,
                `0 0 0 0 color-mix(in srgb, ${m.ring} 0%, transparent)`,
              ],
            }
      }
      transition={isFree ? undefined : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        borderRadius: 14,
        padding: 13,
        background: isFree
          ? 'var(--sq-surface)'
          : `linear-gradient(150deg, color-mix(in srgb, ${m.ring} 12%, var(--sq-surface)) 0%, var(--sq-surface) 70%)`,
        border: '1px solid ' + (isFree ? 'var(--sq-border)' : `color-mix(in srgb, ${m.ring} 32%, transparent)`),
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        minHeight: 116,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', letterSpacing: '0.06em' }}>
          COURT {c.court}
        </span>
        <span className={'sq-chip ' + m.tagCls} style={{ padding: '2px 8px', fontSize: 10 }}>
          {m.dot && <span className="sq-live-dot" style={{ background: 'var(--sq-green)' }} />}
          {m.tag}
        </span>
      </div>
      {isFree ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--sq-text-2)' }}>Available now</div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', marginTop: 4 }}>
            Next · {c.next}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          <div className="sq-display" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.15 }}>
            {c.who}
          </div>
          {c.coach && <div style={{ fontSize: 12, color: 'var(--sq-text-2)', marginTop: 2 }}>{c.coach}</div>}
        </div>
      )}
      {!isFree && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--sq-border)', paddingTop: 8 }}>
          <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)' }}>
            until {c.until}
          </span>
          <span className="sq-mono" style={{ fontSize: 11, color: m.ring, fontWeight: 600 }}>
            {c.left}m left
          </span>
        </div>
      )}
    </motion.div>
  );
}

function LessonRow({ s }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 14px',
        borderRadius: 13,
        background: s.you ? 'linear-gradient(120deg, color-mix(in srgb, var(--sq-gold) 14%, var(--sq-surface)), var(--sq-surface) 75%)' : 'var(--sq-surface)',
        border: '1px solid ' + (s.you ? 'color-mix(in srgb, var(--sq-gold) 38%, transparent)' : 'var(--sq-border)'),
      }}
    >
      <div style={{ textAlign: 'center', minWidth: 44 }}>
        <div className="sq-mono" style={{ fontSize: 15, fontWeight: 600, color: s.you ? 'var(--sq-gold)' : 'var(--sq-text)' }}>
          {s.time}
        </div>
      </div>
      <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--sq-border)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.15, display: 'flex', alignItems: 'center', gap: 7 }}>
          {s.you && (
            <span className="sq-chip gold" style={{ padding: '1px 7px', fontSize: 9.5 }}>
              YOU
            </span>
          )}
          {s.group}
        </div>
        <div style={{ fontSize: 12, color: 'var(--sq-text-2)', marginTop: 3 }}>{s.coach}</div>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
        <span className="sq-chip" style={{ padding: '2px 8px', fontSize: 10 }}>
          Court {s.court}
        </span>
        <span className="sq-mono" style={{ fontSize: 10, color: s.spots === 'Full' ? 'var(--sq-text-3)' : 'var(--sq-text-2)' }}>
          {s.spots}
        </span>
      </div>
    </div>
  );
}

export default function MyClubScreen() {
  const { nav } = useNav();
  const free = COURTS.filter((c) => c.status === 'free').length;

  return (
    <MScreen
      tabBar={<MTabBar active="clubs" onTab={nav.switchTab} />}
      header={
        <div style={{ padding: '4px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 11,
                  flexShrink: 0,
                  background: 'var(--sq-surface-2)',
                  border: '1px solid var(--sq-border-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--sq-gold)',
                }}
              >
                <Icons.Club size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="sq-display" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                  {CLUB.short}
                </div>
                <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', letterSpacing: '0.04em', marginTop: 2 }}>
                  SQUASH SECTION
                </div>
              </div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--sq-surface)', border: '1px solid var(--sq-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-text-2)' }}>
              <Icons.More size={16} />
            </div>
          </div>
          <span className="sq-chip green" style={{ fontSize: 10.5 }}>
            <Icons.Check size={11} /> {CLUB.membershipLabel}
          </span>
        </div>
      }
    >
      <div style={{ padding: '4px 20px 22px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* live courts */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sq-live-dot" />
              <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Courts right now
              </span>
            </div>
            <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-green)' }}>
              {free} open
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {COURTS.map((c) => (
              <CourtNow key={c.court} c={c} />
            ))}
          </div>
        </div>

        {/* your next lesson banner */}
        <div
          style={{
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 13,
            background: 'linear-gradient(120deg, color-mix(in srgb, var(--sq-gold) 18%, var(--sq-bg)), var(--sq-surface) 80%)',
            border: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)',
          }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'color-mix(in srgb, var(--sq-gold) 18%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-gold)', flexShrink: 0 }}>
            <Icons.Bolt size={19} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-gold)', letterSpacing: '0.1em' }}>
              YOUR NEXT LESSON
            </div>
            <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600, marginTop: 2 }}>
              Today 18:00 · Coach Mariam · Court 2
            </div>
          </div>
        </div>

        {/* today's lesson sheet */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em' }}>
              Lesson sheet
            </h2>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--sq-text-3)' }}>
              <Icons.Refresh size={12} /> Synced 2 min ago
            </span>
          </div>

          {/* day selector */}
          <div style={{ display: 'flex', gap: 7, marginBottom: 14, overflowX: 'auto' }}>
            {WEEK_DAYS.map(([d, n, active]) => (
              <div
                key={d}
                style={{
                  flexShrink: 0,
                  width: 46,
                  padding: '9px 0',
                  borderRadius: 12,
                  textAlign: 'center',
                  background: active ? 'var(--sq-gold)' : 'var(--sq-surface)',
                  border: '1px solid ' + (active ? 'transparent' : 'var(--sq-border)'),
                  color: active ? '#0a0a0a' : 'var(--sq-text-2)',
                }}
              >
                <div className="sq-mono" style={{ fontSize: 9.5, opacity: 0.75, letterSpacing: '0.05em' }}>
                  {d}
                </div>
                <div className="sq-display" style={{ fontSize: 16, fontWeight: 700, marginTop: 1 }}>
                  {n}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {SCHEDULE.map((s) => (
              <LessonRow key={s.id} s={s} />
            ))}
          </div>

          <p style={{ margin: '14px 2px 0', fontSize: 11.5, color: 'var(--sq-text-3)', lineHeight: 1.5, display: 'flex', gap: 7 }}>
            <Icons.Chat size={14} /> <span>No more screenshots in the WhatsApp group — the office publishes the sheet straight to SERVE.</span>
          </p>
        </div>
      </div>
    </MScreen>
  );
}
