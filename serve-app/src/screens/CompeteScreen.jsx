// CompeteScreen.jsx — "Do you compete in tournaments?" Yes → competitive card,
// No → recreational card. Seeds the right empty card template before the build.

import SQLogo from '../components/SQLogo';
import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { EMPTY_COMPETITIVE, EMPTY_RECREATIONAL } from '../data';

function Choice({ icon, title, sub, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className="sq-card"
      style={{ textAlign: 'left', cursor: 'pointer', padding: 18, display: 'flex', alignItems: 'center', gap: 16, background: 'var(--sq-surface)' }}
    >
      <div
        style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: `color-mix(in srgb, ${accent} 14%, transparent)`,
          border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
          color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
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

export default function CompeteScreen() {
  const { nav, forChild, setCardType, setPlayer } = useNav();
  const who = forChild ? 'your child' : 'you';

  function choose(cardType) {
    setCardType(cardType);
    const template = cardType === 'competitive' ? EMPTY_COMPETITIVE : EMPTY_RECREATIONAL;
    setPlayer({ ...template, forChild });
    nav.push('build');
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
          Step 2 of 3
        </div>
        <h1 className="sq-display" style={{ margin: '8px 0 0', fontSize: 27, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Do {who}<br /><span style={{ color: 'var(--sq-gold)' }}>compete?</span>
        </h1>
        <p style={{ margin: '8px 0 22px', color: 'var(--sq-text-2)', fontSize: 13.5, lineHeight: 1.5 }}>
          This decides what your card shows. You can change it later.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Choice
            icon={<Icons.Medal size={24} />}
            accent="var(--sq-gold)"
            title="Yes, I compete"
            sub="Tournament player — show national ranking, division & match record."
            onClick={() => choose('competitive')}
          />
          <Choice
            icon={<Icons.Heart size={24} />}
            accent="var(--sq-blue)"
            title="No, I play for fun"
            sub="Casual / recreational — a clean card with your club, favourite shot & years playing."
            onClick={() => choose('recreational')}
          />
        </div>
      </div>
    </MScreen>
  );
}
