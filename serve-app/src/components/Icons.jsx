// Icons.jsx — single-color stroke icons, sized inline. Ported from the
// SERVE prototype's primitives.jsx.

const SQIcon = ({ size = 18, fill = 'none', strokeWidth = 1.7, viewBox = '0 0 24 24', d, children }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill={fill}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

export const Icons = {
  // squash racket mark — the brand glyph
  Racket: ({ size = 18 }) => (
    <SQIcon size={size}>
      <ellipse cx="9" cy="9" rx="5.5" ry="6.5" transform="rotate(-30 9 9)" />
      <path d="M13.5 13.5L20 20" />
      <path d="M19 19l1.5 1.5" />
      <path d="M5.5 7l7 4M7 4.5l4 7" opacity="0.5" />
    </SQIcon>
  ),
  User: ({ size = 18 }) => (
    <SQIcon size={size}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </SQIcon>
  ),
  Pin: ({ size = 14 }) => (
    <SQIcon size={size}>
      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </SQIcon>
  ),
  Chevron: ({ size = 16, dir = 'right' }) => {
    const map = { right: 'M9 5l7 7-7 7', left: 'M15 5l-7 7 7 7', down: 'M5 9l7 7 7-7', up: 'M5 15l7-7 7 7' };
    return <SQIcon size={size} d={map[dir]} />;
  },
  Camera: ({ size = 16 }) => (
    <SQIcon size={size}>
      <path d="M3 8a2 2 0 012-2h2l1.2-1.6a1 1 0 01.8-.4h6a1 1 0 01.8.4L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </SQIcon>
  ),
  Heart: ({ size = 16, filled }) => (
    <SQIcon size={size} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7-4.3-9.3-8.3C1.2 8.9 2.6 5.5 6 5.5c2 0 3.2 1.3 4 2.4.8-1.1 2-2.4 4-2.4 3.4 0 4.8 3.4 3.3 6.2C19 15.7 12 20 12 20z" />
    </SQIcon>
  ),
  Medal: ({ size = 16 }) => (
    <SQIcon size={size}>
      <circle cx="12" cy="14" r="6" />
      <path d="M9 3l3 6 3-6M8.5 3.5L12 9M15.5 3.5L12 9" opacity="0.7" />
      <path d="M12 11.5l1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L9 13.8l2-.3z" />
    </SQIcon>
  ),
  Check: ({ size = 18 }) => <SQIcon size={size} d="M4 12l5 5L20 6" />,
  Edit: ({ size = 16 }) => (
    <SQIcon size={size}>
      <path d="M4 20h4l10-10-4-4L4 16v4zM13.5 6.5l4 4" />
    </SQIcon>
  ),
  Share: ({ size = 16 }) => (
    <SQIcon size={size}>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="17" cy="6" r="2.5" />
      <circle cx="17" cy="18" r="2.5" />
      <path d="M8.2 10.9l6.6-3.8M8.2 13.1l6.6 3.8" />
    </SQIcon>
  ),
};
