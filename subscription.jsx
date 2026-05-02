// SquashTime — Subscription Tiers + Account Dashboard

const PLANS = {
  free: {
    id: 'free', name: 'Basic', price: 0, color: '#4a9a5a', border: '#1e3a28',
    caveats: 'Unlimited sessions. Senior coach guaranteed 5x/month.',
    features: ['Unlimited sessions per month','5 guaranteed Senior coach sessions/month','Remaining sessions: mix of Junior & Senior coaches (randomly assigned)','Standard Zoom link delivery','No access to Fitness coaching'],
    limits: { seniorPerMonth: 5 },
  },
  premium: {
    id: 'premium', name: 'Premium', price: 9.99, color: '#3de05a', border: '#3de05a',
    badge: 'Most Popular',
    caveats: 'Full control — pick your coach every time.',
    features: ['Unlimited sessions per month','Choose your preferred coach every session','Access to Fitness coaching (first-come, first-served)','Priority Zoom scheduling','Tournament + Personal session types'],
    limits: null,
  },
};

const authInputStyle = {
  width: '100%', background: '#091209', border: '1px solid #1e2e1e',
  borderRadius: 10, padding: '12px 14px', color: '#c0d8c0',
  fontFamily: "'Quicksand',sans-serif", fontSize: 14, outline: 'none',
  boxSizing: 'border-box',
};

function PremiumPaymentForm() {
  const [card, setCard] = React.useState({ number: '', name: '', expiry: '', cvv: '' });
  const fmt = v => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExp = v => { const d=v.replace(/\D/g,'').slice(0,4); return d.length>2?d.slice(0,2)+'/'+d.slice(2):d; };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input placeholder="Card number" value={card.number} onChange={e => setCard({...card,number:fmt(e.target.value)})} style={authInputStyle} />
      <input placeholder="Cardholder name" value={card.name} onChange={e => setCard({...card,name:e.target.value})} style={authInputStyle} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <input placeholder="MM/YY" value={card.expiry} onChange={e => setCard({...card,expiry:fmtExp(e.target.value)})} style={authInputStyle} />
        <input placeholder="CVV" value={card.cvv} maxLength={4} onChange={e => setCard({...card,cvv:e.target.value.replace(/\D/g,'').slice(0,4)})} style={authInputStyle} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {['PayPal','Venmo'].map(m => (
          <button key={m} type="button" style={{ flex:1, background:'#091209', border:'1px solid #1e2e1e', borderRadius:8, padding:'10px', fontFamily:"'Quicksand',sans-serif", fontWeight:700, fontSize:12, color:'#5a7860', cursor:'pointer' }}>{m}</button>
        ))}
      </div>
    </div>
  );
}

function SubscriptionPage({ user, onChoose }) {
  const [selected, setSelected] = React.useState('premium');
  const [processing, setProcessing] = React.useState(false);

  function handleChoose() {
    setProcessing(true);
    setTimeout(() => {
      const updated = authSetSubscription(selected);
      setProcessing(false);
      onChoose(updated, selected);
    }, 1200);
  }

  if (processing) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid #1e3020', borderTop: '4px solid #3de05a', animation: 'spin 0.8s linear infinite', margin: '0 auto 24px' }} />
      <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 22, color: '#d0e8d0', marginBottom: 8 }}>Setting up your plan…</div>
      <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 14, color: '#4a6050' }}>Just a moment</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 'clamp(28px,5vw,44px)', color: '#e8f4e8', letterSpacing: '-0.02em', marginBottom: 10 }}>
          Welcome, {user.name.split(' ')[0]}!
        </div>
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 16, color: '#5a7860' }}>Choose your coaching plan. Upgrade anytime.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20, marginBottom: 28 }}>
        {Object.values(PLANS).map(plan => {
          const sel = selected === plan.id;
          return (
            <div key={plan.id} onClick={() => setSelected(plan.id)} style={{
              background: sel ? '#0a1e10' : '#0d150d',
              border: `2px solid ${sel ? plan.color : '#182018'}`,
              borderRadius: 18, padding: '28px 24px', cursor: 'pointer', position: 'relative',
              transition: 'all 0.18s', boxShadow: sel ? `0 8px 32px #00000050` : 'none',
            }}>
              {plan.badge && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#3de05a', color: '#050d05', fontFamily: "'League Spartan',sans-serif", fontWeight: 800, fontSize: 11, letterSpacing: '0.1em', padding: '4px 14px', borderRadius: 20, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{plan.badge}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 22, color: plan.color, marginBottom: 4 }}>{plan.name}</div>
                  {plan.price === 0
                    ? <span style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 30, color: '#c0d8c0' }}>$0.00</span>
                    : <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}><span style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 34, color: '#e8f4e8' }}>${plan.price}</span><span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#4a6050' }}>/month</span></div>
                  }
                </div>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${sel ? plan.color : '#2a3e2a'}`, background: sel ? plan.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4, transition: 'all 0.15s' }}>
                  {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: plan.id === 'premium' ? '#050d05' : '#e8f4e8' }} />}
                </div>
              </div>
              <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#4a6040', fontStyle: 'italic', marginBottom: 14 }}>{plan.caveats}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: plan.color, flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#8aaa8a', fontWeight: 600, lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ background: '#091209', border: '1px solid #1a2a1a', borderRadius: 12, padding: '14px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 14, color: '#6a8a6a' }}>{selected === 'premium' ? 'Premium — billed monthly' : 'Free plan — no payment needed'}</span>
        <span style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 20, color: '#3de05a' }}>{selected === 'premium' ? '$9.99/mo' : '$0'}</span>
      </div>

      {selected === 'premium' && (
        <div style={{ background: '#091209', border: '1px solid #1a2a1a', borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 11, color: '#4a6850', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Payment Details</div>
          <PremiumPaymentForm />
        </div>
      )}

      <button onClick={handleChoose} style={{ width: '100%', background: '#3de05a', border: 'none', borderRadius: 12, padding: '16px', fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 17, color: '#050d05', cursor: 'pointer', letterSpacing: '0.04em' }}>
        {selected === 'premium' ? 'Start Premium — $9.99/mo →' : 'Continue with Free Plan →'}
      </button>
    </div>
  );
}

function AccountDashboard({ user, onSignOut, onUpgrade, setView }) {
  const plan = PLANS[user.subscription] || PLANS.free;
  const sessLeft = user.subscription !== 'premium' ? Math.max(0, 5 - (user.sessionsUsedThisMonth || 0)) : null;
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 'clamp(26px,4vw,38px)', color: '#e8f4e8', letterSpacing: '-0.02em', marginBottom: 4 }}>My Account</div>
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 14, color: '#4a6050' }}>{user.email}</div>
      </div>

      {/* Plan card */}
      <div style={{ background: user.subscription === 'premium' ? '#0a1e10' : '#0a1410', border: `1px solid ${plan.color}50`, borderRadius: 16, padding: '22px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 10, color: '#3a5a40', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 4 }}>Current Plan</div>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 24, color: plan.color }}>{plan.name}</div>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#4a6050' }}>{plan.price === 0 ? '$0.00 / month' : '$9.99/month'}</div>
          </div>
          {user.subscription !== 'premium' && (
            <button onClick={onUpgrade} style={{ background: '#3de05a', border: 'none', borderRadius: 9, padding: '10px 18px', fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 13, color: '#050d05', cursor: 'pointer' }}>Upgrade →</button>
          )}
        </div>
        {user.subscription === 'free' && (
          <div style={{ background: '#091209', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#5a7860' }}>Senior coach sessions used this month</span>
            <span style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 20, color: (user.sessionsUsedThisMonth || 0) >= 5 ? '#e05a3d' : '#3de05a' }}>{user.sessionsUsedThisMonth || 0} / 5</span>
          </div>
        )}
        {user.subscription === 'premium' && (
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#5a7860' }}>Unlimited sessions · Choose your coach · Priority scheduling</div>
        )}
      </div>

      {/* Profile */}
      <div style={{ background: '#0d150d', border: '1px solid #182018', borderRadius: 14, padding: '22px', marginBottom: 20 }}>
        <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 10, color: '#3a5040', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14 }}>Profile</div>
        {[['Name', user.name], ['Email', user.email], ['Member since', new Date(user.createdAt).toLocaleDateString('en-US',{month:'long',year:'numeric'})]].map(([k,v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#4a6050' }}>{k}</span>
            <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#a0c8a0', fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => setView('booking')} style={{ flex: 1, background: '#3de05a', border: 'none', borderRadius: 11, padding: '14px', fontFamily: "'League Spartan',sans-serif", fontWeight: 800, fontSize: 15, color: '#050d05', cursor: 'pointer' }}>Book a Session</button>
        <button onClick={onSignOut} style={{ background: '#0d150d', border: '1px solid #2a3e2a', borderRadius: 11, padding: '14px 20px', fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 14, color: '#5a7860', cursor: 'pointer' }}>Sign Out</button>
      </div>
    </div>
  );
}

Object.assign(window, { PLANS, SubscriptionPage, AccountDashboard });
