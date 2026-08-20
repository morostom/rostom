// geo.js — turn what an admin actually pastes (a Google Maps link, a plus
// code, or a plain address) into coordinates we can plot, plus the helpers
// the Discover map needs.
//
// No Maps API key is involved: we read coordinates straight out of the link
// when they're in it, and fall back to a small gazetteer of Cairo/Alex
// districts when it's just an address. Every venue still gets a real
// "Open in Maps" link out to Google.

// Cairo-area districts we can place from a written address alone.
const PLACES = [
  ['new cairo', 30.0300, 31.4700], ['fifth settlement', 30.0250, 31.4300],
  ['tagamoa', 30.0250, 31.4300], ['rehab', 30.0600, 31.4900],
  ['madinaty', 30.1050, 31.6100], ['heliopolis', 30.0880, 31.3240],
  ['masr el gedida', 30.0880, 31.3240], ['masr elgedida', 30.0880, 31.3240],
  ['nasr city', 30.0600, 31.3400], ['shorouk', 30.1400, 31.6300],
  ['el shorouk', 30.1400, 31.6300], ['obour', 30.2280, 31.4700],
  ['maadi', 29.9600, 31.2600], ['zamalek', 30.0600, 31.2200],
  ['dokki', 30.0380, 31.2120], ['mohandessin', 30.0560, 31.2000],
  ['giza', 30.0130, 31.2090], ['sheikh zayed', 30.0400, 30.9700],
  ['6th of october', 29.9700, 30.9400], ['october', 29.9700, 30.9400],
  ['haram', 29.9900, 31.1600], ['garden city', 30.0370, 31.2310],
  ['downtown', 30.0450, 31.2360], ['cairo', 30.0444, 31.2357],
  ['alexandria', 31.2001, 29.9187], ['smouha', 31.2150, 29.9450],
  ['sporting', 31.2170, 29.9350], ['north coast', 30.9200, 28.9500],
  ['sahel', 30.9200, 28.9500], ['ain sokhna', 29.6000, 32.3200],
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Pull coordinates out of a Google/Apple Maps URL. Handles the common shapes:
//   .../@30.0444,31.2357,15z        ?q=30.04,31.23      !3d30.04!4d31.23
//   maps?ll=30.04,31.23             geo:30.04,31.23
export function coordsFromMapsUrl(url) {
  const s = String(url || '');
  if (!s) return null;
  const pats = [
    /@(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/,
    /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/,
    /[?&](?:q|ll|sll|daddr|center)=(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/i,
    /^geo:(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/i,
    /(-?\d{1,2}\.\d{4,}),\s*(-?\d{1,3}\.\d{4,})/, // bare "lat, lng" paste
  ];
  for (const re of pats) {
    const m = s.match(re);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

// Best-effort coordinates for a venue: an explicit map link wins, then a
// recognised district in the address/location text.
export function venueCoords({ maps_url, address, location, city } = {}) {
  const fromUrl = coordsFromMapsUrl(maps_url) || coordsFromMapsUrl(address);
  if (fromUrl) return { ...fromUrl, exact: true };
  const hay = `${address || ''} ${location || ''} ${city || ''}`.toLowerCase();
  for (const [name, lat, lng] of PLACES) {
    if (hay.includes(name)) return { lat, lng, exact: false };
  }
  return null;
}

// A Google Maps link that always works — the venue's own link if they gave
// one, otherwise a search for its name + address.
export function mapsLink({ maps_url, name, address, location, city } = {}) {
  if (maps_url && /^https?:\/\//i.test(maps_url)) return maps_url;
  const q = [name, address || location, city].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || 'squash')}`;
}

// Project lat/lng into 0..1 box coordinates for the stylised map.
// Fits everything passed in, with padding, so the pins always fill the frame.
// Build the lat/lng → 0..1 transform for a set of points, and hand it back
// so the MAP BACKGROUND can be projected through the same maths. Without
// this the Nile and the pins live in different coordinate systems and the
// map is just a decorative grid.
export function makeProjection(points, pad = 0.14) {
  const pts = points.filter((p) => p.lat != null && p.lng != null);
  if (!pts.length) return null;
  const q = (arr, f) => {
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.max(0, Math.round((s.length - 1) * f)))];
  };
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const cLat = q(lats, 0.5);
  const cLng = q(lngs, 0.5);
  const spanLat = Math.min(Math.max((q(lats, 0.9) - q(lats, 0.1)) * 1.6, 0.05), 0.45);
  const spanLng = Math.min(Math.max((q(lngs, 0.9) - q(lngs, 0.1)) * 1.6, 0.05), 0.55);
  const minLat = cLat - spanLat / 2, maxLat = cLat + spanLat / 2;
  const minLng = cLng - spanLng / 2, maxLng = cLng + spanLng / 2;
  // clamp=false lets background geography run off the edge and be clipped,
  // instead of piling up on the border
  return (lat, lng, clamp_ = true) => {
    const x = pad + ((lng - minLng) / (maxLng - minLng)) * (1 - pad * 2);
    const y = pad + ((maxLat - lat) / (maxLat - minLat)) * (1 - pad * 2);
    return clamp_ ? { x: clamp(x, 0.04, 0.96), y: clamp(y, 0.06, 0.94) } : { x, y };
  };
}

export function projectPins(pins, pad = 0.14) {
  const pts = pins.filter((p) => p.lat != null && p.lng != null);
  if (!pts.length) return [];
  // Frame the DENSE cluster, not the extremes: one venue in Alexandria
  // would otherwise squash every Cairo pin into a corner. We centre on the
  // median and size the window from the 10th-90th percentile, so outliers
  // clamp to the edge instead of dictating the scale.
  const q = (arr, f) => {
    const s = [...arr].sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.max(0, Math.round((s.length - 1) * f)))];
  };
  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const cLat = q(lats, 0.5);
  const cLng = q(lngs, 0.5);
  const spanLat = Math.min(Math.max((q(lats, 0.9) - q(lats, 0.1)) * 1.6, 0.05), 0.45);
  const spanLng = Math.min(Math.max((q(lngs, 0.9) - q(lngs, 0.1)) * 1.6, 0.05), 0.55);
  let minLat, maxLat, minLng, maxLng;
  minLat = cLat - spanLat / 2; maxLat = cLat + spanLat / 2;
  minLng = cLng - spanLng / 2; maxLng = cLng + spanLng / 2;
  // venues that resolve to the same district would land on one dot — fan
  // them out on a small deterministic ring so every pin stays tappable
  const seen = new Map();
  const spread = pts.map((p) => {
    const key = `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`;
    const n = seen.get(key) || 0;
    seen.set(key, n + 1);
    if (!n) return p;
    const a = (n * 2.39996);            // golden angle, so rings look even
    const r = 0.012 * Math.sqrt(n);
    return { ...p, lat: p.lat + r * Math.sin(a) * 0.7, lng: p.lng + r * Math.cos(a) };
  });
  return spread.map((p) => ({
    ...p,
    x: clamp(pad + ((p.lng - minLng) / (maxLng - minLng)) * (1 - pad * 2), 0.04, 0.96),
    // screen y grows downward, latitude grows upward
    y: clamp(pad + ((maxLat - p.lat) / (maxLat - minLat)) * (1 - pad * 2), 0.06, 0.94),
  }));
}

// straight-line distance, km — good enough for a "3.2 km" label
export function distanceKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
