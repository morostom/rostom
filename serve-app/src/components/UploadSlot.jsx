// UploadSlot.jsx — a working image upload slot. Click to choose a file; shows a
// live preview. `onChange(src)` is called with something you can put straight
// in an <img src>.
//
// Images are downscaled + compressed before they leave this component — a raw
// 4MB phone photo would bloat every client's load. PNGs stay PNG (transparency
// for crests/logos); everything else becomes JPEG.
//
// onChange fires TWICE on a successful upload, and that's deliberate: first
// with a data URL so the preview is instant and offline still works, then
// with a Supabase Storage URL once the file lands. If the upload fails or
// Storage isn't set up, the data URL is simply what gets saved — same
// behaviour as before Storage existed.

import { useRef, useState } from 'react';
import { Icons } from './Icons';
import { uploadImage } from '../lib/storage';

// canvas → { dataURL, blob }: the data URL paints now, the blob uploads.
function encode(canvas, png, cb) {
  const type = png ? 'image/png' : 'image/jpeg';
  const dataURL = png ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.82);
  if (!canvas.toBlob) return cb(dataURL, null);
  canvas.toBlob((blob) => cb(dataURL, blob), type, 0.82);
}

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
    encode(canvas, file.type === 'image/png', cb);
  };
  img.onerror = () => {
    // not decodable as an image (or blocked) — fall back to the raw file
    URL.revokeObjectURL(url);
    const reader = new FileReader();
    reader.onload = () => cb(reader.result, file);
    reader.readAsDataURL(file);
  };
  img.src = url;
}

export default function UploadSlot({ value, onChange, label = 'Upload', height = 110, radius = 14, round = false, maxDim = 1200, folder = 'org', style = {} }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  // guards against a slow first upload overwriting a newer second pick
  const pickId = useRef(0);

  function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const mine = ++pickId.current;
    compress(file, maxDim, (dataURL, blob) => {
      if (pickId.current !== mine) return;
      onChange(dataURL);           // paint immediately
      if (!blob) return;
      setBusy(true);
      uploadImage(blob, folder)
        .then((url) => { if (url && pickId.current === mine) onChange(url); })
        .finally(() => { if (pickId.current === mine) setBusy(false); });
    });
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
          {busy
            ? <span className="sq-spin" style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid rgba(14,11,10,0.3)', borderTopColor: '#0e0b0a', display: 'block' }} />
            : <Icons.Camera size={11} />}
        </span>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={pick} style={{ display: 'none' }} />
    </button>
  );
}
