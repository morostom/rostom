// WhoForScreen.jsx — "Are you creating a card for yourself or your child?"
// Branches the rest of onboarding (copy + parent framing) accordingly.

import SQLogo from '../components/SQLogo';
import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { useT } from '../i18n';

function Choice({ icon, title, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="sq-card"
      style={{
        textAlign: 'left',
        cursor: 'pointer',
        padding: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'var(--sq-surface)',
        transition: 'border-color 0.15s, transform 0.1s',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          flexShrink: 0,
          background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)',
          border: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)',
          color: 'var(--sq-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--sq-text-2)', marginTop: 3, lineHeight: 1.4 }}>{sub}</div>
      </div>
      <Icons.Chevron size={18} />
    </button>
  );
}

export default function WhoForScreen() {
  const { nav, setForChild, setAccountType } = useNav();
  const t = useT();

  function choose(forChild) {
    setAccountType?.('player');
    setForChild(forChild);
    nav.push('compete');
  }

  function chooseParent() {
    setAccountType?.('parent');
    nav.push('parentLink');
  }

  return (
    <MScreen
      header={
        <div style={{ padding: '6px 16px 6px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Pill onClick={() => nav.pop()}>
            <Icons.Chevron dir="left" size={16} />
          </Pill>
          <SQLogo size={18} accent />
        </div>
      }
    >
      <div style={{ padding: '18px 22px 24px' }}>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
          {t('Step 1 of 3')}
        </div>
        <h1 className="sq-display" style={{ margin: '8px 0 0', fontSize: 27, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {t('How will you')}<br /><span style={{ color: 'var(--sq-gold)' }}>{t('use SERVE?')}</span>
        </h1>
        <p style={{ margin: '8px 0 22px', color: 'var(--sq-text-2)', fontSize: 13.5, lineHeight: 1.5 }}>
          {t('Make a player card for yourself or your child, or set up a parent account to track and pay for your child.')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Choice icon={<Icons.User size={24} />} title={t('For myself')} sub={t('I play squash and want my own card.')} onClick={() => choose(false)} />
          <Choice icon={<Icons.Users size={24} />} title={t('For my child')} sub={t("I'm setting up my child's player card.")} onClick={() => choose(true)} />
          <Choice icon={<Icons.Heart size={24} />} title={t('Parent account')} sub={t("No card — track my child's sessions, book courts, and pay their transfers.")} onClick={chooseParent} />
        </div>
      </div>
    </MScreen>
  );
}
