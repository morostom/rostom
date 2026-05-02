// SquashTime — Auth System (localStorage-persisted, simulated)

// ── Auth Store ───────────────────────────────────────────────────────
const AUTH_KEY = 'squashtime_user';
const USERS_KEY = 'squashtime_users';

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
}
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; }
}
function setCurrentUser(user) {
  if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_KEY);
}
function updateCurrentUser(updates) {
  const user = getCurrentUser();
  if (!user) return;
  const updated = { ...user, ...updates };
  setCurrentUser(updated);
  const users = getUsers();
  if (users[user.email]) { users[user.email] = updated; saveUsers(users); }
  return updated;
}

// ── Player Auth Actions ──────────────────────────────────────────────
function authSignUp(name, email, password, profile = {}) {
  const users = getUsers();
  if (users[email.toLowerCase()]) return { error: 'An account with this email already exists.' };
  const user = {
    id: Date.now().toString(),
    name, email: email.toLowerCase(), password,
    phone: profile.phone || '',
    age: profile.age || '',
    level: profile.level || '',
    role: 'player',
    subscription: null,
    sessionsUsedThisMonth: 0,
    monthKey: new Date().toISOString().slice(0, 7),
    createdAt: new Date().toISOString(),
  };
  users[email.toLowerCase()] = user;
  saveUsers(users);
  setCurrentUser(user);
  return { user };
}

function authSignIn(email, password) {
  const users = getUsers();
  const user = users[email.toLowerCase()];
  if (!user) return { error: 'No account found with this email.' };
  if (user.password !== password) return { error: 'Incorrect password.' };
  setCurrentUser(user);
  return { user };
}

function authSignOut() { setCurrentUser(null); }

function authSetSubscription(tier) {
  return updateCurrentUser({ subscription: tier, sessionsUsedThisMonth: 0, monthKey: new Date().toISOString().slice(0, 7) });
}

function authCheckMonthReset(user) {
  const monthKey = new Date().toISOString().slice(0, 7);
  if (user.monthKey !== monthKey) {
    return updateCurrentUser({ sessionsUsedThisMonth: 0, monthKey });
  }
  return user;
}

function authIncrementSessions() {
  const user = getCurrentUser();
  if (!user) return;
  return updateCurrentUser({ sessionsUsedThisMonth: (user.sessionsUsedThisMonth || 0) + 1 });
}

// ── Coach Auth ───────────────────────────────────────────────────────
// Access codes map to coach IDs — only shared with coaches directly
const COACH_ACCESS_CODES = {
  'COACH-REDA-001':    1,
  'COACH-SHEHAB-002':  2,
  'COACH-MENNA-003':   3,
  'COACH-ROSTOM-004':  4,
  'COACH-YOUSSEF-005': 5,
  'COACH-WALID-006':   6,
  'COACH-ALAA-007':    7,
  'COACH-SAMIR-008':   8,
};

function authCoachSignIn(accessCode) {
  const coachId = COACH_ACCESS_CODES[accessCode.trim().toUpperCase()];
  if (!coachId) return { error: 'Invalid access code. Contact SquashTime administration.' };
  const coach = COACHES.find(c => c.id === coachId);
  if (!coach) return { error: 'Coach profile not found.' };
  const user = {
    id: `coach_${coachId}`,
    name: coach.name,
    email: `${coach.name.split(' ')[0].toLowerCase()}@squashtime.com`,
    role: 'coach',
    coachId,
    coachLevel: coach.level,
    subscription: 'coach',
    createdAt: new Date().toISOString(),
  };
  setCurrentUser(user);
  return { user };
}

// ── Shared Styles ────────────────────────────────────────────────────
const authInputStyle = {
  width: '100%', background: '#091209', border: '1px solid #1e2e1e',
  borderRadius: 10, padding: '13px 16px', color: '#c0d8c0',
  fontFamily: "'Quicksand',sans-serif", fontSize: 15, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
};
const authBtnStyle = {
  width: '100%', background: '#3de05a', border: 'none', borderRadius: 11,
  padding: '15px', fontFamily: "'League Spartan',sans-serif", fontWeight: 800,
  fontSize: 16, color: '#050d05', cursor: 'pointer', letterSpacing: '0.04em',
  transition: 'all 0.15s', marginTop: 4,
};

function AuthLabel({ children }) {
  return (
    <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 11, color: '#4a6850', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7 }}>
      {children}
    </div>
  );
}
function AuthError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ background: '#1a0a0a', border: '1px solid #5a1010', borderRadius: 8, padding: '10px 14px', fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#e05a5a', marginBottom: 4 }}>
      {msg}
    </div>
  );
}

// ── Sign Up Form ─────────────────────────────────────────────────────
function SignUpForm({ onSuccess, onSwitch }) {
  const [step, setStep] = React.useState(1);
  const [name, setName]   = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pw, setPw]       = React.useState('');
  const [pw2, setPw2]     = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [age, setAge]     = React.useState('');
  const [level, setLevel] = React.useState('');
  const [err, setErr]     = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const levels = ['Beginner','Intermediate','Advanced','Junior Competitive','National Level'];

  function handleStep1(e) {
    e.preventDefault(); setErr('');
    if (!name.trim()) return setErr('Please enter your name.');
    if (!email.includes('@')) return setErr('Please enter a valid email.');
    if (pw.length < 6) return setErr('Password must be at least 6 characters.');
    if (pw !== pw2) return setErr('Passwords do not match.');
    setStep(2);
  }
  function handleSubmit(e) {
    e.preventDefault(); setErr('');
    if (!age) return setErr('Please enter your age.');
    if (!level) return setErr('Please select your skill level.');
    setLoading(true);
    setTimeout(() => {
      const result = authSignUp(name.trim(), email.trim(), pw, { phone, age, level });
      setLoading(false);
      if (result.error) { setErr(result.error); setStep(1); }
      else onSuccess(result.user);
    }, 700);
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {['Account', 'Player Profile'].map((lbl, i) => (
          <div key={lbl} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', height: 3, borderRadius: 2, background: i < step ? '#3de05a' : '#1e2e1e' }} />
            <span style={{ fontFamily: "'League Spartan',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: i < step ? '#3de05a' : '#3a4e3a', textTransform: 'uppercase' }}>{lbl}</span>
          </div>
        ))}
      </div>

      <AuthError msg={err} />

      {step === 1 && (
        <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><AuthLabel>Full Name</AuthLabel><input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={authInputStyle} /></div>
          <div><AuthLabel>Email Address</AuthLabel><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={authInputStyle} /></div>
          <div><AuthLabel>Password</AuthLabel><input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Min. 6 characters" style={authInputStyle} /></div>
          <div><AuthLabel>Confirm Password</AuthLabel><input type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Repeat password" style={authInputStyle} /></div>
          <button type="submit" style={authBtnStyle}>Next: Player Profile →</button>
          <div style={{ textAlign: 'center', fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#4a6050' }}>
            Already have an account?{' '}
            <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: '#3de05a', cursor: 'pointer', fontWeight: 700, fontFamily: "'Quicksand',sans-serif", fontSize: 13 }}>Sign in</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#5a7860', marginBottom: 4 }}>
            This info pre-fills your booking forms so you never have to type it again.
          </div>
          <div><AuthLabel>Phone (optional)</AuthLabel><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" style={authInputStyle} /></div>
          <div><AuthLabel>Player Age</AuthLabel><input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 14" style={authInputStyle} /></div>
          <div>
            <AuthLabel>Skill Level</AuthLabel>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {levels.map(l => (
                <button key={l} type="button" onClick={() => setLevel(l)} style={{
                  background: level === l ? '#3de05a' : '#091209',
                  border: `1px solid ${level === l ? '#3de05a' : '#1e2e1e'}`,
                  borderRadius: 7, padding: '7px 12px', cursor: 'pointer',
                  fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 12,
                  color: level === l ? '#050d05' : '#6a8a6a', transition: 'all 0.12s',
                }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={() => setStep(1)} style={{ ...authBtnStyle, background: '#0d150d', color: '#5a7860', border: '1px solid #1e2e1e', flex: '0 0 auto', width: 'auto', padding: '15px 20px' }}>← Back</button>
            <button type="submit" disabled={loading} style={{ ...authBtnStyle, flex: 1, background: loading ? '#1e3020' : '#3de05a', color: loading ? '#3a5040' : '#050d05' }}>
              {loading ? 'Creating Account…' : 'Create Account →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Sign In Form ─────────────────────────────────────────────────────
function SignInForm({ onSuccess, onSwitch }) {
  const [email, setEmail] = React.useState('');
  const [pw, setPw]       = React.useState('');
  const [err, setErr]     = React.useState('');
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e) {
    e.preventDefault(); setErr(''); setLoading(true);
    setTimeout(() => {
      const result = authSignIn(email.trim(), pw);
      setLoading(false);
      if (result.error) setErr(result.error);
      else onSuccess(result.user);
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <AuthError msg={err} />
      <div><AuthLabel>Email Address</AuthLabel><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={authInputStyle} /></div>
      <div><AuthLabel>Password</AuthLabel><input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Your password" style={authInputStyle} /></div>
      <button type="submit" disabled={loading} style={{ ...authBtnStyle, background: loading ? '#1e3020' : '#3de05a', color: loading ? '#3a5040' : '#050d05' }}>
        {loading ? 'Signing In…' : 'Sign In →'}
      </button>
      <div style={{ textAlign: 'center', fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#4a6050' }}>
        New to SquashTime?{' '}
        <button type="button" onClick={onSwitch} style={{ background: 'none', border: 'none', color: '#3de05a', cursor: 'pointer', fontWeight: 700, fontFamily: "'Quicksand',sans-serif", fontSize: 13 }}>Create an account</button>
      </div>
    </form>
  );
}

// ── Coach Access Form ────────────────────────────────────────────────
function CoachSignInForm({ onSuccess }) {
  const [code, setCode]   = React.useState('');
  const [err, setErr]     = React.useState('');
  const [loading, setLoading] = React.useState(false);

  function handleSubmit(e) {
    e.preventDefault(); setErr(''); setLoading(true);
    setTimeout(() => {
      const result = authCoachSignIn(code);
      setLoading(false);
      if (result.error) setErr(result.error);
      else onSuccess(result.user);
    }, 700);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Info banner */}
      <div style={{ background: '#0a1a0a', border: '1px solid #1e3020', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 12, color: '#3de05a', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Coach Access</div>
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#5a7860', lineHeight: 1.6 }}>
          This portal is for SquashTime coaches only. Enter your private access code to manage your schedule and availability.
        </div>
      </div>

      <AuthError msg={err} />

      <div>
        <AuthLabel>Coach Access Code</AuthLabel>
        <input
          type="password"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="COACH-XXXX-000"
          style={{ ...authInputStyle, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          autoComplete="off"
        />
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#3a5040', marginTop: 6 }}>
          Access codes are provided directly by SquashTime administration.
        </div>
      </div>

      <button type="submit" disabled={loading || !code.trim()} style={{
        ...authBtnStyle,
        background: loading || !code.trim() ? '#1e3020' : '#3de05a',
        color: loading || !code.trim() ? '#3a5040' : '#050d05',
      }}>
        {loading ? 'Verifying…' : 'Access Coach Portal →'}
      </button>
    </form>
  );
}

// ── Auth Modal ───────────────────────────────────────────────────────
function AuthModal({ mode = 'signup', onSuccess, onClose }) {
  const [tab, setTab] = React.useState(mode === 'coach' ? 'coach' : mode);

  const tabs = [
    { id: 'signup', label: 'Sign Up' },
    { id: 'signin', label: 'Sign In' },
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#0a140a', border: '1px solid #1e3020', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 420, position: 'relative', boxShadow: '0 24px 80px #000c', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#4a6050', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 24, color: '#3de05a', letterSpacing: '-0.02em' }}>SquashTime</div>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#4a6050', marginTop: 4 }}>
            {tab === 'coach' ? 'Coach portal access' : tab === 'signup' ? 'Create your account to get started' : 'Welcome back'}
          </div>
        </div>

        {/* Player tabs */}
        {tab !== 'coach' && (
          <div style={{ display: 'flex', background: '#091209', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, background: tab === t.id ? '#3de05a' : 'transparent', border: 'none',
                borderRadius: 7, padding: '9px', fontFamily: "'League Spartan',sans-serif",
                fontWeight: 700, fontSize: 13, color: tab === t.id ? '#050d05' : '#5a7860',
                cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em',
              }}>{t.label}</button>
            ))}
          </div>
        )}

        {/* Coach tab back button */}
        {tab === 'coach' && (
          <button onClick={() => setTab('signin')} style={{ background: 'none', border: 'none', color: '#5a8060', cursor: 'pointer', fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20, padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← Back to player login
          </button>
        )}

        {/* Forms */}
        {tab === 'signup' && <SignUpForm onSuccess={onSuccess} onSwitch={() => setTab('signin')} />}
        {tab === 'signin' && <SignInForm onSuccess={onSuccess} onSwitch={() => setTab('signup')} />}
        {tab === 'coach'  && <CoachSignInForm onSuccess={onSuccess} />}

        {/* Coach portal link */}
        {tab !== 'coach' && (
          <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #182018' }}>
            <button onClick={() => setTab('coach')} style={{ background: 'none', border: 'none', fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#3a5040', cursor: 'pointer', fontWeight: 600 }}>
              Are you a coach? <span style={{ color: '#5a7860', textDecoration: 'underline' }}>Coach portal →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  getCurrentUser, setCurrentUser, authSignUp, authSignIn, authSignOut,
  authSetSubscription, authCheckMonthReset, authIncrementSessions,
  authCoachSignIn, updateCurrentUser, AuthModal,
});
