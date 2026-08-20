// backend.js — maps Supabase rows ↔ the store shape, hydrates initial state,
// subscribes to realtime changes, and performs writes. Only used when
// hasBackend is true; otherwise the store stays fully local.

import { hasBackend, supabase } from './supabase';

const CLUB = 'heliopolis';
const ACADEMY = 'ramyashour';

// courts/sessions live under a branch — the branch id IS the club_id column.
const courtFromRow = (r) => ({ branch: r.club_id, court: r.court_no, type: r.type, status: r.status, who: r.who, coach: r.coach, until: r.until, left: r.remaining, next: r.next, price: r.price ?? null });
const sessionFromRow = (r) => ({ id: r.id, branch: r.club_id, day: r.day, time: r.time, type: r.type, title: r.title, coach: r.coach, court: r.court, players: r.players || [], price: r.price ?? null, spots: r.spots ?? null, open: !!r.open, duration: r.duration ?? null, mine: false });
const bookingFromRow = (r) => ({ id: r.id, branch: r.branch, court: r.court, title: r.title, venue: r.venue, type: r.type, day: r.day, time: r.time, endTime: r.end_time, price: r.price, method: r.method, status: r.status });
const branchFromRow = (r) => ({ id: r.id, org_id: r.org_id, name: r.name, location: r.location, courts: r.court_count, price: r.price ?? null, peak_price: r.peak_price ?? null, peak_from: r.peak_from ?? null, peak_to: r.peak_to ?? null, open_hour: r.open_hour ?? null, close_hour: r.close_hour ?? null, maps_url: r.maps_url ?? null, address: r.address ?? null });
const orgFromRow = (r) => ({ id: r.id, type: r.type, name: r.name, accent: r.accent, logo: r.logo, cover: r.cover, crest: r.crest, owner_phone: r.owner_phone, coach_phone: r.coach_phone, maps_url: r.maps_url, address: r.address, owner_id: r.owner_id });
const paymentFromRow = (r) => ({ id: r.id, player: r.player, item: r.item, amount: r.amount, status: r.status, method: r.method });
const staffFromRow = (r) => ({ id: r.id, org_id: r.org_id, name: r.name, role: r.role, initials: r.initials, squads: r.squads });
const parentLinkFromRow = (r) => ({ id: r.id, parent_identifier: r.parent_identifier, parent_name: r.parent_name, child_name: r.child_name, status: r.status || 'pending' });
const requestFromRow = (r) => ({ id: r.id, parent_identifier: r.parent_identifier, child_name: r.child_name, item: r.item, venue: r.venue, court: r.court, day: r.day, time: r.time, amount: r.amount, status: r.status, expiresAt: r.expires_at, createdAt: r.created_at });
const reviewFromRow = (r) => ({ id: r.id, venue_id: r.venue_id, venue_name: r.venue_name, player: r.player, rating: r.rating, comment: r.comment, createdAt: r.created_at });
const cancellationFromRow = (r) => ({ id: r.id, session_id: r.session_id, session_title: r.session_title, club_id: r.club_id, coach: r.coach, player: r.player, parent_identifier: r.parent_identifier, reason: r.reason, status: r.status, createdAt: r.created_at });

// Build a store patch from the whole DB (simple + robust for demo volume).
export async function hydrate() {
  if (!hasBackend) return {};
  const [courts, sessions, bookings, payments, settings, staff, links, requests, reviews, cancellations, branches, profiles] = await Promise.all([
    supabase.from('courts').select('*').order('court_no'),
    supabase.from('sessions').select('*'),
    supabase.from('bookings').select('*').order('created_at', { ascending: true }),
    supabase.from('payments').select('*'),
    supabase.from('org_settings').select('*'),
    supabase.from('staff').select('*').order('created_at', { ascending: true }),
    supabase.from('parent_links').select('*'),
    supabase.from('payment_requests').select('*').order('created_at', { ascending: true }),
    supabase.from('reviews').select('*').order('created_at', { ascending: true }),
    supabase.from('cancellations').select('*').order('created_at', { ascending: true }),
    supabase.from('branches').select('*').order('created_at', { ascending: true }),
    supabase.from('profiles').select('name, card'),
  ]);
  const patch = {};
  if (branches.data?.length) patch.branches = branches.data.map(branchFromRow);
  if (courts.data?.length) patch.courts = courts.data.map(courtFromRow);
  if (sessions.data) patch.sessions = sessions.data.map(sessionFromRow);
  if (bookings.data) patch.bookings = bookings.data.map(bookingFromRow);
  if (payments.data?.length) patch.payments = payments.data.map(paymentFromRow);
  if (staff.data) patch.staff = staff.data.map(staffFromRow);
  if (links.data) patch.parentLinks = links.data.map(parentLinkFromRow);
  if (requests.data) patch.paymentRequests = requests.data.map(requestFromRow);
  if (reviews.data) patch.reviews = reviews.data.map(reviewFromRow);
  if (cancellations.data) patch.cancellations = cancellations.data.map(cancellationFromRow);
  if (profiles.data) {
    // real player cards, keyed by lowercase name — only the public-safe
    // fields (name · age · division · ranking · club), never the full card
    const cards = {};
    for (const row of profiles.data) {
      const c = row.card;
      if (!c || c.kind === 'admin' || c.kind === 'parent' || !c.name) continue;
      cards[c.name.toLowerCase()] = { name: c.name, age: c.age, division: c.division, rankLabel: c.rankLabel, rankVerified: !!c.rankVerified, club: c.club };
    }
    patch.playerCards = cards;
  }
  if (settings.data) {
    patch.orgs = settings.data.map(orgFromRow); // every org, incl. dynamic ones
    const hel = settings.data.find((s) => s.id === CLUB);
    const aca = settings.data.find((s) => s.id === ACADEMY);
    if (hel?.accent) patch.clubTheme = hel.accent;
    if (aca?.accent) patch.academyTheme = aca.accent;
    if (hel?.name) patch.clubName = hel.name;
    if (aca?.name) patch.academyName = aca.name;
    patch.images = { clubCrest: hel?.crest || undefined, clubCover: hel?.cover || undefined, academyLogo: aca?.logo || undefined, academyCover: aca?.cover || undefined };
    patch.contacts = {
      heliopolis: { owner: hel?.owner_phone || '', coach: hel?.coach_phone || '' },
      ramyashour: { owner: aca?.owner_phone || '', coach: aca?.coach_phone || '' },
    };
  }
  return patch;
}

// Re-hydrate on login/logout — with tightened RLS, what a client can see
// depends on who they are, so the pre-login snapshot goes stale on sign-in.
// IMPORTANT: the callback must not touch supabase synchronously — sign-in
// holds an internal auth lock until all subscribers return, and a query here
// waits on that same lock (deadlock: sign-in never resolves). Defer instead.
export function onAuth(cb) {
  if (!hasBackend) return () => {};
  const { data } = supabase.auth.onAuthStateChange(() => { setTimeout(cb, 0); });
  return () => data?.subscription?.unsubscribe();
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
    .on('postgres_changes', { event: '*', schema: 'public', table: 'parent_links' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_requests' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cancellations' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'branches' }, onChange)
    .subscribe();
  return () => supabase.removeChannel(ch);
}

// ── writes ───────────────────────────────────────────────────────────
// the branch id is stored in the club_id column
export async function writeCourt(c) {
  if (!c) return;
  await supabase.from('courts').update({ status: c.status, who: c.who ?? null, coach: c.coach ?? null, until: c.until ?? null, remaining: c.left ?? null, next: c.next ?? null, type: c.type ?? 'Standard', price: c.price ?? null }).eq('club_id', c.branch).eq('court_no', c.court);
}
export async function addSession(s) {
  const base = { club_id: s.branch || CLUB, day: s.day, time: s.time, type: s.type, title: s.title, coach: s.coach, court: s.court, players: s.players || [] };
  const { error } = await supabase.from('sessions').insert({ ...base, price: s.price ?? null, spots: s.spots ?? null, open: !!s.open, duration: s.duration ?? null });
  if (error) await supabase.from('sessions').insert(base); // pre-migration DB: retry without the open-session columns
}
export async function removeSession(id) {
  await supabase.from('sessions').delete().eq('id', id);
}
export async function updateSession(id, patch) {
  const row = {};
  for (const k of ['day', 'time', 'type', 'title', 'coach', 'court', 'players', 'price', 'spots', 'open', 'duration']) if (patch[k] !== undefined) row[k] = patch[k];
  await supabase.from('sessions').update(row).eq('id', id);
}
// players aren't org owners, so joining goes through a security-definer RPC
// that only appends a name (capacity- and dedup-guarded in SQL)
export async function joinSession(id, player) {
  await supabase.rpc('serve_join_session', { p_session: id, p_player: player });
}
export async function addBooking(b) {
  const { data } = await supabase.auth.getUser();
  await supabase.from('bookings').insert({
    user_id: data?.user?.id ?? null, venue: b.venue, court: String(b.court ?? ''), branch: b.branch ?? null, title: b.title ?? null,
    type: b.type ?? null, day: b.day, time: b.time, end_time: b.endTime ?? null, price: b.price, method: b.method, status: b.status || 'confirmed',
  });
}
// a brand-new org, owned by the signed-in admin from birth (RLS gates on it)
export async function createOrg(o) {
  const { data } = await supabase.auth.getUser();
  await supabase.from('org_settings').insert({
    id: o.id, type: o.type, name: o.name, accent: o.accent ?? null, logo: o.logo ?? null, cover: o.cover ?? null,
    owner_phone: o.owner_phone || null, coach_phone: o.coach_phone || null, owner_id: data?.user?.id ?? null,
  });
}
export async function upsertOrg(id, patch) {
  const row = { updated_at: new Date().toISOString() };
  for (const k of ['name', 'accent', 'logo', 'cover', 'crest', 'owner_phone', 'coach_phone']) {
    if (patch[k] !== undefined) row[k] = patch[k];
  }
  await supabase.from('org_settings').update(row).eq('id', id);
}
export async function addBranch(br) {
  await supabase.from('branches').insert({ id: br.id, org_id: br.org_id, name: br.name, location: br.location ?? null, court_count: br.courts ?? 0, price: br.price ?? null, open_hour: br.open_hour ?? null, close_hour: br.close_hour ?? null });
}
export async function updateBranch(id, patch) {
  const row = {};
  if (patch.name != null) row.name = patch.name;
  if (patch.location != null) row.location = patch.location;
  if (patch.courts != null) row.court_count = patch.courts;
  // rates + opening hours are nullable on purpose: null means "house default"
  for (const k of ['price', 'peak_price', 'peak_from', 'peak_to', 'open_hour', 'close_hour', 'maps_url', 'address']) {
    if (patch[k] !== undefined) row[k] = patch[k];
  }
  await supabase.from('branches').update(row).eq('id', id);
}
export async function removeBranch(id) {
  await supabase.from('courts').delete().eq('club_id', id);
  await supabase.from('sessions').delete().eq('club_id', id);
  await supabase.from('branches').delete().eq('id', id);
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
export async function setName(which, name) {
  const id = which === 'club' ? CLUB : ACADEMY;
  await supabase.from('org_settings').upsert({ id, type: which, name, updated_at: new Date().toISOString() });
}
export async function setContacts(org, { owner, coach }) {
  const type = org === CLUB ? 'club' : 'academy';
  await supabase.from('org_settings').upsert({ id: org, type, owner_phone: owner ?? null, coach_phone: coach ?? null, updated_at: new Date().toISOString() });
}
// Bind an org to the signed-in admin (only if it's still unclaimed). After
// this, RLS lets only this owner edit the org + its branches/courts/staff.
export async function claimOrg(orgType) {
  if (!hasBackend) return;
  const id = orgType === 'club' ? CLUB : ACADEMY;
  const { data } = await supabase.auth.getUser();
  const uid = data?.user?.id;
  if (!uid) return;
  await supabase.from('org_settings').update({ owner_id: uid }).eq('id', id).is('owner_id', null);
}
// Is the current org owned by someone other than me? (drives a read-only notice)
export async function orgOwnership(orgType) {
  if (!hasBackend) return { ownerId: null, mine: true };
  const id = orgType === 'club' ? CLUB : ACADEMY;
  const { data: u } = await supabase.auth.getUser();
  const uid = u?.user?.id || null;
  const { data } = await supabase.from('org_settings').select('owner_id').eq('id', id).single();
  const ownerId = data?.owner_id || null;
  return { ownerId, mine: !ownerId || ownerId === uid };
}
export async function addReview(r) {
  await supabase.from('reviews').insert({ venue_id: r.venue_id, venue_name: r.venue_name ?? null, player: r.player ?? null, rating: r.rating, comment: r.comment ?? null });
}
export async function addCancellation(c) {
  await supabase.from('cancellations').insert({ session_id: String(c.session_id ?? ''), session_title: c.session_title ?? null, club_id: c.club_id || 'heliopolis', coach: c.coach ?? null, player: c.player ?? null, parent_identifier: c.parent_identifier ?? null, reason: c.reason ?? null, status: c.status || 'cancelled' });
}
export async function updateCancellation(id, patch) {
  await supabase.from('cancellations').update(patch).eq('id', id);
}
export async function removeCancellation(id) {
  await supabase.from('cancellations').delete().eq('id', id);
}
export async function addStaff(s) {
  // let the DB mint the uuid; realtime hydrate reconciles the optimistic row
  await supabase.from('staff').insert({ org_id: s.org_id, name: s.name, role: s.role ?? null, initials: s.initials ?? null, squads: s.squads ?? null });
}
export async function removeStaff(id) {
  await supabase.from('staff').delete().eq('id', id);
}
export async function addParentLink(l) {
  await supabase.from('parent_links').insert({ parent_identifier: l.parent_identifier, parent_name: l.parent_name ?? null, child_name: l.child_name, status: l.status || 'pending' });
}
export async function updateParentLink(id, patch) {
  await supabase.from('parent_links').update(patch).eq('id', id);
}
export async function removeParentLink(id) {
  await supabase.from('parent_links').delete().eq('id', id);
}
export async function addPaymentRequest(r) {
  await supabase.from('payment_requests').insert({
    parent_identifier: r.parent_identifier, child_name: r.child_name ?? null, item: r.item ?? null,
    venue: r.venue ?? null, court: String(r.court ?? ''), day: r.day ?? null, time: r.time ?? null,
    amount: r.amount ?? null, status: r.status || 'pending', expires_at: r.expiresAt ?? null,
  });
}
export async function updatePaymentRequest(id, patch) {
  await supabase.from('payment_requests').update(patch).eq('id', id);
}
export async function addCourtRow(c) {
  await supabase.from('courts').insert({ club_id: c.branch, court_no: c.court, type: c.type || 'Standard', status: c.status || 'free', next: c.next ?? null, price: c.price ?? null });
}
export async function removeCourtRow(branch, court) {
  await supabase.from('courts').delete().eq('club_id', branch).eq('court_no', court);
}
export async function setImage(key, dataURL) {
  // key: academyLogo | academyCover | clubCrest | clubCover
  if (key === 'clubCrest') await supabase.from('org_settings').upsert({ id: CLUB, type: 'club', crest: dataURL });
  else if (key === 'clubCover') await supabase.from('org_settings').upsert({ id: CLUB, type: 'club', cover: dataURL });
  else await supabase.from('org_settings').upsert({ id: ACADEMY, type: 'academy', [key === 'academyLogo' ? 'logo' : 'cover']: dataURL });
}
