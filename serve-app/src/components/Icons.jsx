// Icons.jsx — single-color stroke icons, sized inline. Ported from the
// SERVE prototype's primitives.jsx.

const SQIcon = ({ size = 18, fill = 'none', strokeWidth = 1.7, viewBox = '0 0 24 24', d, children, style }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill={fill}
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
  >
    {d ? <path d={d} /> : children}
  </svg>
);

export const Icons = {
  Racket: ({ size = 18 }) => (
    <SQIcon size={size}>
      <ellipse cx="9" cy="9" rx="5.5" ry="6.5" transform="rotate(-30 9 9)" />
      <path d="M13.5 13.5L20 20" />
      <path d="M19 19l1.5 1.5" />
      <path d="M5.5 7l7 4M7 4.5l4 7" opacity="0.5" />
    </SQIcon>
  ),
  Home: ({ size = 18 }) => <SQIcon size={size} d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9z" />,
  Search: ({ size = 18 }) => (
    <SQIcon size={size}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </SQIcon>
  ),
  Calendar: ({ size = 18 }) => (
    <SQIcon size={size}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
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
  Bolt: ({ size = 14 }) => (
    <SQIcon size={size} fill="currentColor" strokeWidth="0">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </SQIcon>
  ),
  Star: ({ size = 14, filled }) => (
    <SQIcon size={size} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 2l3 6.5 7 1-5 4.8 1.2 7L12 18l-6.2 3.3L7 14.3l-5-4.8 7-1z" />
    </SQIcon>
  ),
  Plus: ({ size = 18 }) => <SQIcon size={size} d="M12 5v14M5 12h14" />,
  Check: ({ size = 18 }) => <SQIcon size={size} d="M4 12l5 5L20 6" />,
  ArrowRight: ({ size = 18 }) => <SQIcon size={size} d="M5 12h14M13 5l7 7-7 7" />,
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
  Upload: ({ size = 16 }) => (
    <SQIcon size={size}>
      <path d="M12 15V4M8 8l4-4 4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
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
  Trophy: ({ size = 16 }) => (
    <SQIcon size={size}>
      <path d="M7 4h10v4a5 5 0 01-10 0V4z" />
      <path d="M7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3M9 19h6M12 13v6" />
    </SQIcon>
  ),
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
  Settings: ({ size = 16 }) => (
    <SQIcon size={size}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.6 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1A1.7 1.7 0 004.7 9a1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </SQIcon>
  ),
  More: ({ size = 16 }) => (
    <SQIcon size={size}>
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    </SQIcon>
  ),
  Club: ({ size = 18 }) => (
    <SQIcon size={size}>
      <path d="M12 3l7 2.4v5.1c0 4.6-3 7.7-7 9.1-4-1.4-7-4.5-7-9.1V5.4L12 3z" />
      <circle cx="12" cy="10.5" r="2.1" />
      <path d="M12 12.6v3.2" opacity="0.6" />
    </SQIcon>
  ),
  Ticket: ({ size = 16 }) => (
    <SQIcon size={size}>
      <path d="M4 7a2 2 0 012-2h12a2 2 0 012 2v2a1.6 1.6 0 000 3.2V15a2 2 0 01-2 2H6a2 2 0 01-2-2v-2.8A1.6 1.6 0 004 9V7z" />
      <path d="M13 5v14" strokeDasharray="2 2.4" opacity="0.7" />
    </SQIcon>
  ),
  Lock: ({ size = 16 }) => (
    <SQIcon size={size}>
      <rect x="5" y="11" width="14" height="10" rx="2.2" />
      <path d="M8 11V7.5a4 4 0 018 0V11" />
      <circle cx="12" cy="15.5" r="1.2" fill="currentColor" strokeWidth="0" />
    </SQIcon>
  ),
  Unlock: ({ size = 16 }) => (
    <SQIcon size={size}>
      <rect x="5" y="11" width="14" height="10" rx="2.2" />
      <path d="M8 11V7.5a4 4 0 017.7-1.5" />
      <circle cx="12" cy="15.5" r="1.2" fill="currentColor" strokeWidth="0" />
    </SQIcon>
  ),
  Copy: ({ size = 16 }) => (
    <SQIcon size={size}>
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </SQIcon>
  ),
  Chat: ({ size = 16 }) => (
    <SQIcon size={size}>
      <path d="M4 5h16a1 1 0 011 1v9a1 1 0 01-1 1H9l-4 3.5V16H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
      <path d="M8 9.5h8M8 12.5h5" opacity="0.7" />
    </SQIcon>
  ),
  Court: ({ size = 16 }) => (
    <SQIcon size={size}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 12h18M12 4v16" opacity="0.4" />
      <circle cx="12" cy="12" r="2.5" />
    </SQIcon>
  ),
  Refresh: ({ size = 16 }) => (
    <SQIcon size={size}>
      <path d="M3.5 9a8 8 0 0114-3.5L21 8M20.5 15a8 8 0 01-14 3.5L3 16" />
      <path d="M21 4v4h-4M3 20v-4h4" />
    </SQIcon>
  ),
};
