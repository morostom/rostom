// PlayerCard.jsx — the collectible card. Two card TYPES and two layout VARIANTS.
//  type:    'competitive' (ranking, division, tournament record)
//           'recreational' (no ranking — favourite shot + years playing)
//  variant: 'full' (hero) | 'compact' (gallery tile)

import { memo } from 'react';
import { Icons } from './Icons';

function rankOf(p) {
  if (typeof p.rank === 'number') return String(p.rank);
  const m = (p.rankLabel || '').match(/\d+/);
  return m ? m[0] : null;
}

function PhotoArea({ player, height, placeholder }) {
  if (player.photo) {
    return <img src={player.photo} alt={player.name} style={{ width: '100%', height, objectFit: 'cover' }} />;
  }
  return (
    <div
      style={{
        width: '100%',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--sq-text-3)',
        fontFamily: 'var(--sq-mono)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        background:
          'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 6px, rgba(255,255,255,0) 6px 14px), linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
      }}
    >
      {placeholder}
    </div>
  );
}

function CardStat({ label, value, accent }) {
  return (
    <div style={{ padding: '9px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--sq-border)' }}>
      <div className="sq-mono" style={{ fontSize: 8.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </div>
      <div className="sq-display" style={{ fontSize: 16, fontWeight: 700, marginTop: 3, color: accent || 'var(--sq-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </div>
    </div>
  );
}

function CardField({ icon, label, value, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
      <span style={{ color: accent || 'var(--sq-text-3)', display: 'inline-flex', width: 16 }}>{icon}</span>
      <span className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 96, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--sq-text)', textAlign: 'right', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || '—'}</span>
    </div>
  );
}

function PlayerCard({ player, accent, variant = 'full' }) {
  const recreational = player.cardType === 'recreational';
  const ac = accent || player.accent || (recreational ? 'var(--sq-blue)' : 'var(--sq-gold)');
  const compact = variant === 'compact';
  const firstName = (player.name || 'Player').split(' ')[0];
  const rank = rankOf(player);
  const record = player.wins != null ? `${player.wins}–${player.losses}` : '—';
  const tag = recreational ? 'Recreational' : player.division || 'Junior';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: compact ? '9px 11px 0' : '13px 15px 0' }}>
        <span className="serve-wordmark" style={{ fontSize: compact ? 12 : 15, WebkitTextStrokeWidth: '0.8px' }}>
          SERVE
        </span>
        <span className="sq-mono" style={{ fontSize: compact ? 8.5 : 10, color: ac, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {tag}
        </span>
      </div>

      {/* photo */}
      <div
        style={{
          position: 'relative',
          margin: compact ? '8px 11px 0' : '12px 15px 0',
          borderRadius: 14,
          overflow: 'hidden',
          height: compact ? 132 : 230,
          background: 'var(--sq-surface-2)',
        }}
      >
        <PhotoArea player={player} height={compact ? 132 : 230} placeholder={compact ? 'photo' : `${firstName}'s photo`} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(7,7,7,0.92) 100%)', pointerEvents: 'none' }} />
        {/* rank badge — competitive + SERVE-verified only */}
        {!recreational && rank && player.rankVerified && (
          <div style={{ position: 'absolute', top: 10, right: 10, pointerEvents: 'none', lineHeight: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span className="sq-display" style={{ fontSize: compact ? 26 : 40, fontWeight: 700, color: ac, textShadow: `0 0 16px color-mix(in srgb, ${ac} 55%, transparent)` }}>
              #{rank}
            </span>
            {!compact && (
              <span className="sq-mono" style={{ fontSize: 8, color: 'var(--sq-green)', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Icons.Check size={9} /> VERIFIED
              </span>
            )}
          </div>
        )}
        {/* unverified ranking — awaiting SERVE verification */}
        {!recreational && rank && !player.rankVerified && !compact && (
          <div style={{ position: 'absolute', top: 10, right: 10, pointerEvents: 'none' }}>
            <span className="sq-chip" style={{ fontSize: 9, padding: '3px 8px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
              Rank pending
            </span>
          </div>
        )}
        {/* name + age */}
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 10, pointerEvents: 'none' }}>
          <div className="sq-display" style={{ fontSize: compact ? 16 : 23, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            {player.name || 'Your name'}
          </div>
          <div className="sq-mono" style={{ fontSize: compact ? 9.5 : 11.5, color: 'var(--sq-text-2)', marginTop: 2 }}>
            Age {player.age || '—'} · {player.club || 'Club'}
          </div>
        </div>
      </div>

      {compact ? (
        <div style={{ padding: '9px 12px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="sq-mono" style={{ fontSize: 9.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {recreational ? player.yearsPlaying || '—' : record}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: 'var(--sq-text-2)' }}>
            <span style={{ color: ac, display: 'inline-flex' }}>
              {recreational ? <Icons.Racket size={11} /> : <Icons.Heart size={11} filled />}
            </span>{' '}
            {recreational ? player.favShot : player.fav}
          </span>
        </div>
      ) : recreational ? (
        <div style={{ padding: '14px 15px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <CardStat label="Playing for" value={player.yearsPlaying || '—'} accent={ac} />
            <CardStat label="Level" value="Recreational" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderTop: '1px solid var(--sq-border)', paddingTop: 12 }}>
            <CardField icon={<Icons.Pin size={13} />} label="Club" value={player.club} />
            <CardField icon={<span style={{ color: ac, display: 'inline-flex' }}><Icons.Racket size={13} /></span>} label="Favourite shot" value={player.favShot} accent={ac} />
          </div>
        </div>
      ) : (
        <div style={{ padding: '14px 15px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <CardStat label="Ranking" value={!rank ? '—' : player.rankVerified ? `#${rank}` : 'Pending'} accent={ac} />
            <CardStat label="Record" value={record} />
            <CardStat label="Since" value={player.since || '—'} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderTop: '1px solid var(--sq-border)', paddingTop: 12 }}>
            <CardField icon={<Icons.Pin size={13} />} label="Club" value={player.club} />
            <CardField icon={<Icons.Racket size={13} />} label="Racket" value={player.racket} />
            <CardField
              icon={<span style={{ color: ac, display: 'inline-flex' }}><Icons.Heart size={13} filled /></span>}
              label="Favorite player"
              value={player.fav}
              accent={ac}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(PlayerCard);
