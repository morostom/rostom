// SettingsScreen.jsx — account settings: profile summary, language, sign out.

import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import { useNav } from '../navigation/nav';
import { useToast } from '../components/Toast';
import { hasBackend } from '../lib/supabase';
import { signOut } from '../lib/auth';
import { useT, useLang, setLang } from '../i18n';

function Row({ icon, label, value, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px',
        background: 'var(--sq-surface)', border: '1px solid var(--sq-border)', borderRadius: 13,
        color: danger ? 'var(--sq-danger)' : 'var(--sq-text)', fontFamily: 'var(--sq-body)',
      }}
    >
      <span style={{ color: danger ? 'var(--sq-danger)' : 'var(--sq-text-3)', display: 'inline-flex' }}>{icon}</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{label}</span>
      {value && <span className="sq-mono" style={{ fontSize: 12, color: 'var(--sq-text-3)' }}>{value}</span>}
      {onClick && !value && <Icons.Chevron size={15} />}
    </button>
  );
}

export default function SettingsScreen() {
  const { nav, player, account } = useNav();
  const notify = useToast();
  const t = useT();
  const lang = useLang();

  async function logout() {
    await signOut();
    nav.replaceRoot('auth');
  }
  function toggleLang() {
    const next = lang === 'ar' ? 'en' : 'ar';
    setLang(next);
    notify(next === 'ar' ? 'تم التبديل إلى العربية' : 'Switched to English');
  }

  return (
    <MScreen
      header={
        <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill>
          <span className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>{t('Settings')}</span>
        </div>
      }
    >
      <div style={{ padding: '8px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {/* account */}
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('Account')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <Row icon={<Icons.User size={16} />} label={player?.name || t('Your account')} value={account?.method === 'phone' ? '+20 ' + (account?.identifier || '') : account?.identifier || ''} />
            <Row icon={<Icons.Medal size={16} />} label={t('Player card')} value={player?.cardType === 'recreational' ? t('Recreational') : t('Competitive')} onClick={() => { nav.pop(); }} />
          </div>
        </div>

        {/* preferences */}
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('Preferences')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <Row icon={<Icons.Chat size={16} />} label={t('Language')} value={lang === 'ar' ? 'العربية' : 'English'} onClick={toggleLang} />
            <Row icon={<Icons.Bolt size={16} />} label={t('Notifications')} value={t('On')} onClick={() => notify('Notification settings')} />
          </div>
        </div>

        {/* about */}
        <div>
          <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('About')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <Row icon={<Icons.Club size={16} />} label="SERVE" value={hasBackend ? t('Connected') : t('Offline')} />
            <Row icon={<Icons.Refresh size={16} />} label={t('Version')} value="0.1" />
          </div>
        </div>

        <button className="sq-btn-ghost" style={{ padding: '14px', fontSize: 14, color: 'var(--sq-danger)', borderColor: 'color-mix(in srgb, var(--sq-danger) 35%, transparent)' }} onClick={logout}>
          {t('Log out')}
        </button>
      </div>
    </MScreen>
  );
}
