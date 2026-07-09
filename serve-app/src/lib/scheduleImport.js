// scheduleImport.js — parse a pasted schedule (CSV, TSV, or plain lines) into
// session rows the store can publish. Coaches that don't exist yet are
// reported so the caller can auto-create them.
//
// Expected columns (header row optional, order flexible when a header is
// present): Day, Time, Coach, Court, Title, Type, Players
//   · Day: Mon/Monday/…   · Time: 24h HH:MM   · Court: number
//   · Players: separated by ; or /
// Without a header, that exact column order is assumed.

const DAYS = {
  mon: 'Mon', monday: 'Mon', tue: 'Tue', tues: 'Tue', tuesday: 'Tue',
  wed: 'Wed', wednesday: 'Wed', thu: 'Thu', thur: 'Thu', thurs: 'Thu', thursday: 'Thu',
  fri: 'Fri', friday: 'Fri', sat: 'Sat', saturday: 'Sat', sun: 'Sun', sunday: 'Sun',
};
const COLS = ['day', 'time', 'coach', 'court', 'title', 'type', 'players'];

const split = (line) => line.split(/\t|,/).map((c) => c.trim());
const normDay = (v) => DAYS[(v || '').toLowerCase().trim()] || null;
const normTime = (v) => {
  const m = (v || '').trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!m) return null;
  const h = Math.min(23, parseInt(m[1], 10));
  return `${String(h).padStart(2, '0')}:${m[2]}`;
};

export function parseSchedule(text) {
  const lines = (text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], skipped: 0 };

  // header row? map column order by name; otherwise use the default order
  let order = COLS;
  let start = 0;
  const first = split(lines[0]).map((c) => c.toLowerCase());
  if (first.includes('day') && first.includes('time')) {
    order = first.map((h) => COLS.find((c) => h.includes(c)) || null);
    start = 1;
  }

  const rows = [];
  let skipped = 0;
  for (const line of lines.slice(start)) {
    const cells = split(line);
    const get = (col) => {
      const i = order.indexOf(col);
      return i >= 0 ? (cells[i] || '') : '';
    };
    const day = normDay(get('day'));
    const time = normTime(get('time'));
    const coach = get('coach').trim();
    const court = parseInt(get('court'), 10) || 1;
    if (!day || !time || !coach) { skipped++; continue; }
    const players = get('players').split(/[;/]/).map((p) => p.trim()).filter(Boolean);
    rows.push({
      day, time, coach, court,
      title: get('title').trim() || get('type').trim() || 'Training',
      type: get('type').trim() || 'Group training',
      players,
    });
  }
  return { rows, skipped };
}
