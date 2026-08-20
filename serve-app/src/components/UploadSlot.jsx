// UploadSlot.jsx — a working image upload slot. Click to choose a file; shows a
// live preview. `value` is a data URL, `onChange(dataURL)` is called on upload.
//
// Images are downscaled + compressed before they leave this component — these
// data URLs are stored in DB rows and hydrated to every client, so a raw
// 4MB phone photo would bloat everyone's load. PNGs stay PNG (transparency
// for crests/logos); everything else becomes JPEG.

import { useRef } from 'react';
import { Icons } from './Icons';

function compress(file, maxDim, cb) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    const png = file.type === 'image/png';
    cb(png ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.82));
  };
  img.onerror = () => {
    // not decodable as an image (or blocked) — fall back to the raw file
    URL.revokeObjectURL(url);
    const reader = new FileReader();
    reader.onload = () => cb(reader.result);
    reader.readAsDataURL(file);
  };
  img.src = url;
}

export default function UploadSlot({ value, onChange, label = 'Upload', height = 110, radius = 14, round = false, maxDim = 1200, style = {} }) {
  const ref = useRef(null);
  function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    compress(file, maxDim, onChange);
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
        <span style={{ position: 'absolute', right: 6, bottom: 6, width: 24, height: 24, borderRadius: '50%', background: 'var(--sq-gold)', color: '#0e0b0a', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--sq-bg)' }}>
          <Icons.Camera size={11} />
        </span>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
    </button>
  );
}
