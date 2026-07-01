// backend.js — maps Supabase rows ↔ the store shape, hydrates initial state,
// subscribes to realtime changes, and performs writes. Only used when
// hasBackend is true; otherwise the store stays fully local.

import { hasBackend, supabase } from './supabase';

const CLUB = 'heliopolis';
const ACADEMY = 'ramyashour';

const courtFromRow = (r) => ({ court: r.court_no, type: r.type, status: r.status, who: r.who, coach: r.coach, until: r.until, left: r.remaining, next: r.next });
const sessionFromRow = (r) => ({ id: r.id, day: r.day, time: r.time, type: r.type, title: r.title, coach: r.coach, court: r.court, players: r.players || [], mine: false });
const bookingFromRow = (r) => ({ id: r.id, court: r.court, title: r.title, venue: r.venue, type: r.type, day: r.day, time: r.time, endTime: r.end_time, price: r.price, method: r.method, status: r.status });
const paymentFromRow = (r) => ({ id: r.id, player: r.player, item: r.item, amount: r.amount, status: r.status, method: r.method });
const staffFromRow = (r) => ({ id: r.id, org_id: r.org_id, name: r.name, role: r.role, initials: r.initials, squads: r.squads });

// Build a store patch from the whole DB (simple + robust for demo volume).
export async function hydrate() {
  if (!hasBackend) return {};
  const [courts, sessions, bookings, payments, settings, staff] = await Promise.all([
    supabase.from('courts').select('*').eq('club_id', CLUB).order('court_no'),
    supabase.from('sessions').select('*').eq('club_id', CLUB),
    supabase.from('bookings').select('*').order('created_at', { ascending: true }),
    supabase.from('payments').select('*'),
    supabase.from('org_settings').select('*'),
    supabase.from('staff').select('*').order('created_at', { ascending: true }),
  ]);
  const patch = {};
  if (courts.data?.length) patch.courts = courts.data.map(courtFromRow);
  if (sessions.data) patch.sessions = sessions.data.map(sessionFromRow);
  if (bookings.data) patch.bookings = bookings.data.map(bookingFromRow);
  if (payments.data?.length) patch.payments = payments.data.map(paymentFromRow);
  if (staff.data) patch.staff = staff.data.map(staffFromRow);
  if (settings.data) {
    const hel = settings.data.find((s) => s.id === CLUB);
    const aca = settings.data.find((s) => s.id === ACADEMY);
    if (hel?.accent) patch.clubTheme = hel.accent;
    if (aca?.accent) patch.academyTheme = aca.accent;
    patch.images = { clubCrest: hel?.crest || undefined, academyLogo: aca?.logo || undefined, academyCover: aca?.cover || undefined };
  }
  return patch;
}

// Re-hydrate whenever any live table changes.
export function subscribe(onChange) {
  if (!hasBackend) return () => {};
  const ch = supabase
    .channel('serve-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'courts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'org_settings' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, onChange)
    .subscribe();
  return () => supabase.removeChannel(ch);
}

// ── writes ───────────────────────────────────────────────────────────
export async function writeCourt(c) {
  await supabase.from('courts').update({ status: c.status, who: c.who ?? null, coach: c.coach ?? null, until: c.until ?? null, remaining: c.left ?? null, next: c.next ?? null }).eq('club_id', CLUB).eq('court_no', c.court);
}
export async function addSession(s) {
  await supabase.from('sessions').insert({ club_id: CLUB, day: s.day, time: s.time, type: s.type, title: s.title, coach: s.coach, court: s.court, players: s.players || [] });
}
export async function removeSession(id) {
  await supabase.from('sessions').delete().eq('id', id);
}
export async function addBooking(b) {
  const { data } = await supabase.auth.getUser();
  await supabase.from('bookings').insert({
    user_id: data?.user?.id ?? null, venue: b.venue, court: String(b.court ?? ''), title: b.title ?? null,
    type: b.type ?? null, day: b.day, time: b.time, end_time: b.endTime ?? null, price: b.price, method: b.method, status: b.status || 'confirmed',
  });
}
export async function removeBooking(id) {
  await supabase.from('bookings').delete().eq('id', id);
}
export async function setPayment(id, patch) {
  await supabase.from('payments').update(patch).eq('id', id);
}
export async function setTheme(which, hex) {
  const id = which === 'club' ? CLUB : ACADEMY;
  await supabase.from('org_settings').upsert({ id, type: which, accent: hex, updated_at: new Date().toISOString() });
}
export async function addStaff(s) {
  // let the DB mint the uuid; realtime hydrate reconciles the optimistic row
  await supabase.from('staff').insert({ org_id: s.org_id, name: s.name, role: s.role ?? null, initials: s.initials ?? null, squads: s.squads ?? null });
}
export async function removeStaff(id) {
  await supabase.from('staff').delete().eq('id', id);
}
export async function addCourtRow(c) {
  await supabase.from('courts').insert({ club_id: CLUB, court_no: c.court, type: c.type || 'Standard', status: c.status || 'free', next: c.next ?? null });
}
export async function removeCourtRow(court) {
  await supabase.from('courts').delete().eq('club_id', CLUB).eq('court_no', court);
}
export async function setImage(key, dataURL) {
  // key: academyLogo | academyCover | clubCrest
  if (key === 'clubCrest') await supabase.from('org_settings').upsert({ id: CLUB, type: 'club', crest: dataURL });
  else await supabase.from('org_settings').upsert({ id: ACADEMY, type: 'academy', [key === 'academyLogo' ? 'logo' : 'cover']: dataURL });
}
