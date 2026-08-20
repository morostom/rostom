// send-push — deliver a Web Push notification to every device belonging to
// one parent.
//
// Called by the CHILD's app the moment they create a payment or cancellation
// request. It runs with the service-role key so it can read the parent's
// subscription endpoints, which the child themselves can never see (RLS on
// push_subscriptions is per-device, and an endpoint is a capability — anyone
// holding one can push to that phone).
//
// Deploy:
//   supabase functions deploy send-push
//   supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com
//
// Generate the key pair once with:
//   npx web-push generate-vapid-keys
// The PUBLIC key also goes in the app build as VITE_VAPID_PUBLIC_KEY.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

// Normalise the same way the app does, so '+20 100 123 4567' and
// '201001234567' find the same parent.
const normId = (s: string) => (s || '').toLowerCase().replace(/[\s()-]/g, '').replace(/^\+/, '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY');
  const PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY');
  const SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@serve.app';
  if (!PUBLIC || !PRIVATE) return json({ error: 'VAPID keys not configured' }, 500);

  // Only a signed-in user may trigger a push, so this can't be used as an
  // open relay to spam arbitrary phones.
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const { data: caller } = await admin.auth.getUser(authHeader.replace('Bearer ', ''));
  if (!caller?.user) return json({ error: 'unauthorized' }, 401);

  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return json({ error: 'bad json' }, 400); }

  const identifier = normId(String(payload.identifier || ''));
  const title = String(payload.title || 'SERVE');
  const body = String(payload.body || '');
  const kind = String(payload.kind || 'general');
  const urgent = payload.urgent === true;
  if (!identifier) return json({ error: 'identifier required' }, 400);

  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('identifier', identifier);
  if (error) return json({ error: error.message }, 500);
  if (!subs?.length) return json({ sent: 0, reason: 'no devices' });

  webpush.setVapidDetails(SUBJECT, PUBLIC, PRIVATE);

  const message = JSON.stringify({ title, body, kind, urgent, tag: `serve-${kind}`, url: './' });

  let sent = 0;
  const dead: string[] = [];
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        message,
        { TTL: urgent ? 600 : 3600, urgency: urgent ? 'high' : 'normal' },
      );
      sent++;
    } catch (e) {
      // 404/410 mean the browser threw the subscription away (app deleted,
      // permission revoked). Clean it up so we stop paying for it forever.
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) dead.push(s.endpoint);
    }
  }));

  if (dead.length) await admin.from('push_subscriptions').delete().in('endpoint', dead);

  return json({ sent, pruned: dead.length });
});
