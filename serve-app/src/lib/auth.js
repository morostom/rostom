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
