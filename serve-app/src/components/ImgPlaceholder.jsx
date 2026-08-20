// ImgPlaceholder.jsx — striped texture stand-in for imagery (logos, covers,
// action shots) in the desktop consoles. Mirrors the prototype's .sq-img-ph.

export default function ImgPlaceholder({ label, height = 120, width = '100%', radius = 12, hue, style = {} }) {
  const tint =
    hue === 'gold'
      ? 'linear-gradient(135deg, color-mix(in srgb, var(--sq-gold) 18%, transparent) 0%, rgba(0,0,0,0.6) 100%), #0d0d0d'
      : hue === 'navy'
      ? 'linear-gradient(135deg, rgba(46,140,240,0.12) 0%, rgba(13,21,37,0.8) 100%), #0d1424'
      : 'linear-gradient(135deg, #1a1a1a 0%, #0e0b0a 100%)';
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        border: '1px solid var(--sq-border)',
        color: 'var(--sq-text-3)',
        fontFamily: 'var(--sq-mono)',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 6px, rgba(255,255,255,0) 6px 14px), ${tint}`,
        ...style,
      }}
    >
      <span style={{ opacity: 0.55 }}>{label}</span>
    </div>
  );
}
