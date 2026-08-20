// SurfaceSwitcher.jsx — floating control to flip between the player app and the
// two desktop consoles. A demo affordance so all three surfaces are reachable.

const SURFACES = [
  { id: 'app', label: 'Player app' },
  { id: 'admin', label: 'Academy admin' },
  { id: 'coach', label: 'Coach console' },
];

export default function SurfaceSwitcher({ surface, onChange }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: 'rgba(18,18,18,0.82)',
        border: '1px solid var(--sq-border-2)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      }}
    >
      {SURFACES.map((s) => {
        const on = s.id === surface;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              border: 0,
              cursor: 'pointer',
              fontFamily: 'var(--sq-display)',
              fontWeight: 600,
              fontSize: 12.5,
              letterSpacing: '-0.01em',
              background: on ? 'var(--sq-gold)' : 'transparent',
              color: on ? '#0e0b0a' : 'var(--sq-text-2)',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
