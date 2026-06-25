// data.js — SERVE mock data (Egyptian context). Static reference data lives
// here; runtime state (live courts, schedule, themes, bookings, payments,
// uploaded images) lives in store.js so every surface stays in sync.

// ── clubs & academies directory ──────────────────────────────────────
// Clubs are members-only (access code). Academies are open booking.
export const CLUBS_DIR = [
  { id: 'heliopolis', name: 'Heliopolis Sporting Club', short: 'Heliopolis SC', type: 'club', courts: 7, city: 'Heliopolis · Cairo', est: '1910', accent: '#4ea8ff', joinable: true },
  { id: 'wadidegla', name: 'Wadi Degla', short: 'Wadi Degla', type: 'club', courts: 20, city: 'Maadi · Cairo', accent: '#4ade80' },
  { id: 'blackball', name: 'Black Ball', short: 'Black Ball', type: 'club', courts: 16, city: 'New Cairo', accent: '#f5453b', guestPass: true },
  { id: 'gezira', name: 'Gezira Sporting Club', short: 'Gezira SC', type: 'club', courts: 16, city: 'Zamalek · Cairo', accent: '#a779f0' },
  { id: 'alahly', name: 'Al Ahly Sporting Club', short: 'Al Ahly', type: 'club', courts: 8, city: 'Nasr City · Cairo', accent: '#f5453b' },
  { id: 'smouha', name: 'Smouha', short: 'Smouha', type: 'club', courts: 6, city: 'Alexandria', accent: '#4ea8ff' },
  { id: 'sporting', name: 'Sporting', short: 'Sporting', type: 'club', courts: 13, city: 'Alexandria', accent: '#ff8a3d' },
];

export const ACADEMIES_DIR = [
  { id: 'ramyashour', name: 'Ramy Ashour Squash Academy', short: 'Ramy Ashour', type: 'academy', courts: 7, city: 'New Cairo', minPrice: 200, bookable: true },
  { id: 'borolossy', name: 'El Borolossy Academy', short: 'El Borolossy', type: 'academy', courts: '20–30+', city: 'Multiple locations', minPrice: 180, bookable: true },
  { id: 'cairohub', name: 'Cairo Squash Hub', short: 'Cairo Squash Hub', type: 'academy', courts: 5, city: 'Cairo', minPrice: 180, bookable: true },
  { id: 'amirwagih', name: 'Amir Wagih Squash Academy', short: 'Amir Wagih', type: 'academy', courts: 5, city: 'Cairo', minPrice: 200, bookable: true },
  { id: 'shoukry', name: 'Shoukry Squash', short: 'Shoukry Squash', type: 'academy', courts: 10, city: 'Cairo', minPrice: 220, bookable: true },
  { id: 'bassemmakram', name: 'Bassem Makram Academy', short: 'Bassem Makram', type: 'academy', courts: 10, city: 'Smash Club (4) · Sky (6)', minPrice: 200, bookable: true },
];

export const ACADEMIES_LIST = [...CLUBS_DIR, ...ACADEMIES_DIR].map((o) => o.name);

// Heliopolis bio (the only club with a full history page for the demo).
export const HELIOPOLIS_BIO = {
  id: 'heliopolis',
  name: 'Heliopolis Sporting Club',
  established: 'December 23, 1910',
  about: 'Established on December 23, 1910, Heliopolis Sporting Club is one of Egypt’s foundational multi-sport institutions. Squash has been part of its offering since its early years.',
  courts: 7,
  formerChampions: ['Ramy Ashour', 'Ali Farag', 'Omar Mosaad', 'Mohamed Reda', 'Nour El Tayeb', 'Hania El Hammamy'],
  headCoaches: ['Ali Ashmawy', 'Abdel Rahman ElSergany'],
  accent: '#4ea8ff',
};

// ── Discover: a glimpse of what's bookable right now ─────────────────
// Standard courts only (no glass-back). Most are academies; clubs like
// Black Ball occasionally sell guest-pass slots at a higher price.
export const OPEN_COURTS = [
  { id: 'oc1', venue: 'Ramy Ashour Squash Academy', venueId: 'ramyashour', court: 3, time: '18:00', price: 200, type: 'Standard' },
  { id: 'oc2', venue: 'Cairo Squash Hub', venueId: 'cairohub', court: 2, time: '17:30', price: 180, type: 'Standard' },
  { id: 'oc3', venue: 'Shoukry Squash', venueId: 'shoukry', court: 5, time: '19:00', price: 220, type: 'Standard' },
  { id: 'oc4', venue: 'Black Ball', venueId: 'blackball', court: 7, time: '20:00', price: 350, type: 'Standard', guest: true },
  { id: 'oc5', venue: 'Amir Wagih Squash Academy', venueId: 'amirwagih', court: 1, time: '18:30', price: 200, type: 'Standard' },
  { id: 'oc6', venue: 'El Borolossy Academy', venueId: 'borolossy', court: 4, time: '19:30', price: 180, type: 'Standard' },
];

export const OPEN_SESSIONS = [
  { id: 'os1', title: 'Junior Group Clinic', coach: 'Mohamed Reda', venue: 'Ramy Ashour Squash Academy', venueId: 'ramyashour', time: 'Today 17:00', spots: '3 left', price: 150 },
  { id: 'os2', title: 'Adults Fitness', coach: 'Bassem Tarek', venue: 'Shoukry Squash', venueId: 'shoukry', time: 'Thu 19:00', spots: '5 left', price: 120 },
  { id: 'os3', title: 'Drill Squad', coach: 'Adham Nabil', venue: 'Cairo Squash Hub', venueId: 'cairohub', time: 'Fri 18:00', spots: '2 left', price: 180 },
];

// Generates a few open standard courts for an academy detail page.
export function academyCourts(venue) {
  const base = venue.minPrice || 200;
  return [
    { court: 1, type: 'Standard', time: '18:00', price: base },
    { court: 2, type: 'Standard', time: '18:30', price: base },
    { court: 3, type: 'Standard', time: '19:00', price: base + 20 },
    { court: 4, type: 'Standard', time: '20:00', price: base + 40 },
  ];
}

// ── card option lists ────────────────────────────────────────────────
export const FAV_PLAYERS = [
  'Ali Farag', 'Mostafa Asal', 'Nour El Sherbini', 'Hania El Hammamy',
  'Karim Abdel Gawad', 'Marwan ElShorbagy', 'Paul Coll',
  'Ramy Ashour', 'Mohamed Abouelghar', 'Youssef Ibrahim', 'Other',
];
export const RACKETS = ['Tecnifibre', 'Dunlop', 'Head', 'Prince', 'Harrow', 'Other'];
export const FAV_SHOTS = ['Straight drop', 'Backhand boast', 'Cross-court nick', 'Volley drop', 'Trickle boast', 'Deep lob', 'Forehand kill'];
export const YEARS_OPTIONS = ['Less than 1 year', '1–2 years', '3–5 years', '5–10 years', '10+ years'];

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

export const EMPTY_COMPETITIVE = {
  id: 'me', cardType: 'competitive', forChild: false, name: '', age: '', division: '', club: '',
  rankLabel: '', rankVerified: false, racket: '', fav: '', wins: 0, losses: 0, since: YEAR, accent: '#f5453b', photo: null,
};
export const EMPTY_RECREATIONAL = {
  id: 'me', cardType: 'recreational', forChild: false, name: '', age: '', division: '', club: '',
  favShot: '', yearsPlaying: '', accent: '#4ea8ff', photo: null,
};
// the demo (login) player — Mohamed Rostom, a Heliopolis member.
export const DEMO_PLAYER = {
  id: 'me', cardType: 'competitive', forChild: false, name: 'Mohamed Rostom', age: '15', division: 'U17',
  club: 'Heliopolis Sporting Club', rankLabel: '#3 · U17 National', rankVerified: true, racket: 'Tecnifibre',
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

// ── people (Egyptian names) ──────────────────────────────────────────
export const COACHES = [
  { name: 'Ali Ashmawy', initials: 'AA', role: 'Head Coach', squads: 'Elite · U19' },
  { name: 'Abdel Rahman ElSergany', initials: 'AE', role: 'Head Coach', squads: 'U15 · U17' },
  { name: 'Mohamed Reda', initials: 'MR', role: 'Performance Coach', squads: 'U13 · U15' },
  { name: 'Bassem Tarek', initials: 'BT', role: 'Fitness & Conditioning', squads: 'All squads' },
  { name: 'Adham Nabil', initials: 'AN', role: 'Junior Development', squads: 'U11 · U13' },
  { name: 'Ismail Sherif', initials: 'IS', role: 'Private Coach', squads: 'Privates' },
];

export const ROSTER = [
  { name: 'Mohamed Rostom', initials: 'MR', group: 'U17 Squad', status: 'active', last: 'Today · 14:10' },
  { name: 'Nour Hassan', initials: 'NH', group: 'U17 Squad', status: 'active', last: 'Today · 16:30' },
  { name: 'Aly Kamal', initials: 'AK', group: 'U13 Squad', status: 'active', last: 'Yesterday' },
  { name: 'Taha Ibrahim', initials: 'TI', group: 'Elite Squad', status: 'active', last: '2 days ago' },
  { name: 'Belal Sherif', initials: 'BS', group: 'U15 Squad', status: 'pending', last: 'Invite sent · 2d ago' },
  { name: 'Salman Adel', initials: 'SA', group: 'Adults Social', status: 'active', last: 'Today · 09:00' },
  { name: 'Aly Mostafa', initials: 'AM', group: 'U13 Squad', status: 'pending', last: 'Invite sent · 5h ago' },
];

export const CODES = [
  { code: '9F4K2A', to: 'Mohamed Rostom', status: 'redeemed', when: 'Redeemed 12 May', via: 'WhatsApp' },
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

export const CLUB = { id: 'heliopolis', name: 'Heliopolis Sporting Club', short: 'Heliopolis SC', section: 'Squash Section', city: 'Heliopolis · Cairo', est: '1910', courts: 7 };

export const WEEK_DAYS = [
  ['Mon', '12'], ['Tue', '13'], ['Wed', '14', true], ['Thu', '15'],
  ['Fri', '16'], ['Sat', '17'], ['Sun', '18'],
];
export const SESSION_TYPES = ['Lesson', 'Group training', 'Fitness'];
export const TIME_SLOTS = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

// ── academy admin (Ramy Ashour Squash Academy — a real academy) ──────
export const ACADEMY = {
  id: 'ramyashour', name: 'Ramy Ashour Squash Academy', short: 'Ramy Ashour',
  city: 'New Cairo', district: 'New Cairo', owner: 'Ramy Ashour', ownerInitials: 'RA',
  tagline: 'Train where champions are made.', contact: 'play@ramyashouracademy.com',
  courts: 7, juniors: 142, minPrice: 200, accent: '#f5453b',
};

export const REVENUE_7D = [2400, 3100, 2700, 4200, 3800, 5100, 4180];
export const REVENUE_DAYS = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed'];
export const REVENUE_BREAKDOWN = [
  ['Court bookings', '64%', 'EGP 51,200'],
  ['Group training', '24%', 'EGP 19,200'],
  ['Private coaching', '12%', 'EGP 9,600'],
];

// all courts are standard (no glass-back)
export const ADMIN_COURTS = [
  { n: 'Court 1', type: 'Standard', base: 220, peak: 320, peakOn: true },
  { n: 'Court 2', type: 'Standard', base: 220, peak: 320, peakOn: true },
  { n: 'Court 3', type: 'Standard', base: 200, peak: 280, peakOn: true },
  { n: 'Court 4', type: 'Standard', base: 200, peak: 280, peakOn: true },
  { n: 'Court 5', type: 'Standard', base: 200, peak: null, peakOn: false },
  { n: 'Court 6', type: 'Standard', base: 200, peak: null, peakOn: false },
];
export const ADMIN_COACHES = COACHES.map((c, i) => ({ ...c, sessions: [28, 26, 22, 18, 24, 31][i] || 20 }));
export const ADMIN_PLAYERS = [
  { name: 'Mohamed Rostom', initials: 'MR', division: 'U17', coach: 'Ali Ashmawy', status: 'active', joined: '2023', spend: '12,400' },
  { name: 'Nour Hassan', initials: 'NH', division: 'U17', coach: 'Abdel Rahman ElSergany', status: 'active', joined: '2022', spend: '18,900' },
  { name: 'Aly Kamal', initials: 'AK', division: 'U13', coach: 'Adham Nabil', status: 'active', joined: '2023', spend: '9,600' },
  { name: 'Taha Ibrahim', initials: 'TI', division: 'Elite', coach: 'Ali Ashmawy', status: 'active', joined: '2021', spend: '22,300' },
  { name: 'Belal Sherif', initials: 'BS', division: 'U15', coach: 'Mohamed Reda', status: 'trial', joined: '2025', spend: '1,200' },
  { name: 'Salman Adel', initials: 'SA', division: 'Senior', coach: 'Ismail Sherif', status: 'active', joined: '2020', spend: '15,100' },
];

// academy payments — manually marked paid by cash or card (academy only)
export const PAYMENTS = [
  { id: 'p1', player: 'Mohamed Rostom', item: 'Private lesson · Ali Ashmawy', amount: 250, status: 'unpaid', method: null },
  { id: 'p2', player: 'Aly Kamal', item: 'Court 3 · 1 hr', amount: 200, status: 'paid', method: 'card' },
  { id: 'p3', player: 'Taha Ibrahim', item: 'Group training · 4 sessions', amount: 600, status: 'unpaid', method: null },
  { id: 'p4', player: 'Belal Sherif', item: 'Court 5 · 1 hr', amount: 200, status: 'paid', method: 'cash' },
  { id: 'p5', player: 'Salman Adel', item: 'Fitness block · 8 sessions', amount: 960, status: 'unpaid', method: null },
  { id: 'p6', player: 'Nour Hassan', item: 'Private lesson · Mohamed Reda', amount: 250, status: 'unpaid', method: null },
];

export const SETUP_STEPS = [
  { n: 1, key: 'details', label: 'Academy details & logo' },
  { n: 2, key: 'hours', label: 'Operating hours' },
  { n: 3, key: 'courts', label: 'Courts & pricing' },
  { n: 4, key: 'coaches', label: 'Coaches' },
  { n: 5, key: 'open', label: 'Open to players' },
];
export const OPERATING_HOURS = [
  { day: 'Monday', open: '07:00', close: '23:00' }, { day: 'Tuesday', open: '07:00', close: '23:00' },
  { day: 'Wednesday', open: '07:00', close: '23:00' }, { day: 'Thursday', open: '07:00', close: '23:00' },
  { day: 'Friday', open: '09:00', close: '23:59' }, { day: 'Saturday', open: '09:00', close: '23:59' },
  { day: 'Sunday', open: '07:00', close: '22:00' },
];

export const BRAND_COLORS = [
  { name: 'Neon red', hex: '#f5453b' }, { name: 'Electric blue', hex: '#4ea8ff' },
  { name: 'Court green', hex: '#4ade80' }, { name: 'Violet', hex: '#a779f0' },
  { name: 'Amber', hex: '#ff8a3d' }, { name: 'Gold', hex: '#d4a64f' },
];
