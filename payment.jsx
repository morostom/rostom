// SquashTime — Payment & Confirmation

function PaymentPage({ booking, onBack, onSuccess }) {
  const [method, setMethod] = React.useState('card');
  const [card, setCard] = React.useState({ number: '', name: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const reportFee  = booking.addReport ? 30 : 0;
  const totalPrice = booking.coach.price + reportFee;

  const methods = [
    { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
    { id: 'paypal', label: 'PayPal', icon: '🅿' },
    { id: 'venmo', label: 'Venmo', icon: '✦' },
  ];

  function formatCardNumber(v) {
    return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  }
  function formatExpiry(v) {
    const digits = v.replace(/\D/g,'').slice(0,4);
    return digits.length > 2 ? digits.slice(0,2) + '/' + digits.slice(2) : digits;
  }

  function validate() {
    if (method !== 'card') return true;
    const e = {};
    if (card.number.replace(/\s/g,'').length < 16) e.number = 'Enter a valid 16-digit card number';
    if (!card.name.trim()) e.name = 'Cardholder name required';
    if (card.expiry.length < 5) e.expiry = 'Enter valid expiry MM/YY';
    if (card.cvv.length < 3) e.cvv = 'Enter valid CVV';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handlePay() {
    if (!validate()) return;
    setProcessing(true);
    // generate zoom link here so we can pass it to onSuccess
    const zoomLink = `https://zoom.us/j/${Math.floor(Math.random()*900000000+100000000)}?pwd=${Math.random().toString(36).slice(2,12)}`;
    setTimeout(() => { setProcessing(false); onSuccess(zoomLink); }, 2800);
  }

  // Detect card brand from number
  function cardBrand(num) {
    const n = num.replace(/\s/g,'');
    if (n.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(n)) return 'Mastercard';
    if (/^3[47]/.test(n)) return 'Amex';
    if (n.startsWith('6')) return 'Discover';
    return null;
  }
  const brand = cardBrand(card.number);

  if (processing) return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={spinnerStyle} />
      </div>
      <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 24, color: '#d0e8d0', marginBottom: 8 }}>Processing Payment…</div>
      <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 14, color: '#4a6050', lineHeight: 1.7 }}>
        Charging ${totalPrice}.00<br/>
        Scheduling your Zoom session<br/>
        Sending confirmation emails
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#5a8060', cursor: 'pointer', fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', padding: 0, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>← Back</button>

      {/* Order Summary */}
      <div style={{ background: '#091209', border: '1px solid #1e3020', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 11, color: '#4a6850', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Order Summary</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <CoachAvatar coach={booking.coach} size="sm" />
          <div>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 16, color: '#d0e8d0' }}>{booking.coach.name}</div>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#4a6050' }}>
              {booking.sessionType === 'tournament' ? 'Tournament Coaching' : 'Personal Training'} ·{' '}
              {booking.date && booking.date.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {booking.time}
            </div>
            {booking.tournament && <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 11, color: '#3a5040', marginTop: 2 }}>📍 {booking.tournament}</div>}
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1a2e1a', paddingTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: reportFee > 0 ? 8 : 0 }}>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#4a6050' }}>1-hour session</div>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 16, color: '#a0c8a0' }}>${booking.coach.price}.00</div>
          </div>
          {reportFee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#4a6050' }}>Written performance report</div>
              <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 16, color: '#3de05a' }}>+$30.00</div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a2e1a', paddingTop: 10 }}>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 13, color: '#5a8060' }}>Total</div>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 26, color: '#3de05a' }}>${totalPrice}.00</div>
          </div>
        </div>
      </div>

      {/* Payment Method Tabs */}
      <div>
        <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 11, color: '#4a6850', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Payment Method</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {methods.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{
              flex: 1, background: method === m.id ? '#0a1e10' : '#0d150d',
              border: `1px solid ${method === m.id ? '#3de05a' : '#182018'}`,
              borderRadius: 10, padding: '12px 8px', cursor: 'pointer',
              fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 12,
              color: method === m.id ? '#3de05a' : '#5a7060',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 20 }}>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Card Form */}
      {method === 'card' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Visual Card */}
          <div style={{
            background: 'linear-gradient(135deg, #0a2010 0%, #142820 50%, #0d1e14 100%)',
            border: '1px solid #1e3a22', borderRadius: 16, padding: '22px 24px',
            position: 'relative', overflow: 'hidden', minHeight: 120,
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: '#3de05a08' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 20, width: 90, height: 90, borderRadius: '50%', background: '#3de05a05' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 16, color: '#3de05a', letterSpacing: '0.08em' }}>SQUASHTIME</div>
              {brand && <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 13, color: '#5a8060', letterSpacing: '0.1em' }}>{brand.toUpperCase()}</div>}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 16, color: '#c0d8c0', letterSpacing: '0.15em', marginBottom: 12 }}>
              {card.number || '•••• •••• •••• ••••'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 9, color: '#3a5040', fontFamily: "'League Spartan',sans-serif", letterSpacing: '0.1em', marginBottom: 2 }}>CARDHOLDER</div>
                <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#8ab0a0' }}>{card.name || 'Your Name'}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#3a5040', fontFamily: "'League Spartan',sans-serif", letterSpacing: '0.1em', marginBottom: 2 }}>EXPIRES</div>
                <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#8ab0a0' }}>{card.expiry || 'MM/YY'}</div>
              </div>
            </div>
          </div>

          {/* Card Fields */}
          <div>
            <PayLabel>Card Number</PayLabel>
            <input placeholder="1234 5678 9012 3456" value={card.number}
              onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })}
              style={{ ...payInputStyle, borderColor: errors.number ? '#e05a3d' : '#1e2e1e' }} />
            {errors.number && <ErrMsg>{errors.number}</ErrMsg>}
          </div>
          <div>
            <PayLabel>Cardholder Name</PayLabel>
            <input placeholder="Name as on card" value={card.name}
              onChange={e => setCard({ ...card, name: e.target.value })}
              style={{ ...payInputStyle, borderColor: errors.name ? '#e05a3d' : '#1e2e1e' }} />
            {errors.name && <ErrMsg>{errors.name}</ErrMsg>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <PayLabel>Expiry</PayLabel>
              <input placeholder="MM/YY" value={card.expiry}
                onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                style={{ ...payInputStyle, borderColor: errors.expiry ? '#e05a3d' : '#1e2e1e' }} />
              {errors.expiry && <ErrMsg>{errors.expiry}</ErrMsg>}
            </div>
            <div>
              <PayLabel>CVV</PayLabel>
              <input placeholder="•••" value={card.cvv} maxLength={4}
                onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g,'').slice(0,4) })}
                style={{ ...payInputStyle, borderColor: errors.cvv ? '#e05a3d' : '#1e2e1e' }} />
              {errors.cvv && <ErrMsg>{errors.cvv}</ErrMsg>}
            </div>
          </div>
        </div>
      )}

      {/* PayPal / Venmo redirects */}
      {method === 'paypal' && (
        <div style={{ background: '#0d150d', border: '1px solid #182018', borderRadius: 14, padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🅿</div>
          <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 16, color: '#d0e8d0', marginBottom: 6 }}>Continue with PayPal</div>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#4a6050', lineHeight: 1.6 }}>You'll be redirected to PayPal to complete your ${totalPrice}.00 payment securely.</div>
        </div>
      )}
      {method === 'venmo' && (
        <div style={{ background: '#0d150d', border: '1px solid #182018', borderRadius: 14, padding: '28px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
          <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 16, color: '#d0e8d0', marginBottom: 6 }}>Continue with Venmo</div>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#4a6050', lineHeight: 1.6 }}>You'll be redirected to Venmo to complete your ${totalPrice}.00 payment securely.</div>
        </div>
      )}

      {/* Security badges */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['🔒 SSL Encrypted', '✓ PCI Compliant', '↩ Instant Refunds'].map(b => (
          <span key={b} style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 11, color: '#3a5040', fontWeight: 600 }}>{b}</span>
        ))}
      </div>

      <button onClick={handlePay} style={{
        width: '100%', background: '#3de05a', border: 'none', borderRadius: 12,
        padding: '16px 24px', fontFamily: "'League Spartan',sans-serif", fontWeight: 900,
        fontSize: 18, color: '#050d05', cursor: 'pointer', transition: 'all 0.15s',
        letterSpacing: '0.04em',
      }}>
        Pay ${totalPrice}.00 & Book Session
      </button>
    </div>
  );
}

function ConfirmationPage({ booking, onNewBooking, zoomLink }) {
  const confirmLink = zoomLink || `https://zoom.us/j/${Math.floor(Math.random()*900000000+100000000)}?pwd=${Math.random().toString(36).slice(2,12)}`;
  const confirmNum  = 'ST-' + Date.now().toString(36).toUpperCase().slice(-8);
  const reportFee   = booking.addReport ? 30 : 0;
  const totalPrice  = booking.coach.price + reportFee;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Success header */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#0a2010', border: '3px solid #3de05a', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>✓</div>
        <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 28, color: '#3de05a', marginBottom: 6 }}>Session Booked!</div>
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 14, color: '#5a7860', lineHeight: 1.7 }}>
          Confirmation #{confirmNum}<br/>
          Emails sent to <strong style={{ color: '#8ab0a0' }}>{booking.playerInfo.email}</strong> and your coach
        </div>
      </div>

      {/* Zoom Card */}
      <div style={{ background: 'linear-gradient(135deg, #0a2010, #0e1e18)', border: '1px solid #3de05a40', borderRadius: 16, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#1a6ef0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📹</div>
          <div>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 800, fontSize: 16, color: '#d0e8d0' }}>Zoom Session Scheduled</div>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#4a6050' }}>Auto-generated and sent to both parties</div>
          </div>
        </div>
        <div style={{ background: '#061206', border: '1px solid #1a2a1a', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#3de05a', wordBreak: 'break-all', lineHeight: 1.6 }}>{confirmLink}</div>
        </div>
        <button onClick={() => navigator.clipboard?.writeText(confirmLink)} style={{
          background: '#3de05a', border: 'none', borderRadius: 9, padding: '10px 20px',
          fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 13,
          color: '#050d05', cursor: 'pointer', letterSpacing: '0.04em',
        }}>Copy Zoom Link</button>
      </div>

      {/* Session details */}
      <div style={{ background: '#091209', border: '1px solid #182018', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 11, color: '#4a6850', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>Session Details</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, borderBottom: '1px solid #182018', marginBottom: 14 }}>
          <CoachAvatar coach={booking.coach} size="sm" />
          <div>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 16, color: '#d0e8d0' }}>{booking.coach.name}</div>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#4a6050' }}>{booking.coach.title}</div>
          </div>
        </div>
        {[
          ['Date', booking.date && booking.date.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})],
          ['Time', booking.time],
          ['Format', 'Live Zoom Session (1 hour)'],
          ['Type', booking.sessionType === 'tournament' ? 'Tournament Coaching' : 'Personal Training'],
          ...(booking.tournament ? [['Tournament', booking.tournament]] : []),
          ['Player', booking.playerInfo.name],
          ['Paid', `$${totalPrice}.00${booking.addReport ? ' (incl. report)' : ''}`],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
            <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#4a6050' }}>{k}</span>
            <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#a0c0a0', fontWeight: 600, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Report notice */}
      {booking.addReport && (
        <div style={{ background: '#0a1e10', border: '1px solid #3de05a40', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>📝</span>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#5a8060', lineHeight: 1.7 }}>
            <strong style={{ color: '#3de05a' }}>Written Performance Report included.</strong> Your coach will send a detailed report to <strong style={{ color: '#8ab0a0' }}>{booking.playerInfo.email}</strong> within <strong style={{ color: '#8ab0a0' }}>3–5 business days</strong> of session completion via <span style={{ color: '#8ab0a0' }}>info@squashtime.com</span>.
          </div>
        </div>
      )}

      {/* Email notice */}
      <div style={{ background: '#091209', border: '1px solid #182018', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>📧</span>
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#5a7860', lineHeight: 1.7 }}>
          A confirmation email with the Zoom link, session details, and receipt has been sent to <strong style={{ color: '#8ab0a0' }}>{booking.playerInfo.email}</strong>. Your coach has also been notified.
        </div>
      </div>

      <button onClick={onNewBooking} style={{
        width: '100%', background: '#0d150d', border: '1px solid #3de05a',
        borderRadius: 12, padding: '14px 24px',
        fontFamily: "'League Spartan',sans-serif", fontWeight: 800, fontSize: 16,
        color: '#3de05a', cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em',
      }}>Book Another Session</button>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

function PayLabel({ children }) {
  return <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 11, color: '#4a6850', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>{children}</div>;
}
function ErrMsg({ children }) {
  return <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#e05a3d', marginTop: 5 }}>{children}</div>;
}
const payInputStyle = {
  width: '100%', background: '#091209', border: '1px solid #1e2e1e',
  borderRadius: 9, padding: '12px 14px', color: '#c0d8c0',
  fontFamily: "'Quicksand',sans-serif", fontSize: 14, outline: 'none',
  boxSizing: 'border-box',
};
const spinnerStyle = {
  width: 52, height: 52, borderRadius: '50%',
  border: '4px solid #182018', borderTop: '4px solid #3de05a',
  animation: 'spin 0.8s linear infinite', margin: '0 auto',
};

Object.assign(window, { PaymentPage, ConfirmationPage });
