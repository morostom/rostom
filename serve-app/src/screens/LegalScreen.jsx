// LegalScreen.jsx — the terms and privacy policy, in the app.
//
// The signup screen has always said "By continuing you agree to SERVE's
// terms". Until now those terms did not exist anywhere a user could read
// them, which is a worse position than having no notice at all. The
// documents live in docs/legal/ and are inlined at build time, so they ship
// inside the single-file export with no network fetch and no 404.
//
// The renderer below handles only the Markdown the two documents actually
// use — headings, bullets, tables, bold, and the bracketed [DECISION NEEDED]
// placeholders. It is not a general Markdown engine and does not need to be.

import { useState } from 'react';
import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { useT } from '../i18n';
import termsMd from '../../docs/legal/terms.md?raw';
import privacyMd from '../../docs/legal/privacy.md?raw';

const H = { 1: 22, 2: 17, 3: 14.5 };

// **bold** → <strong>, everything else stays text. Split rather than replace
// so nothing is ever interpreted as HTML.
function inline(text, key) {
  const parts = String(text).split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) => (i % 2
    ? <strong key={`${key}-${i}`} style={{ color: 'var(--sq-text)', fontWeight: 600 }}>{p}</strong>
    : <span key={`${key}-${i}`}>{p}</span>));
}

function Markdown({ src }) {
  const lines = src.split('\n');
  const out = [];
  let i = 0;
  let k = 0;

  while (i < lines.length) {
    const line = lines[i];

    // table: a header row followed by a |---| separator
    if (line.startsWith('|') && (lines[i + 1] || '').includes('---')) {
      const rows = [];
      const head = line.split('|').slice(1, -1).map((c) => c.trim());
      i += 2;
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim()));
        i++;
      }
      out.push(
        <div key={k++} style={{ overflowX: 'auto', margin: '10px 0 16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>{head.map((h, n) => (
                <th key={n} className="sq-mono" style={{ textAlign: 'start', padding: '7px 9px', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--sq-text-3)', borderBottom: '1px solid var(--sq-border-2)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>{rows.map((r, n) => (
              <tr key={n}>{r.map((c, m) => (
                <td key={m} style={{ padding: '8px 9px', color: 'var(--sq-text-2)', borderBottom: '1px solid var(--sq-border)', lineHeight: 1.45, verticalAlign: 'top' }}>{inline(c, `${n}-${m}`)}</td>
              ))}</tr>
            ))}</tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (line.startsWith('#')) {
      const level = Math.min(3, (line.match(/^#+/) || ['#'])[0].length);
      out.push(
        <h2 key={k++} className="sq-display" style={{ fontSize: H[level], fontWeight: 700, letterSpacing: '-0.02em', margin: level === 1 ? '4px 0 10px' : '22px 0 8px', lineHeight: 1.2 }}>
          {inline(line.replace(/^#+\s*/, ''), k)}
        </h2>,
      );
      i++; continue;
    }

    if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, '')); i++;
      }
      out.push(
        <ul key={k++} style={{ margin: '4px 0 14px', paddingInlineStart: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((it, n) => (
            <li key={n} style={{ fontSize: 13.5, color: 'var(--sq-text-2)', lineHeight: 1.55 }}>{inline(it, n)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // a draft placeholder — flagged rather than quietly rendered as prose
    if (/^\*\[.*\]\*$/.test(line.trim())) {
      out.push(
        <div key={k++} className="sq-card" style={{ padding: '11px 13px', margin: '6px 0 14px', borderColor: 'color-mix(in srgb, var(--sq-gold) 30%, transparent)', fontSize: 12.5, color: 'var(--sq-text-2)', lineHeight: 1.5, display: 'flex', gap: 9 }}>
          <Icons.Bolt size={14} style={{ color: 'var(--sq-gold)', flexShrink: 0, marginTop: 2 }} />
          <span>{line.trim().replace(/^\*\[|\]\*$/g, '')}</span>
        </div>,
      );
      i++; continue;
    }

    if (line.trim() === '' || line.trim() === '---') { i++; continue; }

    // The source files are hard-wrapped at ~78 characters. Rendering each
    // wrapped line as its own paragraph breaks sentences mid-clause, so
    // gather the run of plain lines and join them back into one.
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      lines[i].trim() !== '---' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('|') &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\*\[.*\]\*$/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim()); i++;
    }
    out.push(
      <p key={k++} style={{ margin: '0 0 12px', fontSize: 13.5, color: 'var(--sq-text-2)', lineHeight: 1.6 }}>
        {inline(para.join(' '), k)}
      </p>,
    );
  }
  return <>{out}</>;
}

export default function LegalScreen({ doc = 'terms' }) {
  const { nav } = useNav();
  const t = useT();
  const [tab, setTab] = useState(doc === 'privacy' ? 'privacy' : 'terms');

  return (
    <MScreen
      header={
        <div style={{ padding: '6px 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill>
            <span className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>{t('Legal')}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['terms', 'Terms of Use'], ['privacy', 'Privacy Policy']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={'sq-chip' + (tab === id ? ' gold' : '')}
                style={{ cursor: 'pointer', padding: '8px 13px', fontSize: 12 }}>
                {t(label)}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <div style={{ padding: '6px 20px 32px' }}>
        <div className="sq-card" style={{ padding: '12px 14px', marginBottom: 18, fontSize: 12.5, color: 'var(--sq-text-2)', lineHeight: 1.5, borderColor: 'color-mix(in srgb, var(--sq-gold) 28%, transparent)' }}>
          {t('Draft — these documents are being reviewed and are not final.')}
        </div>
        <Markdown src={tab === 'privacy' ? privacyMd : termsMd} />
      </div>
    </MScreen>
  );
}
