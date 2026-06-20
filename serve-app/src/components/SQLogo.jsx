// SQLogo.jsx — SERVE neon wordmark (matches the EST. 2026 sign logo).

export default function SQLogo({ size = 22, est = false, accent = false, align = 'flex-start' }) {
  const strokeW = Math.max(0.7, size / 15);
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: align, lineHeight: 0.86 }}>
      <span
        className={'serve-wordmark' + (accent ? ' accent' : '')}
        style={{ fontSize: size, WebkitTextStrokeWidth: strokeW + 'px' }}
      >
        SERVE
      </span>
      {est && (
        <span className="serve-est" style={{ fontSize: Math.max(7, size * 0.2), marginTop: size * 0.16 }}>
          EST. 2026
        </span>
      )}
    </div>
  );
}
