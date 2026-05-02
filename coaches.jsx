// SquashTime — Coach Data & Components

const FITNESS_COLOR = '#e04040';

const COACHES = [
{
  id: 1, name: 'Mohamed Reda', level: 'Senior', price: 125,
  title: 'Head Senior Coach',
  bio: 'Formerly ranked in the Top 50 PSA World Tour with 15+ years of competitive and coaching experience. Specializes in transforming junior players into tournament champions.',
  specialties: ['Tournament Strategy', 'Mental Toughness', 'Advanced Footwork'],
  rating: 4.9, sessions: 312,
  sessionTypes: ['tournament', 'personal']
},
{
  id: 2, name: 'Shehab Essam', level: 'Senior', price: 125,
  title: 'Senior Performance Coach',
  bio: 'Elite performance specialist with a track record of developing nationally ranked juniors. Known for high-intensity, results-driven coaching.',
  specialties: ['Physical Conditioning', 'Shot Accuracy', 'Tactical Play'],
  rating: 4.8, sessions: 248,
  sessionTypes: ['tournament', 'personal']
},
{
  id: 3, name: 'Menna Nasser', level: 'Senior', price: 125,
  title: 'Senior Technical Coach',
  bio: 'Former national team player with unmatched expertise in swing mechanics and court geometry. Excels at video analysis and technical correction.',
  specialties: ['Swing Mechanics', 'Court Positioning', 'Video Analysis'],
  rating: 4.9, sessions: 195,
  sessionTypes: ['tournament', 'personal']
},
{
  id: 8, name: 'Samir El Degwi', level: 'Fitness', price: 125,
  title: 'Head Fitness & Conditioning Coach',
  bio: 'Elite strength and conditioning specialist with extensive experience developing high-performance squash athletes. Samir designs personalized programs that maximize on-court explosiveness, endurance, and injury resilience.',
  specialties: ['Strength & Conditioning', 'Athletic Performance', 'Injury Prevention'],
  rating: 4.9, sessions: 0,
  sessionTypes: ['personal'],
  fitnessOnly: true
},
{
  id: 4, name: 'Mohamed Rostom', level: 'Junior', founder: true, price: 90,
  title: 'Junior Coach & Founder',
  bio: 'Founder of SquashTime. On a mission to bring world-class squash coaching to junior players across the United States — anytime, anywhere.',
  specialties: ['Junior Development', 'Fundamentals', 'Tournament Prep'],
  rating: 4.8, sessions: 156,
  sessionTypes: ['tournament', 'personal']
},
{
  id: 5, name: 'Youssef Bastawy', level: 'Junior', price: 90,
  title: 'Junior Development Coach',
  bio: 'Energetic and encouraging coach who builds strong technical foundations and a genuine love for squash in players of all ages.',
  specialties: ['Beginner Foundation', 'Rally Building', 'Match Play'],
  rating: 4.7, sessions: 98,
  sessionTypes: ['tournament', 'personal']
},
{
  id: 6, name: 'Mohamed Walid', level: 'Junior', price: 90,
  title: 'Junior Performance Coach',
  bio: 'Dynamic coach focused on athletic development and structured skill-building. Helps juniors reach their next competitive level.',
  specialties: ['Fitness & Agility', 'Solo Drills', 'Game Structure'],
  rating: 4.7, sessions: 87,
  sessionTypes: ['tournament', 'personal']
},
{
  id: 7, name: 'Alaa Gomaa', level: 'Junior', price: 90,
  title: 'Junior Skills Coach',
  bio: 'Specialist in skills-based coaching for competitive juniors. Creates a positive, growth-focused environment in every session.',
  specialties: ['Technical Skills', 'Volley & Drop', 'Competition Mindset'],
  rating: 4.6, sessions: 72,
  sessionTypes: ['tournament', 'personal']
}];


const UPCOMING_TOURNAMENTS = [
{ id: 1, name: 'US Junior Open 2026', location: 'Chicago, IL', dates: 'May 2–4, 2026' },
{ id: 2, name: 'National Junior Championships', location: 'Boston, MA', dates: 'May 9–11, 2026' },
{ id: 3, name: 'Mid-Atlantic Junior Classic', location: 'Philadelphia, PA', dates: 'May 16–18, 2026' },
{ id: 4, name: 'Northeast Junior Invitational', location: 'New York, NY', dates: 'May 23–25, 2026' },
{ id: 5, name: 'Great Lakes Junior Open', location: 'Cleveland, OH', dates: 'May 30 – Jun 1, 2026' },
{ id: 6, name: 'Southeast Junior Championships', location: 'Atlanta, GA', dates: 'Jun 6–8, 2026' },
{ id: 7, name: 'Junior PSA Challenger Series', location: 'Washington, DC', dates: 'Jun 13–15, 2026' }];


// ── Dynamic Availability System ──────────────────────────────────────────────

function getCoachBlockedKey(coachId) {return `squashtime_coach_blocked_${coachId}`;}

function getCoachBlockedSlots(coachId) {
  try {return JSON.parse(localStorage.getItem(getCoachBlockedKey(coachId)) || '{}');}
  catch {return {};}
}

function toggleCoachBlockedSlot(coachId, dateStr, time) {
  const blocked = getCoachBlockedSlots(coachId);
  const slots = blocked[dateStr] || [];
  if (slots.includes(time)) {
    blocked[dateStr] = slots.filter((s) => s !== time);
    if (!blocked[dateStr].length) delete blocked[dateStr];
  } else {
    blocked[dateStr] = [...slots, time];
  }
  localStorage.setItem(getCoachBlockedKey(coachId), JSON.stringify(blocked));
}

function getCoachBookedSlotsFromSessions(coachId) {
  try {
    const coach = COACHES.find((c) => c.id === coachId);
    if (!coach) return {};
    const all = JSON.parse(localStorage.getItem('squashtime_sessions') || '{}');
    const booked = {};
    Object.values(all).forEach((userSessions) => {
      (userSessions || []).forEach((session) => {
        if (session.coachName === coach.name && session.status === 'active') {
          const dateStr = session.date ? new Date(session.date).toDateString() : null;
          if (dateStr && session.time) {
            booked[dateStr] = [...(booked[dateStr] || []), session.time];
          }
        }
      });
    });
    return booked;
  } catch {return {};}
}

function getBaseAvailability(coachId) {
  const availability = {};
  const today = new Date();
  for (let i = 1; i <= 42; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const hash = (date.getDate() * 13 + coachId * 7 + date.getMonth() * 3) % 10;
    if (hash > 2) {
      const allSlots = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];
      const slots = allSlots.filter((_, idx) => (date.getDate() + idx * 3 + coachId * 2) % 4 !== 0);
      if (slots.length > 0) availability[date.toDateString()] = slots;
    }
  }
  return availability;
}

// Real-time availability: base minus blocked minus already-booked
function getCoachAvailability(coachId) {
  const base = getBaseAvailability(coachId);
  const blocked = getCoachBlockedSlots(coachId);
  const booked = getCoachBookedSlotsFromSessions(coachId);
  const result = {};
  for (const [dateStr, slots] of Object.entries(base)) {
    const filtered = slots.filter((slot) =>
    !(blocked[dateStr] || []).includes(slot) &&
    !(booked[dateStr] || []).includes(slot)
    );
    if (filtered.length > 0) result[dateStr] = filtered;
  }
  return result;
}

// Kept for backward-compat — booking.jsx calls getCoachAvailability directly now
const COACH_AVAILABILITY = {};
COACHES.forEach((c) => {COACH_AVAILABILITY[c.id] = getCoachAvailability(c.id);});

function getAvailableCoaches(dateStr, timeSlot) {
  return COACHES.filter((coach) => {
    const slots = getCoachAvailability(coach.id)[dateStr];
    if (!slots) return false;
    if (!timeSlot) return slots.length > 0;
    return slots.includes(timeSlot);
  });
}

function getInitials(name) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('');
}

function coachAccentColor(coach) {
  if (coach.level === 'Fitness') return FITNESS_COLOR;
  if (coach.level === 'Senior') return '#3de05a';
  return '#3ab0e0';
}

// ── Coach Avatar ──────────────────────────────────────────────────────────────

function CoachAvatar({ coach, size = 'md' }) {
  const pxMap = { xs: 32, sm: 42, md: 58, lg: 80, xl: 104 };
  const px = pxMap[size] || 58;
  const accent = coachAccentColor(coach);
  const bgMap = {
    Senior: 'linear-gradient(135deg,#0e2a18,#162e1e)',
    Fitness: 'linear-gradient(135deg,#2a0e0e,#2e1616)',
    Junior: 'linear-gradient(135deg,#0e1a2e,#162230)'
  };
  return (
    <div style={{
      width: px, height: px, borderRadius: '50%', flexShrink: 0,
      background: bgMap[coach.level] || bgMap.Junior,
      border: `2px solid ${accent}33`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'League Spartan', sans-serif", fontWeight: 800,
      fontSize: px * 0.32, color: accent, letterSpacing: '0.04em'
    }}>
      {getInitials(coach.name)}
    </div>);

}

function StarRating({ rating }) {
  return (
    <span style={{ color: '#f0b429', fontSize: 12, letterSpacing: 1 }}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
      <span style={{ color: '#6a8a6a', marginLeft: 4, fontFamily: "'Quicksand',sans-serif" }}>{rating}</span>
    </span>);

}

// ── Coach Card ────────────────────────────────────────────────────────────────

function CoachCard({ coach, onClick, selected = false, compact = false }) {
  const [hov, setHov] = React.useState(false);
  const accent = coachAccentColor(coach);
  const isFitness = coach.level === 'Fitness';

  const bgSelected = isFitness ? '#1e0a0a' : coach.level === 'Senior' ? '#0a1e10' : '#0a1020';

  return (
    <div
      onClick={() => onClick && onClick(coach)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? bgSelected : hov ? '#111811' : '#0d150d',
        border: `1px solid ${selected ? accent : hov ? '#243024' : '#182018'}`,
        borderRadius: 14, padding: compact ? '14px 16px' : '22px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.18s ease', position: 'relative',
        boxShadow: selected ? `0 0 0 1px ${accent}30, 0 4px 24px #00000040` : hov ? '0 4px 20px #00000030' : 'none'
      }}>
      
      {/* Level badge */}
      <div style={{
        position: 'absolute', top: 12, right: 12,
        background: isFitness ? '#2a0e0e' : coach.level === 'Senior' ? '#0d2218' : '#0d1828',
        color: accent, fontSize: 10, fontWeight: 700,
        letterSpacing: '0.12em', padding: '3px 8px', borderRadius: 5,
        fontFamily: "'League Spartan', sans-serif", textTransform: 'uppercase'
      }}>
        {coach.level}{coach.founder ? ' · Founder' : ''}
      </div>

      <div style={{ display: 'flex', gap: 14, alignItems: compact ? 'center' : 'flex-start' }}>
        <CoachAvatar coach={coach} size={compact ? 'sm' : 'md'} />
        <div style={{ flex: 1, minWidth: 0, paddingRight: 60 }}>
          <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: compact ? 15 : 19, color: '#e8f0e8', marginBottom: 1 }}>
            {coach.name}
          </div>
          <div style={{ fontSize: 12, color: '#5a7060', fontFamily: "'Quicksand',sans-serif", marginBottom: compact ? 0 : 8 }}>
            {coach.title}
          </div>

          {!compact &&
          <>
              <div style={{ fontSize: 13, color: '#7a9080', fontFamily: "'Quicksand',sans-serif", lineHeight: 1.6, marginBottom: 12 }}>
                {coach.bio}
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: isFitness ? 10 : 14 }}>
                {coach.specialties.map((s) =>
              <span key={s} style={{
                background: isFitness ? '#1a0a0a' : '#091209',
                border: `1px solid ${isFitness ? '#3a1212' : '#182018'}`,
                color: isFitness ? '#a05050' : '#5a7860',
                fontSize: 11, padding: '3px 9px', borderRadius: 5,
                fontFamily: "'Quicksand',sans-serif", fontWeight: 600
              }}>{s}</span>
              )}
                {isFitness &&
              <span style={{
                background: '#2a0808', border: `1px solid ${FITNESS_COLOR}`,
                color: FITNESS_COLOR, fontSize: 11, padding: '3px 9px', borderRadius: 5,
                fontFamily: "'Quicksand',sans-serif", fontWeight: 700
              }}>Personal Only</span>
              }
              </div>
              {isFitness &&
            <div style={{ border: '1px solid #2a1010', borderRadius: 8, padding: '8px 12px', marginBottom: 14, background: "rgb(24, 14, 14)" }}>
                  <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#8a5050', lineHeight: 1.6 }}>
                    Premium members only · First-come, first-served · No tournament coaching
                  </div>
                </div>
            }
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 800, fontSize: 22, color: accent }}>
                  ${coach.price}<span style={{ fontSize: 12, color: '#3a5040', fontWeight: 500 }}>/hr</span>
                </div>
              </div>
            </>
          }

          {compact &&
          <div style={{ fontSize: 14, color: accent, fontFamily: "'League Spartan',sans-serif", fontWeight: 700 }}>
              ${coach.price}/hr
            </div>
          }
        </div>
      </div>
    </div>);

}

// ── Coach Schedule Manager (for Coach Portal) ────────────────────────────────

function CoachScheduleManager({ coach }) {
  const MONTHS_LIST = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS_LIST = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [tick, setTick] = React.useState(0);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() {if (viewMonth === 0) {setViewMonth(11);setViewYear((y) => y - 1);} else setViewMonth((m) => m - 1);}
  function nextMonth() {if (viewMonth === 11) {setViewMonth(0);setViewYear((y) => y + 1);} else setViewMonth((m) => m + 1);}

  function hasBaseSlots(d) {
    if (!d) return false;
    const dt = new Date(viewYear, viewMonth, d);
    if (dt <= today) return false;
    return (getBaseAvailability(coach.id)[dt.toDateString()] || []).length > 0;
  }

  const selStr = selectedDate ? selectedDate.toDateString() : null;
  const baseSlots = selStr ? getBaseAvailability(coach.id)[selStr] || [] : [];
  const blocked = selStr ? getCoachBlockedSlots(coach.id)[selStr] || [] : [];
  const booked = selStr ? getCoachBookedSlotsFromSessions(coach.id)[selStr] || [] : [];

  function handleToggle(time) {
    if (booked.includes(time)) return;
    toggleCoachBlockedSlot(coach.id, selStr, time);
    setTick((t) => t + 1);
  }

  // Slot counts for stats
  const allBlocked = getCoachBlockedSlots(coach.id);
  const totalBlockedCount = Object.values(allBlocked).reduce((s, a) => s + a.length, 0);
  const allBooked = getCoachBookedSlotsFromSessions(coach.id);
  const totalBookedCount = Object.values(allBooked).reduce((s, a) => s + a.length, 0);

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
        { label: 'Upcoming Bookings', value: totalBookedCount, color: '#f0b429' },
        { label: 'Slots Blocked', value: totalBlockedCount, color: '#e04040' }].
        map((s) =>
        <div key={s.label} style={{ background: '#0a140a', border: '1px solid #182018', borderRadius: 12, padding: '14px 22px', flex: 1 }}>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 900, fontSize: 26, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#4a6050', marginTop: 2 }}>{s.label}</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'start' }}>
        {/* Calendar */}
        <div style={{ background: '#091209', border: '1px solid #182018', borderRadius: 14, padding: 20, userSelect: 'none', minWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: '#5a8060', fontSize: 22, cursor: 'pointer', padding: '0 8px', lineHeight: 1 }}>‹</button>
            <span style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, color: '#c8e0c8', fontSize: 15 }}>{MONTHS_LIST[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: '#5a8060', fontSize: 22, cursor: 'pointer', padding: '0 8px', lineHeight: 1 }}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
            {DAYS_LIST.map((d) => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#3a5040', fontFamily: "'League Spartan',sans-serif", letterSpacing: '0.06em', paddingBottom: 4 }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {cells.map((d, i) => {
              const has = hasBaseSlots(d);
              const dt = d ? new Date(viewYear, viewMonth, d) : null;
              const isSel = dt && selectedDate && dt.toDateString() === selectedDate.toDateString();
              const isPast = dt && dt <= today;
              return (
                <div key={i} onClick={() => {if (has && dt) setSelectedDate(dt);}} style={{
                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 8, fontSize: 13, fontFamily: "'Quicksand',sans-serif", fontWeight: 600,
                  cursor: has ? 'pointer' : 'default',
                  background: isSel ? '#3de05a' : has ? '#0d1f0d' : 'transparent',
                  color: isSel ? '#050d05' : has ? '#a0c8a0' : d && !isPast ? '#3a4e3a' : d ? '#222' : 'transparent',
                  position: 'relative'
                }}>
                  {d}
                  {has && !isSel && <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#3de05a60' }} />}
                </div>);

            })}
          </div>
          {/* Legend */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: '1px solid #182018' }}>
            {[['#3de05a', 'Available'], ['#e04040', 'Blocked by you'], ['#f0b429', 'Booked by player']].map(([c, l]) =>
            <div key={l} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 11, color: '#5a7060' }}>{l}</span>
              </div>
            )}
          </div>
        </div>

        {/* Slot panel */}
        {!selectedDate ?
        <div style={{ background: '#091209', border: '1px solid #182018', borderRadius: 14, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 18, color: '#4a6050', marginBottom: 10 }}>Select a Date</div>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, color: '#3a5040', lineHeight: 1.7 }}>
              Pick a highlighted date to manage your availability.<br />
              Click any slot to block or unblock it.
            </div>
          </div> :

        <div style={{ background: '#091209', border: '1px solid #182018', borderRadius: 14, padding: '22px' }}>
            <div style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 800, fontSize: 18, color: '#d0e8d0', marginBottom: 4 }}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, color: '#4a6050', marginBottom: 18 }}>
              Click a slot to toggle availability. Booked slots cannot be modified.
            </div>
            {baseSlots.length === 0 ?
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 14, color: '#3a5040', padding: '16px 0' }}>No slots for this day.</div> :

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {baseSlots.map((slot) => {
              const isBooked = booked.includes(slot);
              const isBlocked = blocked.includes(slot);
              let bg, border, color, label;
              if (isBooked) {bg = '#1a1200';border = '#f0b42940';color = '#f0b429';label = 'Booked';} else
              if (isBlocked) {bg = '#1a0808';border = '#e0404060';color = '#e04040';label = 'Blocked';} else
              {bg = '#0a1e10';border = '#3de05a40';color = '#3de05a';label = 'Available';}
              return (
                <div key={slot} onClick={() => handleToggle(slot)} style={{
                  background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 8px',
                  cursor: isBooked ? 'not-allowed' : 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  opacity: isBooked ? 0.7 : 1, transition: 'all 0.14s'
                }}>
                      <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 13, color }}>{slot}</span>
                      <span style={{ fontFamily: "'League Spartan',sans-serif", fontWeight: 700, fontSize: 9, color, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.8 }}>{label}</span>
                    </div>);

            })}
              </div>
          }
          </div>
        }
      </div>
    </div>);

}

Object.assign(window, {
  COACHES, COACH_AVAILABILITY, UPCOMING_TOURNAMENTS, FITNESS_COLOR,
  getAvailableCoaches, getCoachAvailability, getBaseAvailability,
  getCoachBlockedSlots, toggleCoachBlockedSlot, getCoachBookedSlotsFromSessions,
  getInitials, coachAccentColor,
  CoachAvatar, CoachCard, StarRating, CoachScheduleManager
});