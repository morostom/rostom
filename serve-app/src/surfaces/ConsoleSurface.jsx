// ConsoleSurface.jsx — the unified admin entry. Gates both consoles behind
// login/signup + onboarding: after email/phone + password you pick Club or
// Academy, set your name / org name / pics, then go live into the matching
// console. A returning admin with a saved org lands straight in their console.

import { useEffect, useState } from 'react';
import DesktopFrame from '../desktop/DesktopFrame';
import CoachConsole from '../desktop/coach/CoachConsole';
import AdminConsole from '../desktop/admin/AdminConsole';
import AdminAuth from '../desktop/auth/AdminAuth';
import SQLogo from '../components/SQLogo';
import { hasBackend } from '../lib/supabase';
import { getSessionUser, loadAdmin } from '../lib/auth';
import { orgOwnership } from '../lib/backend';
import { store } from '../store';

export default function ConsoleSurface() {
  const [stage, setStage] = useState('auth'); // 'auth' | 'live'
  const [orgType, setOrgType] = useState('club');
  const [orgId, setOrgId] = useState(null); // dynamic org; null = legacy demo org
  const [checking, setChecking] = useState(hasBackend);
  const [readOnly, setReadOnly] = useState(false);
  const [demo, setDemo] = useState(false); // no-login preview of a demo venue
  const [bannerOpen, setBannerOpen] = useState(true);

  async function checkOwnership(type, id) {
    if (!hasBackend || id) return; // a dynamic org is owned by its creator
    try { const { mine } = await orgOwnership(type); setReadOnly(!mine); } catch { /* ignore */ }
  }

  // returning admin: if already signed in with a saved org, skip straight in
  useEffect(() => {
    if (!hasBackend) return;
    let alive = true;
    (async () => {
      try {
        const u = await getSessionUser();
        if (u) {
          const a = await loadAdmin();
          if (alive && a?.orgType) {
            // paint the org's real name/colour immediately — hydration
            // replaces this with the server row moments later
            if (a.orgId) store.seedOrg({ id: a.orgId, type: a.orgType, name: a.orgName || '', accent: a.accent || '#f5453b' });
            setOrgType(a.orgType); setOrgId(a.orgId || null); await checkOwnership(a.orgType, a.orgId); setStage('live');
          }
        }
      } catch { /* ignore */ }
      if (alive) setChecking(false);
    })();
    return () => { alive = false; };
  }, []);

  // legacy admins (pre-multi-tenant) fall back to the demo org for their type
  const effectiveOrg = orgId || (orgType === 'academy' ? 'ramyashour' : 'heliopolis');

  return (
    <DesktopFrame>
      {checking ? (
        <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sq-bg)' }}>
          <SQLogo size={26} />
        </div>
      ) : stage === 'live' ? (
        <>
          {readOnly && !demo && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '8px 16px', textAlign: 'center', fontSize: 12.5, background: 'color-mix(in srgb, var(--sq-gold) 16%, #0a0a0a)', borderBottom: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)', color: 'var(--sq-text)' }}>
              This {orgType} is managed by another account — you have read-only access.
            </div>
          )}
          {demo && bannerOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 12.5, background: 'color-mix(in srgb, var(--sq-gold) 16%, #0a0a0a)', borderBottom: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)', color: 'var(--sq-text)' }}>
              <span>Demo preview — you're viewing a live console. Changes won't be saved. Use “Log out” to return.</span>
              <button onClick={() => setBannerOpen(false)} style={{ background: 'none', border: 0, color: 'var(--sq-text-2)', cursor: 'pointer', fontSize: 15, lineHeight: 1 }}>×</button>
            </div>
          )}
          {orgType === 'academy' ? <AdminConsole orgId={effectiveOrg} /> : <CoachConsole orgId={effectiveOrg} />}
        </>
      ) : (
        <AdminAuth onLive={async (t, id, opts) => {
          setOrgType(t); setOrgId(id || null);
          if (opts?.demo) { setDemo(true); setReadOnly(false); }
          else { setDemo(false); await checkOwnership(t, id); }
          setStage('live');
        }} />
      )}
    </DesktopFrame>
  );
}
