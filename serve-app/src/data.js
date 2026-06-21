// data.js — all mock data for SERVE (Egyptian context), shaped to map onto a
// future API. Swapping these constants for fetch() calls later should not
// require touching the screens.

// ── locations & options (Egyptian) ───────────────────────────────────
export const LOCATIONS = [
  'Heliopolis · Cairo',
  'Zamalek · Cairo',
  'Maadi · Cairo',
  'Nasr City · Cairo',
  'New Cairo',
  '6th of October · Giza',
  'Dokki · Giza',
];

// Real Egyptian squash academies / clubs.
export const ACADEMIES_LIST = [
  'Wadi Degla Squash Academy',
  'Gezira Sporting Club',
  'Smash Academy',
  'Black Ball Academy',
  'Heliopolis Sporting Club',
  'Zamalek Sporting Club',
  'Shooting Club · Dokki',
];

// Egyptian squash pros (plus a couple of global names players look up to).
export const FAV_PLAYERS = [
  'Ali Farag',
  'Mostafa Asal',
  'Nour El Sherbini',
  'Nouran Gohar',
  'Hania El Hammamy',
  'Karim Abdel Gawad',
  'Tarek Momen',
  'Marwan ElShorbagy',
  'Amanda Sobhy',
  'Paul Coll',
];

// Recreational card: favourite shot instead of ranking.
export const FAV_SHOTS = [
  'Straight drop',
  'Backhand boast',
  'Cross-court nick',
  'Volley drop',
  'Trickle boast',
  'Deep lob',
  'Forehand kill',
];

export const YEARS_OPTIONS = ['Less than 1 year', '1–2 years', '3–5 years', '5–10 years', '10+ years'];

export const RACKETS = [
  'Tecnifibre Carboflex 125',
  'Dunlop Sonic Core Pro',
  'Head Speed 120 SB',
  'Eye Rackets V.Lite',
  'Harrow Vapor',
  'Wilson Ultra Team',
  'Black Knight Ion',
];

// Age → competitive division (no manual selection).
//  ≤10 U11 · 11–12 U13 · 13–14 U15 · 15–16 U17 · 17–18 U19 · 19+ Senior
export function divisionForAge(age) {
  const a = parseInt(age, 10);
  if (!a || a < 4) return '';
  if (a <= 10) return 'U11';
  if (a <= 12) return 'U13';
  if (a <= 14) return 'U15';
  if (a <= 16) return 'U17';
  if (a <= 18) return 'U19';
  return 'Senior';
}

// ── player card templates ────────────────────────────────────────────
const YEAR = String(new Date().getFullYear());

export const EMPTY_COMPETITIVE = {
  id: 'me', cardType: 'competitive', forChild: false,
  name: '', age: '', division: '', club: '',
  rank: '', rankLabel: '', racket: '', fav: '',
  wins: 0, losses: 0, since: YEAR, accent: '#f5453b', photo: null,
};

export const EMPTY_RECREATIONAL = {
  id: 'me', cardType: 'recreational', forChild: false,
  name: '', age: '', division: '', club: '',
  favShot: '', yearsPlaying: '', accent: '#4ea8ff', photo: null,
};

// A fully-filled demo card used by the "Log in" path so the pitcher can land
// straight in a populated profile without typing.
export const DEMO_PLAYER = {
  id: 'me', cardType: 'competitive', forChild: false,
  name: 'Omar Khaled', age: '14', division: 'U15', club: 'Wadi Degla Squash Academy',
  rank: 3, rankLabel: '#3 · U15 National', racket: 'Tecnifibre Carboflex 125',
  fav: 'Ali Farag', wins: 38, losses: 9, since: '2023', accent: '#f5453b', photo: null,
};

// ── player dashboard extras ──────────────────────────────────────────
export const SEASON_STATS = [
  { label: 'Matches', value: '47', hint: '38 W · 9 L' },
  { label: 'Win rate', value: '81%', hint: '+6% this month' },
  { label: 'Best rank', value: '#3', hint: 'U15 National' },
];

export const REC_STATS = [
  { label: 'Sessions', value: '32', hint: 'this season' },
  { label: 'Regular court', value: 'Heliopolis', hint: 'Tue & Thu' },
  { label: 'Playing since', value: '2019', hint: '6 years' },
];

export const UP_NEXT = {
  day: 'FRI', date: '16', title: 'Friday Night Drill Squad',
  meta: '18:00 · Group training · Wadi Degla',
};

// ── junior roster (the Players gallery) ──────────────────────────────
export const JUNIORS = [
  DEMO_PLAYER,
  { id: 'lina', cardType: 'competitive', photo: null, name: 'Lina Saleh', initials: 'LS', age: 13, division: 'U13', rank: 1, rankLabel: '#1 · U13 Girls', club: 'Gezira Sporting Club', racket: 'Dunlop Sonic Core Pro', fav: 'Nour El Sherbini', wins: 44, losses: 4, since: '2022', accent: '#4ea8ff' },
  { id: 'yusuf', cardType: 'competitive', photo: null, name: 'Yusuf Adel', initials: 'YA', age: 15, division: 'U17', rank: 7, rankLabel: '#7 · U17 National', club: 'Smash Academy', racket: 'Head Speed 120 SB', fav: 'Mostafa Asal', wins: 29, losses: 12, since: '2023', accent: '#4ade80' },
  { id: 'hana', cardType: 'competitive', photo: null, name: 'Hana Tarek', initials: 'HT', age: 12, division: 'U13', rank: 2, rankLabel: '#2 · U13 Girls', club: 'Black Ball Academy', racket: 'Harrow Vapor', fav: 'Nouran Gohar', wins: 31, losses: 7, since: '2024', accent: '#a779f0' },
  { id: 'karim', cardType: 'competitive', photo: null, name: 'Karim Nabil', initials: 'KN', age: 16, division: 'U17', rank: 5, rankLabel: '#5 · U17 National', club: 'Heliopolis Sporting Club', racket: 'Wilson Ultra Team', fav: 'Karim Abdel Gawad', wins: 41, losses: 15, since: '2021', accent: '#2dd4bf' },
  { id: 'maya', cardType: 'competitive', photo: null, name: 'Maya Reda', initials: 'MR', age: 11, division: 'U11', rank: 4, rankLabel: '#4 · U11 Girls', club: 'Wadi Degla Squash Academy', racket: 'Eye Rackets V.Lite', fav: 'Hania El Hammamy', wins: 22, losses: 6, since: '2024', accent: '#ff8a3d' },
];

export const JUNIOR_FILTERS = ['All', 'U11', 'U13', 'U15', 'U17'];

// ── Heliopolis Sporting Club (members-only Clubs pillar) ─────────────
export const CLUB = {
  id: 'hsc', name: 'Heliopolis Sporting Club', short: 'Heliopolis SC',
  section: 'Squash Section', city: 'Heliopolis · Cairo', est: '1905',
  members: 186, courts: 4, membershipLabel: 'Membership active · renews May 2027',
  validCode: '9F4K2A',
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

export const CODES = [
  { code: '9F4K2A', to: 'Omar Khaled', status: 'redeemed', when: 'Redeemed 12 May', via: 'WhatsApp' },
  { code: '3T8M1P', to: 'Nour Hassan', status: 'sent', when: 'Sent 18 May', via: 'WhatsApp' },
  { code: 'QX7L0R', to: 'Youssef Adel', status: 'sent', when: 'Sent 19 May', via: 'SMS' },
  { code: 'K5R2WQ', to: null, status: 'open', when: 'Generated 19 May', via: null },
  { code: 'B8N3VD', to: null, status: 'open', when: 'Generated 19 May', via: null },
  { code: 'M2W9HF', to: 'Adam Sobhy', status: 'expired', when: 'Expired 02 May', via: 'WhatsApp' },
];

// access-code resolution — shared by the coach console + player join flow.
export function resolveAccessCode(input) {
  const code = (input || '').trim().toUpperCase();
  const record = CODES.find((c) => c.code === code);
  if (!record) return { ok: false, reason: 'unknown' };
  if (record.status === 'expired') return { ok: false, reason: 'expired', record };
  return { ok: true, record };
}

export function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── academy admin console (Wadi Degla) ───────────────────────────────
export const ACADEMY = {
  name: 'Wadi Degla Squash Academy', short: 'Wadi Degla',
  city: 'Maadi · Cairo', district: 'Maadi', owner: 'Hisham Maged',
  ownerInitials: 'HM', tagline: 'Where Cairo juniors level up.',
  contact: 'play@wadidegla.club', courts: 6, juniors: 184, minPrice: 180,
  rating: 4.9, todayRevenue: '$4,180', todayBookings: 22, todayTrainings: 4,
};

export const ADMIN_COURTS = [
  { n: 'Court 1', type: 'Glass back · Pro', base: 280, peak: 420, peakOn: true },
  { n: 'Court 2', type: 'Glass back · Pro', base: 280, peak: 420, peakOn: true },
  { n: 'Court 3', type: 'Standard', base: 180, peak: 270, peakOn: true },
  { n: 'Court 4', type: 'Standard', base: 180, peak: 270, peakOn: true },
  { n: 'Court 5', type: 'Standard', base: 180, peak: null, peakOn: false },
  { n: 'Court 6', type: 'Standard', base: 180, peak: null, peakOn: false },
];

export const ADMIN_COACHES = [
  { name: 'Karim El-Hosary', initials: 'KE', role: 'Head Coach', squads: 'Elite · U17', sessions: 28, rating: 4.9 },
  { name: 'Mona Saleh', initials: 'MS', role: 'Junior Development', squads: 'U11 · U13', sessions: 22, rating: 4.8 },
  { name: 'Tarek Refaat', initials: 'TR', role: 'Performance Coach', squads: 'U15 · U19', sessions: 24, rating: 4.9 },
  { name: 'Nada Sobhy', initials: 'NS', role: 'Fitness & Conditioning', squads: 'All squads', sessions: 18, rating: 4.7 },
  { name: 'Omar Hany', initials: 'OH', role: 'Assistant Coach', squads: 'Beginners', sessions: 15, rating: 4.6 },
  { name: 'Mariam Adel', initials: 'MA', role: 'Private Coach', squads: 'Privates', sessions: 31, rating: 5.0 },
];

export const ADMIN_PLAYERS = [
  { name: 'Omar Khaled', initials: 'OK', division: 'U15', coach: 'Tarek Refaat', status: 'active', joined: '2023', spend: '12,400' },
  { name: 'Lina Saleh', initials: 'LS', division: 'U13', coach: 'Mona Saleh', status: 'active', joined: '2022', spend: '18,900' },
  { name: 'Yusuf Adel', initials: 'YA', division: 'U17', coach: 'Karim El-Hosary', status: 'active', joined: '2023', spend: '9,600' },
  { name: 'Hana Tarek', initials: 'HT', division: 'U13', coach: 'Mona Saleh', status: 'trial', joined: '2025', spend: '1,200' },
  { name: 'Karim Nabil', initials: 'KN', division: 'U17', coach: 'Tarek Refaat', status: 'active', joined: '2021', spend: '22,300' },
  { name: 'Maya Reda', initials: 'MR', division: 'U11', coach: 'Mona Saleh', status: 'active', joined: '2024', spend: '7,800' },
  { name: 'Adam Sobhy', initials: 'AS', division: 'Senior', coach: 'Karim El-Hosary', status: 'inactive', joined: '2020', spend: '15,100' },
];

export const REVENUE_7D = [2400, 3100, 2700, 4200, 3800, 5100, 4180];
export const REVENUE_DAYS = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

// academy onboarding wizard — 5 steps, pre-filled so it's demo-steppable.
export const SETUP_STEPS = [
  { n: 1, key: 'details', label: 'Academy details & logo' },
  { n: 2, key: 'hours', label: 'Operating hours' },
  { n: 3, key: 'courts', label: 'Courts & pricing' },
  { n: 4, key: 'coaches', label: 'Coaches & priority times' },
  { n: 5, key: 'open', label: 'Open to players' },
];

export const OPERATING_HOURS = [
  { day: 'Monday', open: '07:00', close: '23:00', on: true },
  { day: 'Tuesday', open: '07:00', close: '23:00', on: true },
  { day: 'Wednesday', open: '07:00', close: '23:00', on: true },
  { day: 'Thursday', open: '07:00', close: '23:00', on: true },
  { day: 'Friday', open: '09:00', close: '23:59', on: true },
  { day: 'Saturday', open: '09:00', close: '23:59', on: true },
  { day: 'Sunday', open: '07:00', close: '22:00', on: true },
];
