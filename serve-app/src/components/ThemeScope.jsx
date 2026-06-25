// ThemeScope.jsx — overrides the accent token for its subtree so a club or
// academy can run SERVE in its own brand colour (e.g. Heliopolis in blue).
// Every component reads var(--sq-gold), so setting it here re-themes everything
// inside: buttons, chips, the wordmark glow, active nav, card accents.

function hover(hex) {
  // lighten the accent a touch for :hover via a translucent white blend
  return `color-mix(in srgb, ${hex} 80%, white)`;
}

export default function ThemeScope({ accent, style, children, ...rest }) {
  return (
    <div
      style={{ '--sq-gold': accent, '--sq-gold-hi': hover(accent), display: 'contents', ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
