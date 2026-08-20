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
import { projectPins, makeProjection } from '../lib/geo';

// Real Cairo geography in lat/lng, projected through the SAME transform as
// the pins — so the river, the ring road and the district labels actually
// line up with where the venues are.
const NILE = [
  [30.20, 31.255], [30.14, 31.238], [30.10, 31.226], [30.075, 31.222],
  [30.045, 31.228], [30.00, 31.232], [29.96, 31.240], [29.90, 31.252], [29.84, 31.262],
];
const RING_ROAD = [
  [30.15, 31.22], [30.16, 31.35], [30.11, 31.45], [30.02, 31.49],
  [29.93, 31.42], [29.90, 31.28], [29.94, 31.17], [30.03, 31.12], [30.11, 31.14], [30.15, 31.22],
];
const DISTRICTS = [
  ['Heliopolis', 30.088, 31.324], ['Nasr City', 30.058, 31.343],
  ['New Cairo', 30.030, 31.470], ['Maadi', 29.960, 31.260],
  ['Zamalek', 30.061, 31.221], ['Giza', 30.013, 31.209],
  ['6th October', 29.970, 30.940], ['Downtown', 30.045, 31.236],
];

export default function VenueMap({ venues = [], height = 190, activeId, onPick, me = null }) {
  // project the player's position through the same transform as the venues,
  // so "you" lands in the right place relative to the pins
  const pins = useMemo(
    () => projectPins(me ? [...venues, { id: '__me__', lat: me.lat, lng: me.lng, me: true }] : venues),
    [venues, me],
  );
  const proj = useMemo(
    () => makeProjection(me ? [...venues, { lat: me.lat, lng: me.lng }] : venues),
    [venues, me],
  );
  const path = (coords) => coords
    .map(([lat, lng], i) => { const p = proj(lat, lng, false); return `${i ? 'L' : 'M'}${(p.x * 100).toFixed(2)} ${(p.y * 100).toFixed(2)}`; })
    .join(' ');
  const mePin = pins.find((p) => p.me);
  const venuePins = pins.filter((p) => !p.me);

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
      {/* real Cairo geography, projected with the pins */}
      {proj && (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d={path(RING_ROAD)} fill="none" stroke="var(--sq-border-2)" strokeWidth="0.5" strokeDasharray="1.6 1.2" vectorEffect="non-scaling-stroke" />
          <path d={path(NILE)} fill="none" stroke="color-mix(in srgb, var(--sq-blue) 38%, transparent)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
      {/* district labels sit in the DOM so they never stretch with the svg */}
      {proj && DISTRICTS.map(([name, lat, lng]) => {
        const p = proj(lat, lng, false);
        if (p.x < 0.02 || p.x > 0.98 || p.y < 0.04 || p.y > 0.96) return null;
        return (
          <span key={name} className="sq-mono"
            style={{ position: 'absolute', left: `${p.x * 100}%`, top: `${p.y * 100}%`, transform: 'translate(-50%, -50%)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sq-text-3)', opacity: 0.55, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            {name}
          </span>
        );
      })}

      {mePin && (
        <div style={{ position: 'absolute', left: `${mePin.x * 100}%`, top: `${mePin.y * 100}%`, transform: 'translate(-50%, -50%)', zIndex: 1, pointerEvents: 'none' }}>
          <span style={{ display: 'block', width: 13, height: 13, borderRadius: 999, background: 'var(--sq-blue)', border: '2px solid var(--sq-surface)', boxShadow: '0 0 0 6px color-mix(in srgb, var(--sq-blue) 22%, transparent)' }} />
        </div>
      )}

      {/* pins */}
      {venuePins.map((p) => {
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
        <Icons.Pin size={10} /> {venuePins.length} nearby
      </div>

      {!venuePins.length && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-text-3)', fontSize: 12 }}>
          No mapped venues yet
        </div>
      )}
    </div>
  );
}
