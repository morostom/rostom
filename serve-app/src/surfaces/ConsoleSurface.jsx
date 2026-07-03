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

export default function ConsoleSurface() {
  const [stage, setStage] = useState('auth'); // 'auth' | 'live'
  const [orgType, setOrgType] = useState('club');
  const [checking, setChecking] = useState(hasBackend);
  const [readOnly, setReadOnly] = useState(false);

  async function checkOwnership(type) {
    if (!hasBackend) return;
    try { const { mine } = await orgOwnership(type); setReadOnly(!mine); } catch { /* ignore */ }
  }

  // returning admin: if already signed in with a saved org, skip straight in
  useEffect(() => {
    if (!hasBackend) return;
    let alive = true;
    (async () => {
      try {
        const u = await getSessionUser();
        if (u) { const a = await loadAdmin(); if (alive && a?.orgType) { setOrgType(a.orgType); await checkOwnership(a.orgType); setStage('live'); } }
      } catch { /* ignore */ }
      if (alive) setChecking(false);
    })();
    return () => { alive = false; };
  }, []);

  return (
    <DesktopFrame>
      {checking ? (
        <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sq-bg)' }}>
          <SQLogo size={26} accent />
        </div>
      ) : stage === 'live' ? (
        <>
          {readOnly && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '8px 16px', textAlign: 'center', fontSize: 12.5, background: 'color-mix(in srgb, var(--sq-gold) 16%, #0a0a0a)', borderBottom: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)', color: 'var(--sq-text)' }}>
              This {orgType} is managed by another account — you have read-only access.
            </div>
          )}
          {orgType === 'academy' ? <AdminConsole /> : <CoachConsole />}
        </>
      ) : (
        <AdminAuth onLive={async (t) => { setOrgType(t); await checkOwnership(t); setStage('live'); }} />
      )}
    </DesktopFrame>
  );
}
