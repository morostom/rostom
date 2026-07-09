// ParentLinkScreen.jsx — parent-account setup. Link to a child by name so the
// parent can see their sessions, book for them, and receive "transfer to
// parent" payment requests.

import { useState } from 'react';
import SQLogo from '../components/SQLogo';
import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { useStore, store } from '../store';
import { useT } from '../i18n';
import { normId, saveParent } from '../lib/auth';

export default function ParentLinkScreen() {
  const { nav, account, setChild } = useNav();
  const state = useStore();
  const t = useT();
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  // suggest children we already know about (players who appear in the schedule)
  const known = Array.from(new Set(state.sessions.flatMap((s) => s.players || []))).slice(0, 6);

  function link() {
    const clean = name.trim();
    if (clean.length < 2) return setErr(t('Enter your child’s name.'));
    const parent_identifier = normId(account?.identifier) || 'parent';
    store.linkChild({ parent_identifier, parent_name: account?.name || 'Parent', child_name: clean });
    saveParent({ childName: clean }); // so future logins open the parent home
    setChild?.(clean);
    nav.replaceRoot('profile');
  }

  return (
    <MScreen
      header={
        <div style={{ padding: '6px 16px 6px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill>
          <SQLogo size={18} accent />
        </div>
      }
      tabBar={
        <div style={{ padding: '12px 22px', borderTop: '1px solid var(--sq-border)', background: 'var(--sq-scrim)' }}>
          <button className="sq-btn-gold serve-glow-soft" style={{ padding: '15px 18px', fontSize: 14.5, width: '100%' }} onClick={link}>
            {t('Link child →')}
          </button>
        </div>
      }
    >
      <div style={{ padding: '18px 22px 24px' }}>
        <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{t('Parent account')}</div>
        <h1 className="sq-display" style={{ margin: '8px 0 0', fontSize: 27, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {t('Who are you')}<br /><span style={{ color: 'var(--sq-gold)' }}>{t('looking after?')}</span>
        </h1>
        <p style={{ margin: '8px 0 22px', color: 'var(--sq-text-2)', fontSize: 13.5, lineHeight: 1.5 }}>
          {t('Link your child by name. You’ll see their sessions, book courts for them, and get a phone alert when they ask you to pay.')}
        </p>

        <label className="sq-label">{t('Child’s name')}</label>
        <div className="sq-field" style={{ marginTop: 6 }}>
          <Icons.User size={15} />
          <input className="sq-input" value={name} placeholder="e.g. Mohamed Rostom" onChange={(e) => { setName(e.target.value); setErr(''); }} />
        </div>

        {known.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('Players at your club')}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {known.map((n) => (
                <button key={n} onClick={() => { setName(n); setErr(''); }} className={'sq-chip' + (name === n ? ' gold' : '')} style={{ cursor: 'pointer', padding: '7px 12px', fontSize: 12.5 }}>{n}</button>
              ))}
            </div>
          </div>
        )}

        {err && (
          <div style={{ marginTop: 14, fontFamily: 'var(--sq-mono)', fontSize: 12, color: 'var(--sq-danger)', background: 'color-mix(in srgb, var(--sq-danger) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-danger) 35%, transparent)', borderRadius: 10, padding: '10px 12px' }}>
            {err}
          </div>
        )}
      </div>
    </MScreen>
  );
}
