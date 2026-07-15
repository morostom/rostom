// AdminAuth.jsx — login / signup + onboarding for club & academy admins.
// Flow: email/phone + password → choose Club or Academy → admin name, org
// name, logo/crest + cover → "Go live" opens the matching console.
// Everything persists (Supabase when configured, local store otherwise).

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SQLogo from '../../components/SQLogo';
import { Icons } from '../../components/Icons';
import UploadSlot from '../../components/UploadSlot';
import { DUR_FAST } from '../../motion';
import { store } from '../../store';
import { hasBackend } from '../../lib/supabase';
import { signUp, signIn, saveAdmin, loadAdmin } from '../../lib/auth';
import { useT } from '../../i18n';
import { BRAND_COLORS } from '../../data';

const fieldCss = { padding: '12px 14px', border: '1px solid var(--sq-border-2)', borderRadius: 10, background: 'rgba(255,255,255,0.02)', fontSize: 14, color: 'var(--sq-text)', outline: 'none', width: '100%', fontFamily: 'var(--sq-body)' };
const Label = ({ children }) => <label className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 7 }}>{children}</label>;

function Shell({ children, sub }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', background: 'radial-gradient(1200px 600px at 50% -10%, color-mix(in srgb, var(--sq-gold) 8%, transparent), transparent), var(--sq-bg)' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <SQLogo size={30} align="center" />
          {sub && <p style={{ margin: '12px 0 0', color: 'var(--sq-text-2)', fontSize: 13.5 }}>{sub}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminAuth({ onLive }) {
  const t = useT();
  const [stage, setStage] = useState('auth'); // auth | choose | details
  const [mode, setMode] = useState('signup'); // signup | login
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const [orgType, setOrgType] = useState('club');
  const [adminName, setAdminName] = useState('');
  const [orgName, setOrgName] = useState('');
  // onboarding drafts stay LOCAL until the org exists — a fresh signup must
  // never stamp its logo/colour onto the shared demo orgs.
  const [logo, setLogo] = useState(null);
  const [cover, setCover] = useState(null);
  const [accent, setAccent] = useState('#f5453b');
  const [courts, setCourts] = useState('4');
  const [location, setLocation] = useState('');

  const identifier = method === 'phone' ? phone : email;

  async function submitAuth() {
    setErr('');
    if (method === 'phone' && phone.replace(/\D/g, '').length < 7) return setErr(t('Enter a valid phone number.'));
    if (method === 'email' && !/\S+@\S+\.\S+/.test(email)) return setErr(t('Enter a valid email address.'));
    if (pw.length < 4) return setErr(t('Password must be at least 4 characters.'));

    setBusy(true);
    const res = mode === 'login'
      ? await signIn({ method, identifier, password: pw })
      : await signUp({ method, identifier, password: pw });
    setBusy(false);
    if (res.error) return setErr(res.error);

    if (mode === 'login') {
      const admin = hasBackend ? await loadAdmin() : null;
      if (admin?.orgType) { onLive(admin.orgType, admin.orgId || null); return; }
      setStage('choose'); // no saved org yet → set one up
    } else {
      setStage('choose');
    }
  }

  function chooseType(type) {
    setOrgType(type);
    setOrgName(''); // a fresh signup starts blank — no prefilled demo name
    setStage('details');
  }

  async function goLive() {
    setErr('');
    if (adminName.trim().length < 2) return setErr(t('Enter your name.'));
    if (orgName.trim().length < 2) return setErr(t('Enter your name.'));
    // every signup spins up its OWN org (row + Main Branch + free courts),
    // owned by this account from birth — the demo orgs are never touched.
    const orgId = store.createOrg({ type: orgType, name: orgName, accent, logo, cover, courts, location });
    await saveAdmin({ adminName, orgType, orgName, orgId });
    onLive(orgType, orgId);
  }

  return (
    <AnimatePresence mode="wait">
      {stage === 'auth' && (
        <motion.div key="auth" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>
          <Shell sub={t('The management console for your club or academy.')}>
            <div className="sq-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', background: 'var(--sq-bg)', borderRadius: 12, padding: 4, border: '1px solid var(--sq-border)' }}>
                {[['signup', 'Create account'], ['login', 'Log in']].map(([id, label]) => (
                  <button key={id} onClick={() => { setMode(id); setErr(''); }} style={{ flex: 1, padding: '11px', borderRadius: 9, border: 0, cursor: 'pointer', fontFamily: 'var(--sq-display)', fontWeight: 600, fontSize: 13.5, background: mode === id ? 'var(--sq-gold)' : 'transparent', color: mode === id ? '#0a0a0a' : 'var(--sq-text-2)' }}>{t(label)}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['email', 'Email'], ['phone', 'Phone']].map(([id, label]) => (
                  <button key={id} onClick={() => { setMethod(id); setErr(''); }} className={'sq-chip' + (method === id ? ' gold' : '')} style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: 12.5, cursor: 'pointer' }}>{t(label)}</button>
                ))}
              </div>
              {method === 'email' ? (
                <div><Label>{t('Work email')}</Label><input style={fieldCss} type="email" value={email} placeholder="you@club.com" onChange={(e) => setEmail(e.target.value)} /></div>
              ) : (
                <div><Label>{t('Phone number')}</Label><input style={fieldCss} type="tel" value={phone} placeholder="+20 10 1234 5678" onChange={(e) => setPhone(e.target.value)} /></div>
              )}
              <div><Label>{t('Password')}</Label><input style={fieldCss} type="password" value={pw} placeholder={t('At least 4 characters')} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitAuth()} /></div>
              {err && <div style={{ fontFamily: 'var(--sq-mono)', fontSize: 12, color: 'var(--sq-danger)', background: 'color-mix(in srgb, var(--sq-danger) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-danger) 35%, transparent)', borderRadius: 10, padding: '10px 12px' }}>{err}</div>}
              <button className="sq-btn-gold serve-glow-soft" style={{ padding: '14px', fontSize: 14.5 }} onClick={submitAuth} disabled={busy}>
                {busy ? t('Please wait…') : mode === 'signup' ? t('Continue →') : t('Log in →')}
              </button>
              <p style={{ margin: 0, textAlign: 'center', fontSize: 11.5, color: 'var(--sq-text-3)', lineHeight: 1.5 }}>
                {mode === 'signup' ? "Next you'll pick whether you run a club or an academy." : 'Log in to open your console.'}
              </p>
            </div>
          </Shell>
        </motion.div>
      )}

      {stage === 'choose' && (
        <motion.div key="choose" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>
          <Shell sub={t('What are you setting up?')}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { t: 'club', icon: <Icons.Club size={30} />, title: 'Club', sub: 'Members-only. Live court board, schedule, access codes.' },
                { t: 'academy', icon: <Icons.Trophy size={30} />, title: 'Academy', sub: 'Open booking. Courts, coaches, group training, payments.' },
              ].map((o) => (
                <button key={o.t} onClick={() => chooseType(o.t)} className="sq-card" style={{ textAlign: 'left', cursor: 'pointer', padding: 22, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 190 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 15, background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 30%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{o.icon}</div>
                  <div className="sq-display" style={{ fontSize: 19, fontWeight: 700 }}>{t(o.title)}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--sq-text-2)', lineHeight: 1.5 }}>{t(o.sub)}</div>
                  <div style={{ flex: 1 }} />
                  <span className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', gap: 6 }}>{t('Set up')} <Icons.ArrowRight size={13} /></span>
                </button>
              ))}
            </div>
          </Shell>
        </motion.div>
      )}

      {stage === 'details' && (
        <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: DUR_FAST }}>
          <Shell sub={t('Set up your club. This is what players will see.')}>
            <div className="sq-card" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div><Label>{t('Your name')}</Label><input style={fieldCss} value={adminName} placeholder="e.g. Ahmed Hassan" onChange={(e) => setAdminName(e.target.value)} /></div>
              <div><Label>{orgType === 'club' ? t('Club name') : t('Academy name')}</Label><input style={fieldCss} value={orgName} placeholder={orgType === 'club' ? 'e.g. Heliopolis Sporting Club' : 'e.g. Ramy Ashour Squash Academy'} onChange={(e) => setOrgName(e.target.value)} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 12 }}>
                <div><Label>{t('Location')}</Label><input style={fieldCss} value={location} placeholder="e.g. New Cairo · Cairo" onChange={(e) => setLocation(e.target.value)} /></div>
                <div><Label>{t('Courts')}</Label><input style={fieldCss} type="number" min="1" max="40" value={courts} onChange={(e) => setCourts(e.target.value)} /></div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 120, flexShrink: 0 }}>
                  <Label>{orgType === 'club' ? t('Crest') : t('Logo')}</Label>
                  <UploadSlot value={logo} onChange={setLogo} label="Drop image" height={120} radius={16} maxDim={512} />
                </div>
                <div style={{ flex: 1 }}>
                  <Label>{t('Cover photo')}</Label>
                  <UploadSlot value={cover} onChange={setCover} label="Drop a cover photo of your courts" height={120} radius={12} />
                </div>
              </div>
              <div>
                <Label>{t('Brand colour')}</Label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {BRAND_COLORS.map((c) => {
                    const on = accent.toLowerCase() === c.hex.toLowerCase();
                    return <button key={c.hex} title={c.name} onClick={() => setAccent(c.hex)} style={{ width: 40, height: 40, borderRadius: 11, background: c.hex, cursor: 'pointer', border: 0, color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: on ? `0 0 0 2px var(--sq-bg), 0 0 0 4px ${c.hex}` : 'none' }}>{on && <Icons.Check size={16} />}</button>;
                  })}
                </div>
              </div>
              {err && <div style={{ fontFamily: 'var(--sq-mono)', fontSize: 12, color: 'var(--sq-danger)', background: 'color-mix(in srgb, var(--sq-danger) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-danger) 35%, transparent)', borderRadius: 10, padding: '10px 12px' }}>{err}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="sq-btn-ghost" style={{ padding: '13px 18px', fontSize: 13.5 }} onClick={() => setStage('choose')}>{t('Back')}</button>
                <button className="sq-btn-gold serve-glow-soft" style={{ flex: 1, padding: '14px', fontSize: 14.5 }} onClick={goLive}>{t('Go live →')}</button>
              </div>
            </div>
          </Shell>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
