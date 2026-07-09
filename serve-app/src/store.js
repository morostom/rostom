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

// Branches — a club/academy can run several physical locations, each with its
// own live board + schedule. `branch` on a court/session is the branch id.
function seedBranches() {
  return [
    { id: 'hel-masr', org_id: 'heliopolis', name: 'Masr El Gedida', location: 'Heliopolis · Cairo', courts: 7 },
    { id: 'hel-shorouk', org_id: 'heliopolis', name: 'El Shorouk', location: 'El Shorouk City', courts: 10 },
    { id: 'ramy-main', org_id: 'ramyashour', name: 'Main Branch', location: 'New Cairo', courts: 7 },
  ];
}

// live courts, tagged by branch. status: lesson|playing|free|booked
function seedCourts() {
  const masr = [
    { court: 1, type: 'Standard', status: 'lesson', who: 'U17 Squad', coach: 'Ali Ashmawy', until: '17:00', left: 18 },
    { court: 2, type: 'Standard', status: 'playing', who: 'Aly vs Taha', coach: null, until: '16:45', left: 12 },
    { court: 3, type: 'Standard', status: 'lesson', who: 'Mohamed Rostom', coach: 'Ali Ashmawy', until: '17:15', left: 33 },
    { court: 4, type: 'Standard', status: 'free', who: null, coach: null, next: '17:00 · Belal S.' },
    { court: 5, type: 'Standard', status: 'free', who: null, coach: null, next: '18:30 · open' },
    { court: 6, type: 'Standard', status: 'playing', who: 'Salman vs Nour', coach: null, until: '17:05', left: 25 },
    { court: 7, type: 'Standard', status: 'free', who: null, coach: null, next: '19:00 · open' },
  ].map((c) => ({ ...c, branch: 'hel-masr' }));
  // El Shorouk — a larger branch, mostly open
  const shorouk = Array.from({ length: 10 }, (_, i) => ({
    court: i + 1, type: 'Standard', branch: 'hel-shorouk',
    ...(i === 0 ? { status: 'playing', who: 'Members match', coach: null, until: '18:00', left: 40 }
      : i === 1 ? { status: 'lesson', who: 'U13 Squad', coach: 'Adham Nabil', until: '17:30', left: 20 }
      : { status: 'free', who: null, coach: null, next: 'open' }),
  }));
  return [...masr, ...shorouk];
}

// schedule sessions. `mine` / players[] drive what a member sees in the app.
function seedSessions() {
  return [
    { id: 'sx1', day: 'Mon', time: '18:00', type: 'Lesson', title: 'Solo lesson 1', coach: 'Ali Ashmawy', court: 3, players: ['Mohamed Rostom'], mine: true, branch: 'hel-masr' },
    { id: 'sx2', day: 'Wed', time: '18:00', type: 'Lesson', title: 'Solo lesson 2', coach: 'Ali Ashmawy', court: 3, players: ['Mohamed Rostom'], mine: true, branch: 'hel-masr' },
    { id: 'sx3', day: 'Fri', time: '18:00', type: 'Lesson', title: 'Solo lesson 3', coach: 'Ali Ashmawy', court: 2, players: ['Mohamed Rostom'], mine: true, branch: 'hel-masr' },
    { id: 'sx4', day: 'Wed', time: '17:00', type: 'Group training', title: 'U17 Squad', coach: 'Abdel Rahman ElSergany', court: 1, players: ['Mohamed Rostom', 'Nour Hassan', 'Taha Ibrahim'], mine: true, branch: 'hel-masr' },
    { id: 'sx5', day: 'Thu', time: '19:00', type: 'Fitness', title: 'Strength & movement', coach: 'Bassem Tarek', court: 5, players: ['Mohamed Rostom', 'Aly Kamal'], mine: true, branch: 'hel-masr' },
    { id: 'sx6', day: 'Wed', time: '16:00', type: 'Group training', title: 'U11 Beginners', coach: 'Adham Nabil', court: 4, players: ['Aly Mostafa'], mine: false, branch: 'hel-masr' },
    { id: 'sx7', day: 'Tue', time: '20:00', type: 'Group training', title: 'Elite Squad', coach: 'Ali Ashmawy', court: 2, players: ['Taha Ibrahim'], mine: false, branch: 'hel-shorouk' },
  ];
}

function seed() {
  return {
    clubTheme: '#4ea8ff', // Heliopolis ships blue
    academyTheme: '#f5453b',
    clubName: CLUB.name,
    academyName: ACADEMY.name,
    branches: seedBranches(),
    courts: seedCourts(),
    sessions: seedSessions(),
    staff: seedStaff(),
    bookings: [],
    payments: PAYMENTS,
    parentLinks: [],        // { id, parent_identifier, parent_name, child_name, status }
    paymentRequests: [],    // { id, parent_identifier, child_name, item, ..., status, expiresAt }
    reviews: [],            // { id, venue_id, venue_name, player, rating, comment }
    cancellations: [],      // { id, session_id, session_title, player, parent_identifier, reason, status }
    contacts: {             // WhatsApp numbers per org (owner + head coach)
      heliopolis: { owner: '', coach: '' },
      ramyashour: { owner: '', coach: '' },
    },
    playerCards: {},        // real player cards by lowercase name (backend)
    undo: null,             // { kind, label, expiresAt, ...snapshot } — one-slot undo
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
  backend.onAuth(refresh); // RLS-visible data changes on login/logout
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
  // courts are identified by (branch, court number)
  setCourt: (branch, court, patch) => {
    const next = state.courts.map((c) => (c.branch === branch && c.court === court ? { ...c, ...patch } : c));
    commit({ ...state, courts: next });
    if (hasBackend) backend.writeCourt(next.find((c) => c.branch === branch && c.court === court));
  },
  freeCourt: (branch, court) => {
    const reset = state.courts.map((c) => (c.branch === branch && c.court === court ? { branch: c.branch, court: c.court, type: c.type, status: 'free', who: null, coach: null, next: 'open' } : c));
    commit({ ...state, courts: reset });
    if (hasBackend) backend.writeCourt(reset.find((c) => c.branch === branch && c.court === court));
  },
  addSession: (s) => {
    commit({ ...state, sessions: [...state.sessions, { id: 'sess' + Date.now(), players: [], mine: false, ...s }] });
    if (hasBackend) backend.addSession(s);
  },
  removeSession: (id) => {
    commit({ ...state, sessions: state.sessions.filter((s) => s.id !== id) });
    if (hasBackend) backend.removeSession(id);
  },
  // book a club live court (marks it booked + records the reservation)
  bookCourt: (branch, court, booking) => {
    const b = { id: 'bk' + Date.now(), branch, ...booking };
    commit({
      ...state,
      courts: state.courts.map((c) => (c.branch === branch && c.court === court ? { ...c, status: 'booked', who: 'Your booking', coach: null, until: booking.endTime, left: 60 } : c)),
      bookings: [...state.bookings, b],
    });
    if (hasBackend) {
      const c = state.courts.find((x) => x.branch === branch && x.court === court);
      if (c) backend.writeCourt({ ...c, status: 'booked', who: 'Your booking', coach: null, until: booking.endTime, left: 60 });
      backend.addBooking(b);
    }
  },
  // book any other court (academy / guest pass) — just records the reservation
  addBooking: (booking) => { commit({ ...state, bookings: [...state.bookings, { id: 'bk' + Date.now(), ...booking }] }); if (hasBackend) backend.addBooking(booking); },
  cancelBooking: (id) => {
    const b = state.bookings.find((x) => x.id === id);
    // if this was a club live court we secured, free it back up
    const branch = b?.branch;
    const freedCourt = b && branch && Number(b.court) ? Number(b.court) : null;
    const freed = freedCourt
      ? state.courts.map((c) => (c.branch === branch && c.court === freedCourt && c.status === 'booked' ? { branch: c.branch, court: c.court, type: c.type, status: 'free', who: null, coach: null, next: 'open' } : c))
      : state.courts;
    commit({
      ...state,
      bookings: state.bookings.filter((x) => x.id !== id),
      courts: freed,
      undo: b ? { kind: 'booking', label: 'Booking cancelled', booking: b, branch, courtNo: freedCourt, expiresAt: Date.now() + 60 * 1000 } : state.undo,
    });
    if (hasBackend) {
      backend.removeBooking(id);
      if (freedCourt) backend.writeCourt(freed.find((c) => c.branch === branch && c.court === freedCourt));
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
  // ── courts (per branch live board) ──
  addCourt: (branch) => {
    const next = state.courts.filter((c) => c.branch === branch).reduce((m, c) => Math.max(m, c.court), 0) + 1;
    const court = { branch, court: next, type: 'Standard', status: 'free', who: null, coach: null, next: 'open' };
    commit({ ...state, courts: [...state.courts, court] });
    if (hasBackend) backend.addCourtRow(court);
  },
  removeCourt: (branch, court) => {
    commit({ ...state, courts: state.courts.filter((c) => !(c.branch === branch && c.court === court)) });
    if (hasBackend) backend.removeCourtRow(branch, court);
  },
  // ── branches (locations under a club/academy) ──
  addBranch: (org_id, { name, location, courts }) => {
    const clean = (name || '').trim();
    if (!clean) return;
    const id = org_id + '-' + Date.now();
    const n = Math.max(0, Math.min(40, parseInt(courts, 10) || 0));
    const branch = { id, org_id, name: clean, location: location || '', courts: n };
    // spin up n free courts for the new branch
    const newCourts = Array.from({ length: n }, (_, i) => ({ branch: id, court: i + 1, type: 'Standard', status: 'free', who: null, coach: null, next: 'open' }));
    commit({ ...state, branches: [...state.branches, branch], courts: [...state.courts, ...newCourts] });
    if (hasBackend) { backend.addBranch(branch); newCourts.forEach((c) => backend.addCourtRow(c)); }
    return branch;
  },
  setBranchInfo: (id, patch) => {
    commit({ ...state, branches: state.branches.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
    if (hasBackend) backend.updateBranch(id, patch);
  },
  removeBranch: (id) => {
    commit({ ...state, branches: state.branches.filter((b) => b.id !== id), courts: state.courts.filter((c) => c.branch !== id), sessions: state.sessions.filter((s) => s.branch !== id) });
    if (hasBackend) backend.removeBranch(id);
  },
  // ── parent accounts ──
  // Link a parent (by their login identifier) to a child (by name). Starts
  // 'pending' — the child approves it from their app before transfers work.
  linkChild: ({ parent_identifier, parent_name, child_name }) => {
    const name = (child_name || '').trim();
    if (!name || !parent_identifier) return;
    const existing = state.parentLinks.find((l) => l.parent_identifier === parent_identifier && l.child_name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const row = { id: 'pl' + Date.now(), parent_identifier, parent_name: parent_name || '', child_name: name, status: 'pending' };
    commit({ ...state, parentLinks: [...state.parentLinks, row] });
    if (hasBackend) backend.addParentLink(row);
    return row;
  },
  approveLink: (id) => {
    commit({ ...state, parentLinks: state.parentLinks.map((l) => (l.id === id ? { ...l, status: 'approved' } : l)) });
    if (hasBackend) backend.updateParentLink(id, { status: 'approved' });
  },
  declineLink: (id) => {
    commit({ ...state, parentLinks: state.parentLinks.filter((l) => l.id !== id) });
    if (hasBackend) backend.removeParentLink(id);
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
  // parent approves & pays — confirms the booking under the child's name.
  // Refuses if the 10-minute hold has lapsed (marks it expired instead).
  payRequest: (id, method) => {
    const r = state.paymentRequests.find((x) => x.id === id);
    if (!r) return;
    if (r.expiresAt && new Date(r.expiresAt).getTime() <= Date.now()) {
      commit({ ...state, paymentRequests: state.paymentRequests.map((x) => (x.id === id ? { ...x, status: 'expired' } : x)) });
      if (hasBackend) backend.updatePaymentRequest(id, { status: 'expired' });
      return;
    }
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
  // ── reviews ──
  addReview: ({ venue_id, venue_name, player, rating, comment }) => {
    const row = { id: 'rv' + Date.now(), venue_id, venue_name: venue_name || '', player: player || 'Anonymous', rating: Number(rating) || 5, comment: comment || '' };
    commit({ ...state, reviews: [...state.reviews, row] });
    if (hasBackend) backend.addReview(row);
    return row;
  },
  // ── org contact numbers (WhatsApp) ──
  setContact: (org, patch) => {
    const cur = state.contacts[org] || { owner: '', coach: '' };
    const next = { ...cur, ...patch };
    commit({ ...state, contacts: { ...state.contacts, [org]: next } });
    if (hasBackend) backend.setContacts(org, next);
  },
  // ── session cancellations ──
  // Direct cancel (16+ or no parent): remove the session + notify the club.
  // A 15-minute undo can restore it (and drop the cancellation notice).
  cancelSessionDirect: (session, reason) => {
    const alert = { id: 'cx' + Date.now(), session_id: session.id, session_title: session.title, club_id: 'heliopolis', coach: session.coach, player: session.players?.[0] || '', reason: reason || '', status: 'cancelled' };
    commit({
      ...state,
      sessions: state.sessions.filter((s) => s.id !== session.id),
      cancellations: [...state.cancellations, alert],
      undo: { kind: 'session', label: 'Session cancelled', session, cancellationId: alert.id, expiresAt: Date.now() + 15 * 60 * 1000 },
    });
    if (hasBackend) { backend.removeSession(session.id); backend.addCancellation(alert); }
    return alert;
  },
  // restore whatever the last cancel removed (if still within its window)
  performUndo: () => {
    const u = state.undo;
    if (!u || (u.expiresAt && u.expiresAt <= Date.now())) { commit({ ...state, undo: null }); return; }
    if (u.kind === 'session') {
      commit({
        ...state,
        sessions: [...state.sessions, u.session],
        cancellations: state.cancellations.filter((c) => c.id !== u.cancellationId),
        undo: null,
      });
      if (hasBackend) { backend.addSession(u.session); backend.removeCancellation(u.cancellationId); }
    } else if (u.kind === 'booking') {
      const courts = u.courtNo
        ? state.courts.map((c) => (c.branch === u.branch && c.court === u.courtNo ? { ...c, status: 'booked', who: 'Your booking', coach: null, until: u.booking.endTime, left: 60 } : c))
        : state.courts;
      commit({ ...state, bookings: [...state.bookings, u.booking], courts, undo: null });
      if (hasBackend) { backend.addBooking(u.booking); if (u.courtNo) backend.writeCourt(courts.find((c) => c.branch === u.branch && c.court === u.courtNo)); }
    }
  },
  clearUndo: () => { if (state.undo) commit({ ...state, undo: null }); },
  // Under-16: create a pending cancellation the parent must approve.
  requestCancellation: (session, reason, parent_identifier) => {
    const row = { id: 'cx' + Date.now(), session_id: session.id, session_title: session.title, club_id: 'heliopolis', coach: session.coach, player: session.players?.[0] || '', parent_identifier, reason: reason || '', status: 'pending' };
    commit({ ...state, cancellations: [...state.cancellations, row] });
    if (hasBackend) backend.addCancellation(row);
    return row;
  },
  approveCancellation: (id) => {
    const c = state.cancellations.find((x) => x.id === id);
    if (!c) return;
    commit({
      ...state,
      sessions: state.sessions.filter((s) => s.id !== c.session_id),
      cancellations: state.cancellations.map((x) => (x.id === id ? { ...x, status: 'cancelled' } : x)),
    });
    if (hasBackend) { backend.removeSession(c.session_id); backend.updateCancellation(id, { status: 'cancelled' }); }
  },
  declineCancellation: (id) => {
    commit({ ...state, cancellations: state.cancellations.map((x) => (x.id === id ? { ...x, status: 'declined' } : x)) });
    if (hasBackend) backend.updateCancellation(id, { status: 'declined' });
  },
  reset: () => { commit(seed()); },
};
