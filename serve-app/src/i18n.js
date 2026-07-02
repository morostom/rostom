// i18n.js — tiny language store for SERVE (English / Arabic) with RTL support.
//
// Keys are the English strings themselves, so any string not yet translated
// simply falls back to English — we can wrap screens incrementally without
// anything breaking. useT() returns a translator that re-renders on switch;
// setLang() flips <html dir> to rtl/ltr for Arabic.

import { useSyncExternalStore } from 'react';

const KEY = 'serve_lang';

// Arabic dictionary. English text → Arabic. Missing entries fall back to English.
const AR = {
  // ── auth ──
  "Egypt's squash": 'الإسكواش في مصر',
  'home court.': 'ملعبك الأساسي.',
  'Welcome': 'أهلاً',
  'back.': 'بعودتك.',
  'Create your account to build your player card.': 'أنشئ حسابك لبناء بطاقة اللاعب الخاصة بك.',
  'Log in to your SERVE account.': 'سجّل الدخول إلى حسابك في SERVE.',
  'Sign up': 'إنشاء حساب',
  'Log in': 'تسجيل الدخول',
  'Phone': 'الهاتف',
  'Email': 'البريد الإلكتروني',
  'Phone number': 'رقم الهاتف',
  'Email address': 'البريد الإلكتروني',
  'Password': 'كلمة المرور',
  'At least 4 characters': '4 أحرف على الأقل',
  'Create account →': 'إنشاء حساب ←',
  'Log in →': 'تسجيل الدخول ←',
  'Please wait…': 'برجاء الانتظار…',
  'Enter a valid phone number.': 'أدخل رقم هاتف صحيح.',
  'Enter a valid email address.': 'أدخل بريدًا إلكترونيًا صحيحًا.',
  'Password must be at least 4 characters.': 'كلمة المرور يجب ألا تقل عن 4 أحرف.',
  'By continuing you agree to SERVE’s terms. We’ll only use your number to secure your account.': 'بالمتابعة فإنك توافق على شروط SERVE. سنستخدم رقمك فقط لتأمين حسابك.',
  'Tip: tap Log in to jump straight into a demo profile.': 'نصيحة: اضغط تسجيل الدخول للدخول مباشرة إلى ملف تجريبي.',

  // ── who-for / parent ──
  'Step 1 of 3': 'الخطوة 1 من 3',
  'How will you': 'كيف ستستخدم',
  'use SERVE?': 'SERVE؟',
  'Make a player card for yourself or your child, or set up a parent account to track and pay for your child.': 'أنشئ بطاقة لاعب لك أو لطفلك، أو أنشئ حساب ولي أمر لمتابعة طفلك والدفع نيابةً عنه.',
  'For myself': 'لنفسي',
  'I play squash and want my own card.': 'ألعب الإسكواش وأريد بطاقتي الخاصة.',
  'For my child': 'لطفلي',
  "I'm setting up my child's player card.": 'أقوم بإعداد بطاقة اللاعب الخاصة بطفلي.',
  'Parent account': 'حساب ولي الأمر',
  "No card — track my child's sessions, book courts, and pay their transfers.": 'بدون بطاقة — تابع حصص طفلك، احجز الملاعب، وادفع طلباته.',
  'Who are you': 'من الذي',
  'looking after?': 'ترعاه؟',
  'Link your child by name. You’ll see their sessions, book courts for them, and get a phone alert when they ask you to pay.': 'اربط طفلك بالاسم. سترى حصصه، وتحجز له الملاعب، وتصلك تنبيهات على هاتفك عندما يطلب الدفع.',
  'Child’s name': 'اسم الطفل',
  'Players at your club': 'اللاعبون في ناديك',
  'Link child →': 'ربط الطفل ←',
  'Enter your child’s name.': 'أدخل اسم طفلك.',

  // ── parent home ──
  'Home': 'الرئيسية',
  'Your child': 'طفلك',
  'Book a court': 'احجز ملعبًا',
  'Turn on phone alerts': 'تفعيل تنبيهات الهاتف',
  'Get a banner + sound the moment your child asks you to pay.': 'استلم تنبيهًا وصوتًا لحظة طلب طفلك الدفع.',
  'Needs your approval': 'يحتاج موافقتك',
  'History': 'السجل',
  'Paid': 'مدفوع',
  'Declined': 'مرفوض',
  'Expired': 'منتهي',
  'Link a child': 'اربط طفلاً',
  'No child linked yet.': 'لم يتم ربط أي طفل بعد.',
  'Decline': 'رفض',
  'Phone alerts enabled': 'تم تفعيل تنبيهات الهاتف',

  // ── tabs ──
  'Profile': 'الملف',
  'My Club': 'ناديي',
  'Discover': 'استكشف',
  'Bookings': 'الحجوزات',

  // ── bookings ──
  'Nothing booked yet': 'لا توجد حجوزات بعد',
  'Find a court or session to reserve.': 'ابحث عن ملعب أو حصة للحجز.',
  'Reservations': 'الحجوزات',
  'Club sessions': 'حصص النادي',
  'Cancel': 'إلغاء',
  'Booking cancelled': 'تم إلغاء الحجز',

  // ── discover ──
  'Book a court anywhere in Egypt': 'احجز ملعبًا في أي مكان في مصر',
  'Available now': 'متاح الآن',
  'Group sessions': 'حصص جماعية',
  'Academies': 'الأكاديميات',
  'Clubs': 'الأندية',
  'Book': 'احجز',
  'Join': 'انضم',
  'members': 'أعضاء',
  'Guest passes': 'تصاريح ضيوف',

  // ── settings ──
  'Settings': 'الإعدادات',
  'Account': 'الحساب',
  'Your account': 'حسابك',
  'Player card': 'بطاقة اللاعب',
  'Competitive': 'تنافسي',
  'Recreational': 'ترفيهي',
  'Preferences': 'التفضيلات',
  'Language': 'اللغة',
  'Notifications': 'الإشعارات',
  'On': 'مُفعّل',
  'About': 'حول',
  'Connected': 'متصل',
  'Offline': 'غير متصل',
  'Version': 'الإصدار',
  'Log out': 'تسجيل الخروج',
  'English': 'الإنجليزية',
  'Arabic': 'العربية',

  // ── common ──
  'Done': 'تم',
  'Save': 'حفظ',
  'Up next': 'التالي',
  'Member': 'عضو',
};

function load() {
  try { return localStorage.getItem(KEY) === 'ar' ? 'ar' : 'en'; } catch { return 'en'; }
}

let lang = load();
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

function apply() {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }
}
apply();

export function setLang(l) {
  lang = l === 'ar' ? 'ar' : 'en';
  try { localStorage.setItem(KEY, lang); } catch { /* ignore */ }
  apply();
  emit();
}
export function getLang() { return lang; }
export function isRTL() { return lang === 'ar'; }

function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); }
export function useLang() { return useSyncExternalStore(subscribe, () => lang, () => lang); }

// translator hook — re-renders the component when the language switches
export function useT() {
  const l = useLang();
  return (s) => (l === 'ar' && AR[s]) ? AR[s] : s;
}
