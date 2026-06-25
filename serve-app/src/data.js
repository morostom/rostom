// data.js — SERVE mock data (Egyptian context). Static reference data lives
// here; anything that changes at runtime (live courts, schedule, themes,
// bookings) lives in store.js so every surface stays in sync.

// ── clubs & academies directory (with real court counts) ─────────────
export const CLUBS_DIR = [
  { id: 'heliopolis', name: 'Heliopolis Sporting Club', short: 'Heliopolis SC', type: 'club', courts: 7, city: 'Heliopolis · Cairo', est: '1905', accent: '#4ea8ff', joinable: true },
  { id: 'wadidegla', name: 'Wadi Degla', short: 'Wadi Degla', type: 'club', courts: 20, city: 'Maadi · Cairo', accent: '#4ade80' },
  { id: 'blackball', name: 'Black Ball', short: 'Black Ball', type: 'club', courts: 16, city: 'New Cairo', accent: '#f5453b' },
  { id: 'gezira', name: 'Gezira Sporting Club', short: 'Gezira SC', type: 'club', courts: 16, city: 'Zamalek · Cairo', accent: '#a779f0' },
  { id: 'alahly', name: 'Al Ahly Sporting Club', short: 'Al Ahly', type: 'club', courts: 8, city: 'Nasr City · Cairo', accent: '#f5453b' },
  { id: 'smouha', name: 'Smouha', short: 'Smouha', type: 'club', courts: 6, city: 'Alexandria', accent: '#4ea8ff' },
  { id: 'sporting', name: 'Sporting', short: 'Sporting', type: 'club', courts: 13, city: 'Alexandria', accent: '#ff8a3d' },
];

export const ACADEMIES_DIR = [
  { id: 'borolossy', name: 'El Borolossy Academy', short: 'El Borolossy', type: 'academy', courts: '20–30+', city: 'Multiple locations' },
  { id: 'ramyashour', name: 'Ramy Ashour Squash Academy', short: 'Ramy Ashour', type: 'academy', courts: 7, city: 'Cairo' },
  { id: 'cairohub', name: 'Cairo Squash Hub', short: 'Cairo Squash Hub', type: 'academy', courts: 5, city: 'Cairo' },
  { id: 'amirwagih', name: 'Amir Wagih Squash Academy', short: 'Amir Wagih', type: 'academy', courts: 5, city: 'Cairo' },
  { id: 'shoukry', name: 'Shoukry Squash', short: 'Shoukry Squash', type: 'academy', courts: 10, city: 'Cairo' },
  { id: 'bassemmakram', name: 'Bassem Makram Academy', short: 'Bassem Makram', type: 'academy', courts: 10, city: 'Smash Club (4) · Sky (6)' },
];

// flat list for the card-builder "club / academy" dropdown
export const ACADEMIES_LIST = [...CLUBS_DIR, ...ACADEMIES_DIR].map((o) => o.name);

// ── card option lists ────────────────────────────────────────────────
export const FAV_PLAYERS = [
  'Ali Farag', 'Mostafa Asal', 'Nour El Sherbini', 'Hania El Hammamy',
  'Karim Abdel Gawad', 'Marwan ElShorbagy', 'Paul Coll',
  'Ramy Ashour', 'Mohamed Abouelghar', 'Youssef Ibrahim', 'Other',
];

export const RACKETS = ['Tecnifibre', 'Dunlop', 'Head', 'Prince', 'Harrow', 'Other'];

export const FAV_SHOTS = ['Straight drop', 'Backhand boast', 'Cross-court nick', 'Volley drop', 'Trickle boast', 'Deep lob', 'Forehand kill'];
export const YEARS_OPTIONS = ['Less than 1 year', '1–2 years', '3–5 years', '5–10 years', '10+ years'];

// Age → competitive division.
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

const YEAR = String(new Date().getFullYear());

// ── player card templates ────────────────────────────────────────────
export const EMPTY_COMPETITIVE = {
  id: 'me', cardType: 'competitive', forChild: false,
  name: '', age: '', division: '', club: '',
  rankLabel: '', rankVerified: false, racket: '', fav: '',
  wins: 0, losses: 0, since: YEAR, accent: '#f5453b', photo: null,
};
export const EMPTY_RECREATIONAL = {
  id: 'me', cardType: 'recreational', forChild: false,
  name: '', age: '', division: '', club: '',
  favShot: '', yearsPlaying: '', accent: '#4ea8ff', photo: null,
};
export const DEMO_PLAYER = {
  id: 'me', cardType: 'competitive', forChild: false,
  name: 'Nour Hassan', age: '15', division: 'U17', club: 'Heliopolis Sporting Club',
  rankLabel: '#3 · U17 National', rankVerified: true, racket: 'Tecnifibre',
  fav: 'Ali Farag', wins: 38, losses: 9, since: '2023', accent: '#4ea8ff', photo: null,
};

export const SEASON_STATS = [
  { label: 'Matches', value: '47', hint: '38 W · 9 L' },
  { label: 'Win rate', value: '81%', hint: '+6% this month' },
  { label: 'Best rank', value: '#3', hint: 'U17 National' },
];
export const REC_STATS = [
  { label: 'Sessions', value: '32', hint: 'this season' },
  { label: 'Home club', value: 'Heliopolis', hint: 'Tue & Thu' },
  { label: 'Playing since', value: '2019', hint: '6 years' },
];

// ── people (coaches & players, Egyptian names) ───────────────────────
export const COACHES = [
  { name: 'Mohamed Reda', initials: 'MR', role: 'Head Coach', squads: 'Elite · U17' },
  { name: 'Ali Hassan', initials: 'AH', role: 'Performance Coach', squads: 'U15 · U19' },
  { name: 'Bassem Tarek', initials: 'BT', role: 'Fitness & Conditioning', squads: 'All squads' },
  { name: 'Adham Nabil', initials: 'AN', role: 'Junior Development', squads: 'U11 · U13' },
  { name: 'Ismail Sherif', initials: 'IS', role: 'Private Coach', squads: 'Privates' },
];

export const ROSTER = [
  { name: 'Nour Hassan', initials: 'NH', group: 'U17 Squad', status: 'active', last: 'Today · 14:10' },
  { name: 'Mohamed Salah', initials: 'MS', group: 'U15 Squad', status: 'active', last: 'Today · 16:30' },
  { name: 'Aly Kamal', initials: 'AK', group: 'U13 Squad', status: 'active', last: 'Yesterday' },
  { name: 'Taha Ibrahim', initials: 'TI', group: 'Elite Squad', status: 'active', last: '2 days ago' },
  { name: 'Belal Sherif', initials: 'BS', group: 'U15 Squad', status: 'pending', last: 'Invite sent · 2d ago' },
  { name: 'Salman Adel', initials: 'SA', group: 'Adults Social', status: 'active', last: 'Today · 09:00' },
  { name: 'Aly Mostafa', initials: 'AM', group: 'U13 Squad', status: 'pending', last: 'Invite sent · 5h ago' },
  { name: 'Nour Tarek', initials: 'NT', group: 'Elite Squad', status: 'active', last: 'Today · 11:20' },
];

// ── access codes (shared by coach console + player join) ──────────────
export const CODES = [
  { code: '9F4K2A', to: 'Nour Hassan', status: 'redeemed', when: 'Redeemed 12 May', via: 'WhatsApp' },
  { code: '3T8M1P', to: 'Belal Sherif', status: 'sent', when: 'Sent 18 May', via: 'WhatsApp' },
  { code: 'QX7L0R', to: 'Aly Mostafa', status: 'sent', when: 'Sent 19 May', via: 'SMS' },
  { code: 'K5R2WQ', to: null, status: 'open', when: 'Generated 19 May', via: null },
  { code: 'B8N3VD', to: null, status: 'open', when: 'Generated 19 May', via: null },
];
export function resolveAccessCode(input) {
  const code = (input || '').trim().toUpperCase();
  const record = CODES.find((c) => c.code === code);
  if (!record) return { ok: false, reason: 'unknown' };
  return { ok: true, record };
}
export function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// the members-only club the player can join in the demo
export const CLUB = { id: 'heliopolis', name: 'Heliopolis Sporting Club', short: 'Heliopolis SC', section: 'Squash Section', city: 'Heliopolis · Cairo', est: '1905', courts: 7 };

export const WEEK_DAYS = [
  ['Mon', '12'], ['Tue', '13'], ['Wed', '14', true], ['Thu', '15'],
  ['Fri', '16'], ['Sat', '17'], ['Sun', '18'],
];

export const SESSION_TYPES = ['Lesson', 'Group training', 'Fitness'];

// court time slots for booking
export const TIME_SLOTS = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

// ── academy admin (Wadi Degla) ───────────────────────────────────────
export const ACADEMY = {
  id: 'wadidegla', name: 'Wadi Degla', short: 'Wadi Degla',
  city: 'Maadi · Cairo', district: 'Maadi', owner: 'Mohamed Reda', ownerInitials: 'MR',
  tagline: 'Where Cairo juniors level up.', contact: 'play@wadidegla.club',
  courts: 20, juniors: 184, minPrice: 180, accent: '#f5453b',
};

export const REVENUE_7D = [2400, 3100, 2700, 4200, 3800, 5100, 4180];
export const REVENUE_DAYS = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

// academy revenue breakdown (no memberships/subscriptions — handled off-platform)
export const REVENUE_BREAKDOWN = [
  ['Court bookings', '64%', 'EGP 51,200'],
  ['Group training', '24%', 'EGP 19,200'],
  ['Private coaching', '12%', 'EGP 9,600'],
];

// admin court list (Wadi Degla shows 6 representative courts of its 20)
export const ADMIN_COURTS = [
  { n: 'Court 1', type: 'Glass back · Pro', base: 280, peak: 420, peakOn: true },
  { n: 'Court 2', type: 'Glass back · Pro', base: 280, peak: 420, peakOn: true },
  { n: 'Court 3', type: 'Standard', base: 180, peak: 270, peakOn: true },
  { n: 'Court 4', type: 'Standard', base: 180, peak: 270, peakOn: true },
  { n: 'Court 5', type: 'Standard', base: 180, peak: null, peakOn: false },
  { n: 'Court 6', type: 'Standard', base: 180, peak: null, peakOn: false },
];

// admin coaches (no ratings)
export const ADMIN_COACHES = COACHES.map((c, i) => ({ ...c, sessions: [28, 22, 18, 24, 31][i] || 20 }));

// admin player roster (Egyptian names; spend = court/training spend, not a subscription)
export const ADMIN_PLAYERS = [
  { name: 'Nour Hassan', initials: 'NH', division: 'U17', coach: 'Mohamed Reda', status: 'active', joined: '2023', spend: '12,400' },
  { name: 'Mohamed Salah', initials: 'MS', division: 'U15', coach: 'Ali Hassan', status: 'active', joined: '2022', spend: '18,900' },
  { name: 'Aly Kamal', initials: 'AK', division: 'U13', coach: 'Adham Nabil', status: 'active', joined: '2023', spend: '9,600' },
  { name: 'Taha Ibrahim', initials: 'TI', division: 'Elite', coach: 'Mohamed Reda', status: 'active', joined: '2021', spend: '22,300' },
  { name: 'Belal Sherif', initials: 'BS', division: 'U15', coach: 'Ali Hassan', status: 'trial', joined: '2025', spend: '1,200' },
  { name: 'Salman Adel', initials: 'SA', division: 'Senior', coach: 'Ismail Sherif', status: 'active', joined: '2020', spend: '15,100' },
  { name: 'Aly Mostafa', initials: 'AM', division: 'U13', coach: 'Adham Nabil', status: 'trial', joined: '2025', spend: '900' },
];

export const SETUP_STEPS = [
  { n: 1, key: 'details', label: 'Academy details & logo' },
  { n: 2, key: 'hours', label: 'Operating hours' },
  { n: 3, key: 'courts', label: 'Courts & pricing' },
  { n: 4, key: 'coaches', label: 'Coaches' },
  { n: 5, key: 'open', label: 'Open to players' },
];
export const OPERATING_HOURS = [
  { day: 'Monday', open: '07:00', close: '23:00' },
  { day: 'Tuesday', open: '07:00', close: '23:00' },
  { day: 'Wednesday', open: '07:00', close: '23:00' },
  { day: 'Thursday', open: '07:00', close: '23:00' },
  { day: 'Friday', open: '09:00', close: '23:59' },
  { day: 'Saturday', open: '09:00', close: '23:59' },
  { day: 'Sunday', open: '07:00', close: '22:00' },
];

// brand colour palette offered in profile editors
export const BRAND_COLORS = [
  { name: 'Neon red', hex: '#f5453b' },
  { name: 'Electric blue', hex: '#4ea8ff' },
  { name: 'Court green', hex: '#4ade80' },
  { name: 'Violet', hex: '#a779f0' },
  { name: 'Amber', hex: '#ff8a3d' },
  { name: 'Gold', hex: '#d4a64f' },
];
