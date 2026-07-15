// BuildCardScreen.jsx — step 3 of onboarding. Adapts to the chosen card type:
//   competitive  → ranking, racket, favourite player (division auto from age)
//   recreational → favourite shot, years playing
// Name starts empty; age automatically derives the division.

import { useRef, useState } from 'react';
import { Icons } from '../components/Icons';
import SQLogo from '../components/SQLogo';
import { MScreen, Pill } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { useT } from '../i18n';
import { saveCard } from '../lib/auth';
import { ACADEMIES_LIST, FAV_PLAYERS, FAV_SHOTS, YEARS_OPTIONS, RACKETS, divisionForAge } from '../data';

function PField({ label, value, onChange, placeholder, icon, mono, type = 'text' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="sq-label">{label}</label>
      <div className="sq-field">
        {icon && <span style={{ color: 'var(--sq-text-3)' }}>{icon}</span>}
        <input className={'sq-input' + (mono ? ' mono' : '')} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
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
        <select className="sq-input sq-select" value={value} onChange={(e) => onChange(e.target.value)} style={{ color: value ? 'var(--sq-text)' : 'var(--sq-text-3)' }}>
          <option value="" disabled>{placeholder || 'Select…'}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <Icons.Chevron dir="down" size={14} />
      </div>
    </div>
  );
}

// A dropdown that becomes a free-text field when "Other" is picked, so players
// can write in a value not on the list.
function SelectOrOther({ label, value, onChange, options, placeholder, icon }) {
  const [other, setOther] = useState(value && !options.includes(value));
  if (other) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label className="sq-label">{label}</label>
        <div className="sq-field">
          {icon && <span style={{ color: 'var(--sq-text-3)' }}>{icon}</span>}
          <input className="sq-input" value={value} placeholder={`Write your ${label.toLowerCase()}`} autoFocus onChange={(e) => onChange(e.target.value)} />
          <button onClick={() => { setOther(false); onChange(''); }} style={{ background: 'none', border: 0, color: 'var(--sq-text-3)', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--sq-mono)' }}>list</button>
        </div>
      </div>
    );
  }
  return (
    <PSelect
      label={label}
      value={value}
      icon={icon}
      placeholder={placeholder}
      options={options}
      onChange={(v) => { if (v === 'Other') { setOther(true); onChange(''); } else onChange(v); }}
    />
  );
}

export default function BuildCardScreen() {
  const { nav, player, setPlayer, cardType, forChild } = useNav();
  const t = useT();
  const recreational = cardType === 'recreational';
  const [form, setForm] = useState(player);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const who = forChild ? t("Your child's") : t('Your');
  const namePlaceholder = forChild ? t("Child's full name") : t('Your full name');
  const division = divisionForAge(form.age);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  function setAge(val) {
    const age = val.replace(/[^0-9]/g, '').slice(0, 2);
    setForm((f) => ({ ...f, age, division: divisionForAge(age) }));
  }

  function pickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: reader.result }));
    reader.readAsDataURL(file);
  }

  function handleCreate() {
    setError('');
    if (!form.name.trim()) return setError(t('Add a name to build the card.'));
    if (!form.age) return setError(t('Add an age.'));
    if (!form.club) return setError(t('Pick a club or academy.'));
    setCreating(true);
    const card = { ...form, division };
    saveCard(card); // persists to the player's profile when a backend is configured
    setTimeout(() => {
      setPlayer(card);
      nav.replaceRoot('profile', { justCreated: true });
    }, 450);
  }

  const canCreate = form.name.trim() && form.age && form.club;
  const accent = recreational ? 'var(--sq-blue)' : 'var(--sq-gold)';

  return (
    <MScreen
      header={
        <div style={{ padding: '6px 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Pill onClick={() => nav.pop()}>
              <Icons.Chevron dir="left" size={16} />
            </Pill>
            <SQLogo size={18} />
          </div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 14 }}>
            {t('Step 3 of 3')} · {recreational ? t('Recreational') : t('Competitive')}
          </div>
          <h1 className="sq-display" style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            {t('Build')} {who.toLowerCase()}<br /><span style={{ color: accent }}>{t('player card.')}</span>
          </h1>
        </div>
      }
      tabBar={
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--sq-border)', background: 'var(--sq-scrim)' }}>
          <button
            className="sq-btn-gold serve-glow-soft"
            style={{ padding: '15px 18px', fontSize: 14.5, width: '100%', background: canCreate ? accent : undefined }}
            disabled={!canCreate || creating}
            onClick={handleCreate}
          >
            {creating ? t('Creating your card…') : t('Create my card →')}
          </button>
        </div>
      }
    >
      {/* photo */}
      <div style={{ padding: '4px 20px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => fileRef.current?.click()} style={{ width: 88, height: 88, flexShrink: 0, position: 'relative', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
          <div className="serve-glow-soft" style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`, background: 'var(--sq-surface-2)' }}>
            {form.photo ? (
              <img src={form.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-text-3)' }}>
                <Icons.User size={28} />
              </div>
            )}
          </div>
          <div style={{ position: 'absolute', right: -2, bottom: -2, width: 28, height: 28, borderRadius: '50%', background: accent, color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--sq-bg)' }}>
            <Icons.Camera size={13} />
          </div>
        </button>
        <div style={{ flex: 1 }}>
          <div className="sq-display" style={{ fontSize: 15, fontWeight: 600 }}>{forChild ? t('Add their photo') : t('Add your photo')}</div>
          <div style={{ fontSize: 12, color: 'var(--sq-text-3)', marginTop: 3, lineHeight: 1.4 }}>{t('Tap the circle to upload — this is the face of the card.')}</div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
      </div>

      {/* fields */}
      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <PField label={forChild ? t("Child's name") : t('Full name')} value={form.name} onChange={set('name')} placeholder={namePlaceholder} icon={<Icons.User size={15} />} />

        {/* age + auto division */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 12 }}>
          <PField label={t('Age')} value={form.age} onChange={setAge} placeholder="14" mono type="number" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="sq-label">{t('Division · auto')}</label>
            <div className="sq-field" style={{ background: 'rgba(255,255,255,0.015)' }}>
              <Icons.Medal size={15} />
              <span className="sq-input" style={{ display: 'flex', alignItems: 'center', color: division ? accent : 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)' }}>
                {division || t('enter age')}
              </span>
            </div>
          </div>
        </div>

        <PSelect label={t('Club / academy')} value={form.club} onChange={set('club')} options={ACADEMIES_LIST} placeholder={t('Select a club')} icon={<Icons.Pin size={15} />} />

        {recreational ? (
          <>
            <SelectOrOther label={t('Favourite shot')} value={form.favShot} onChange={set('favShot')} options={FAV_SHOTS} placeholder={t('Pick your signature shot')} icon={<Icons.Racket size={15} />} />
            <PSelect label={t('Years playing')} value={form.yearsPlaying} onChange={set('yearsPlaying')} options={YEARS_OPTIONS} placeholder={t('How long have you played?')} icon={<Icons.Calendar size={15} />} />
            <SelectOrOther label={t('Favorite player')} value={form.fav} onChange={set('fav')} options={FAV_PLAYERS} placeholder={t('Pick a pro (or write your own)')} icon={<Icons.Heart size={15} />} />
          </>
        ) : (
          <>
            <div>
              <PField label={t('National ranking')} value={form.rankLabel} onChange={set('rankLabel')} placeholder="e.g. #3 · U17 National" icon={<Icons.Medal size={15} />} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 7, color: 'var(--sq-text-3)', fontSize: 11.5, lineHeight: 1.4 }}>
                <Icons.Lock size={12} />
                <span>{t('A SERVE team member verifies your ranking before the badge appears on your card.')}</span>
              </div>
            </div>
            <SelectOrOther label={t('Racket')} value={form.racket} onChange={set('racket')} options={RACKETS} placeholder={t('Pick your racket')} icon={<Icons.Racket size={15} />} />
            <SelectOrOther label={t('Favorite player')} value={form.fav} onChange={set('fav')} options={FAV_PLAYERS} placeholder={t('Pick a pro (or write your own)')} icon={<Icons.Heart size={15} />} />
          </>
        )}

        {error && (
          <div style={{ fontFamily: 'var(--sq-mono)', fontSize: 12, color: 'var(--sq-danger)', background: 'color-mix(in srgb, var(--sq-danger) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-danger) 35%, transparent)', borderRadius: 10, padding: '10px 12px' }}>
            {error}
          </div>
        )}
      </div>
    </MScreen>
  );
}
