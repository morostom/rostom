// BranchesPanel.jsx — branch (location) management shared by both consoles.
// List, add, inline-rename/relocate, and remove branches for one org; each
// branch carries its own live board + schedule keyed by its id.

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../components/Icons';
import { useToast } from '../components/Toast';
import { DUR_FAST } from '../motion';
import { useStore, store } from '../store';
import { useT } from '../i18n';

export default function BranchesPanel({ orgId, Topbar }) {
  const t = useT();
  const notify = useToast();
  const state = useStore();
  const list = state.branches.filter((b) => b.org_id === orgId);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [courts, setCourts] = useState('6');
  const fieldCss = { padding: '10px 12px', border: '1px solid var(--sq-border-2)', borderRadius: 8, background: 'rgba(255,255,255,0.02)', fontSize: 13.5, color: 'var(--sq-text)', outline: 'none', width: '100%', fontFamily: 'var(--sq-body)' };
  const Label = ({ children }) => <label className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>{children}</label>;

  function submit() {
    if (!name.trim()) return notify('Enter a branch name');
    store.addBranch(orgId, { name, location, courts });
    notify(`Added ${name.trim()}`);
    setName(''); setLocation(''); setCourts('6'); setAdding(false);
  }

  return (
    <>
      <Topbar title={t('Branches')} sub={t('Each location has its own live board & schedule')} trailing={
        <button className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 12.5 }} onClick={() => setAdding((v) => !v)}><Icons.Plus size={14} /> {t('Add branch')}</button>
      } />
      <div style={{ padding: '24px 30px 40px', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 760 }}>
        <AnimatePresence>
          {adding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: DUR_FAST }} style={{ overflow: 'hidden' }}>
              <div className="sq-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h2 className="sq-display" style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>New branch</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
                  <div><Label>{t('Branch name')}</Label><input autoFocus style={fieldCss} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New Cairo" /></div>
                  <div><Label>{t('Courts')}</Label><input style={fieldCss} type="number" min="0" max="40" value={courts} onChange={(e) => setCourts(e.target.value)} /></div>
                </div>
                <div><Label>{t('Location')}</Label><input style={fieldCss} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. New Cairo · Cairo" /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="sq-btn-gold" style={{ padding: '10px 18px', fontSize: 13 }} onClick={submit}>{t('Add branch')}</button>
                  <button className="sq-btn-ghost" style={{ padding: '10px 16px', fontSize: 13 }} onClick={() => setAdding(false)}>Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {list.map((b) => {
          const courtCount = state.courts.filter((c) => c.branch === b.id).length;
          return (
            <div key={b.id} className="sq-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.Pin size={20} /></div>
                <div style={{ flex: 1 }}>
                  <input className="sq-display" defaultValue={b.name} onBlur={(e) => { if (e.target.value.trim() && e.target.value !== b.name) { store.setBranchInfo(b.id, { name: e.target.value.trim() }); notify(t('Branch updated')); } }}
                    style={{ fontSize: 16, fontWeight: 700, background: 'none', border: 0, color: 'var(--sq-text)', outline: 'none', width: '100%', padding: 0 }} />
                  <input defaultValue={b.location} placeholder={t('Location')} onBlur={(e) => { if (e.target.value !== b.location) { store.setBranchInfo(b.id, { location: e.target.value }); notify(t('Branch updated')); } }}
                    className="sq-mono" style={{ fontSize: 11.5, background: 'none', border: 0, color: 'var(--sq-text-3)', outline: 'none', width: '100%', padding: '2px 0 0' }} />
                </div>
                <span className="sq-chip gold" style={{ fontSize: 11 }}>{courtCount} courts</span>
              </div>
              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--sq-border)', paddingTop: 10 }}>
                {list.length > 1 && <button className="sq-btn-ghost" style={{ padding: '8px 12px', fontSize: 12, color: 'var(--sq-text-3)' }} onClick={() => { store.removeBranch(b.id); notify(`${t('Removed')} ${b.name}`); }}>{t('Remove branch')}</button>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
