// VenueMap.jsx — the Discover map. A stylised Cairo-style street canvas with
// a pin per venue, positioned from real coordinates.
//
// Deliberately not Google/Mapbox tiles: no API key, no billing, no network
// dependency, and it matches the SERVE palette in both themes. Positions are
// real (projected lat/lng), and every pin can hand off to actual Google Maps
// for directions — so it's honest about where things are without pretending
// to be a routing map.

import { useMemo } from 'react';
import { Icons } from './Icons';
import { projectPins } from '../lib/geo';

export default function VenueMap({ venues = [], height = 190, activeId, onPick }) {
  const pins = useMemo(() => projectPins(venues), [venues]);

  return (
    <div
      style={{
        position: 'relative',
        height,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--sq-border)',
        background:
          'radial-gradient(120% 90% at 20% 0%, color-mix(in srgb, var(--sq-gold) 7%, transparent), transparent 60%), var(--sq-surface)',
      }}
    >
      {/* stylised street grid + river */}
      <svg viewBox="0 0 400 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g stroke="var(--sq-border-2)" strokeWidth="0.7" fill="none" opacity="0.65">
          {[24, 60, 96, 132, 168].map((y) => <line key={'h' + y} x1="0" y1={y} x2="400" y2={y} />)}
          {[40, 100, 160, 220, 280, 340].map((x) => <line key={'v' + x} x1={x} y1="0" x2={x} y2="200" />)}
          <path d="M0 150 Q90 120 150 150 T400 128" strokeWidth="1" />
          <path d="M60 0 Q120 70 200 90 T400 60" strokeWidth="1" />
        </g>
        {/* the Nile */}
        <path
          d="M120 -10 C140 50 108 96 128 140 C142 174 132 194 138 210"
          stroke="color-mix(in srgb, var(--sq-blue) 34%, transparent)"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
        />
        {/* a couple of green blocks so it reads as a city, not graph paper */}
        <g fill="color-mix(in srgb, var(--sq-green) 12%, transparent)">
          <rect x="252" y="34" width="52" height="34" rx="6" />
          <rect x="44" y="118" width="40" height="28" rx="6" />
        </g>
      </svg>

      {/* pins */}
      {pins.map((p) => {
        const on = p.id === activeId;
        const col = p.accent || 'var(--sq-gold)';
        return (
          <button
            key={p.id}
            onClick={() => onPick?.(p)}
            title={p.name}
            style={{
              position: 'absolute',
              left: `${p.x * 100}%`,
              top: `${p.y * 100}%`,
              transform: 'translate(-50%, -100%)',
              background: 'none',
              border: 0,
              padding: 4,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: on ? 3 : 2,
            }}
          >
            <span
              style={{
                width: on ? 15 : 11,
                height: on ? 15 : 11,
                borderRadius: 999,
                background: col,
                border: '2px solid var(--sq-surface)',
                boxShadow: `0 0 0 ${on ? 4 : 2}px color-mix(in srgb, ${col} 26%, transparent), 0 2px 6px rgba(0,0,0,0.45)`,
                display: 'block',
                transition: 'width .15s, height .15s, box-shadow .15s',
              }}
            />
            {on && (
              <span
                className="sq-display"
                style={{
                  marginTop: 5,
                  fontSize: 10.5,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'var(--sq-scrim-2)',
                  border: '1px solid var(--sq-border-2)',
                  color: 'var(--sq-text)',
                  maxWidth: 130,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {p.short || p.name}
              </span>
            )}
          </button>
        );
      })}

      {/* count badge */}
      <div
        className="sq-mono"
        style={{
          position: 'absolute', left: 10, top: 10, zIndex: 4,
          fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.12em',
          padding: '4px 9px', borderRadius: 999,
          background: 'var(--sq-scrim-2)', border: '1px solid var(--sq-border)',
          color: 'var(--sq-text-2)', display: 'inline-flex', alignItems: 'center', gap: 6,
        }}
      >
        <Icons.Pin size={10} /> {pins.length} nearby
      </div>

      {!pins.length && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-text-3)', fontSize: 12 }}>
          No mapped venues yet
        </div>
      )}
    </div>
  );
}
