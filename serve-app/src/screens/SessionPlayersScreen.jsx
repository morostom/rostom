// SessionPlayersScreen.jsx — who's signed up for a group session. Each player
// shows the public-safe slice of their card: name, age · division, and their
// national ranking when they have one. Real cards (from the DB) override the
// demo directory; unknown names still render with initials.

import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import ThemeScope from '../components/ThemeScope';
import { useNav } from '../navigation/nav';
import { useStore } from '../store';
import { useT } from '../i18n';
import { PLAYER_DIRECTORY } from '../data';

const initials = (name) => name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export default function SessionPlayersScreen({ session }) {
  const { nav, player } = useNav();
  const state = useStore();
  const t = useT();
  const s = session || {};
  // include anyone who joined this open session from the app
  const joined = (s.id && state.openJoins?.[s.id]) || [];
  const names = [...new Set([...(s.players || []), ...joined])];

  const info = (name) =>
    state.playerCards?.[name.toLowerCase()] ||
    PLAYER_DIRECTORY.find((p) => p.name.toLowerCase() === name.toLowerCase()) ||
    { name };

  return (
    <ThemeScope accent={state.clubTheme}>
      <MScreen
        header={
          <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill>
            <span className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>{t("Who's playing")}</span>
          </div>
        }
      >
        <div style={{ padding: '4px 20px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* the session */}
          <div className="sq-card serve-glow-soft" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 28%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icons.Users size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sq-display" style={{ fontSize: 15, fontWeight: 700 }}>{t(s.title || 'Session')}</div>
              <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 2 }}>
                {[[s.day, s.time].filter(Boolean).join(' · '), s.coach, s.venue, s.court ? `Court ${s.court}` : null].filter(Boolean).join(' · ')}
              </div>
            </div>
            <span className="sq-chip gold" style={{ fontSize: 10.5 }}>{names.length} {t('players')}</span>
          </div>

          {/* the roster */}
          <div>
            <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('Signed up')}</div>
            {names.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {names.map((n) => {
                  const p = info(n);
                  const me = player?.name && n.toLowerCase() === player.name.toLowerCase();
                  return (
                    <div key={n} className="sq-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 13, borderColor: me ? 'color-mix(in srgb, var(--sq-gold) 35%, transparent)' : undefined }}>
                      <div style={{ width: 44, height: 44, borderRadius: 22, flexShrink: 0, background: 'linear-gradient(135deg, #2a2a2a, #161616)', border: '1px solid var(--sq-border-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                        {initials(n)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="sq-display" style={{ fontSize: 14.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
                          {p.name}
                          {me && <span className="sq-chip gold" style={{ padding: '1px 7px', fontSize: 9 }}>{t('YOU')}</span>}
                        </div>
                        <div className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-2)', marginTop: 3 }}>
                          {p.age ? `${t('Age')} ${p.age}` : t('SERVE player')}{p.division ? ` · ${p.division}` : ''}
                        </div>
                      </div>
                      {p.rankLabel && (
                        <span className="sq-chip" style={{ fontSize: 10, color: 'var(--sq-gold)', borderColor: 'color-mix(in srgb, var(--sq-gold) 30%, transparent)', background: 'color-mix(in srgb, var(--sq-gold) 10%, transparent)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <Icons.Medal size={11} /> {p.rankLabel}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="sq-card" style={{ padding: 18, textAlign: 'center', color: 'var(--sq-text-3)', fontSize: 12.5 }}>{t('No players signed up yet.')}</div>
            )}
          </div>
        </div>
      </MScreen>
    </ThemeScope>
  );
}
