// supabase.js — the Supabase client, only created when keys are present.
//
// Keys come from Vite build-time env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
// or a runtime override on window.__SERVE__ (handy for pasting keys into a
// single-file build without rebuilding). With no keys, `hasBackend` is false and
// the app runs entirely on the local store — so the offline pitch exports keep
// working unchanged.

import { createClient } from '@supabase/supabase-js';

const runtime = (typeof window !== 'undefined' && window.__SERVE__) || {};
const url = import.meta.env.VITE_SUPABASE_URL || runtime.supabaseUrl;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || runtime.supabaseAnonKey;

export const hasBackend = Boolean(url && anon);

export const supabase = hasBackend
  ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
