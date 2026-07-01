// ClubCrest.jsx — the Heliopolis club badge. Shows the uploaded crest image
// (from the store, set on the coach console) when present, otherwise falls back
// to the generic club icon. Used across the app + console so an uploaded crest
// shows up everywhere the club is represented.

import { Icons } from './Icons';
import { useStore } from '../store';

export default function ClubCrest({ size = 32, radius = 8 }) {
  const state = useStore();
  const src = state.images?.clubCrest;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0, overflow: 'hidden',
        background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)',
        border: '1px solid color-mix(in srgb, var(--sq-gold) 28%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-gold)',
      }}
    >
      {src ? <img src={src} alt="Club crest" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icons.Club size={size * 0.55} />}
    </div>
  );
}
