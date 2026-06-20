// SignupScreen.jsx — SERVE player sign-up: create your profile, then SERVE
// turns it into your official collectible player card.

import { useRef, useState } from 'react';
import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import PlayerCard from '../components/PlayerCard';
import { DIVISIONS, CLUBS, FAV_PLAYERS, SAMPLE_PLAYER } from '../data';

// ── field primitives (real, controlled inputs styled like the prototype) ──
function PField({ label, value, onChange, placeholder, icon, mono, type = 'text' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="sq-label">{label}</label>
      <div className="sq-field">
        {icon && <span style={{ color: 'var(--sq-text-3)' }}>{icon}</span>}
        <input
          className={'sq-input' + (mono ? ' mono' : '')}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function PSelect({ label, value, onChange, options, placeholder, icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="sq-label">{label}</label>
      <div className="sq-field">
        {icon && <span style={{ color: 'var(--sq-text-3)' }}>{icon}</span>}
        <select
          className="sq-input sq-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ color: value ? 'var(--sq-text)' : 'var(--sq-text-3)' }}
        >
          <option value="" disabled>
            {placeholder || 'Select…'}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <Icons.Chevron dir="down" size={14} />
      </div>
    </div>
  );
}

// ── phone frame shell — centers a 402px-wide screen on dark backdrop ──
function PhoneFrame({ children }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background:
          'radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--sq-gold) 9%, transparent), transparent 60%), var(--sq-bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 402,
          height: 'min(844px, 94dvh)',
          borderRadius: 44,
          overflow: 'hidden',
          background: 'var(--sq-bg)',
          border: '1px solid var(--sq-border-2)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function SignupScreen() {
  const [form, setForm] = useState(SAMPLE_PLAYER);
  const [created, setCreated] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  function pickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  }

  function handleCreate() {
    setError('');
    if (!form.name.trim()) return setError('Add your full name to build your card.');
    if (!form.age) return setError('Add your age.');
    if (!form.division) return setError('Pick your division.');
    setCreating(true);
    // brief beat so the "Creating…" state reads, then reveal the card
    setTimeout(() => {
      setCreating(false);
      setCreated(true);
    }, 650);
  }

  const canCreate = form.name.trim() && form.age && form.division;

  return (
    <PhoneFrame>
      {/* status-bar safe area */}
      <div style={{ height: 62, flexShrink: 0 }} />

      {created ? (
        // ── card-created success state ──
        <div className="sq-fade-up" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '6px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SQLogo size={20} accent />
            <span
              className="sq-chip gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              <Icons.Check size={12} /> Card created
            </span>
          </div>

          <div style={{ padding: '14px 20px 2px' }}>
            <div
              className="sq-mono"
              style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}
            >
              Your player card
            </div>
            <h1 className="sq-display" style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em' }}>
              Welcome to <span style={{ color: 'var(--sq-gold)' }}>SERVE.</span>
            </h1>
          </div>

          <div style={{ padding: '16px 26px 18px' }}>
            <PlayerCard player={form} />
          </div>

          <div style={{ padding: '0 20px 28px', display: 'flex', gap: 10 }}>
            <button className="sq-btn-ghost" style={{ padding: '13px 16px', fontSize: 13.5, flex: 1 }} onClick={() => setCreated(false)}>
              <Icons.Edit size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
              Edit card
            </button>
            <button className="sq-btn-gold serve-glow-soft" style={{ padding: '13px 16px', fontSize: 13.5, flex: 1 }}>
              <Icons.Share size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
              Share
            </button>
          </div>
        </div>
      ) : (
        // ── signup form ──
        <>
          <div style={{ padding: '6px 20px 14px', flexShrink: 0 }}>
            <SQLogo size={24} accent />
            <div
              className="sq-mono"
              style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 16 }}
            >
              New player · Junior
            </div>
            <h1 className="sq-display" style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              Build your
              <br />
              <span style={{ color: 'var(--sq-gold)' }}>player card.</span>
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--sq-text-2)', fontSize: 13.5 }}>
              Tell us about your game. This becomes your official SERVE card.
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* photo upload */}
            <div style={{ padding: '4px 20px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => fileRef.current?.click()}
                style={{ width: 92, height: 92, flexShrink: 0, position: 'relative', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
              >
                <div
                  className="serve-glow-soft"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid color-mix(in srgb, var(--sq-gold) 40%, transparent)',
                    background: 'var(--sq-surface-2)',
                  }}
                >
                  {form.photo ? (
                    <img src={form.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-text-3)' }}>
                      <Icons.User size={30} />
                    </div>
                  )}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    right: -2,
                    bottom: -2,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'var(--sq-gold)',
                    color: '#0a0a0a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid var(--sq-bg)',
                  }}
                >
                  <Icons.Camera size={14} />
                </div>
              </button>
              <div style={{ flex: 1 }}>
                <div className="sq-display" style={{ fontSize: 15, fontWeight: 600 }}>
                  Add your photo
                </div>
                <div style={{ fontSize: 12, color: 'var(--sq-text-3)', marginTop: 3, lineHeight: 1.4 }}>
                  Tap the circle to upload — this is the face of your card.
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
            </div>

            {/* fields */}
            <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <PField label="Full name" value={form.name} onChange={set('name')} placeholder="e.g. Omar Khaled" icon={<Icons.User size={15} />} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12 }}>
                <PField label="Age" value={form.age} onChange={set('age')} placeholder="14" mono type="number" />
                <PSelect label="Division" value={form.division} onChange={set('division')} options={DIVISIONS} placeholder="Select" />
              </div>
              <PSelect label="Club / academy" value={form.club} onChange={set('club')} options={CLUBS} placeholder="Select your club" icon={<Icons.Pin size={15} />} />
              <PField label="National ranking" value={form.rankLabel} onChange={set('rankLabel')} placeholder="e.g. #3 · U15 National" icon={<Icons.Medal size={15} />} />
              <PField label="Racket" value={form.racket} onChange={set('racket')} placeholder="e.g. Tecnifibre Carboflex 125" icon={<Icons.Racket size={15} />} />
              <PSelect label="Favorite player" value={form.fav} onChange={set('fav')} options={FAV_PLAYERS} placeholder="Pick a pro" icon={<Icons.Heart size={15} />} />

              {error && (
                <div
                  style={{
                    fontFamily: 'var(--sq-mono)',
                    fontSize: 12,
                    color: 'var(--sq-danger)',
                    background: 'color-mix(in srgb, var(--sq-danger) 12%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--sq-danger) 35%, transparent)',
                    borderRadius: 10,
                    padding: '10px 12px',
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* sticky CTA */}
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--sq-border)',
              background: 'rgba(7,7,7,0.95)',
              flexShrink: 0,
            }}
          >
            <button
              className="sq-btn-gold serve-glow-soft"
              style={{ padding: '15px 18px', fontSize: 14.5, width: '100%' }}
              disabled={!canCreate || creating}
              onClick={handleCreate}
            >
              {creating ? 'Creating your card…' : 'Create my card →'}
            </button>
          </div>
        </>
      )}

      {/* home-indicator safe area */}
      <div style={{ height: 20, flexShrink: 0 }} />
    </PhoneFrame>
  );
}
