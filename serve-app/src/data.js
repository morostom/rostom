// data.js — all mock data for SERVE, kept in one place and shaped the way a
// backend/API would eventually return it. Swapping these constants for fetch()
// calls later should not require touching the screens.
//
// Shapes
// ──────
// Player  { id, name, age, division, club, rank, rankLabel, racket, fav,
//           wins, losses, since, accent, photo (data-URL | null), initials }
// Court   { court, type, status: 'lesson'|'playing'|'free', who, coach,
//           until, left (min), next }
// Lesson  { id, time, group, coach, court, spots, you }
// Club    { id, name, short, section, city, est, members, courts,
//           membershipLabel, validCode }

// ── form option lists ────────────────────────────────────────────────
export const DIVISIONS = [
  'U11 Boys', 'U11 Girls', 'U13 Boys', 'U13 Girls', 'U15 Boys',
  'U15 Girls', 'U17 Boys', 'U17 Girls', 'U19 Boys', 'U19 Girls',
];

export const CLUBS = [
  'Apex Squash Club', 'Glasshouse Squash', 'Baseline Academy',
  'Frontwall Club', 'Center Court', 'Heliopolis Sporting Club',
];

export const FAV_PLAYERS = [
  'Ali Farag', 'Mostafa Asal', 'Nour El Sherbini', 'Nouran Gohar',
  'Hania El Hammamy', 'Tarek Momen', 'Paul Coll', 'Amanda Sobhy',
];

// ── the signed-in player (pre-filled so the card looks complete) ──────
export const SAMPLE_PLAYER = {
  id: 'me',
  name: 'Omar Khaled',
  age: '14',
  division: 'U15 Boys',
  club: 'Apex Squash Club',
  rank: 3,
  rankLabel: '#3 · U15 National',
  racket: 'Tecnifibre Carboflex 125',
  fav: 'Ali Farag',
  wins: 38,
  losses: 9,
  since: '2023',
  accent: '#f5453b',
  initials: 'OK',
  photo: null,
};

// ── player dashboard extras ──────────────────────────────────────────
export const SEASON_STATS = [
  { label: 'Matches', value: '47', hint: '38 W · 9 L' },
  { label: 'Win rate', value: '81%', hint: '+6% this month' },
  { label: 'Best rank', value: '#3', hint: 'U15 National' },
];

export const UP_NEXT = {
  day: 'FRI',
  date: '16',
  title: 'Friday Night Drill Squad',
  meta: '18:00 · Group training · Apex',
};

// ── junior roster (the Players gallery) ──────────────────────────────
export const JUNIORS = [
  SAMPLE_PLAYER,
  {
    id: 'lina', photo: null, name: 'Lina Saleh', initials: 'LS', age: 13,
    division: 'U13 Girls', rank: 1, rankLabel: '#1 · U13 Girls',
    club: 'Glasshouse Squash', racket: 'Dunlop Sonic Core Pro',
    fav: 'Nour El Sherbini', wins: 44, losses: 4, since: '2022', accent: '#4ea8ff',
  },
  {
    id: 'yusuf', photo: null, name: 'Yusuf Adel', initials: 'YA', age: 15,
    division: 'U15 Boys', rank: 7, rankLabel: '#7 · U15 National',
    club: 'Baseline Academy', racket: 'Head Speed 120 SB',
    fav: 'Mostafa Asal', wins: 29, losses: 12, since: '2023', accent: '#4ade80',
  },
  {
    id: 'hana', photo: null, name: 'Hana Tarek', initials: 'HT', age: 12,
    division: 'U13 Girls', rank: 2, rankLabel: '#2 · U13 Girls',
    club: 'Frontwall Club', racket: 'Harrow Vapor',
    fav: 'Nouran Gohar', wins: 31, losses: 7, since: '2024', accent: '#a779f0',
  },
  {
    id: 'karim', photo: null, name: 'Karim Nabil', initials: 'KN', age: 16,
    division: 'U17 Boys', rank: 5, rankLabel: '#5 · U17 National',
    club: 'Center Court', racket: 'Wilson Ultra Team',
    fav: 'Paul Coll', wins: 41, losses: 15, since: '2021', accent: '#2dd4bf',
  },
  {
    id: 'maya', photo: null, name: 'Maya Reda', initials: 'MR', age: 11,
    division: 'U11 Girls', rank: 4, rankLabel: '#4 · U11 Girls',
    club: 'Apex Squash Club', racket: 'Salming Cannone',
    fav: 'Amanda Sobhy', wins: 22, losses: 6, since: '2024', accent: '#ff8a3d',
  },
];

export const JUNIOR_FILTERS = ['All', 'U11', 'U13', 'U15', 'U17'];

export function getJuniorById(id) {
  return JUNIORS.find((j) => j.id === id) || null;
}

// ── Heliopolis Sporting Club (members-only Clubs pillar) ─────────────
export const CLUB = {
  id: 'hsc',
  name: 'Heliopolis Sporting Club',
  short: 'Heliopolis SC',
  section: 'Squash Section',
  city: 'Heliopolis · Cairo',
  est: '1905',
  members: 186,
  courts: 4,
  membershipLabel: 'Membership active · renews May 2027',
  validCode: '9F4K2A', // the access code that unlocks the club in this demo
};

export const COURTS = [
  { court: 1, type: 'Glass back', status: 'lesson', who: 'U13 Squad', coach: 'Coach Tarek', until: '17:00', left: 18 },
  { court: 2, type: 'Glass back', status: 'playing', who: 'O. Khaled vs S. Wael', coach: null, until: '16:45', left: 12 },
  { court: 3, type: 'Standard', status: 'lesson', who: 'Private', coach: 'Coach Mariam', until: '17:15', left: 33 },
  { court: 4, type: 'Standard', status: 'free', who: null, coach: null, next: '17:00 · Karim F.' },
];

export const SCHEDULE = [
  { id: 's1', time: '16:00', group: 'U11 Beginners', coach: 'Coach Youssef', court: 3, spots: '8 / 10', you: false },
  { id: 's2', time: '16:30', group: 'U13 Squad', coach: 'Coach Tarek', court: 1, spots: 'Full', you: false },
  { id: 's3', time: '17:00', group: 'U15 Squad', coach: 'Coach Tarek', court: 1, spots: '6 / 8', you: false },
  { id: 's4', time: '18:00', group: 'Private lesson', coach: 'Coach Mariam', court: 2, spots: 'You', you: true },
  { id: 's5', time: '19:00', group: 'Adults Social', coach: 'Coach Omar', court: 4, spots: '11 / 12', you: false },
  { id: 's6', time: '20:00', group: 'Elite Squad', coach: 'Coach Tarek', court: 1, spots: 'Invite', you: false },
];

export const WEEK_DAYS = [
  ['Mon', '12'], ['Tue', '13'], ['Wed', '14', true], ['Thu', '15'],
  ['Fri', '16'], ['Sat', '17'], ['Sun', '18'],
];

// ── club coordinator console (coach side) ────────────────────────────
// Member  { name, initials, group, status: 'active'|'pending'|'expired',
//           since, expires, last }
export const MEMBERS = [
  { name: 'Omar Khaled', initials: 'OK', group: 'U15 Squad', status: 'active', since: '2023', expires: 'May 2027', last: 'On court now' },
  { name: 'Seif Wael', initials: 'SW', group: 'U15 Squad', status: 'active', since: '2022', expires: 'Dec 2026', last: 'Today · 16:30' },
  { name: 'Nour Hassan', initials: 'NH', group: 'U13 Squad', status: 'pending', since: '—', expires: '—', last: 'Invite sent · 2d ago' },
  { name: 'Laila Mansour', initials: 'LM', group: 'Adults Social', status: 'expired', since: '2019', expires: 'Jan 2026', last: '3 weeks ago' },
  { name: 'Karim Fouad', initials: 'KF', group: 'Elite Squad', status: 'active', since: '2020', expires: 'Sep 2026', last: 'Yesterday' },
  { name: 'Hana Sherif', initials: 'HS', group: 'U13 Squad', status: 'active', since: '2024', expires: 'Mar 2027', last: 'Today · 14:10' },
  { name: 'Youssef Adel', initials: 'YA', group: 'U15 Squad', status: 'pending', since: '—', expires: '—', last: 'Invite sent · 5h ago' },
  { name: 'Farida Gamal', initials: 'FG', group: 'Adults Social', status: 'active', since: '2021', expires: 'Nov 2026', last: '2 days ago' },
  { name: 'Salma Ezzat', initials: 'SE', group: 'Elite Squad', status: 'expired', since: '2018', expires: 'Feb 2026', last: '1 month ago' },
];

// Code  { code, to, status: 'redeemed'|'sent'|'open'|'expired', when, via }
export const CODES = [
  { code: '9F4K2A', to: 'Omar Khaled', status: 'redeemed', when: 'Redeemed 12 May', via: 'WhatsApp' },
  { code: '3T8M1P', to: 'Nour Hassan', status: 'sent', when: 'Sent 18 May', via: 'WhatsApp' },
  { code: 'QX7L0R', to: 'Youssef Adel', status: 'sent', when: 'Sent 19 May', via: 'SMS' },
  { code: 'K5R2WQ', to: null, status: 'open', when: 'Generated 19 May', via: null },
  { code: 'B8N3VD', to: null, status: 'open', when: 'Generated 19 May', via: null },
  { code: 'M2W9HF', to: 'Adam Sobhy', status: 'expired', when: 'Expired 02 May', via: 'WhatsApp' },
];
