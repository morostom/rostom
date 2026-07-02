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
  'Approve': 'موافقة',
  'Pay EGP': 'ادفع',
  'Phone alerts enabled': 'تم تفعيل تنبيهات الهاتف',
  'Waiting for your child to approve': 'في انتظار موافقة طفلك',
  'Pending': 'قيد الانتظار',
  'Parent link request': 'طلب ربط ولي أمر',
  'A parent': 'ولي أمر',
  'wants to link to your account to pay for your bookings.': 'يريد الارتباط بحسابك لدفع حجوزاتك.',
  'Request declined': 'تم رفض الطلب',
  'Parent linked': 'تم ربط ولي الأمر',

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

  // ── profile home ──
  'Welcome to SERVE': 'مرحبًا بك في SERVE',
  'My player card': 'بطاقة اللاعب الخاصة بي',
  'No history yet — your past bookings will show here.': 'لا يوجد سجل بعد — ستظهر حجوزاتك السابقة هنا.',
  'Edit card': 'تعديل البطاقة',
  'Share': 'مشاركة',
  'Card link copied': 'تم نسخ رابط البطاقة',

  // ── player card ──
  'Ranking': 'التصنيف',
  'Tier': 'المستوى',
  'Since': 'منذ',
  'Club': 'النادي',
  'Racket': 'المضرب',
  'Playing for': 'يلعب لصالح',
  'Verified': 'موثّق',

  // ── my club ──
  'SQUASH SECTION': 'قسم الإسكواش',
  'Live courts': 'الملاعب المباشرة',
  'Courts right now': 'الملاعب الآن',
  'open': 'متاح',
  'Your schedule': 'جدولك',
  'Full club schedule →': 'جدول النادي الكامل ←',
  "No sessions yet. Your coach's lessons & training will appear here.": 'لا توجد حصص بعد. ستظهر دروس مدربك وتدريباتك هنا.',
  'Full schedule': 'الجدول الكامل',
  'My schedule': 'جدولي',
  'Open': 'متاح',
  'In play': 'قيد اللعب',
  'Lesson': 'حصة',
  'Booked': 'محجوز',

  // ── club bio ──
  'Club': 'النادي',
  'Enter access code': 'أدخل رمز الدخول',
  'About': 'حول',
  'Former champions': 'أبطال سابقون',
  'Head coaches': 'المدربون الرئيسيون',
  'Head Coach': 'مدرب رئيسي',
  'Established': 'تأسّس',

  // ── academy ──
  'Academy': 'الأكاديمية',
  'Available courts · today': 'الملاعب المتاحة · اليوم',
  'open booking': 'حجز مفتوح',

  // ── payment ──
  'Checkout': 'الدفع',
  'Payment method': 'طريقة الدفع',
  'Apple Pay': 'Apple Pay',
  'One tap with Face ID': 'لمسة واحدة مع Face ID',
  'Credit / Debit card': 'بطاقة ائتمان / خصم',
  'Visa · Mastercard · Meeza': 'فيزا · ماستركارد · ميزة',
  'Pay from your TELDA balance': 'ادفع من رصيد TELDA',
  'Processing payment…': 'جارٍ معالجة الدفع…',
  'Court secured': 'تم تأمين الملعب',
  'Booked!': 'تم الحجز!',
  'My bookings': 'حجوزاتي',
  'Transfer to parent': 'تحويل إلى ولي الأمر',
  'Sent to your parent': 'تم الإرسال إلى ولي أمرك',
  'They’ll get an alert on their phone to approve and pay. This court is held for 10 minutes.': 'سيصلهم تنبيه على هاتفهم للموافقة والدفع. هذا الملعب محجوز لمدة 10 دقائق.',
  'What': 'ماذا',
  'Where': 'أين',
  'When': 'متى',
  'Amount': 'المبلغ',
  'Method': 'الطريقة',

  // ── card builder ──
  'Next': 'التالي',
  'Back': 'رجوع',
  'Continue': 'متابعة',
  'Do you compete in tournaments?': 'هل تشارك في البطولات؟',
  'Yes, I compete': 'نعم، أشارك',
  'No, I play for fun': 'لا، ألعب للمتعة',
  'Full name': 'الاسم الكامل',
  'Age': 'العمر',
  'Create my card': 'أنشئ بطاقتي',

  // ── console (desktop) ──
  'Dashboard': 'لوحة التحكم',
  'Academy profile': 'ملف الأكاديمية',
  'Club profile': 'ملف النادي',
  'Court schedule': 'جدول الملاعب',
  'Schedule builder': 'منشئ الجدول',
  'Courts': 'الملاعب',
  'Coaches': 'المدربون',
  'Players': 'اللاعبون',
  'Members': 'الأعضاء',
  'Group training': 'التدريب الجماعي',
  'Payments': 'المدفوعات',
  'Revenue': 'الإيرادات',
  'Access codes': 'رموز الدخول',
  'Add coach': 'إضافة مدرب',
  'Add court': 'إضافة ملعب',
  'Remove coach': 'إزالة مدرب',
  'Save changes': 'حفظ التغييرات',
  'Section': 'القسم',
  'Manage': 'الإدارة',

  // ── admin auth ──
  'Create account': 'إنشاء حساب',
  'The management console for your club or academy.': 'وحدة تحكم إدارة النادي أو الأكاديمية.',
  'Work email': 'البريد الإلكتروني للعمل',
  'Continue →': 'متابعة ←',
  'What are you setting up?': 'ماذا تريد أن تُنشئ؟',
  'Members-only. Live court board, schedule, access codes.': 'للأعضاء فقط. لوحة ملاعب مباشرة، جدول، رموز دخول.',
  'Open booking. Courts, coaches, group training, payments.': 'حجز مفتوح. ملاعب، مدربون، تدريب جماعي، مدفوعات.',
  'Set up': 'إعداد',
  'Your name': 'اسمك',
  'Club name': 'اسم النادي',
  'Academy name': 'اسم الأكاديمية',
  'Cover photo': 'صورة الغلاف',
  'Brand colour': 'لون العلامة',
  'Go live →': 'انطلق ←',
  'Enter your name.': 'أدخل اسمك.',
  'Set up your club. This is what players will see.': 'أعدّ ناديك. هذا ما سيراه اللاعبون.',
  'Crest': 'الشعار',
  'Logo': 'الشعار',

  // ── reviews & ratings ──
  'No reviews yet': 'لا توجد تقييمات بعد',
  'Ratings & reviews': 'التقييمات والمراجعات',
  'Leave a review': 'اكتب مراجعة',
  'How was your experience?': 'كيف كانت تجربتك؟',
  'Submit review': 'إرسال المراجعة',
  'Thanks for your review': 'شكرًا على مراجعتك',
  'Anonymous': 'مجهول',
  'Be the first to review this academy.': 'كن أول من يقيّم هذه الأكاديمية.',
  'Message owner': 'راسل المالك',
  'Message coach': 'راسل المدرب',

  // ── discover filters ──
  'Sort': 'ترتيب',
  'Near me': 'الأقرب',
  'Best': 'الأعلى تقييمًا',

  // ── cancellation ──
  'Sent to your parent to approve': 'أُرسل إلى ولي أمرك للموافقة',
  'Session cancelled — club notified': 'أُلغيت الحصة — تم إخطار النادي',
  'Reason (e.g. not feeling well)': 'السبب (مثلاً: لست بخير)',
  'Under 16 — your parent must approve this cancellation.': 'أقل من ١٦ — يجب أن يوافق ولي أمرك على الإلغاء.',
  'Keep session': 'إبقاء الحصة',
  'Request cancel': 'طلب الإلغاء',
  'Confirm cancel': 'تأكيد الإلغاء',
  'Cancellation requests': 'طلبات الإلغاء',
  'Keep it': 'إبقاؤها',
  'Approve cancel': 'الموافقة على الإلغاء',
  'Kept the session': 'تم إبقاء الحصة',
  'Cancellation approved': 'تمت الموافقة على الإلغاء',
  'Undo': 'تراجع',
  'Booking cancelled': 'أُلغي الحجز',
  'Session cancelled': 'أُلغيت الحصة',
  'Your card': 'بطاقتك',
  'Feeling groovy?': 'في مزاج للعب؟',
  'Make your own card and challenge your fellow parents to a heated squash match.': 'أنشئ بطاقتك وتحدَّ زملاءك أولياء الأمور في مباراة إسكواش حامية.',

  // ── joining a club ──
  'Members only': 'للأعضاء فقط',
  'This club is members only. Enter the access code from your club to unlock live courts, your schedule, and booking.': 'هذا النادي للأعضاء فقط. أدخل رمز الدخول من ناديك لفتح الملاعب المباشرة وجدولك والحجز.',
  'Enter access code': 'أدخل رمز الدخول',
  'Access code': 'رمز الدخول',
  'Unlock club': 'فتح النادي',
  'That code is not recognised.': 'هذا الرمز غير معروف.',
  'Welcome to the club': 'أهلاً بك في النادي',
  "Clubs are private. Unlike academies, only registered members can see a club's schedule and live courts — so you'll need an access code from your club's squash office.": 'الأندية خاصة. على عكس الأكاديميات، الأعضاء المسجّلون فقط يمكنهم رؤية جدول النادي وملاعبه المباشرة — لذا ستحتاج إلى رمز دخول من مكتب الإسكواش بناديك.',
  'On SERVE': 'على SERVE',
  'CODE REQUIRED': 'الرمز مطلوب',
  'Already a member? Your squash office sends codes over WhatsApp — paste yours to unlock the club.': 'عضو بالفعل؟ يرسل مكتب الإسكواش الرموز عبر واتساب — الصق رمزك لفتح النادي.',
  'Guest passes': 'تصاريح ضيوف',

  // ── academy / club names ──
  'Ramy Ashour': 'رامي عاشور',
  'El Borolossy': 'البرلسي',
  'Cairo Squash Hub': 'مركز القاهرة للإسكواش',
  'Amir Wagih': 'أمير وجيه',
  'Shoukry Squash': 'شكري سكواش',
  'Bassem Makram': 'باسم مكرم',
  'Heliopolis SC': 'هليوبوليس',
  'Ramy Ashour Squash Academy': 'أكاديمية رامي عاشور للإسكواش',
  'El Borolossy Academy': 'أكاديمية البرلسي',
  'Amir Wagih Squash Academy': 'أكاديمية أمير وجيه للإسكواش',
  'Bassem Makram Academy': 'أكاديمية باسم مكرم',
  'Heliopolis Sporting Club': 'نادي هليوبوليس الرياضي',
  'Wadi Degla': 'وادي دجلة',
  'Black Ball': 'بلاك بول',
  'Gezira SC': 'الجزيرة',
  'Al Ahly': 'الأهلي',
  'Smouha': 'سموحة',
  'Sporting': 'سبورتنج',

  // ── session names & types ──
  'Fitness': 'لياقة',
  'Solo lesson 1': 'درس فردي ١',
  'Solo lesson 2': 'درس فردي ٢',
  'Solo lesson 3': 'درس فردي ٣',
  'U17 Squad': 'فريق تحت ١٧',
  'U11 Beginners': 'مبتدئون تحت ١١',
  'Elite Squad': 'فريق النخبة',
  'Strength & movement': 'قوة وحركة',
  'courts': 'ملاعب',
  'book': 'احجز',
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
