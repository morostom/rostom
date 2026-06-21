// AuthScreen.jsx — the first screen. Log in or sign up with a phone number or
// email + password. Sign up → onboarding (who-for → compete → build card).
// Log in → straight into a populated demo profile (no typing needed to demo).

import { useState } from 'react';
import SQLogo from '../components/SQLogo';
import { Icons } from '../components/Icons';
import { MScreen } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { DEMO_PLAYER } from '../data';

function Field({ label, type, value, onChange, placeholder, icon, prefix }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="sq-label">{label}</label>
      <div className="sq-field">
        {icon && <span style={{ color: 'var(--sq-text-3)' }}>{icon}</span>}
        {prefix && <span className="sq-mono" style={{ fontSize: 14, color: 'var(--sq-text-2)' }}>{prefix}</span>}
        <input className="sq-input" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

export default function AuthScreen() {
  const { nav, setAccount, setPlayer } = useNav();
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [method, setMethod] = useState('phone'); // 'phone' | 'email'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const identifier = method === 'phone' ? phone : email;

  function submit() {
    setErr('');
    if (method === 'phone' && phone.replace(/\D/g, '').length < 7) return setErr('Enter a valid phone number.');
    if (method === 'email' && !/\S+@\S+\.\S+/.test(email)) return setErr('Enter a valid email address.');
    if (pw.length < 4) return setErr('Password must be at least 4 characters.');

    setAccount({ method, identifier });
    if (mode === 'login') {
      // demo account lands straight in a populated profile
      setPlayer({ ...DEMO_PLAYER });
      nav.replaceRoot('profile');
    } else {
      nav.push('whoFor');
    }
  }

  return (
    <MScreen
      header={
        <div style={{ padding: '10px 22px 6px' }}>
          <SQLogo size={26} accent est />
        </div>
      }
      tabBar={
        <div style={{ padding: '12px 22px', borderTop: '1px solid var(--sq-border)', background: 'rgba(7,7,7,0.95)' }}>
          <button className="sq-btn-gold serve-glow-soft" style={{ padding: '15px 18px', fontSize: 14.5, width: '100%' }} onClick={submit}>
            {mode === 'signup' ? 'Create account →' : 'Log in →'}
          </button>
        </div>
      }
    >
      <div style={{ padding: '18px 22px 8px' }}>
        <h1 className="sq-display" style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {mode === 'signup' ? (
            <>
              Egypt's squash
              <br />
              <span style={{ color: 'var(--sq-gold)' }}>home court.</span>
            </>
          ) : (
            <>
              Welcome
              <br />
              <span style={{ color: 'var(--sq-gold)' }}>back.</span>
            </>
          )}
        </h1>
        <p style={{ margin: '8px 0 0', color: 'var(--sq-text-2)', fontSize: 13.5 }}>
          {mode === 'signup' ? 'Create your account to build your player card.' : 'Log in to your SERVE account.'}
        </p>
      </div>

      <div style={{ padding: '16px 22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* login / signup tabs */}
        <div style={{ display: 'flex', background: 'var(--sq-surface)', borderRadius: 12, padding: 4, border: '1px solid var(--sq-border)' }}>
          {[['signup', 'Sign up'], ['login', 'Log in']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => { setMode(id); setErr(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 9, border: 0, cursor: 'pointer',
                fontFamily: 'var(--sq-display)', fontWeight: 600, fontSize: 13.5,
                background: mode === id ? 'var(--sq-gold)' : 'transparent',
                color: mode === id ? '#0a0a0a' : 'var(--sq-text-2)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* method toggle */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[['phone', 'Phone', <Icons.Chat size={14} key="p" />], ['email', 'Email', <Icons.Chevron size={14} key="e" dir="right" />]].map(([id, label, ic]) => (
            <button
              key={id}
              onClick={() => { setMethod(id); setErr(''); }}
              className={'sq-chip' + (method === id ? ' gold' : '')}
              style={{ flex: 1, justifyContent: 'center', padding: '9px', fontSize: 12.5, cursor: 'pointer' }}
            >
              {label}
            </button>
          ))}
        </div>

        {method === 'phone' ? (
          <Field label="Phone number" type="tel" value={phone} onChange={setPhone} placeholder="10 1234 5678" prefix="+20" />
        ) : (
          <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        )}
        <Field label="Password" type="password" value={pw} onChange={setPw} placeholder="At least 4 characters" icon={<Icons.Lock size={15} />} />

        {err && (
          <div style={{ fontFamily: 'var(--sq-mono)', fontSize: 12, color: 'var(--sq-danger)', background: 'color-mix(in srgb, var(--sq-danger) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-danger) 35%, transparent)', borderRadius: 10, padding: '10px 12px' }}>
            {err}
          </div>
        )}

        <p style={{ margin: 0, textAlign: 'center', fontSize: 12, color: 'var(--sq-text-3)', lineHeight: 1.5 }}>
          {mode === 'signup'
            ? 'By continuing you agree to SERVE’s terms. We’ll only use your number to secure your account.'
            : 'Tip: tap Log in to jump straight into a demo profile.'}
        </p>
      </div>
    </MScreen>
  );
}
