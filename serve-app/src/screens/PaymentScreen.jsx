// PaymentScreen.jsx — pay for a court (or session) reservation. Apple Pay,
// Credit/Debit card, and TELDA. On success the reservation is saved to the
// store: a Heliopolis live court is also marked booked (secureCourt), academy &
// guest-pass courts just record the booking.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../components/Icons';
import { MScreen, Pill } from '../components/mobile';
import ThemeScope from '../components/ThemeScope';
import { useNav } from '../navigation/nav';
import { useStore, store } from '../store';

const METHODS = [
  { id: 'applepay', label: 'Apple Pay', sub: 'One tap with Face ID' },
  { id: 'card', label: 'Credit / Debit card', sub: 'Visa · Mastercard · Meeza' },
  { id: 'telda', label: 'TELDA', sub: 'Pay from your TELDA balance' },
];

function CardForm() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
      <div className="sq-field"><Icons.Wallet size={15} /><input className="sq-input mono" placeholder="Card number" defaultValue="4242 4242 4242 4242" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="sq-field"><input className="sq-input mono" placeholder="MM / YY" defaultValue="08 / 27" /></div>
        <div className="sq-field"><input className="sq-input mono" placeholder="CVC" defaultValue="123" /></div>
      </div>
    </div>
  );
}

export default function PaymentScreen(params) {
  const { nav, player } = useNav();
  const state = useStore();
  const { courtNo, title, venue = 'Heliopolis SC', type = 'Standard', day = 'Today', time, endTime, price, secureCourt = false, guest = false } = params;
  const heading = title || `Court ${courtNo}`;
  const [method, setMethod] = useState('applepay');
  const [phase, setPhase] = useState('form');

  // if this player is linked to a parent, they can send the bill to them instead
  const parentLink = state.parentLinks.find((l) => player?.name && l.child_name.toLowerCase() === player.name.toLowerCase());

  function pay() {
    setPhase('processing');
    setTimeout(() => {
      const booking = { court: courtNo ?? '—', title, venue, type, day, time, endTime, price, method, status: 'confirmed' };
      if (secureCourt && courtNo) store.bookCourt(courtNo, booking);
      else store.addBooking(booking);
      setPhase('done');
    }, 1000);
  }

  function transferToParent() {
    store.requestTransfer({
      parent_identifier: parentLink.parent_identifier,
      child_name: player.name,
      item: heading, venue, court: courtNo ?? '—', day, time, amount: price,
    });
    setPhase('sent');
  }

  return (
    <ThemeScope accent={state.clubTheme}>
      <MScreen
        header={phase === 'form' ? (
          <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Pill onClick={() => nav.pop()}><Icons.Chevron dir="left" size={16} /></Pill>
            <span className="sq-display" style={{ fontSize: 17, fontWeight: 700 }}>Checkout</span>
          </div>
        ) : null}
        tabBar={phase === 'form' ? (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--sq-border)', background: 'rgba(7,7,7,0.95)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="sq-btn-gold serve-glow-soft" style={{ width: '100%', padding: '15px', fontSize: 14.5 }} onClick={pay}>
              {method === 'applepay' ? <> Pay</> : `Pay EGP ${price}`}
            </button>
            {parentLink && (
              <button className="sq-btn-ghost" style={{ width: '100%', padding: '13px', fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={transferToParent}>
                <Icons.Heart size={15} /> Transfer to parent
              </button>
            )}
          </div>
        ) : null}
      >
        {phase === 'sent' ? (
          <div className="sq-fade-up" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px', gap: 18 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              style={{ width: 92, height: 92, borderRadius: '50%', background: 'color-mix(in srgb, var(--sq-gold) 16%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 45%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Heart size={40} />
            </motion.div>
            <div>
              <h1 className="sq-display" style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Sent to your parent</h1>
              <p style={{ margin: '8px 0 0', color: 'var(--sq-text-2)', fontSize: 14, lineHeight: 1.5 }}>They’ll get an alert on their phone to approve and pay. This court is held for <strong style={{ color: 'var(--sq-text)' }}>10 minutes</strong>.</p>
            </div>
            <div className="sq-card" style={{ width: '100%', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
              {[['What', heading], ['Where', venue], ['When', `${day} · ${time}`], ['Amount', `EGP ${price}`]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span className="sq-mono" style={{ color: 'var(--sq-text-3)', textTransform: 'uppercase', fontSize: 10.5, letterSpacing: '0.08em' }}>{k}</span>
                  <span style={{ fontWeight: 500, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
            <button className="sq-btn-gold" style={{ width: '100%', padding: '13px', fontSize: 13.5 }} onClick={() => nav.switchTab('bookings')}>Done</button>
          </div>
        ) : phase === 'done' ? (
          <div className="sq-fade-up" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px', gap: 18 }}>
            <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              style={{ width: 92, height: 92, borderRadius: '50%', background: 'color-mix(in srgb, var(--sq-green) 18%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-green) 45%, transparent)', color: 'var(--sq-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.Check size={44} />
            </motion.div>
            <div>
              <h1 className="sq-display" style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{secureCourt ? 'Court secured' : 'Booked!'}</h1>
              <p style={{ margin: '8px 0 0', color: 'var(--sq-text-2)', fontSize: 14 }}>{heading} · {venue} · {time}{endTime ? `–${endTime}` : ''}</p>
            </div>
            <div className="sq-card" style={{ width: '100%', padding: 16, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
              {[['What', heading], ['Where', venue], ['When', `${day} · ${time}`], ['Paid', `EGP ${price}`], ['Method', METHODS.find((m) => m.id === method)?.label]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span className="sq-mono" style={{ color: 'var(--sq-text-3)', textTransform: 'uppercase', fontSize: 10.5, letterSpacing: '0.08em' }}>{k}</span>
                  <span style={{ fontWeight: 500, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button className="sq-btn-ghost" style={{ flex: 1, padding: '13px', fontSize: 13.5 }} onClick={() => nav.switchTab('bookings')}>My bookings</button>
              <button className="sq-btn-gold" style={{ flex: 1, padding: '13px', fontSize: 13.5 }} onClick={() => nav.switchTab('discover')}>Done</button>
            </div>
          </div>
        ) : phase === 'processing' ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--sq-text-2)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--sq-border-2)', borderTopColor: 'var(--sq-gold)' }} />
            <span style={{ fontSize: 14 }}>Processing payment…</span>
          </div>
        ) : (
          <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="sq-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: 'color-mix(in srgb, var(--sq-gold) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 28%, transparent)', color: 'var(--sq-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icons.Court size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sq-display" style={{ fontSize: 15, fontWeight: 600 }}>{heading}</div>
                <div className="sq-mono" style={{ fontSize: 11.5, color: 'var(--sq-text-2)', marginTop: 2 }}>{venue} · {day} {time}{endTime ? `–${endTime}` : ''}</div>
              </div>
              <div className="sq-display" style={{ fontSize: 18, fontWeight: 700 }}>EGP {price}</div>
            </div>
            {guest && (
              <div style={{ display: 'flex', gap: 9, alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: 'color-mix(in srgb, var(--sq-gold) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--sq-gold) 22%, transparent)', fontSize: 12, color: 'var(--sq-text-2)' }}>
                <Icons.User size={14} /> Guest pass — you must play with a club member.
              </div>
            )}
            <div>
              <div className="sq-mono" style={{ fontSize: 10.5, color: 'var(--sq-text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Payment method</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {METHODS.map((m) => {
                  const on = m.id === method;
                  return (
                    <button key={m.id} onClick={() => setMethod(m.id)} style={{ textAlign: 'left', cursor: 'pointer', padding: '14px 16px', borderRadius: 13, display: 'flex', alignItems: 'center', gap: 13, background: on ? 'color-mix(in srgb, var(--sq-gold) 10%, var(--sq-surface))' : 'var(--sq-surface)', border: '1.5px solid ' + (on ? 'color-mix(in srgb, var(--sq-gold) 50%, transparent)' : 'var(--sq-border)') }}>
                      <span style={{ width: 30, display: 'flex', justifyContent: 'center', color: on ? 'var(--sq-gold)' : 'var(--sq-text-2)' }}>
                        {m.id === 'applepay' ? <span style={{ fontWeight: 600, fontSize: 15, fontFamily: 'system-ui' }}> Pay</span> : m.id === 'telda' ? <span style={{ fontFamily: 'var(--sq-display)', fontWeight: 700, fontSize: 13 }}>telda</span> : <Icons.Wallet size={20} />}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{m.label}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--sq-text-3)', marginTop: 1 }}>{m.sub}</div>
                      </div>
                      <span style={{ width: 20, height: 20, borderRadius: 10, border: '2px solid ' + (on ? 'var(--sq-gold)' : 'var(--sq-border-2)'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {on && <span style={{ width: 9, height: 9, borderRadius: 5, background: 'var(--sq-gold)' }} />}
                      </span>
                    </button>
                  );
                })}
              </div>
              {method === 'card' && <CardForm />}
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--sq-text-3)', lineHeight: 1.5, display: 'flex', gap: 7 }}>
              <Icons.Lock size={13} /> Payments are encrypted. Cancel free up to 6 hours before your slot.
            </p>
          </div>
        )}
      </MScreen>
    </ThemeScope>
  );
}
