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

export default function ConsoleSurface() {
  const [stage, setStage] = useState('auth'); // 'auth' | 'live'
  const [orgType, setOrgType] = useState('club');
  const [checking, setChecking] = useState(hasBackend);

  // returning admin: if already signed in with a saved org, skip straight in
  useEffect(() => {
    if (!hasBackend) return;
    let alive = true;
    (async () => {
      try {
        const u = await getSessionUser();
        if (u) { const a = await loadAdmin(); if (alive && a?.orgType) { setOrgType(a.orgType); setStage('live'); } }
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
        orgType === 'academy' ? <AdminConsole /> : <CoachConsole />
      ) : (
        <AdminAuth onLive={(t) => { setOrgType(t); setStage('live'); }} />
      )}
    </DesktopFrame>
  );
}
