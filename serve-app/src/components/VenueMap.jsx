// VenueMap.jsx — the Discover map. A real, pannable OpenStreetMap of Cairo
// with a brand-coloured pin per venue.
//
// Leaflet + OSM tiles: no API key, no billing account, no per-view quota. The
// tiles are recoloured in CSS (see .serve-map in index.css) so the map reads
// as SERVE in both themes instead of as a stock Google embed. Venues that sit
// on top of each other collapse into a count bubble that zooms in on tap, and
// every venue still hands off to real Google Maps for directions.

import { useEffect, useRef, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Icons } from './Icons';

const CAIRO = [30.0444, 31.2357];

// A venue pin: a brand-coloured dot, bigger and labelled when it's the one
// the sheet below is showing.
function pinIcon(v, active) {
  const col = v.accent && v.accent !== 'var(--sq-gold)' ? v.accent : 'var(--sq-gold)';
  const d = active ? 16 : 12;
  const label = active
    ? `<span class="serve-pin-label sq-display">${escapeHtml(v.short || v.name || '')}</span>`
    : '';
  return L.divIcon({
    className: 'serve-pin' + (active ? ' on' : ''),
    html: `<span class="serve-pin-dot" style="--pin:${col};width:${d}px;height:${d}px"></span>${label}`,
    iconSize: [d, d],
    iconAnchor: [d / 2, d / 2],
  });
}

function clusterIcon(n) {
  const d = n > 9 ? 34 : 30;
  return L.divIcon({
    className: 'serve-pin serve-cluster',
    html: `<span class="serve-cluster-bubble sq-display" style="width:${d}px;height:${d}px">${n}</span>`,
    iconSize: [d, d],
    iconAnchor: [d / 2, d / 2],
  });
}

const meIcon = () =>
  L.divIcon({ className: 'serve-pin', html: '<span class="serve-me-dot"></span>', iconSize: [14, 14], iconAnchor: [7, 7] });

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Group venues whose screen positions are within `px` of each other. O(n²),
// which is nothing at the scale of "every squash venue in Egypt".
function clusterAt(map, items, px) {
  const pts = items.map((v) => ({ v, p: map.latLngToLayerPoint([v.lat, v.lng]) }));
  const used = new Array(pts.length).fill(false);
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const group = [pts[i].v];
    for (let j = i + 1; j < pts.length; j++) {
      if (used[j]) continue;
      if (pts[i].p.distanceTo(pts[j].p) < px) { used[j] = true; group.push(pts[j].v); }
    }
    out.push(group);
  }
  return out;
}

export default function VenueMap({ venues = [], height = 196, activeId, onPick, me = null }) {
  const hostRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const meRef = useRef(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  // On a phone the map fills the width of a vertically-scrolling feed, so a
  // drag would steal the scroll. It stays locked until the player taps it.
  const [locked, setLocked] = useState(() => typeof window !== 'undefined' && 'ontouchstart' in window);
  const [tiles, setTiles] = useState('loading'); // loading | ok | offline

  const mapped = useMemo(() => venues.filter((v) => v.lat != null && v.lng != null), [venues]);
  // Only refit the view when the SET of venues changes — not on every 30s
  // clock tick, which would yank the map out from under a player mid-pan.
  const sig = useMemo(
    () => mapped.map((v) => `${v.id}:${v.lat.toFixed(3)},${v.lng.toFixed(3)}`).sort().join('|'),
    [mapped],
  );
  const activeRef = useRef(activeId);
  activeRef.current = activeId;

  // ── create the map once ─────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !hostRef.current) return;
    const map = L.map(hostRef.current, {
      center: CAIRO,
      zoom: 10,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,   // the map lives inside a scrolling feed
      tap: true,
    });
    const tl = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
      crossOrigin: true,
    }).addTo(map);
    // a blank grey box reads as a bug; say so instead
    let ok = 0, bad = 0;
    tl.on('tileload', () => { ok += 1; setTiles('ok'); });
    tl.on('tileerror', () => { bad += 1; if (!ok && bad > 2) setTiles('offline'); });
    L.control.zoom({ position: 'topright' }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // the container is measured before it has settled in the flex column
    setTimeout(() => map.invalidateSize(), 0);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── keep the height honest ──────────────────────────────────────────
  useEffect(() => { mapRef.current?.invalidateSize(); }, [height]);

  // ── lock / unlock gestures ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const h of ['dragging', 'touchZoom', 'doubleClickZoom']) {
      if (locked) map[h].disable(); else map[h].enable();
    }
    // the wheel only ever engages after a deliberate tap, on any device
    if (locked) map.scrollWheelZoom.disable(); else map.scrollWheelZoom.enable();
  }, [locked]);

  // ── frame the venues ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pts = [...mapped.map((v) => [v.lat, v.lng]), ...(me ? [[me.lat, me.lng]] : [])];
    if (!pts.length) { map.setView(CAIRO, 10); return; }
    if (pts.length === 1) { map.setView(pts[0], 13); return; }
    map.fitBounds(L.latLngBounds(pts).pad(0.18), { animate: false, maxZoom: 14 });
  }, [sig, me?.lat, me?.lng]);

  // ── draw pins & clusters, re-clustering on every zoom/pan ───────────
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    const draw = () => {
      layer.clearLayers();
      if (!mapped.length) return;
      const active = mapped.find((v) => v.id === activeRef.current);
      // the active venue always shows as itself, never swallowed by a bubble
      const rest = active ? mapped.filter((v) => v.id !== active.id) : mapped;
      for (const group of clusterAt(map, rest, 42)) {
        if (group.length === 1) {
          const v = group[0];
          L.marker([v.lat, v.lng], { icon: pinIcon(v, false), title: v.name, keyboard: false })
            .on('click', () => onPickRef.current?.(v))
            .addTo(layer);
        } else {
          const lat = group.reduce((a, v) => a + v.lat, 0) / group.length;
          const lng = group.reduce((a, v) => a + v.lng, 0) / group.length;
          L.marker([lat, lng], { icon: clusterIcon(group.length), keyboard: false })
            .on('click', () => {
              const b = L.latLngBounds(group.map((v) => [v.lat, v.lng]));
              // a cluster of venues at the same address can't be split by
              // zooming — pick the first one instead of zooming forever
              if (map.getZoom() >= 16 || b.getNorthEast().equals(b.getSouthWest())) onPickRef.current?.(group[0]);
              else map.fitBounds(b.pad(0.35), { maxZoom: 16 });
            })
            .addTo(layer);
        }
      }
      if (active) {
        L.marker([active.lat, active.lng], { icon: pinIcon(active, true), zIndexOffset: 500, keyboard: false })
          .on('click', () => onPickRef.current?.(active))
          .addTo(layer);
      }
    };

    draw();
    map.on('zoomend moveend', draw);
    return () => { map.off('zoomend moveend', draw); };
  }, [mapped, activeId]);

  // ── you-are-here ────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (meRef.current) { meRef.current.remove(); meRef.current = null; }
    if (!me) return;
    meRef.current = L.marker([me.lat, me.lng], { icon: meIcon(), interactive: false, zIndexOffset: 900 }).addTo(map);
  }, [me?.lat, me?.lng]);

  // ── keep the picked venue in view ───────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const v = mapped.find((x) => x.id === activeId);
    if (!map || !v) return;
    if (!map.getBounds().pad(-0.12).contains([v.lat, v.lng])) map.panTo([v.lat, v.lng], { animate: true });
  }, [activeId, mapped]);

  const fitAll = () => {
    const map = mapRef.current;
    if (!map) return;
    const pts = [...mapped.map((v) => [v.lat, v.lng]), ...(me ? [[me.lat, me.lng]] : [])];
    if (pts.length > 1) map.fitBounds(L.latLngBounds(pts).pad(0.18), { maxZoom: 14 });
    else if (pts.length) map.setView(pts[0], 13);
  };

  return (
    <div className="serve-map" style={{ position: 'relative', height, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--sq-border)', background: 'var(--sq-surface)' }}>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />

      {/* venue count — doubles as "fit everything back in frame" */}
      <button
        onClick={fitAll}
        className="sq-mono serve-map-chip"
        style={{ left: 10, top: 10 }}
        title="Show all venues"
      >
        <Icons.Pin size={10} /> {mapped.length} {mapped.length === 1 ? 'venue' : 'venues'}
      </button>

      {/* While locked, Leaflet doesn't swallow the touch, so the feed scrolls
          normally and pins stay tappable. This chip hands the map back. */}
      {locked && (
        <button onClick={() => setLocked(false)} className="sq-mono serve-map-chip serve-map-unlock">
          <Icons.Search size={10} /> Tap to explore
        </button>
      )}

      {tiles === 'offline' && (
        <div className="sq-mono" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-text-3)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', pointerEvents: 'none', zIndex: 380 }}>
          Map offline · pins still accurate
        </div>
      )}

      {!mapped.length && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sq-text-3)', fontSize: 12, pointerEvents: 'none', zIndex: 500 }}>
          No mapped venues yet
        </div>
      )}
    </div>
  );
}
