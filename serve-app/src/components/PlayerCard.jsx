// PlayerCard.jsx — the collectible junior player card. Ported from the SERVE
// prototype and wired to live profile data + an uploaded photo.

import { Icons } from './Icons';

function CardStat({ label, value, accent }) {
  return (
    <div
      style={{
        padding: '9px 10px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--sq-border)',
      }}
    >
      <div
        className="sq-mono"
        style={{ fontSize: 8.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        {label}
      </div>
      <div className="sq-display" style={{ fontSize: 17, fontWeight: 700, marginTop: 3, color: accent || 'var(--sq-text)' }}>
        {value}
      </div>
    </div>
  );
}

function CardField({ icon, label, value, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
      <span style={{ color: accent || 'var(--sq-text-3)', display: 'inline-flex', width: 16 }}>{icon}</span>
      <span
        className="sq-mono"
        style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 96, flexShrink: 0 }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--sq-text)', textAlign: 'right', flex: 1 }}>
        {value || '—'}
      </span>
    </div>
  );
}

export default function PlayerCard({ player, accent = 'var(--sq-gold)' }) {
  const ac = accent;
  const firstName = (player.name || 'Player').split(' ')[0];
  // derive the bare rank number (e.g. "#3 · U15 National" → "3") for the badge
  const rankMatch = (player.rankLabel || '').match(/\d+/);
  const rank = rankMatch ? rankMatch[0] : '—';

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 18,
        overflow: 'hidden',
        background: 'linear-gradient(165deg, #161616 0%, #0b0b0b 60%, #070707 100%)',
        border: `1px solid color-mix(in srgb, ${ac} 45%, transparent)`,
        boxShadow: `0 0 0 1px color-mix(in srgb, ${ac} 12%, transparent), 0 18px 50px rgba(0,0,0,0.6), 0 0 40px color-mix(in srgb, ${ac} 14%, transparent)`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* header strip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px 0' }}>
        <span className="serve-wordmark" style={{ fontSize: 15, WebkitTextStrokeWidth: '0.8px' }}>
          SERVE
        </span>
        <span
          className="sq-mono"
          style={{ fontSize: 10, color: ac, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          {player.division || 'Junior'}
        </span>
      </div>

      {/* photo */}
      <div
        style={{
          position: 'relative',
          margin: '12px 15px 0',
          borderRadius: 14,
          overflow: 'hidden',
          height: 230,
          background: 'var(--sq-surface-2)',
        }}
      >
        {player.photo ? (
          <img src={player.photo} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--sq-text-3)',
              fontFamily: 'var(--sq-mono)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              background:
                'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 6px, rgba(255,255,255,0) 6px 14px), linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            }}
          >
            {firstName}'s photo
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 40%, rgba(7,7,7,0.92) 100%)',
            pointerEvents: 'none',
          }}
        />
        {/* rank badge */}
        <div style={{ position: 'absolute', top: 10, right: 10, pointerEvents: 'none', lineHeight: 1 }}>
          <span
            className="sq-display"
            style={{ fontSize: 40, fontWeight: 700, color: ac, textShadow: `0 0 16px color-mix(in srgb, ${ac} 55%, transparent)` }}
          >
            #{rank}
          </span>
        </div>
        {/* name + age */}
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 10, pointerEvents: 'none' }}>
          <div className="sq-display" style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            {player.name || 'Your name'}
          </div>
          <div className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 2 }}>
            Age {player.age || '—'} · {player.club || 'Club'}
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ padding: '14px 15px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <CardStat label="Ranking" value={`#${rank}`} accent={ac} />
          <CardStat label="Division" value={player.division ? player.division.split(' ')[0] : '—'} />
          <CardStat label="Since" value={new Date().getFullYear()} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderTop: '1px solid var(--sq-border)', paddingTop: 12 }}>
          <CardField icon={<Icons.Pin size={13} />} label="Club" value={player.club} />
          <CardField icon={<Icons.Racket size={13} />} label="Racket" value={player.racket} />
          <CardField
            icon={
              <span style={{ color: ac, display: 'inline-flex' }}>
                <Icons.Heart size={13} filled />
              </span>
            }
            label="Favorite player"
            value={player.fav}
            accent={ac}
          />
        </div>
      </div>
    </div>
  );
}
