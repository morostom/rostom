// SquashTime — Sessions (Active + History)

const SESSIONS_KEY = 'squashtime_sessions';

function getUserSessions(email) {
  if (!email) return [];
  try {
    const all = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
    return all[email.toLowerCase()] || [];
  } catch { return []; }
}

function saveUserSession(email, session) {
  if (!email) return;
  try {
    const all = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
    const key = email.toLowerCase();
    all[key] = [session, ...(all[key] || [])];
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
  } catch {}
}

function updateSessionResult(email, sessionId, result) {
  if (!email) return;
  try {
    const all = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '{}');
    const key = email.toLowerCase();
    all[key] = (all[key] || []).map(s => s.id === sessionId ? { ...s, result, status: 'history' } : s);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
  } catch {}
}

function buildSession(booking, zoomLink) {
  return {
    id: Date.now().toString(),
    coachName: booking.coach.name,
    coachTitle: booking.coach.title,
    coachLevel: booking.coach.level,
    coachPrice: booking.coach.price,
    date: booking.date ? booking.date.toISOString() : null,
    time: booking.time,
    sessionType: booking.sessionType,
    tournament: booking.tournament || null,
    zoomLink,
    playerName: booking.playerInfo.name,
    playerEmail: booking.playerInfo.email,
    addReport: booking.addReport || false,
    status: 'active',
    result: null,
    bookedAt: new Date().toISOString(),
  };
}

function SessionsPage({ user }) {
  const [tab, setTab] = React.useState('active');
  const [sessions, setSessions] = React.useState(() => getUserSessions(user?.email));
  const [addingResult, setAddingResult] = React.useState(null);
  const [resultText, setResultText] = React.useState('');
  const [resultOutcome, setResultOutcome] = React.useState('');

  const active = sessions.filter(s => s.status === 'active');
  const history = sessions.filter(s => s.status === 'history');

  function handleMarkComplete(session) {
    setAddingResult(session);
    setResultText('');
    setResultOutcome('');
  }

  function handleSaveResult() {
    if (!addingResult) return;
    updateSessionResult(user.email, addingResult.id, { outcome: resultOutcome, notes: resultText });
    setSessions(getUserSessions(user.email));
    setAddingResult(null);
  }

  const emptyStyle = { textAlign: 'center', padding: '48px 24px', color: '#3a5040', fontFamily: "'Quicksand',sans-serif", fontSize: 15 };

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '100px 24px 60px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 11, color: '#3de05a', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>My Coaching</div>
        <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 'clamp(26px,4vw,38px)', color: '#d8eed8', letterSpacing: '-0.02em' }}>Sessions</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#091209', borderRadius: 12, padding: 4, marginBottom: 28, width: 'fit-content' }}>
        {[['active', `Active (${active.length})`], ['history', `History (${history.length})`]].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: tab === t ? '#3de05a' : 'transparent', border: 'none',
            borderRadius: 9, padding: '10px 24px', fontFamily: "'League Spartan',sans-serif",
            fontWeight: 700, fontSize: 13, color: tab === t ? '#050d05' : '#5a7860',
            cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em',
          }}>{l}</button>
        ))}
      </div>

      {/* Active Sessions */}
      {tab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {active.length === 0 && (
            <div style={emptyStyle}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
              <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 18, color: '#4a6050', marginBottom: 8 }}>No active sessions</div>
              <div>Book a session to see it appear here.</div>
            </div>
          )}
          {active.map(s => <SessionCard key={s.id} session={s} onMarkComplete={() => handleMarkComplete(s)} />)}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {history.length === 0 && (
            <div style={emptyStyle}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📖</div>
              <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 18, color: '#4a6050', marginBottom: 8 }}>No past sessions yet</div>
              <div>Completed sessions will appear here, including competition results.</div>
            </div>
          )}
          {history.map(s => <SessionCard key={s.id} session={s} isPast={true} />)}
        </div>
      )}

      {/* Result Modal */}
      {addingResult && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: '#0a140a', border: '1px solid #1e3020', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 440, boxShadow: '0 24px 80px #000c' }}>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 20, color: '#d0e8d0', marginBottom: 6 }}>Mark Session Complete</div>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#4a6050', marginBottom: 20 }}>
              Session with {addingResult.coachName} · {addingResult.time}
            </div>

            {addingResult.sessionType === 'tournament' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 11, color: '#4a6850', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Tournament Result</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Won','Lost','Drew','N/A'].map(o => (
                    <button key={o} onClick={() => setResultOutcome(o)} style={{
                      background: resultOutcome === o ? '#3de05a' : '#091209',
                      border: `1px solid ${resultOutcome === o ? '#3de05a' : '#1e2e1e'}`,
                      borderRadius: 8, padding: '8px 16px', cursor: 'pointer',
                      fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 13,
                      color: resultOutcome === o ? '#050d05' : '#6a8a6a', transition: 'all 0.12s',
                    }}>{o}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 11, color: '#4a6850', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Notes (optional)</div>
              <textarea
                value={resultText}
                onChange={e => setResultText(e.target.value)}
                placeholder="e.g. Worked on backhand, improved drop shot..."
                rows={3}
                style={{ width: '100%', background: '#091209', border: '1px solid #1e2e1e', borderRadius: 9, padding: '12px 14px', color: '#c0d8c0', fontFamily: "'Quicksand',sans-serif", fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setAddingResult(null)} style={{ flex: '0 0 auto', background: '#0d150d', border: '1px solid #1e2e1e', borderRadius: 9, padding: '12px 18px', fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 13, color: '#5a7860', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveResult} style={{ flex: 1, background: '#3de05a', border: 'none', borderRadius: 9, padding: '12px', fontFamily: "'League Spartan',sans-serif", fontWeight: 800, fontSize: 14, color: '#050d05', cursor: 'pointer' }}>Save & Move to History</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, onMarkComplete, isPast = false }) {
  const [copied, setCopied] = React.useState(false);
  const isSenior = session.coachLevel === 'Senior';
  const accentColor = isSenior ? '#3de05a' : '#3ab0e0';
  const dateStr = session.date ? new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  function copyZoom() {
    navigator.clipboard?.writeText(session.zoomLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div style={{ background: isPast ? '#0a0f0a' : '#0d160d', border: `1px solid ${isPast ? '#182018' : accentColor + '40'}`, borderRadius: 16, padding: '22px 24px', position: 'relative' }}>
      {/* Status badge */}
      <div style={{ position: 'absolute', top: 16, right: 16, background: isPast ? '#0d1a0d' : '#0a2010', color: isPast ? '#4a6050' : '#3de05a', fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 6 }}>
        {isPast ? 'Completed' : 'Upcoming'}
      </div>

      {/* Coach row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, paddingRight: 80 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: isSenior ? '#0e2a18' : '#0e1a2e', border: `2px solid ${accentColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'League Spartan',sans-serif", fontWeight: 800, fontSize: 14, color: accentColor, flexShrink: 0 }}>
          {session.coachName.split(' ').slice(0,2).map(w => w[0]).join('')}
        </div>
        <div>
          <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 17, color: '#d0e8d0' }}>{session.coachName}</div>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#4a6050' }}>{session.coachTitle} · {isSenior ? 'Senior' : 'Junior'} Coach</div>
        </div>
      </div>

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', marginBottom: 16 }}>
        {[
          ['Date', dateStr],
          ['Time', session.time],
          ['Type', session.sessionType === 'tournament' ? 'Tournament Coaching' : 'Personal Training'],
          ['Player', session.playerName],
          ...(session.tournament ? [['Tournament', session.tournament]] : []),
          ['Rate', `$${session.coachPrice}/hr`],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 10, color: '#3a5040', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#9ab89a', fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Past session result */}
      {isPast && session.result && (
        <div style={{ background: '#091209', border: '1px solid #182018', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
          {session.result.outcome && session.sessionType === 'tournament' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: session.result.notes ? 6 : 0 }}>
              <span style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 11, color: '#3a5040', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Result</span>
              <span style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 800, fontSize: 14, color: session.result.outcome === 'Won' ? '#3de05a' : session.result.outcome === 'Lost' ? '#e05a3d' : '#8aaa8a' }}>{session.result.outcome}</span>
            </div>
          )}
          {session.result.notes && (
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#6a8a6a', lineHeight: 1.6 }}>{session.result.notes}</div>
          )}
        </div>
      )}

      {/* Zoom link */}
      {!isPast && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#061206', border: '1px solid #1a2a1a', borderRadius: 9, padding: '10px 14px', marginBottom: 14 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#3de05a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.zoomLink}</span>
          <button onClick={copyZoom} style={{ background: copied ? '#3de05a' : '#0d2010', border: `1px solid ${copied ? '#3de05a' : '#1e3020'}`, borderRadius: 6, padding: '5px 12px', fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 11, color: copied ? '#050d05' : '#5a8060', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* Actions */}
      {!isPast && (
        <button onClick={onMarkComplete} style={{ background: 'transparent', border: '1px solid #2a3e2a', borderRadius: 8, padding: '9px 18px', fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 12, color: '#5a8060', cursor: 'pointer', letterSpacing: '0.04em' }}>
          Mark Complete →
        </button>
      )}
    </div>
  );
}

Object.assign(window, { SessionsPage, buildSession, saveUserSession, getUserSessions });
