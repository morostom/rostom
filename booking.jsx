// SquashTime — Booking Engine (Dual Flow)

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── Mini Calendar ─────────────────────────────────────────────────────────────

function MiniCalendar({ onSelectDate, selectedDate, availabilityMap }) {
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function isAvailable(d) {
    if (!d) return false;
    const dt = new Date(viewYear, viewMonth, d);
    if (dt <= today) return false;
    const key = dt.toDateString();
    if (availabilityMap) return !!(availabilityMap[key] && availabilityMap[key].length);
    return COACHES.some(c => {
      const slots = getCoachAvailability(c.id)[key];
      return slots && slots.length > 0;
    });
  }

  function isSelected(d) {
    if (!d || !selectedDate) return false;
    return new Date(viewYear, viewMonth, d).toDateString() === selectedDate.toDateString();
  }
  function isToday(d) {
    if (!d) return false;
    return new Date(viewYear, viewMonth, d).toDateString() === today.toDateString();
  }
  function prevMonth() { if (viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); }
  function nextMonth() { if (viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); }

  return (
    <div style={{ background:'#091209',border:'1px solid #182018',borderRadius:14,padding:20,userSelect:'none' }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
        <button onClick={prevMonth} style={calNavBtn}>‹</button>
        <span style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:700,color:'#c8e0c8',fontSize:15 }}>{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} style={calNavBtn}>›</button>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:6 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign:'center',fontSize:10,fontWeight:700,color:'#3a5040',fontFamily:"'League Spartan',sans-serif",letterSpacing:'0.06em',paddingBottom:4 }}>{d}</div>)}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2 }}>
        {cells.map((d, i) => {
          const avail = isAvailable(d);
          const sel   = isSelected(d);
          const tod   = isToday(d);
          return (
            <div key={i} onClick={() => { if (avail) onSelectDate(new Date(viewYear, viewMonth, d)); }} style={{
              aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
              borderRadius:8, fontSize:13, fontFamily:"'Quicksand',sans-serif", fontWeight:600,
              cursor: avail ? 'pointer' : 'default',
              background: sel ? '#3de05a' : (avail ? '#0d1f0d' : 'transparent'),
              color: sel ? '#050d05' : (avail ? '#a0c8a0' : (d ? '#2a3a2a' : 'transparent')),
              border: tod && !sel ? '1px solid #3de05a40' : '1px solid transparent',
              transition:'all 0.12s', position:'relative',
            }}>
              {d}
              {avail && !sel && <div style={{ position:'absolute',bottom:3,left:'50%',transform:'translateX(-50%)',width:4,height:4,borderRadius:'50%',background:'#3de05a60' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const calNavBtn = { background:'none',border:'none',color:'#5a8060',fontSize:22,cursor:'pointer',padding:'0 8px',lineHeight:1,fontFamily:"'League Spartan',sans-serif" };

// ── Time Slot Picker ──────────────────────────────────────────────────────────

function TimeSlotPicker({ slots, selected, onSelect }) {
  if (!slots || slots.length === 0) {
    return <div style={{ color:'#4a6050',fontFamily:"'Quicksand',sans-serif",fontSize:14,padding:'16px 0' }}>No available slots for this date.</div>;
  }
  return (
    <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8 }}>
      {slots.map(slot => (
        <button key={slot} onClick={() => onSelect(slot)} style={{
          background: selected===slot ? '#3de05a' : '#0d1a0d',
          border: `1px solid ${selected===slot ? '#3de05a' : '#1e2e1e'}`,
          borderRadius:9, padding:'10px 8px',
          fontFamily:"'Quicksand',sans-serif", fontWeight:700, fontSize:13,
          color: selected===slot ? '#050d05' : '#8aaa8a',
          cursor:'pointer', transition:'all 0.14s',
        }}>{slot}</button>
      ))}
    </div>
  );
}

// ── Session Type Picker ───────────────────────────────────────────────────────

function SessionTypePicker({ value, onChange, availableTypes = ['tournament', 'personal'] }) {
  const allTypes = [
    { id:'tournament', label:'Tournament Coaching', desc:'Live coaching support during a tournament weekend', icon:'🏆' },
    { id:'personal',   label:'Personal Training',   desc:'One-on-one online skill session — no tournament required', icon:'🎯' },
  ];
  const types = allTypes.filter(t => availableTypes.includes(t.id));
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      {types.map(t => (
        <div key={t.id} onClick={() => onChange(t.id)} style={{
          background: value===t.id ? '#0a1e10' : '#0d150d',
          border: `1px solid ${value===t.id ? '#3de05a' : '#182018'}`,
          borderRadius:12, padding:'16px 20px', cursor:'pointer',
          display:'flex', gap:14, alignItems:'flex-start', transition:'all 0.15s',
          boxShadow: value===t.id ? '0 0 0 1px #3de05a20' : 'none',
        }}>
          <div style={{ fontSize:22,marginTop:2 }}>{t.icon}</div>
          <div>
            <div style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:700,fontSize:16,color:value===t.id?'#3de05a':'#c0d8c0',marginBottom:3 }}>{t.label}</div>
            <div style={{ fontFamily:"'Quicksand',sans-serif",fontSize:13,color:'#5a7860',lineHeight:1.5 }}>{t.desc}</div>
          </div>
          <div style={{ marginLeft:'auto',width:18,height:18,borderRadius:'50%',border:`2px solid ${value===t.id?'#3de05a':'#2a3e2a'}`,background:value===t.id?'#3de05a':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2 }}>
            {value===t.id && <div style={{ width:8,height:8,borderRadius:'50%',background:'#050d05' }} />}
          </div>
        </div>
      ))}
      {!availableTypes.includes('tournament') && (
        <div style={{ background:'#180808',border:'1px solid #2a1010',borderRadius:10,padding:'12px 16px' }}>
          <div style={{ fontFamily:"'Quicksand',sans-serif",fontSize:13,color:'#8a5050' }}>
            This coach offers personal coaching only — tournament sessions are not available.
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tournament Picker ─────────────────────────────────────────────────────────

function TournamentPicker({ value, onChange }) {
  const [mode, setMode] = React.useState('preset');
  const [custom, setCustom] = React.useState('');
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      <div style={{ display:'flex',gap:8,marginBottom:4 }}>
        {['preset','custom'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            background: mode===m?'#3de05a':'#0d150d', border:`1px solid ${mode===m?'#3de05a':'#182018'}`,
            borderRadius:8, padding:'7px 16px', cursor:'pointer',
            fontFamily:"'League Spartan',sans-serif", fontWeight:700, fontSize:12,
            color: mode===m?'#050d05':'#6a8a6a', letterSpacing:'0.06em', textTransform:'uppercase', transition:'all 0.12s',
          }}>{m==='preset'?'Select Tournament':'Enter Manually'}</button>
        ))}
      </div>
      {mode==='preset' ? (
        <div style={{ display:'flex',flexDirection:'column',gap:6,maxHeight:240,overflowY:'auto' }}>
          {UPCOMING_TOURNAMENTS.map(t => (
            <div key={t.id} onClick={() => onChange(t.name)} style={{
              background: value===t.name?'#0a1e10':'#0d150d',
              border: `1px solid ${value===t.name?'#3de05a':'#182018'}`,
              borderRadius:9, padding:'12px 14px', cursor:'pointer',
              display:'flex', justifyContent:'space-between', alignItems:'center', transition:'all 0.12s',
            }}>
              <div>
                <div style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:700,fontSize:14,color:value===t.name?'#3de05a':'#b0c8b0' }}>{t.name}</div>
                <div style={{ fontFamily:"'Quicksand',sans-serif",fontSize:12,color:'#4a6050' }}>{t.location} · {t.dates}</div>
              </div>
              {value===t.name && <div style={{ color:'#3de05a',fontSize:18 }}>✓</div>}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          <input placeholder="Tournament name..." value={custom} onChange={e=>{setCustom(e.target.value);onChange(e.target.value);}} style={inputStyle} />
          <input placeholder="Location (City, State)..." style={inputStyle} />
        </div>
      )}
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────

function ProgressBar({ step, total, labels }) {
  return (
    <div style={{ marginBottom:28 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ display:'flex',flexDirection:'column',alignItems:'center',flex:1 }}>
            <div style={{
              width:28,height:28,borderRadius:'50%',
              background: i<step?'#3de05a':(i===step?'#3de05a22':'#111a11'),
              border: `2px solid ${i<=step?'#3de05a':'#1e2e1e'}`,
              display:'flex',alignItems:'center',justifyContent:'center',
              fontFamily:"'League Spartan',sans-serif",fontWeight:800,fontSize:12,
              color: i<step?'#050d05':(i===step?'#3de05a':'#2e4030'),
              marginBottom:4, transition:'all 0.2s', zIndex:1, position:'relative',
            }}>
              {i<step?'✓':i+1}
            </div>
            <div style={{ fontSize:10,color:i<=step?'#5a8060':'#2a3a2a',fontFamily:"'League Spartan',sans-serif",fontWeight:600,letterSpacing:'0.05em',textAlign:'center',textTransform:'uppercase' }}>
              {l}
            </div>
          </div>
        ))}
      </div>
      <div style={{ height:2,background:'#111a11',borderRadius:2,position:'relative',marginTop:4 }}>
        <div style={{ height:'100%',background:'#3de05a',borderRadius:2,width:`${(step/(total-1))*100}%`,transition:'width 0.3s ease' }} />
      </div>
    </div>
  );
}

// ── Report Add-On Card ────────────────────────────────────────────────────────

function ReportAddOnCard({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      background: value ? '#0a1e10' : '#0d150d',
      border: `2px solid ${value ? '#3de05a' : '#182018'}`,
      borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
      display: 'flex', gap: 14, alignItems: 'flex-start',
      transition: 'all 0.15s',
    }}>
      {/* Checkbox */}
      <div style={{
        width: 20, height: 20, borderRadius: 5, border: `2px solid ${value ? '#3de05a' : '#2a3e2a'}`,
        background: value ? '#3de05a' : 'transparent', flexShrink: 0, marginTop: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
      }}>
        {value && <span style={{ color: '#050d05', fontSize: 12, fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 800, fontSize: 15, color: value ? '#3de05a' : '#c0d8c0' }}>
            Written Performance Report
          </span>
          <span style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 14, color: '#3de05a' }}>+$30</span>
          <span style={{ background: '#0a1e10', border: '1px solid #1e3020', borderRadius: 4, padding: '2px 8px', fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 9, color: '#5a8060', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Optional</span>
        </div>
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#5a7860', lineHeight: 1.6 }}>
          After your session, your coach will send a detailed written report covering your strengths, areas to improve, and a personalized action plan. Delivered to your email within <strong style={{ color: '#7a9a7a' }}>3–5 business days</strong> of session completion via <span style={{ color: '#7a9a7a' }}>info@squashtime.com</span>.
        </div>
      </div>
    </div>
  );
}

// ── Booking Engine ────────────────────────────────────────────────────────────

function BookingEngine({ onComplete, initialFlow, preselectedCoach, currentUser }) {
  const [flow, setFlow]   = React.useState(preselectedCoach ? 'coach-first' : (initialFlow || null));
  const [step, setStep]   = React.useState(preselectedCoach ? 1 : 0);
  const [selectedDate,  setSelectedDate]  = React.useState(null);
  const [selectedTime,  setSelectedTime]  = React.useState(null);
  const [selectedCoach, setSelectedCoach] = React.useState(preselectedCoach || null);
  const [sessionType,   setSessionType]   = React.useState(null);
  const [tournament,    setTournament]    = React.useState('');
  const [addReport,     setAddReport]     = React.useState(false);

  const isFree = currentUser?.subscription === 'free';

  const defaultInfo = currentUser
    ? { name: currentUser.name, email: currentUser.email, phone: currentUser.phone||'', age: currentUser.age||'', level: currentUser.level||'', forSelf: true }
    : { name:'', email:'', phone:'', level:'', age:'', forSelf:true };
  const [playerInfo, setPlayerInfo] = React.useState(defaultInfo);
  const [bookingFor, setBookingFor] = React.useState('self');

  function reset() { setFlow(null);setStep(0);setSelectedDate(null);setSelectedTime(null);setSelectedCoach(null);setSessionType(null);setTournament('');setAddReport(false);setBookingFor('self');setPlayerInfo(defaultInfo); }

  const dateStr = selectedDate ? selectedDate.toDateString() : null;

  // Get live availability (reads localStorage each time)
  const coachAvail = selectedCoach ? getCoachAvailability(selectedCoach.id) : null;
  const availableSlots = selectedCoach
    ? (dateStr ? (coachAvail[dateStr] || []) : [])
    : (dateStr ? [...new Set(COACHES.flatMap(c => getCoachAvailability(c.id)[dateStr] || []))] : []);

  // Date-first: coaches available for selected slot, with fitness restrictions
  const availableCoachesForSlot = (dateStr && selectedTime) ? getAvailableCoaches(dateStr, selectedTime).filter(c => {
    if (c.level === 'Fitness') {
      if (sessionType === 'tournament') return false;
      if (isFree) return false;
    }
    return true;
  }) : [];

  // Flow chooser
  if (!flow) {
    return (
      <div style={engineWrap}>
        <div style={{ textAlign:'center',marginBottom:32 }}>
          <div style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:900,fontSize:28,color:'#e8f0e8',marginBottom:8 }}>Book a Session</div>
          <div style={{ fontFamily:"'Quicksand',sans-serif",color:'#5a7060',fontSize:15 }}>Choose how you'd like to get started</div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20 }}>
          {[
            { id:'date-first',  icon:'📅', title:'Pick a Date First',    desc:'Choose your preferred date & time, then see which coaches are available.' },
            { id:'coach-first', icon:'👤', title:'Browse Coaches First', desc:'Explore our coaches, view profiles and rates, then pick a time that works.' },
          ].map(opt => (
            <div key={opt.id} onClick={() => {setFlow(opt.id);setStep(0);}} style={{
              background:'#0d150d',border:'1px solid #182018',borderRadius:16,
              padding:'28px 22px',cursor:'pointer',textAlign:'center',transition:'all 0.18s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.border='1px solid #3de05a';e.currentTarget.style.background='#0a1a0a';}}
            onMouseLeave={e=>{e.currentTarget.style.border='1px solid #182018';e.currentTarget.style.background='#0d150d';}}
            >
              <div style={{ fontSize:36,marginBottom:12 }}>{opt.icon}</div>
              <div style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:800,fontSize:18,color:'#d0e8d0',marginBottom:8 }}>{opt.title}</div>
              <div style={{ fontFamily:"'Quicksand',sans-serif",fontSize:13,color:'#4a6050',lineHeight:1.6 }}>{opt.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center' }}>
          <span style={{ fontFamily:"'Quicksand',sans-serif",fontSize:13,color:'#3a5040' }}>
            All sessions are conducted live via Zoom · Instant confirmation
          </span>
        </div>
      </div>
    );
  }

  // ── DATE-FIRST FLOW ──────────────────────────────────────────────────────────
  if (flow === 'date-first') {
    const steps = ['Date','Time','Session','Coach','Details'];

    if (step===0) return (
      <div style={engineWrap}>
        <BackBtn onClick={reset} />
        <ProgressBar step={0} total={5} labels={steps} />
        <SectionTitle>Select a Date</SectionTitle>
        <MiniCalendar onSelectDate={d=>{setSelectedDate(d);setSelectedTime(null);setStep(1);}} selectedDate={selectedDate} />
      </div>
    );

    if (step===1) return (
      <div style={engineWrap}>
        <BackBtn onClick={()=>setStep(0)} />
        <ProgressBar step={1} total={5} labels={steps} />
        <SectionTitle>Choose a Time <span style={{ color:'#3de05a' }}>{selectedDate&&selectedDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</span></SectionTitle>
        <TimeSlotPicker slots={availableSlots} selected={selectedTime} onSelect={t=>{setSelectedTime(t);setStep(2);}} />
      </div>
    );

    if (step===2) return (
      <div style={engineWrap}>
        <BackBtn onClick={()=>setStep(1)} />
        <ProgressBar step={2} total={5} labels={steps} />
        <SectionTitle>Session Type</SectionTitle>
        <SessionTypePicker value={sessionType} onChange={setSessionType} />
        {sessionType==='tournament' && (
          <div style={{ marginTop:20 }}>
            <Label>Select Tournament</Label>
            <TournamentPicker value={tournament} onChange={setTournament} />
          </div>
        )}
        <NextBtn disabled={!sessionType||(sessionType==='tournament'&&!tournament)} onClick={()=>setStep(3)} label="See Available Coaches →" />
      </div>
    );

    if (step===3) return (
      <div style={engineWrap}>
        <BackBtn onClick={()=>setStep(2)} />
        <ProgressBar step={3} total={5} labels={steps} />
        <SectionTitle>{availableCoachesForSlot.length} Coach{availableCoachesForSlot.length!==1?'es':''} Available</SectionTitle>
        {availableCoachesForSlot.length===0 && (
          <div style={{ color:'#5a7060',fontFamily:"'Quicksand',sans-serif",padding:'20px 0' }}>No coaches available for this slot. Please go back and choose another time.</div>
        )}
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {availableCoachesForSlot.map(c => (
            <CoachCard key={c.id} coach={c} selected={selectedCoach?.id===c.id} onClick={coach=>setSelectedCoach(coach)} />
          ))}
        </div>
        <NextBtn disabled={!selectedCoach} onClick={()=>setStep(4)} label="Continue with this Coach →" />
      </div>
    );

    if (step===4) return (
      <div style={engineWrap}>
        <BackBtn onClick={()=>setStep(3)} />
        <ProgressBar step={4} total={5} labels={steps} />
        <SectionTitle>Player Details</SectionTitle>
        <BookingForToggle bookingFor={bookingFor} onChange={v=>{setBookingFor(v);setPlayerInfo(v==='self'?defaultInfo:{name:'',email:'',phone:'',age:'',level:'',forSelf:false});}} hasAccount={!!currentUser} />
        <PlayerForm info={playerInfo} onChange={setPlayerInfo} readOnly={bookingFor==='self'&&!!currentUser} />
        <Label>Optional Add-On</Label>
        <ReportAddOnCard value={addReport} onChange={setAddReport} />
        <BookingSummaryCard coach={selectedCoach} date={selectedDate} time={selectedTime} sessionType={sessionType} tournament={tournament} addReport={addReport} />
        <NextBtn disabled={!playerInfo.name||!playerInfo.email} onClick={()=>onComplete({coach:selectedCoach,date:selectedDate,time:selectedTime,sessionType,tournament,playerInfo,addReport})} label="Proceed to Payment →" />
      </div>
    );
  }

  // ── COACH-FIRST FLOW ─────────────────────────────────────────────────────────
  if (flow === 'coach-first') {
    const steps = ['Coach','Date','Time','Session','Details'];

    if (step===0) return (
      <div style={engineWrap}>
        <BackBtn onClick={reset} />
        <ProgressBar step={0} total={5} labels={steps} />
        <SectionTitle>Choose Your Coach</SectionTitle>
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {COACHES.map(c => {
            const isFitnessLocked = c.level==='Fitness' && isFree;
            return (
              <div key={c.id}>
                <div style={{ position:'relative' }}>
                  <CoachCard coach={c} selected={selectedCoach?.id===c.id} onClick={isFitnessLocked ? undefined : coach=>{setSelectedCoach(coach);setSelectedDate(null);setSelectedTime(null);setStep(1);}} />
                  {isFitnessLocked && (
                    <div style={{ position:'absolute',inset:0,borderRadius:14,background:'rgba(6,12,6,0.75)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(2px)' }}>
                      <div style={{ background:'#0a140a',border:'1px solid #e04040',borderRadius:12,padding:'16px 22px',textAlign:'center',maxWidth:300 }}>
                        <div style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:800,fontSize:15,color:'#e04040',marginBottom:6 }}>Premium Required</div>
                        <div style={{ fontFamily:"'Quicksand',sans-serif",fontSize:13,color:'#8a5050',lineHeight:1.5 }}>Fitness coaching is available to Premium members only.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    if (step===1) return (
      <div style={engineWrap}>
        <BackBtn onClick={()=>{setStep(0);setSelectedCoach(null);}} />
        <ProgressBar step={1} total={5} labels={steps} />
        <div style={{ display:'flex',gap:12,alignItems:'center',marginBottom:20,background:'#091209',border:'1px solid #182018',borderRadius:12,padding:'12px 16px' }}>
          <CoachAvatar coach={selectedCoach} size="sm" />
          <div>
            <div style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:700,fontSize:16,color:'#d0e8d0' }}>{selectedCoach.name}</div>
            <div style={{ fontFamily:"'Quicksand',sans-serif",fontSize:12,color:'#4a6050' }}>{selectedCoach.title} · ${selectedCoach.price}/hr</div>
          </div>
        </div>
        <SectionTitle>Pick a Date</SectionTitle>
        <MiniCalendar availabilityMap={getCoachAvailability(selectedCoach.id)} onSelectDate={d=>{setSelectedDate(d);setSelectedTime(null);setStep(2);}} selectedDate={selectedDate} />
      </div>
    );

    if (step===2) return (
      <div style={engineWrap}>
        <BackBtn onClick={()=>setStep(1)} />
        <ProgressBar step={2} total={5} labels={steps} />
        <SectionTitle>Choose a Time <span style={{ color:'#3de05a' }}>{selectedDate&&selectedDate.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</span></SectionTitle>
        <TimeSlotPicker
          slots={getCoachAvailability(selectedCoach.id)[dateStr] || []}
          selected={selectedTime}
          onSelect={t=>{setSelectedTime(t);setStep(3);}}
        />
      </div>
    );

    if (step===3) {
      const coachSessionTypes = selectedCoach?.sessionTypes || ['tournament','personal'];
      return (
        <div style={engineWrap}>
          <BackBtn onClick={()=>setStep(2)} />
          <ProgressBar step={3} total={5} labels={steps} />
          <SectionTitle>Session Type</SectionTitle>
          <SessionTypePicker value={sessionType} onChange={setSessionType} availableTypes={coachSessionTypes} />
          {sessionType==='tournament' && (
            <div style={{ marginTop:20 }}>
              <Label>Select Tournament</Label>
              <TournamentPicker value={tournament} onChange={setTournament} />
            </div>
          )}
          <NextBtn disabled={!sessionType||(sessionType==='tournament'&&!tournament)} onClick={()=>setStep(4)} label="Continue →" />
        </div>
      );
    }

    if (step===4) return (
      <div style={engineWrap}>
        <BackBtn onClick={()=>setStep(3)} />
        <ProgressBar step={4} total={5} labels={steps} />
        <SectionTitle>Player Details</SectionTitle>
        <BookingForToggle bookingFor={bookingFor} onChange={v=>{setBookingFor(v);setPlayerInfo(v==='self'?defaultInfo:{name:'',email:'',phone:'',age:'',level:'',forSelf:false});}} hasAccount={!!currentUser} />
        <PlayerForm info={playerInfo} onChange={setPlayerInfo} readOnly={bookingFor==='self'&&!!currentUser} />
        <Label>Optional Add-On</Label>
        <ReportAddOnCard value={addReport} onChange={setAddReport} />
        <BookingSummaryCard coach={selectedCoach} date={selectedDate} time={selectedTime} sessionType={sessionType} tournament={tournament} addReport={addReport} />
        <NextBtn disabled={!playerInfo.name||!playerInfo.email} onClick={()=>onComplete({coach:selectedCoach,date:selectedDate,time:selectedTime,sessionType,tournament,playerInfo,addReport})} label="Proceed to Payment →" />
      </div>
    );
  }

  return null;
}

// ── Shared Sub-Components ─────────────────────────────────────────────────────

const engineWrap = { display:'flex',flexDirection:'column',gap:16,maxWidth:560,margin:'0 auto' };

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background:'none',border:'none',color:'#5a8060',cursor:'pointer',fontFamily:"'League Spartan',sans-serif",fontWeight:700,fontSize:13,letterSpacing:'0.06em',padding:'0 0 4px',display:'flex',alignItems:'center',gap:6,textTransform:'uppercase' }}>← Back</button>
  );
}
function SectionTitle({ children }) {
  return <div style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:800,fontSize:20,color:'#d8eed8',marginBottom:4 }}>{children}</div>;
}
function Label({ children }) {
  return <div style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:700,fontSize:12,color:'#5a7860',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10 }}>{children}</div>;
}
function NextBtn({ onClick, disabled, label }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width:'100%',background:disabled?'#111a11':'#3de05a',border:'none',borderRadius:12,padding:'15px 24px',fontFamily:"'League Spartan',sans-serif",fontWeight:800,fontSize:16,color:disabled?'#2a3e2a':'#050d05',cursor:disabled?'not-allowed':'pointer',transition:'all 0.15s',letterSpacing:'0.04em',marginTop:8 }}>{label}</button>
  );
}

function BookingForToggle({ bookingFor, onChange, hasAccount }) {
  if (!hasAccount) return null;
  return (
    <div style={{ background:'#091209',border:'1px solid #1e2e1e',borderRadius:12,padding:'14px 16px',marginBottom:4 }}>
      <div style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:700,fontSize:11,color:'#4a6850',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10 }}>Who is this session for?</div>
      <div style={{ display:'flex',gap:8 }}>
        {[['self','Me (my account)'],['other','Another player']].map(([v,l]) => (
          <button key={v} onClick={()=>onChange(v)} style={{ flex:1,background:bookingFor===v?'#3de05a':'#0d150d',border:`1px solid ${bookingFor===v?'#3de05a':'#1e2e1e'}`,borderRadius:8,padding:'10px 12px',cursor:'pointer',fontFamily:"'Quicksand',sans-serif",fontWeight:700,fontSize:13,color:bookingFor===v?'#050d05':'#6a8a6a',transition:'all 0.14s' }}>{l}</button>
        ))}
      </div>
      {bookingFor==='self'  && <div style={{ fontFamily:"'Quicksand',sans-serif",fontSize:12,color:'#3a5a3a',marginTop:8 }}>Your account details will be used — nothing to fill in.</div>}
      {bookingFor==='other' && <div style={{ fontFamily:"'Quicksand',sans-serif",fontSize:12,color:'#3a5a3a',marginTop:8 }}>Enter the other player's details below.</div>}
    </div>
  );
}

function PlayerForm({ info, onChange, readOnly = false }) {
  if (readOnly) {
    return (
      <div style={{ background:'#091209',border:'1px solid #1e2e1e',borderRadius:12,padding:'16px 18px',display:'flex',flexDirection:'column',gap:10 }}>
        <div style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:700,fontSize:11,color:'#4a6850',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4 }}>Session Player</div>
        {[['Name',info.name],['Email',info.email],['Phone',info.phone||'—'],['Age',info.age||'—'],['Level',info.level||'—']].map(([k,v]) => (
          <div key={k} style={{ display:'flex',justifyContent:'space-between' }}>
            <span style={{ fontFamily:"'Quicksand',sans-serif",fontSize:13,color:'#4a6050' }}>{k}</span>
            <span style={{ fontFamily:"'Quicksand',sans-serif",fontSize:13,color:'#a0c8a0',fontWeight:600 }}>{v}</span>
          </div>
        ))}
        <div style={{ fontFamily:"'Quicksand',sans-serif",fontSize:11,color:'#3a5040',marginTop:4 }}>Update these details in My Account.</div>
      </div>
    );
  }
  const fields = [
    { key:'name',  label:'Full Name',         placeholder:"Player's full name", type:'text' },
    { key:'email', label:'Email Address',      placeholder:'their@email.com',    type:'email' },
    { key:'phone', label:'Phone (optional)',   placeholder:'+1 (555) 000-0000',  type:'tel' },
    { key:'age',   label:"Player's Age",       placeholder:'e.g. 14',            type:'number' },
  ];
  const levels = ['Beginner','Intermediate','Advanced','Junior Competitive','National Level'];
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
      {fields.map(f => (
        <div key={f.key}>
          <Label>{f.label}</Label>
          <input type={f.type} placeholder={f.placeholder} value={info[f.key]} onChange={e=>onChange({...info,[f.key]:e.target.value})} style={inputStyle} />
        </div>
      ))}
      <div>
        <Label>Skill Level</Label>
        <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
          {levels.map(l => (
            <button key={l} onClick={()=>onChange({...info,level:l})} style={{ background:info.level===l?'#3de05a':'#0d150d',border:`1px solid ${info.level===l?'#3de05a':'#1e2e1e'}`,borderRadius:8,padding:'7px 13px',cursor:'pointer',fontFamily:"'Quicksand',sans-serif",fontWeight:700,fontSize:12,color:info.level===l?'#050d05':'#6a8a6a',transition:'all 0.12s' }}>{l}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

const inputStyle = { width:'100%',background:'#091209',border:'1px solid #1e2e1e',borderRadius:9,padding:'12px 14px',color:'#c0d8c0',fontFamily:"'Quicksand',sans-serif",fontSize:14,outline:'none',boxSizing:'border-box',transition:'border 0.12s' };

function BookingSummaryCard({ coach, date, time, sessionType, tournament, addReport }) {
  if (!coach||!date||!time) return null;
  const reportFee = addReport ? 30 : 0;
  const total = coach.price + reportFee;
  return (
    <div style={{ background:'#091209',border:'1px solid #1e3020',borderRadius:12,padding:'16px 20px' }}>
      <div style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:700,fontSize:12,color:'#4a6850',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12 }}>Booking Summary</div>
      <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
        {[
          ['Coach',      coach.name],
          ['Date',       date.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})],
          ['Time',       time],
          ['Session',    sessionType==='tournament'?'Tournament Coaching':'Personal Training'],
          ...(tournament ? [['Tournament', tournament]] : []),
          ['Rate',       `$${coach.price}/hr`],
          ...(addReport  ? [['Report',     '+$30 (written report)']] : []),
          ['Format',     'Live via Zoom'],
        ].map(([k,v]) => (
          <div key={k} style={{ display:'flex',justifyContent:'space-between',gap:12 }}>
            <span style={{ fontFamily:"'Quicksand',sans-serif",fontSize:13,color:'#4a6050' }}>{k}</span>
            <span style={{ fontFamily:"'Quicksand',sans-serif",fontSize:13,color:'#a0c8a0',fontWeight:600,textAlign:'right' }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop:'1px solid #1e3020',marginTop:14,paddingTop:12,display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:700,fontSize:14,color:'#5a8060' }}>Total Due</span>
        <span style={{ fontFamily:"'League Spartan',sans-serif",fontWeight:900,fontSize:22,color:'#3de05a' }}>${total}.00</span>
      </div>
    </div>
  );
}

Object.assign(window, { BookingEngine, BookingSummaryCard, ReportAddOnCard });
