// store.js — the single source of runtime truth, shared across every surface.
//
// Because all three surfaces are built from the same bundle, they share this
// module singleton (instant updates when run together, e.g. the combined demo
// or the switcher). State is also persisted to localStorage and mirrored across
// browser tabs of the same origin via the `storage` event — so marking a court
// busy in the coach console shows up live in the player app, and a club's
// chosen colour re-themes the player's club view.

import { useSyncExternalStore } from 'react';

const KEY = 'serve_state_v3';

// Heliopolis Sporting Club — 7 courts. Statuses: lesson | playing | free | booked.
function seedCourts() {
  return [
    { court: 1, type: 'Glass back', status: 'lesson', who: 'U17 Squad', coach: 'Mohamed Reda', until: '17:00', left: 18 },
    { court: 2, type: 'Glass back', status: 'playing', who: 'Aly vs Taha', coach: null, until: '16:45', left: 12 },
    { court: 3, type: 'Standard', status: 'lesson', who: 'Private', coach: 'Ismail Sherif', until: '17:15', left: 33 },
    { court: 4, type: 'Standard', status: 'free', who: null, coach: null, next: '17:00 · Belal S.' },
    { court: 5, type: 'Standard', status: 'free', who: null, coach: null, next: '18:30 · open' },
    { court: 6, type: 'Glass back', status: 'playing', who: 'Salman vs Nour', coach: null, until: '17:05', left: 25 },
    { court: 7, type: 'Standard', status: 'free', who: null, coach: null, next: '19:00 · open' },
  ];
}

// schedule sessions. `mine` marks the demo player's (Nour Hassan) own sessions.
function seedSessions() {
  return [
    { id: 'sx1', day: 'Wed', time: '16:00', type: 'Group training', title: 'U11 Beginners', coach: 'Adham Nabil', court: 3, players: ['Aly Mostafa'], mine: false },
    { id: 'sx2', day: 'Wed', time: '17:00', type: 'Group training', title: 'U17 Squad', coach: 'Mohamed Reda', court: 1, players: ['Nour Hassan', 'Taha Ibrahim'], mine: true },
    { id: 'sx3', day: 'Wed', time: '18:00', type: 'Lesson', title: 'Private lesson', coach: 'Ismail Sherif', court: 2, players: ['Nour Hassan'], mine: true },
    { id: 'sx4', day: 'Wed', time: '19:00', type: 'Group training', title: 'Adults Social', coach: 'Adham Nabil', court: 4, players: ['Salman Adel'], mine: false },
    { id: 'sx5', day: 'Fri', time: '18:00', type: 'Fitness', title: 'Strength & movement', coach: 'Bassem Tarek', court: 5, players: ['Nour Hassan', 'Mohamed Salah'], mine: true },
    { id: 'sx6', day: 'Wed', time: '20:00', type: 'Group training', title: 'Elite Squad', coach: 'Mohamed Reda', court: 1, players: ['Taha Ibrahim', 'Nour Tarek'], mine: false },
  ];
}

function seed() {
  return {
    clubTheme: '#4ea8ff', // Heliopolis ships blue (their real brand colour)
    academyTheme: '#f5453b',
    courts: seedCourts(),
    sessions: seedSessions(),
    bookings: [],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return seed();
}

let state = load();
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
function commit(next) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  emit();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue) {
      try { state = JSON.parse(e.newValue); emit(); } catch (err) { /* ignore */ }
    }
  });
}

function subscribe(l) { listeners.add(l); return () => listeners.delete(l); }
export function useStore() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export const store = {
  get: () => state,
  setClubTheme: (hex) => commit({ ...state, clubTheme: hex }),
  setAcademyTheme: (hex) => commit({ ...state, academyTheme: hex }),
  setCourt: (court, patch) => commit({ ...state, courts: state.courts.map((c) => (c.court === court ? { ...c, ...patch } : c)) }),
  freeCourt: (court) => commit({ ...state, courts: state.courts.map((c) => (c.court === court ? { court: c.court, type: c.type, status: 'free', who: null, coach: null, next: 'open' } : c)) }),
  addSession: (s) => commit({ ...state, sessions: [...state.sessions, { id: 'sess' + Date.now(), ...s }] }),
  removeSession: (id) => commit({ ...state, sessions: state.sessions.filter((s) => s.id !== id) }),
  bookCourt: (court, booking) =>
    commit({
      ...state,
      courts: state.courts.map((c) => (c.court === court ? { ...c, status: 'booked', who: 'Your booking', coach: null, until: booking.endTime, left: 60 } : c)),
      bookings: [...state.bookings, { id: 'bk' + Date.now(), ...booking }],
    }),
  reset: () => commit(seed()),
};
