// store.js — the single source of runtime truth, shared across every surface.
// Shared in-memory within one bundle (instant), persisted to localStorage, and
// mirrored across tabs of the same origin via the `storage` event.

import { useSyncExternalStore } from 'react';
import { PAYMENTS } from './data';

const KEY = 'serve_state_v4';

// Heliopolis Sporting Club — 7 standard courts. status: lesson|playing|free|booked
function seedCourts() {
  return [
    { court: 1, type: 'Standard', status: 'lesson', who: 'U17 Squad', coach: 'Ali Ashmawy', until: '17:00', left: 18 },
    { court: 2, type: 'Standard', status: 'playing', who: 'Aly vs Taha', coach: null, until: '16:45', left: 12 },
    { court: 3, type: 'Standard', status: 'lesson', who: 'Mohamed Rostom', coach: 'Ali Ashmawy', until: '17:15', left: 33 },
    { court: 4, type: 'Standard', status: 'free', who: null, coach: null, next: '17:00 · Belal S.' },
    { court: 5, type: 'Standard', status: 'free', who: null, coach: null, next: '18:30 · open' },
    { court: 6, type: 'Standard', status: 'playing', who: 'Salman vs Nour', coach: null, until: '17:05', left: 25 },
    { court: 7, type: 'Standard', status: 'free', who: null, coach: null, next: '19:00 · open' },
  ];
}

// schedule sessions. `mine` / players[] drive what a member sees in the app.
function seedSessions() {
  return [
    { id: 'sx1', day: 'Mon', time: '18:00', type: 'Lesson', title: 'Solo lesson 1', coach: 'Ali Ashmawy', court: 3, players: ['Mohamed Rostom'], mine: true },
    { id: 'sx2', day: 'Wed', time: '18:00', type: 'Lesson', title: 'Solo lesson 2', coach: 'Ali Ashmawy', court: 3, players: ['Mohamed Rostom'], mine: true },
    { id: 'sx3', day: 'Fri', time: '18:00', type: 'Lesson', title: 'Solo lesson 3', coach: 'Ali Ashmawy', court: 2, players: ['Mohamed Rostom'], mine: true },
    { id: 'sx4', day: 'Wed', time: '17:00', type: 'Group training', title: 'U17 Squad', coach: 'Abdel Rahman ElSergany', court: 1, players: ['Mohamed Rostom', 'Nour Hassan', 'Taha Ibrahim'], mine: true },
    { id: 'sx5', day: 'Thu', time: '19:00', type: 'Fitness', title: 'Strength & movement', coach: 'Bassem Tarek', court: 5, players: ['Mohamed Rostom', 'Aly Kamal'], mine: true },
    { id: 'sx6', day: 'Wed', time: '16:00', type: 'Group training', title: 'U11 Beginners', coach: 'Adham Nabil', court: 4, players: ['Aly Mostafa'], mine: false },
    { id: 'sx7', day: 'Wed', time: '20:00', type: 'Group training', title: 'Elite Squad', coach: 'Ali Ashmawy', court: 1, players: ['Taha Ibrahim'], mine: false },
  ];
}

function seed() {
  return {
    clubTheme: '#4ea8ff', // Heliopolis ships blue
    academyTheme: '#f5453b',
    courts: seedCourts(),
    sessions: seedSessions(),
    bookings: [],
    payments: PAYMENTS,
    images: {}, // { academyLogo, academyCover, clubCrest } → data URLs
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
    if (e.key === KEY && e.newValue) { try { state = JSON.parse(e.newValue); emit(); } catch (err) { /* ignore */ } }
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
  setImage: (key, dataURL) => commit({ ...state, images: { ...state.images, [key]: dataURL } }),
  setCourt: (court, patch) => commit({ ...state, courts: state.courts.map((c) => (c.court === court ? { ...c, ...patch } : c)) }),
  freeCourt: (court) => commit({ ...state, courts: state.courts.map((c) => (c.court === court ? { court: c.court, type: c.type, status: 'free', who: null, coach: null, next: 'open' } : c)) }),
  addSession: (s) => commit({ ...state, sessions: [...state.sessions, { id: 'sess' + Date.now(), ...s }] }),
  removeSession: (id) => commit({ ...state, sessions: state.sessions.filter((s) => s.id !== id) }),
  // book a Heliopolis live court (marks it booked + records the reservation)
  bookCourt: (court, booking) =>
    commit({
      ...state,
      courts: state.courts.map((c) => (c.court === court ? { ...c, status: 'booked', who: 'Your booking', coach: null, until: booking.endTime, left: 60 } : c)),
      bookings: [...state.bookings, { id: 'bk' + Date.now(), ...booking }],
    }),
  // book any other court (academy / guest pass) — just records the reservation
  addBooking: (booking) => commit({ ...state, bookings: [...state.bookings, { id: 'bk' + Date.now(), ...booking }] }),
  setPayment: (id, patch) => commit({ ...state, payments: state.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)) }),
  reset: () => commit(seed()),
};
