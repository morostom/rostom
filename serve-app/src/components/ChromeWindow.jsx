// ChromeWindow.jsx — a simplified macOS Chrome browser window frame for the
// desktop consoles. Ported from the SERVE prototype's Chrome.jsx.

const C = { barBg: '#202124', tabBg: '#35363a', text: '#e8eaed', dim: '#9aa0a6', urlBg: '#282a2d' };

function TrafficLights() {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 14px' }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
    </div>
  );
}

function Tab({ title, active }) {
  const curve = (flip) => (
    <svg width="8" height="10" viewBox="0 0 8 10" style={{ position: 'absolute', bottom: 0, [flip ? 'right' : 'left']: -8, transform: flip ? 'scaleX(-1)' : 'none' }}>
      <path d="M0 10C2 9 6 8 8 0V10H0Z" fill={C.tabBg} />
    </svg>
  );
  return (
    <div
      style={{
        position: 'relative',
        height: 34,
        alignSelf: 'flex-end',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: active ? C.tabBg : 'transparent',
        borderRadius: '8px 8px 0 0',
        minWidth: 120,
        maxWidth: 240,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 12,
        color: active ? C.text : C.dim,
      }}
    >
      {active && curve(false)}
      {active && curve(true)}
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#5f6368', flexShrink: 0 }} />
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
    </div>
  );
}

const dot = (
  <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 16, height: 16, borderRadius: '50%', background: C.dim, opacity: 0.4 }} />
  </div>
);

export default function ChromeWindow({ tabs = [{ title: 'New Tab' }], activeIndex = 0, url = 'example.com', width = 1240, height = 804, children }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        background: C.tabBg,
        flexShrink: 0,
      }}
    >
      {/* tab bar */}
      <div style={{ display: 'flex', alignItems: 'center', height: 44, background: C.barBg, paddingRight: 8 }}>
        <TrafficLights />
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', paddingLeft: 4, flex: 1 }}>
          {tabs.map((t, i) => (
            <Tab key={i} title={t.title} active={i === activeIndex} />
          ))}
        </div>
      </div>
      {/* toolbar */}
      <div style={{ height: 40, background: C.tabBg, display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px' }}>
        {dot}
        <div style={{ flex: 1, height: 30, borderRadius: 15, background: C.urlBg, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', margin: '0 6px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: C.dim, opacity: 0.4 }} />
          <span style={{ flex: 1, color: C.text, fontSize: 13, fontFamily: 'system-ui, sans-serif' }}>{url}</span>
        </div>
        {dot}
      </div>
      {/* content */}
      <div style={{ flex: 1, background: 'var(--sq-bg)', overflow: 'hidden' }}>{children}</div>
    </div>
  );
}
