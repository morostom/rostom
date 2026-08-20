// storage.js — put uploaded images in Supabase Storage instead of the row.
//
// Logos and covers used to be stored as base64 data URLs directly in
// org_settings. That works, but every player hydrating the app downloads
// every venue's artwork inline — a few hundred KB per org, on every load,
// forever. Here we upload the file once and store a short public URL.
//
// Everything downstream just puts the string in an <img src>, and a URL and
// a data URL are equally valid there — so rows written before this change
// keep working untouched, and there's nothing to migrate.
//
// If Storage isn't reachable (no backend, bucket missing, offline), every
// function returns null and the caller falls back to the data URL. Uploads
// are an optimisation, never a requirement.

import { hasBackend, supabase } from './supabase';

const BUCKET = 'serve-media';

// null = untested, true/false = what we learned from the first attempt. Once
// we know the bucket isn't there we stop trying and stay on data URLs.
let available = null;

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };

// Upload one image blob; resolves to a public URL, or null to mean
// "couldn't — use the data URL instead".
export async function uploadImage(blob, folder = 'org') {
  if (!hasBackend || !blob || available === false) return null;
  const ext = EXT[blob.type] || 'jpg';
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${folder}/${Date.now()}-${rand}.${ext}`;
  try {
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      cacheControl: '31536000', // filenames are unique, so cache forever
      upsert: false,
    });
    if (error) {
      // "Bucket not found" means the storage migration hasn't been run —
      // remember that so we don't retry on every single upload.
      if (/bucket/i.test(error.message || '')) available = false;
      return null;
    }
    available = true;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch {
    return null;
  }
}

// True when a stored value is a Storage URL rather than inline base64.
export const isStored = (v) => typeof v === 'string' && /^https?:\/\//i.test(v);

// Best-effort cleanup when an image is replaced or an org is deleted. Never
// throws: a leaked file is much cheaper than a failed save.
export async function removeImage(url) {
  if (!hasBackend || !isStored(url)) return;
  const marker = `/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i < 0) return;
  const path = url.slice(i + marker.length).split('?')[0];
  try { await supabase.storage.from(BUCKET).remove([decodeURIComponent(path)]); } catch { /* ignore */ }
}
