// SQLogo.jsx — the SERVE neon wordmark, from the brand sign artwork.
// The PNG is white-on-transparent with the glow baked into its alpha, applied
// as a CSS mask so it tints per theme: neon white on dark, brand red on light
// (see .serve-mark rules in index.css).

import mark from '../assets/serve-mark.png';

export const MARK_ASPECT = 2.528; // width / height of the wordmark image

export default function SQLogo({ size = 22, align = 'flex-start' }) {
  // `size` matches the old wordmark font-size; the sign's detailed outline
  // strokes need a little more height than the plain text did to stay legible
  const h = Math.max(12, Math.round(size * 1.2));
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: align }}>
      <span
        className="serve-mark"
        role="img"
        aria-label="SERVE"
        style={{
          width: Math.round(h * MARK_ASPECT),
          height: h,
          WebkitMaskImage: `url(${mark})`,
          maskImage: `url(${mark})`,
        }}
      />
    </div>
  );
}
