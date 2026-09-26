// LandingPage.jsx — serve.eg, the page that explains what SERVE is and sends
// you to the app.
//
// Bilingual, because half the people who will read this read Arabic first,
// and a landing page for Egypt that is English-only is making a statement it
// does not mean to make. Content lives in one object with both languages
// side by side, so neither can silently drift from the other.
//
// It reuses the app's design tokens, so the page and the product look like
// one thing rather than a marketing site bolted onto a different product.

import { useEffect, useState } from 'react';
import SQLogo from '../components/SQLogo';
import { Icons } from '../components/Icons';

// Where "Open the app" goes. The export script drops the player build into
// ./app/ next to this page, so the default works with no configuration —
// drag netlify/serve-landing onto Netlify and both are live. Point it at a
// separate domain here if you host the app somewhere else.
const APP_URL = './app/';

const C = {
  en: {
    dir: 'ltr',
    nav: { app: 'Open the app', venues: 'For clubs & academies' },
    heroTitle: ['Egypt’s squash', 'home court.'],
    heroBody:
      'Find a court, see who’s playing, follow your club’s schedule, and keep the player card that says who you are on court. One place, for the sport Egypt already owns.',
    cta: 'Open the app',
    ctaNote: 'Free. Works in your browser — no app store.',
    whyEyebrow: 'Why SERVE exists',
    whyTitle: 'Egypt runs world squash. It shouldn’t run on WhatsApp.',
    why: [
      'We produce the best players on earth and then organise it all by hand. Booking a court means messaging the office and waiting. Training schedules live in a coordinator’s head, or a photo of a printed sheet in a group chat.',
      'Parents find out their child’s session moved when their child tells them. A junior who wants a hit on Friday morning has to ring around to learn which courts are even free.',
      'None of that is a squash problem. It is an admin problem, and it is the reason a club with seven courts can have three sitting empty while four people are looking for one.',
      'SERVE is the missing layer: live courts, published schedules, and a player card that travels with you — built for how Egyptian clubs and academies actually work, in both languages, on the phone already in your pocket.',
    ],
    forPlayersEyebrow: 'For players',
    forPlayers: [
      { icon: 'Court', title: 'See every free court, right now', body: 'A live board for each club and academy near you, updated as courts fill and empty.' },
      { icon: 'Calendar', title: 'Your training, not a group chat', body: 'Your squad, your coach and your times — published by the venue, always current.' },
      { icon: 'Medal', title: 'A player card that means something', body: 'Your division, your national ranking, your level. It follows you between clubs.' },
      { icon: 'Bolt', title: 'First call on a cancellation', body: 'When a session is called off, the court goes to the people it was offered to — and your phone tells you.' },
      { icon: 'ParentChild', title: 'Parents in the loop', body: 'Link to your child’s account, see their sessions, and approve what needs approving.' },
      { icon: 'Pin', title: 'A real map', body: 'Every club and academy on one map, sorted by what’s actually close to you.' },
    ],
    forVenuesEyebrow: 'For clubs & academies',
    forVenuesTitle: 'A digital home for your squash section.',
    forVenuesBody:
      'A page your members actually use, a live court board, a schedule you publish once, and a roster that stays current. Clubs and academies get the same console — the words change, the tools do not.',
    forVenues: [
      'Your own page, your own colours, your own branches',
      'A live board your coordinator updates in a tap',
      'Build a week’s schedule in one pass, or import a PDF',
      'Offer a cancelled slot to the coach, the squad, or everyone',
      'Access codes, so your section stays yours',
      'Arabic throughout',
    ],
    venuesCta: 'Talk to us about your venue',
    installTitle: 'Put it on your home screen',
    installBody:
      'SERVE runs in the browser, so there is nothing to install from a store. On iPhone, open it in Safari, tap Share, then “Add to Home Screen” — that is also what lets notifications reach you when the app is closed. On Android, tap the menu and “Install app”.',
    footNote: 'Built in Cairo for Egyptian squash.',
    legal: 'Terms & Privacy',
  },
  ar: {
    dir: 'rtl',
    nav: { app: 'افتح التطبيق', venues: 'للأندية والأكاديميات' },
    heroTitle: ['الإسكواش في مصر', 'ملعبك الأساسي.'],
    heroBody:
      'احجز ملعبًا، شاهد من يلعب الآن، تابع جدول ناديك، واحتفظ ببطاقة اللاعب التي تعرّف بك داخل الملعب. مكان واحد، للرياضة التي تتصدّرها مصر بالفعل.',
    cta: 'افتح التطبيق',
    ctaNote: 'مجانًا. يعمل من المتصفح — بدون متجر تطبيقات.',
    whyEyebrow: 'لماذا SERVE',
    whyTitle: 'مصر تتصدّر الإسكواش عالميًا. لا يصح أن تُدار عبر واتساب.',
    why: [
      'نُخرِّج أفضل لاعبي العالم ثم ننظّم كل شيء يدويًا. حجز ملعب يعني رسالة للإدارة وانتظار الرد. وجداول التدريب محفوظة في ذهن المنسّق، أو صورة لورقة مطبوعة في مجموعة دردشة.',
      'يعرف الأهل بتغيير موعد ابنهم من الابن نفسه. ومن يريد اللعب صباح الجمعة عليه الاتصال بعدة أماكن ليعرف أي ملعب متاح أصلًا.',
      'لا شيء من هذا مشكلة في الإسكواش. إنها مشكلة تنظيم، وهي السبب في أن ناديًا بسبعة ملاعب قد تكون ثلاثة منها فارغة بينما يبحث أربعة أشخاص عن ملعب.',
      'SERVE هي الطبقة الناقصة: ملاعب مباشرة، وجداول منشورة، وبطاقة لاعب ترافقك — مبنية على طريقة عمل الأندية والأكاديميات المصرية فعليًا، باللغتين، على الهاتف الذي معك بالفعل.',
    ],
    forPlayersEyebrow: 'للاعبين',
    forPlayers: [
      { icon: 'Court', title: 'كل ملعب متاح، الآن', body: 'لوحة مباشرة لكل نادٍ وأكاديمية بالقرب منك، تتحدث مع امتلاء الملاعب وخلوّها.' },
      { icon: 'Calendar', title: 'تدريبك، وليس مجموعة دردشة', body: 'فريقك ومدربك ومواعيدك — ينشرها النادي وتبقى محدّثة دائمًا.' },
      { icon: 'Medal', title: 'بطاقة لاعب لها معنى', body: 'فئتك وتصنيفك القومي ومستواك. ترافقك بين الأندية.' },
      { icon: 'Bolt', title: 'الأولوية عند الإلغاء', body: 'عند إلغاء حصة، يذهب الملعب لمن عُرض عليهم — ويصلك إشعار على هاتفك.' },
      { icon: 'ParentChild', title: 'الأهل على اطلاع', body: 'اربط حسابك بحساب ابنك، تابع حصصه، ووافق على ما يحتاج موافقة.' },
      { icon: 'Pin', title: 'خريطة حقيقية', body: 'كل نادٍ وأكاديمية على خريطة واحدة، مرتّبة حسب الأقرب إليك فعلًا.' },
    ],
    forVenuesEyebrow: 'للأندية والأكاديميات',
    forVenuesTitle: 'بيت رقمي لقسم الإسكواش لديك.',
    forVenuesBody:
      'صفحة يستخدمها أعضاؤك فعلًا، ولوحة ملاعب مباشرة، وجدول تنشره مرة واحدة، وقائمة لاعبين تبقى محدّثة. الأندية والأكاديميات تحصل على نفس لوحة التحكم — تتغير الكلمات فقط، لا الأدوات.',
    forVenues: [
      'صفحتك بألوانك وفروعك',
      'لوحة مباشرة يحدّثها منسّقك بضغطة',
      'ابنِ جدول أسبوع كامل دفعة واحدة، أو استورد ملف PDF',
      'اعرض الموعد الملغى على المدرب أو الفريق أو الجميع',
      'رموز دخول، ليبقى قسمك لأعضائه',
      'اللغة العربية في كل مكان',
    ],
    venuesCta: 'تحدّث معنا عن ناديك',
    installTitle: 'ضعه على شاشتك الرئيسية',
    installBody:
      'يعمل SERVE من المتصفح، فلا شيء لتثبيته من المتجر. على الآيفون، افتحه في Safari ثم اضغط مشاركة و«إضافة إلى الشاشة الرئيسية» — وهذا أيضًا ما يسمح للإشعارات بالوصول إليك والتطبيق مغلق. على أندرويد، افتح القائمة واضغط «تثبيت التطبيق».',
    footNote: 'صُنع في القاهرة لإسكواش مصر.',
    legal: 'الشروط والخصوصية',
  },
};

const MAX = 1080;

function Section({ children, style = {} }) {
  return (
    <section style={{ padding: '0 24px', ...style }}>
      <div style={{ maxWidth: MAX, margin: '0 auto' }}>{children}</div>
    </section>
  );
}

const Eyebrow = ({ children }) => (
  <div className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-gold)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 14 }}>
    {children}
  </div>
);

export default function LandingPage() {
  // Arabic first for anyone whose browser says so — this is an Egyptian
  // product, not an English one with a translation bolted on.
  const [lang, setLang] = useState(() => {
    try {
      if (localStorage.getItem('serve_lang') === 'ar') return 'ar';
      if (localStorage.getItem('serve_lang') === 'en') return 'en';
    } catch { /* private mode */ }
    return typeof navigator !== 'undefined' && /^ar\b/i.test(navigator.language || '') ? 'ar' : 'en';
  });
  const c = C[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = c.dir;
    try { localStorage.setItem('serve_lang', lang); } catch { /* ignore */ }
  }, [lang, c.dir]);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--sq-bg)', color: 'var(--sq-text)' }}>
      {/* top bar */}
      <header style={{ borderBottom: '1px solid var(--sq-border)', position: 'sticky', top: 0, zIndex: 10, background: 'var(--sq-scrim)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div style={{ maxWidth: MAX, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <SQLogo size={20} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="sq-btn-ghost"
              style={{ padding: '8px 13px', fontSize: 12.5, cursor: 'pointer' }}
            >
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
            <a href={APP_URL} className="sq-btn-gold" style={{ padding: '9px 16px', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              {c.nav.app} <Icons.ArrowRight size={14} />
            </a>
          </div>
        </div>
      </header>

      {/* hero */}
      <Section style={{ padding: '72px 24px 64px' }}>
        <div style={{ display: 'grid', gap: 40, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'center' }}>
          <div>
            {/* Arabic glyphs are taller than Latin ones, so the 1.02 that
                makes the English headline sit tight makes the Arabic lines
                collide. Loosen it, and drop the negative tracking, which
                Arabic does not want at all. */}
            <h1 className="sq-display" style={{ margin: 0, fontSize: 'clamp(36px, 6.6vw, 68px)', fontWeight: 800, letterSpacing: lang === 'ar' ? '0' : '-0.045em', lineHeight: lang === 'ar' ? 1.35 : 1.02 }}>
              {c.heroTitle[0]}
              <br />
              <span style={{ color: 'var(--sq-gold)' }}>{c.heroTitle[1]}</span>
            </h1>
            <p style={{ margin: '22px 0 0', fontSize: 17, color: 'var(--sq-text-2)', lineHeight: 1.6, maxWidth: 520, textWrap: 'pretty' }}>
              {c.heroBody}
            </p>
            <div style={{ marginTop: 30, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <a href={APP_URL} className="sq-btn-gold serve-glow-soft" style={{ padding: '15px 26px', fontSize: 15.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                {c.cta} <Icons.ArrowRight size={16} />
              </a>
              <span className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-3)' }}>{c.ctaNote}</span>
            </div>
          </div>

          {/* a phone-shaped suggestion of the app, drawn rather than screenshotted
              so it can never go stale against the real product */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 268, borderRadius: 34, padding: 11, background: 'var(--sq-surface-2)', border: '1px solid var(--sq-border-2)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
              {/* .sq-star-field is a CSS mask, so it masks its CHILDREN too —
                  it has to be a sibling layer behind the content, never a
                  wrapper around it. */}
              <div style={{ borderRadius: 25, height: 470, position: 'relative', overflow: 'hidden', background: 'var(--sq-surface)', border: '1px solid var(--sq-border)' }}>
                <div className="sq-star-field" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
                <div style={{ position: 'absolute', inset: 0, padding: 18, display: 'flex', flexDirection: 'column', gap: 11 }}>
                  <SQLogo size={15} />
                  <div className="sq-mono" style={{ fontSize: 9, color: 'var(--sq-text-3)', letterSpacing: '0.16em', marginTop: 4 }}>
                    {lang === 'ar' ? 'الملاعب الآن' : 'COURTS RIGHT NOW'}
                  </div>
                  {[
                    { n: 1, s: lang === 'ar' ? 'حصة' : 'Lesson', free: false },
                    { n: 2, s: lang === 'ar' ? 'متاح' : 'Available', free: true },
                    { n: 3, s: lang === 'ar' ? 'قيد اللعب' : 'In play', free: false },
                    { n: 4, s: lang === 'ar' ? 'متاح' : 'Available', free: true },
                  ].map((r) => (
                    <div key={r.n} style={{
                      padding: '11px 13px', borderRadius: 12,
                      background: r.free ? 'var(--sq-surface-2)' : 'linear-gradient(140deg, color-mix(in srgb, var(--sq-gold) 13%, var(--sq-surface-2)), var(--sq-surface-2) 70%)',
                      border: '1px solid ' + (r.free ? 'color-mix(in srgb, var(--sq-gold) 22%, transparent)' : 'color-mix(in srgb, var(--sq-gold) 30%, transparent)'),
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span className="sq-mono" style={{ fontSize: 10, color: 'var(--sq-text-3)' }}>
                        {lang === 'ar' ? 'ملعب' : 'COURT'} {r.n}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: r.free ? 'var(--sq-green)' : 'var(--sq-gold)' }}>{r.s}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 'auto', padding: '12px', borderRadius: 12, textAlign: 'center', background: 'var(--sq-gold)', color: '#0e0b0a', fontWeight: 700, fontSize: 13 }}>
                    {lang === 'ar' ? 'احجز ملعبًا' : 'Book a court'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* why */}
      <Section style={{ padding: '58px 24px', borderTop: '1px solid var(--sq-border)', background: 'var(--sq-surface)' }}>
        <Eyebrow>{c.whyEyebrow}</Eyebrow>
        <h2 className="sq-display" style={{ margin: 0, fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, letterSpacing: lang === 'ar' ? '0' : '-0.035em', lineHeight: lang === 'ar' ? 1.5 : 1.15, maxWidth: 760 }}>
          {c.whyTitle}
        </h2>
        <div style={{ marginTop: 26, display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {c.why.map((para, i) => (
            <p key={i} style={{ margin: 0, fontSize: 15, color: 'var(--sq-text-2)', lineHeight: 1.7, textWrap: 'pretty' }}>{para}</p>
          ))}
        </div>
      </Section>

      {/* for players */}
      <Section style={{ padding: '58px 24px' }}>
        <Eyebrow>{c.forPlayersEyebrow}</Eyebrow>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))' }}>
          {c.forPlayers.map((f) => {
            const Ic = Icons[f.icon] || Icons.Bolt;
            return (
              <div key={f.title} className="sq-card" style={{ padding: 20, borderRadius: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 13 }}>
                  <Ic size={19} />
                </div>
                <h3 className="sq-display" style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>{f.title}</h3>
                <p style={{ margin: '7px 0 0', fontSize: 13.5, color: 'var(--sq-text-2)', lineHeight: 1.6 }}>{f.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* for venues */}
      <Section style={{ padding: '58px 24px', borderTop: '1px solid var(--sq-border)', background: 'var(--sq-surface)' }}>
        <div style={{ display: 'grid', gap: 36, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', alignItems: 'start' }}>
          <div>
            <Eyebrow>{c.forVenuesEyebrow}</Eyebrow>
            <h2 className="sq-display" style={{ margin: 0, fontSize: 'clamp(24px, 3.4vw, 33px)', fontWeight: 800, letterSpacing: lang === 'ar' ? '0' : '-0.035em', lineHeight: lang === 'ar' ? 1.5 : 1.18 }}>
              {c.forVenuesTitle}
            </h2>
            <p style={{ margin: '16px 0 0', fontSize: 15, color: 'var(--sq-text-2)', lineHeight: 1.65, textWrap: 'pretty' }}>{c.forVenuesBody}</p>
            <a href={APP_URL} className="sq-btn-ghost" style={{ marginTop: 22, padding: '12px 20px', fontSize: 13.5, textDecoration: 'none', color: 'var(--sq-text)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {c.venuesCta} <Icons.ArrowRight size={14} />
            </a>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
            {c.forVenues.map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, fontSize: 14.5, color: 'var(--sq-text-2)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--sq-green)', flexShrink: 0, marginTop: 2 }}><Icons.Check size={15} /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* install */}
      <Section style={{ padding: '58px 24px' }}>
        <div className="sq-card" style={{ padding: 28, borderRadius: 18, borderColor: 'color-mix(in srgb, var(--sq-gold) 28%, transparent)' }}>
          <h3 className="sq-display" style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{c.installTitle}</h3>
          <p style={{ margin: '10px 0 0', fontSize: 14.5, color: 'var(--sq-text-2)', lineHeight: 1.65, maxWidth: 720, textWrap: 'pretty' }}>{c.installBody}</p>
          <a href={APP_URL} className="sq-btn-gold" style={{ marginTop: 20, padding: '13px 24px', fontSize: 14.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {c.cta} <Icons.ArrowRight size={15} />
          </a>
        </div>
      </Section>

      {/* foot */}
      <footer style={{ borderTop: '1px solid var(--sq-border)', padding: '26px 24px 40px' }}>
        <div style={{ maxWidth: MAX, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <SQLogo size={16} />
          <span className="sq-mono" style={{ fontSize: 11, color: 'var(--sq-text-3)' }}>{c.footNote}</span>
          <a href={`${APP_URL}#legal`} style={{ fontSize: 12.5, color: 'var(--sq-text-3)' }}>{c.legal}</a>
        </div>
      </footer>
    </div>
  );
}
