// ClubsLockedScreen.jsx — the Clubs tab before you've joined. Clubs are
// members-only, so this is a locked empty state that routes to the access-code
// flow. Once a code is accepted the Clubs tab becomes MyClub instead.

import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import { MScreen, MTabBar } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { useT } from '../i18n';
import { CLUB } from '../data';

export default function ClubsLockedScreen() {
  const { nav } = useNav();
  const t = useT();

  return (
    <MScreen
      tabBar={<MTabBar active="clubs" onTab={nav.switchTab} />}
      header={
        <div style={{ padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="sq-display" style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em' }}>
            {t('Clubs')}
          </h1>
          <SQLogo size={18} />
        </div>
      }
    >
      <div style={{ padding: '8px 20px 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* lock hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '18px 8px 4px', gap: 14 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 22,
              background: 'radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--sq-gold) 24%, transparent), var(--sq-surface) 70%)',
              border: '1px solid color-mix(in srgb, var(--sq-gold) 35%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--sq-gold)',
            }}
          >
            <Icons.Club size={36} />
          </div>
          <div>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 23, fontWeight: 700, letterSpacing: '-0.02em' }}>
              {t('Members only')}
            </h2>
            <p style={{ margin: '8px 0 0', color: 'var(--sq-text-2)', fontSize: 14, lineHeight: 1.5, maxWidth: 290, textWrap: 'pretty' }}>
              {t("Clubs are private. Unlike academies, only registered members can see a club's schedule and live courts — so you'll need an access code from your club's squash office.")}
            </p>
          </div>
        </div>

        {/* teaser — your club is already on SERVE, but locked */}
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
            {t('On SERVE')}
          </div>
          <div className="sq-card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                flexShrink: 0,
                background: 'var(--sq-surface-2)',
                border: '1px solid var(--sq-border-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sq-text-3)',
              }}
            >
              <Icons.Club size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sq-display" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.15 }}>
                {t(CLUB.name)}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--sq-text-2)', marginTop: 3 }}>
                {CLUB.section} · {CLUB.city}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'var(--sq-text-3)' }}>
                <Icons.Lock size={12} />
                <span className="sq-mono" style={{ fontSize: 10.5, letterSpacing: '0.04em' }}>
                  {t('CODE REQUIRED')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* primary action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="sq-btn-gold"
            style={{ padding: '15px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}
            onClick={() => nav.push('joinClub')}
          >
            <Icons.Ticket size={17} /> {t('Enter access code')}
          </button>
          <p style={{ margin: 0, textAlign: 'center', fontSize: 12.5, color: 'var(--sq-text-3)', lineHeight: 1.5 }}>
            {t('Already a member? Your squash office sends codes over WhatsApp — paste yours to unlock the club.')}
          </p>
        </div>
      </div>
    </MScreen>
  );
}
