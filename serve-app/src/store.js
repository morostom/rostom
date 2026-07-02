// store.js — the single source of runtime truth, shared across every surface.
// Shared in-memory within one bundle (instant), persisted to localStorage, and
// mirrored across tabs of the same origin via the `storage` event.

import { useSyncExternalStore } from 'react';
import { PAYMENTS, COACHES, CLUB, ACADEMY } from './data';
import { hasBackend } from './lib/supabase';
import * as backend from './lib/backend';

const KEY = 'serve_state_v5';

const initials = (name) => name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

// coaches, scoped per org (offline seed; DB-backed when connected)
function seedStaff() {
  const hel = COACHES.map((c, i) => ({ id: 'st-h' + i, org_id: 'heliopolis', ...c }));
  const aca = COACHES.slice(0, 4).map((c, i) => ({ id: 'st-a' + i, org_id: 'ramyashour', ...c }));
  return [...hel, ...aca];
}

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
    clubName: CLUB.name,
    academyName: ACADEMY.name,
    courts: seedCourts(),
    sessions: seedSessions(),
    staff: seedStaff(),
    bookings: [],
    payments: PAYMENTS,
    parentLinks: [],        // { id, parent_identifier, parent_name, child_name }
    paymentRequests: [],    // { id, parent_identifier, child_name, item, ..., status, expiresAt }
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

// Local mode: persist to localStorage + sync across tabs.
// Backend mode: state is driven by Supabase (hydrate + realtime); no localStorage.
function commit(next) {
  state = next;
  if (!hasBackend) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  emit();
}

if (typeof window !== 'undefined' && !hasBackend) {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY && e.newValue) { try { state = JSON.parse(e.newValue); emit(); } catch (err) { /* ignore */ } }
  });
}

// Backend mode: hydrate from the DB and keep in sync via realtime.
if (hasBackend) {
  const refresh = () => backend.hydrate().then((patch) => { state = { ...state, ...patch }; emit(); }).catch(() => {});
  refresh();
  backend.subscribe(refresh);
}

function subscribe(l) { listeners.add(l); return () => listeners.delete(l); }
export function useStore() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

// Every mutation updates the screen instantly (optimistic). In backend mode it
// also writes to Supabase in the background; realtime then reconciles state
// (hydrate replaces whole arrays, so the optimistic entry is cleanly replaced
// by the canonical row — no duplicates). This keeps buttons responsive even if
// the network/realtime is slow.
export const store = {
  get: () => state,
  setClubTheme: (hex) => { commit({ ...state, clubTheme: hex }); if (hasBackend) backend.setTheme('club', hex); },
  setAcademyTheme: (hex) => { commit({ ...state, academyTheme: hex }); if (hasBackend) backend.setTheme('academy', hex); },
  setOrgName: (which, name) => {
    const clean = (name || '').trim();
    if (!clean) return;
    commit({ ...state, [which === 'club' ? 'clubName' : 'academyName']: clean });
    if (hasBackend) backend.setName(which, clean);
  },
  setImage: (key, dataURL) => { commit({ ...state, images: { ...state.images, [key]: dataURL } }); if (hasBackend) backend.setImage(key, dataURL); },
  setCourt: (court, patch) => {
    const next = state.courts.map((c) => (c.court === court ? { ...c, ...patch } : c));
    commit({ ...state, courts: next });
    if (hasBackend) backend.writeCourt(next.find((c) => c.court === court));
  },
  freeCourt: (court) => {
    const reset = state.courts.map((c) => (c.court === court ? { court: c.court, type: c.type, status: 'free', who: null, coach: null, next: 'open' } : c));
    commit({ ...state, courts: reset });
    if (hasBackend) backend.writeCourt(reset.find((c) => c.court === court));
  },
  addSession: (s) => {
    commit({ ...state, sessions: [...state.sessions, { id: 'sess' + Date.now(), players: [], mine: false, ...s }] });
    if (hasBackend) backend.addSession(s);
  },
  removeSession: (id) => {
    commit({ ...state, sessions: state.sessions.filter((s) => s.id !== id) });
    if (hasBackend) backend.removeSession(id);
  },
  // book a Heliopolis live court (marks it booked + records the reservation)
  bookCourt: (court, booking) => {
    commit({
      ...state,
      courts: state.courts.map((c) => (c.court === court ? { ...c, status: 'booked', who: 'Your booking', coach: null, until: booking.endTime, left: 60 } : c)),
      bookings: [...state.bookings, { id: 'bk' + Date.now(), ...booking }],
    });
    if (hasBackend) {
      const c = state.courts.find((x) => x.court === court);
      if (c) backend.writeCourt({ ...c, status: 'booked', who: 'Your booking', coach: null, until: booking.endTime, left: 60 });
      backend.addBooking(booking);
    }
  },
  // book any other court (academy / guest pass) — just records the reservation
  addBooking: (booking) => { commit({ ...state, bookings: [...state.bookings, { id: 'bk' + Date.now(), ...booking }] }); if (hasBackend) backend.addBooking(booking); },
  cancelBooking: (id) => {
    const b = state.bookings.find((x) => x.id === id);
    // if this was a Heliopolis live court we secured, free it back up
    const freed = b && String(b.venue || '').includes('Heliopolis') && Number(b.court)
      ? state.courts.map((c) => (c.court === Number(b.court) && c.status === 'booked' ? { court: c.court, type: c.type, status: 'free', who: null, coach: null, next: 'open' } : c))
      : state.courts;
    commit({ ...state, bookings: state.bookings.filter((x) => x.id !== id), courts: freed });
    if (hasBackend) {
      backend.removeBooking(id);
      if (b && freed !== state.courts) backend.writeCourt(freed.find((c) => c.court === Number(b.court)));
    }
  },
  setPayment: (id, patch) => { commit({ ...state, payments: state.payments.map((p) => (p.id === id ? { ...p, ...patch } : p)) }); if (hasBackend) backend.setPayment(id, patch); },
  // ── staff / coaches (per org: 'heliopolis' club, 'ramyashour' academy) ──
  addStaff: (org_id, { name, role, squads }) => {
    const clean = (name || '').trim();
    if (!clean) return;
    const row = { id: 'st' + Date.now(), org_id, name: clean, role: role || 'Coach', initials: initials(clean), squads: squads || '' };
    commit({ ...state, staff: [...state.staff, row] });
    if (hasBackend) backend.addStaff(row);
  },
  removeStaff: (id) => {
    commit({ ...state, staff: state.staff.filter((s) => s.id !== id) });
    if (hasBackend) backend.removeStaff(id);
  },
  // ── courts (Heliopolis live board) ──
  addCourt: () => {
    const next = state.courts.reduce((m, c) => Math.max(m, c.court), 0) + 1;
    const court = { court: next, type: 'Standard', status: 'free', who: null, coach: null, next: 'open' };
    commit({ ...state, courts: [...state.courts, court] });
    if (hasBackend) backend.addCourtRow(court);
  },
  removeCourt: (court) => {
    commit({ ...state, courts: state.courts.filter((c) => c.court !== court) });
    if (hasBackend) backend.removeCourtRow(court);
  },
  // ── parent accounts ──
  // link a parent (by their login identifier) to a child (by name)
  linkChild: ({ parent_identifier, parent_name, child_name }) => {
    const name = (child_name || '').trim();
    if (!name || !parent_identifier) return;
    const existing = state.parentLinks.find((l) => l.parent_identifier === parent_identifier && l.child_name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const row = { id: 'pl' + Date.now(), parent_identifier, parent_name: parent_name || '', child_name: name };
    commit({ ...state, parentLinks: [...state.parentLinks, row] });
    if (hasBackend) backend.addParentLink(row);
    return row;
  },
  // child asks their parent to pay — creates a pending request with a 10-min hold
  requestTransfer: (req) => {
    const row = {
      id: 'pr' + Date.now(),
      status: 'pending',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      ...req,
    };
    commit({ ...state, paymentRequests: [...state.paymentRequests, row] });
    if (hasBackend) backend.addPaymentRequest(row);
    return row;
  },
  // parent approves & pays — confirms the booking under the child's name
  payRequest: (id, method) => {
    const r = state.paymentRequests.find((x) => x.id === id);
    if (!r) return;
    const booking = { id: 'bk' + Date.now(), court: r.court, title: r.item, venue: r.venue, type: 'Standard', day: r.day, time: r.time, price: r.amount, method: method || 'card', status: 'confirmed', forChild: r.child_name };
    commit({
      ...state,
      paymentRequests: state.paymentRequests.map((x) => (x.id === id ? { ...x, status: 'paid' } : x)),
      bookings: [...state.bookings, booking],
    });
    if (hasBackend) { backend.updatePaymentRequest(id, { status: 'paid' }); backend.addBooking(booking); }
  },
  declineRequest: (id) => {
    commit({ ...state, paymentRequests: state.paymentRequests.map((x) => (x.id === id ? { ...x, status: 'declined' } : x)) });
    if (hasBackend) backend.updatePaymentRequest(id, { status: 'declined' });
  },
  expireRequest: (id) => {
    const r = state.paymentRequests.find((x) => x.id === id);
    if (!r || r.status !== 'pending') return;
    commit({ ...state, paymentRequests: state.paymentRequests.map((x) => (x.id === id ? { ...x, status: 'expired' } : x)) });
    if (hasBackend) backend.updatePaymentRequest(id, { status: 'expired' });
  },
  reset: () => { commit(seed()); },
};
