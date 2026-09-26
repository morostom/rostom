// VenueHomeScreen.jsx — the member's home inside the venue they belong to.
//
// ONE screen for both clubs and academies, the same way the desktop console
// is one VenueConsole. A club member and an academy player want the same four
// things — what's free right now, what they're booked into, who coaches them,
// and a way to book — so the layout is shared and only the vocabulary and a
// couple of sections differ by type.
//
// Reads live state from the store, so a court the coordinator marks busy shows
// here instantly, and themes itself in the venue's own brand colour.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../components/Icons';
import { MScreen, MTabBar } from '../components/mobile';
import ThemeScope from '../components/ThemeScope';
import ClubCrest from '../components/ClubCrest';
import { useNav } from '../navigation/nav';
import { useStore, store, orgInfo } from '../store';
import { useToast } from '../components/Toast';
import { useT } from '../i18n';
import { CLUB } from '../data';
import { useNow, closesInLabel } from '../lib/live';

const STATUS = {
  lesson: { ring: 'var(--sq-gold)', tag: 'Lesson', cls: 'gold' },
  playing: { ring: 'var(--sq-green)', tag: 'In play', cls: 'green' },
  booked: { ring: 'var(--sq-gold)', tag: 'Booked', cls: 'gold' },
  free: { ring: 'var(--sq-border-2)', tag: 'Open', cls: '' },
};

function CourtTile({ c, onBook, t }) {
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
        <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', letterSpacing: '0.06em' }}>{t('COURT')} {c.court}</span>
        <span className={'sq-chip ' + (m.cls === 'green' ? '' : m.cls)} style={m.cls === 'green' ? { fontSize: 9.5, padding: '2px 8px', color: 'var(--sq-green)', borderColor: 'rgba(47,179,122,0.25)', background: 'rgba(47,179,122,0.1)' } : { fontSize: 9.5, padding: '2px 8px' }}>
          {c.status === 'playing' && <span className="sq-live-dot" style={{ background: 'var(--sq-green)' }} />}{t(m.tag)}
        </span>
      </div>
      {free ? (
        <>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--sq-text-2)' }}>{t('Available')}</div>
            <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', marginTop: 3 }}>{c.type}</div>
          </div>
          <button className="sq-btn-gold" style={{ padding: '8px', fontSize: 12 }} onClick={() => onBook(c)}>{t('Book')} →</button>
        </>
      ) : (
        <>
          <div style={{ flex: 1 }}>
            <div className="sq-display" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.15 }}>{c.who}</div>
            {c.coach && <div style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 2 }}>{c.coach}</div>}
          </div>
          {c.left != null && (
            <div className="sq-mono" style={{ fontSize: 10.5, color: m.ring, fontWeight: 600 }}>{c.left}m {t('left')}</div>
          )}
        </>
      )}
    </motion.div>
  );
}

// A court that just came free, offered to this player specifically. First
// tap wins — the claim is settled in the database, not here, so two players
// tapping at the same moment cannot both get it.
function SlotOffer({ o, onClaim, t, busy }) {
  const gone = o.status !== 'open';
  return (
    <div style={{
      padding: '13px 14px', borderRadius: 13, marginBottom: 9,
      background: gone ? 'var(--sq-surface)' : 'linear-gradient(120deg, color-mix(in srgb, var(--sq-green) 14%, var(--sq-surface)), var(--sq-surface) 76%)',
      border: '1px solid ' + (gone ? 'var(--sq-border)' : 'color-mix(in srgb, var(--sq-green) 34%, transparent)'),
      opacity: gone ? 0.6 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: 'color-mix(in srgb, var(--sq-green) 16%, transparent)', color: 'var(--sq-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.Bolt size={17} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sq-display" style={{ fontSize: 14, fontWeight: 600 }}>
            {t('Court')} {o.court} {t('just opened up')}
          </div>
          <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 2 }}>
            {[o.day, o.time].filter(Boolean).join(' ')}
            {o.price ? ` \u00b7 EGP ${o.price}` : ''}
            {o.session_title ? ` \u00b7 ${o.session_title}` : ''}
          </div>
        </div>
        {gone ? (
          <span className="sq-chip" style={{ fontSize: 10, padding: '3px 9px' }}>{t('Taken')}</span>
        ) : (
          <button className="sq-btn-gold" disabled={busy} style={{ padding: '9px 15px', fontSize: 12.5, flexShrink: 0 }} onClick={() => onClaim(o)}>
            {busy ? t('…') : t('Claim')}
          </button>
        )}
      </div>
    </div>
  );
}

const TYPE_ICON = { Lesson: Icons.Medal, 'Group training': Icons.Users, Fitness: Icons.Bolt };

function MySessionRow({ s, onOpen }) {
  const t = useT();
  const Ic = TYPE_ICON[s.type] || Icons.Calendar;
  const hasPlayers = (s.players?.length || 0) > 0;
  return (
    <button onClick={hasPlayers ? () => onOpen?.(s) : undefined} style={{ textAlign: 'left', width: '100%', cursor: hasPlayers ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', borderRadius: 13, background: 'linear-gradient(120deg, color-mix(in srgb, var(--sq-gold) 12%, var(--sq-surface)), var(--sq-surface) 78%)', border: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: 'color-mix(in srgb, var(--sq-gold) 16%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Ic size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600 }}>{t(s.title)}</div>
        <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 2 }}>{s.day} · {s.time} · {s.coach} · {t('Court')} {s.court}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
        <span className="sq-chip gold" style={{ fontSize: 9.5, padding: '2px 8px' }}>{t(s.type)}</span>
        {hasPlayers && (
          <span className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icons.Users size={10} /> {s.players.length}
          </span>
        )}
      </div>
    </button>
  );
}

// Academies are coach-led — who you train under is the headline fact, so it
// gets its own rail rather than being buried in a session row.
function CoachRail({ coaches, t }) {
  if (!coaches.length) return null;
  return (
    <div style={{ padding: '0 20px 22px' }}>
      <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('Your coaches')}</div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 2 }}>
        {coaches.map((c) => (
          <div key={c.id} className="sq-card" style={{ padding: '13px 14px', minWidth: 132, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 19, background: 'color-mix(in srgb, var(--sq-gold) 15%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
              {c.initials || (c.name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="sq-display" style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.2 }}>{c.name}</div>
              <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', marginTop: 3 }}>{t(c.role || 'Coach')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VenueHomeScreen() {
  const { nav, player, accountType, child, membership } = useNav();
  const state = useStore();
  const t = useT();
  const notify = useToast();
  const now = useNow(30000);

  // which venue this member belongs to, and what kind it is
  const orgId = membership?.orgId || 'heliopolis';
  const type = membership?.type === 'academy' ? 'academy' : 'club';
  const isAcademy = type === 'academy';
  const org = orgInfo(state, orgId);
  const accent = org.accent || state.clubTheme;

  // a parent views their child's schedule; a player views their own
  const isParent = accountType === 'parent';
  const who = isParent ? child : player?.name;

  const branches = state.branches.filter((b) => b.org_id === orgId);
  const [branch, setBranch] = useState(branches[0]?.id || null);
  const activeBranch = branches.some((b) => b.id === branch) ? branch : (branches[0]?.id || null);
  const branchIds = new Set(branches.map((b) => b.id));
  const branchCourts = state.courts.filter((c) => c.branch === activeBranch);
  const free = branchCourts.filter((c) => c.status === 'free').length;

  // only this venue's sessions count as "mine" — a player in two places
  // shouldn't see one venue's squad on the other's home
  const mine = state.sessions.filter((s) => {
    const here = !branchIds.size || branchIds.has(s.branch);
    if (!here) return false;
    return isParent ? who && s.players?.includes(who) : (s.mine || (who && s.players?.includes(who)));
  });

  const coaches = state.staff.filter((s) => s.org_id === orgId).slice(0, 8);

  // slots freed by a cancellation and offered to this player
  const [claiming, setClaiming] = useState(null);
  const myOffers = state.slotOffers.filter((o) => {
    if (o.org_id !== orgId) return false;
    if (o.status !== 'open' && o.claimed_by !== who) return false;
    if (o.audience === 'all') return true;
    return (o.recipients || []).some((r) => r?.toLowerCase() === (who || '').toLowerCase());
  });

  async function claim(o) {
    setClaiming(o.id);
    const res = await store.claimSlot(o.id, who);
    setClaiming(null);
    notify(res.ok ? t('Court claimed — see you there') : t(res.reason === 'already taken' ? 'Someone just took it' : 'Could not claim that slot'));
  }
  const cover = org.cover || (orgId === 'heliopolis' ? state.images?.clubCover : state.images?.academyCover);
  const name = org.name || (isAcademy ? t('Your academy') : CLUB.short);

  const hours = branches.find((b) => b.id === activeBranch);
  const openLabel = closesInLabel(now, hours?.open_hour != null ? { open: hours.open_hour, close: hours.close_hour ?? 24 } : undefined, t);

  return (
    <ThemeScope accent={accent}>
      <MScreen
        tabBar={<MTabBar active="venue" onTab={nav.switchTab} venueType={type} />}
        header={
          <div style={{ padding: '4px 20px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                {org.logo
                  ? <img src={org.logo} alt="" style={{ width: 42, height: 42, borderRadius: 11, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--sq-border)' }} />
                  : <ClubCrest size={42} radius={11} />}
                <div style={{ minWidth: 0 }}>
                  {/* academy names run long ("Ramy Ashour Squash Academy"),
                      so allow two lines before clipping rather than cutting
                      the venue's own name mid-word */}
                  <div className="sq-display" style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.15, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t(name)}</div>
                  <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', marginTop: 2 }}>
                    {t(isAcademy ? 'SQUASH ACADEMY' : 'SQUASH SECTION')}
                  </div>
                </div>
              </div>
              <span className="sq-chip" style={{ fontSize: 10.5, color: 'var(--sq-green)', borderColor: 'rgba(47,179,122,0.25)', background: 'rgba(47,179,122,0.1)', flexShrink: 0 }}>
                <Icons.Check size={11} /> {t(isAcademy ? 'Enrolled' : 'Member')}
              </span>
            </div>
          </div>
        }
      >
        {cover && (
          <div style={{ padding: '0 20px 14px' }}>
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 118, border: '1px solid var(--sq-border)' }}>
              <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,11,10,0.85), rgba(0,0,0,0.05))' }} />
              <span className="sq-mono" style={{ position: 'absolute', left: 12, bottom: 10, fontSize: 10, color: 'rgba(255,255,255,0.86)', letterSpacing: '0.1em' }}>{openLabel}</span>
            </div>
          </div>
        )}

        {branches.length > 1 && (
          <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
            {branches.map((b) => (
              <button key={b.id} onClick={() => setBranch(b.id)} className={'sq-chip' + (b.id === activeBranch ? ' gold' : '')} style={{ cursor: 'pointer', padding: '8px 13px', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}>
                <Icons.Pin size={12} /> {b.name}
              </button>
            ))}
          </div>
        )}

        {myOffers.length > 0 && (
          <div style={{ padding: '2px 20px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span className="sq-live-dot" style={{ background: 'var(--sq-green)' }} />
              <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('Just freed up')}</span>
            </div>
            {myOffers.map((o) => <SlotOffer key={o.id} o={o} onClaim={claim} t={t} busy={claiming === o.id} />)}
          </div>
        )}

        {/* live court tracker */}
        <div style={{ padding: '2px 20px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="sq-live-dot" />
              <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('Courts right now')}</span>
            </div>
            <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-green)' }}>{free} {t('open')}</span>
          </div>
          {branchCourts.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {branchCourts.map((c) => <CourtTile key={c.branch + c.court} c={c} t={t} onBook={(court) => nav.push('book', { court, branch: activeBranch })} />)}
            </div>
          ) : (
            <div className="sq-card" style={{ padding: 18, textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 12.5 }}>
              {t('No courts listed yet.')}
            </div>
          )}
          <button className="sq-btn-gold serve-glow-soft" style={{ width: '100%', padding: '14px', fontSize: 14, marginTop: 12 }} onClick={() => nav.push('book', { branch: activeBranch })}>
            <Icons.Plus size={15} style={{ verticalAlign: -3, marginRight: 6 }} /> {t('Book a court')}
          </button>
        </div>

        {isAcademy && <CoachRail coaches={coaches} t={t} />}

        {/* your schedule */}
        <div style={{ padding: '0 20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              {t(isAcademy ? 'Your training' : 'Your schedule')}
            </span>
            <button onClick={() => nav.push('clubSchedule')} style={{ background: 'none', border: 0, color: 'var(--sq-gold)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sq-body)' }}>
              {t(isAcademy ? 'Full academy schedule →' : 'Full club schedule →')}
            </button>
          </div>
          {mine.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {mine.map((s) => <MySessionRow key={s.id} s={s} onOpen={(sess) => nav.push('sessionPlayers', { session: sess })} />)}
            </div>
          ) : (
            <div className="sq-card" style={{ padding: 20, textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 13 }}>
              {t(isAcademy
                ? 'No training yet. Sessions your coach adds will appear here.'
                : "No sessions yet. Your coach's lessons & training will appear here.")}
            </div>
          )}
        </div>
      </MScreen>
    </ThemeScope>
  );
}
