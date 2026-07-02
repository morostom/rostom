// Stars.jsx — read-only star rating + an interactive picker.

import { Icons } from './Icons';

// average rating + count for a venue, from the store's reviews array
export function venueRating(reviews, venueId) {
  const list = (reviews || []).filter((r) => r.venue_id === venueId);
  if (!list.length) return { avg: 0, count: 0 };
  const avg = list.reduce((s, r) => s + (r.rating || 0), 0) / list.length;
  return { avg: Math.round(avg * 10) / 10, count: list.length };
}

function Star({ size, on, half }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', color: on ? 'var(--sq-gold)' : 'var(--sq-border-2)' }}>
      <Icons.Star size={size} filled={on} />
      {half && (
        <span style={{ position: 'absolute', inset: 0, width: '50%', overflow: 'hidden', color: 'var(--sq-gold)' }}>
          <Icons.Star size={size} filled />
        </span>
      )}
    </span>
  );
}

export default function Stars({ value = 0, size = 14, count, showValue }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ display: 'inline-flex', gap: 1 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={size} on={value >= n} half={value >= n - 0.5 && value < n} />
        ))}
      </span>
      {showValue && value > 0 && <span className="sq-mono" style={{ fontSize: size - 2, color: 'var(--sq-text-2)' }}>{value.toFixed(1)}</span>}
      {count != null && <span className="sq-mono" style={{ fontSize: size - 3, color: 'var(--sq-text-3)' }}>({count})</span>}
    </span>
  );
}

// interactive picker
export function StarPicker({ value, onChange, size = 30 }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} onClick={() => onChange(n)} style={{ background: 'none', border: 0, padding: 2, cursor: 'pointer', color: value >= n ? 'var(--sq-gold)' : 'var(--sq-border-2)' }}>
          <Icons.Star size={size} filled={value >= n} />
        </button>
      ))}
    </div>
  );
}
