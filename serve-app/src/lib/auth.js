// auth.js — real Supabase auth when configured, graceful mock otherwise.
//
// Phone sign-ups are mapped to a synthetic email (<digits>@phone.serve.app) so
// email/password auth works without an SMS provider. Swap to supabase.auth
// phone OTP once a Twilio (or similar) provider is configured.

import { hasBackend, supabase } from './supabase';

function emailFor(method, identifier) {
  if (method === 'email') return identifier.trim().toLowerCase();
  return `${identifier.replace(/\D/g, '')}@phone.serve.app`;
}

export async function signUp({ method, identifier, password, name }) {
  if (!hasBackend) return { user: { id: 'local', name } };
  const email = emailFor(method, identifier);
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  const user = data.user;
  if (user) {
    await supabase.from('profiles').upsert({ id: user.id, name: name || null, method, identifier }).select();
  }
  return { user };
}

export async function signIn({ method, identifier, password }) {
  if (!hasBackend) return { user: { id: 'local' } };
  const email = emailFor(method, identifier);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { user: data.user };
}

export async function signOut() {
  if (hasBackend) await supabase.auth.signOut();
}

export async function getSessionUser() {
  if (!hasBackend) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function saveCard(card) {
  if (!hasBackend) return;
  const { data } = await supabase.auth.getUser();
  if (data?.user) await supabase.from('profiles').upsert({ id: data.user.id, name: card.name, card });
}

export async function loadCard() {
  if (!hasBackend) return null;
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return null;
  const { data } = await supabase.from('profiles').select('card').eq('id', u.user.id).single();
  return data?.card || null;
}

// Everything needed to restore a signed-in player/parent without re-typing
// credentials: their card plus the identity they signed up with.
export async function loadProfile() {
  if (!hasBackend) return null;
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return null;
  const { data } = await supabase.from('profiles').select('card, method, identifier, name').eq('id', u.user.id).single();
  return data ? { card: data.card || null, method: data.method || 'phone', identifier: data.identifier || '', name: data.name || '' } : null;
}

// Normalize an identifier so "01005851199", "+20 100 585 1199" and
// "0100-585-1199" all match: phones → digits only, emails → lowercased.
export function normId(x) {
  const s = (x || '').trim();
  const digits = s.replace(/\D/g, '');
  return digits.length >= 7 ? digits : s.toLowerCase();
}

// ── parent profile ───────────────────────────────────────────────────
// Tagged kind:'parent' in profiles.card so login knows to open the parent
// home instead of building a player card.
export async function saveParent({ childName }) {
  if (!hasBackend) return;
  const { data } = await supabase.auth.getUser();
  if (data?.user) await supabase.from('profiles').upsert({ id: data.user.id, card: { kind: 'parent', childName } });
}

// ── admin (club/academy owner) profile ───────────────────────────────
// Stored in the same profiles.card jsonb, tagged kind:'admin', so we know
// which console to open on login without a schema change.
export async function saveAdmin({ adminName, orgType, orgName, orgId }) {
  if (!hasBackend) return;
  const { data } = await supabase.auth.getUser();
  if (data?.user) await supabase.from('profiles').upsert({ id: data.user.id, name: adminName || null, card: { kind: 'admin', orgType, orgName, orgId: orgId || null, adminName } });
}
export async function loadAdmin() {
  if (!hasBackend) return null;
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return null;
  const { data } = await supabase.from('profiles').select('card, name').eq('id', u.user.id).single();
  const card = data?.card;
  if (card?.kind === 'admin') return { ...card, adminName: card.adminName || data?.name };
  return null;
}
