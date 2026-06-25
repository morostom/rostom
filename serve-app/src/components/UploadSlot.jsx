// UploadSlot.jsx — a working image upload slot. Click to choose a file; shows a
// live preview. `value` is a data URL, `onChange(dataURL)` is called on upload.

import { useRef } from 'react';
import { Icons } from './Icons';

export default function UploadSlot({ value, onChange, label = 'Upload', height = 110, radius = 14, round = false, style = {} }) {
  const ref = useRef(null);
  function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  }
  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      style={{
        position: 'relative',
        height,
        width: round ? height : '100%',
        borderRadius: round ? '50%' : radius,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px dashed var(--sq-border-2)',
        background: 'var(--sq-surface-2)',
        padding: 0,
        display: 'block',
        ...style,
      }}
    >
      {value ? (
        <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span
          style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            color: 'var(--sq-text-3)', fontFamily: 'var(--sq-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
            background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 6px, rgba(255,255,255,0) 6px 14px)',
          }}
        >
          <Icons.Upload size={18} />
          {label}
        </span>
      )}
      {value && (
        <span style={{ position: 'absolute', right: 6, bottom: 6, width: 24, height: 24, borderRadius: '50%', background: 'var(--sq-gold)', color: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--sq-bg)' }}>
          <Icons.Camera size={11} />
        </span>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
    </button>
  );
}
