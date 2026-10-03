'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import LocationInput from '@/components/LocationInput';
import { loadGoogleMaps, geocode } from '@/components/googleMaps';

// Same layout as the old listings page (FacetWP): a Filters button that slides
// a filter panel in from the left, the listing cards underneath (24 a page),
// and a map with a pin per listing on the right. Address filters keep the old
// names: _listing_status, _listing_category, _listing_state, _listing_location.
const CATEGORIES = {
  'rv-parks-campgrounds': 'RV Parks/Campgrounds',
  'rv-lots': 'RV Lots',
  'rv-mh-communities': 'RV/MH Communities',
};
const STATUSES = { 'for-sale': 'For Sale', sold: 'Sold' };
const RADII = [10, 25, 50, 100, 250, 500];
const PER_PAGE = 24;
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const money = (n) => (n ? Number(n).toLocaleString('en-US') : null);

function miles(a, b) {
  const R = 3958.8, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const PINS = { red: ['#ea4335', '#a52714'], purple: ['#a020a8', '#6b1270'] };
const pinSvg = ([fill, dark]) => `<svg xmlns="http://www.w3.org/2000/svg" width="27" height="43" viewBox="0 0 27 43"><path d="M13.5 0C6 0 0 6 0 13.5 0 23.6 13.5 43 13.5 43S27 23.6 27 13.5C27 6 21 0 13.5 0z" fill="${fill}" stroke="${dark}" stroke-width="1"/><circle cx="13.5" cy="13.5" r="5" fill="${dark}"/></svg>`;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  if (!document.getElementById('leaflet-css')) {
    const l = document.createElement('link');
    l.id = 'leaflet-css'; l.rel = 'stylesheet'; l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(l);
  }
  window.__leafletPromise ||= loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
  return window.__leafletPromise;
}

export default function ListingsArchive({ listings, fixedState = '', pinColor = 'red' }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [panel, setPanel] = useState(false);
  const mapEl = useRef(null);
  const map = useRef(null);
  const layer = useRef([]);

  const status = sp.get('_listing_status') || '';
  const category = sp.get('_listing_category') || '';
  const stateSlug = fixedState ? slugify(fixedState) : (sp.get('_listing_state') || '');
  const loc = sp.get('_listing_location') || ''; // "lat,lng,radius,label" like FacetWP
  const page = Math.max(1, Number(sp.get('_paged')) || 1);
  const q = (sp.get('q') || '').trim().toLowerCase(); // from the home page search box

  const [locText, setLocText] = useState(() => decodeURIComponent(loc.split(',').slice(3).join(',') || sp.get('q') || ''));
  const [radius, setRadius] = useState(() => Number(loc.split(',')[2]) || 100);
  const [locBusy, setLocBusy] = useState(false);

  function set(patch) {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('_paged' in patch)) next.delete('_paged');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Each facet's options come from the listings matching the *other* filters,
  // which is how the old FacetWP dropdowns behaved.
  const center = useMemo(() => {
    const [lat, lng] = loc.split(',').map(Number);
    return Number.isFinite(lat) && Number.isFinite(lng) && loc ? { lat, lng, r: Number(loc.split(',')[2]) || 100 } : null;
  }, [loc]);
  const match = (l, skip) => (
    (skip === 'status' || !status || l.status === STATUSES[status])
    && (skip === 'category' || !category || l.category === CATEGORIES[category])
    && (skip === 'state' || !stateSlug || slugify(l.state || '') === stateSlug)
    && (!center || (l.lat && l.lng && miles(center, l) <= center.r))
    && (!q || center || `${l.title} ${l.state || ''} ${l.city || ''} ${l.address || ''}`.toLowerCase().includes(q))
  );
  const shown = useMemo(() => listings.filter((l) => match(l)), [listings, status, category, stateSlug, center, q]); // eslint-disable-line react-hooks/exhaustive-deps
  const opts = useMemo(() => ({
    category: Object.keys(CATEGORIES).filter((k) => listings.some((l) => match(l, 'category') && l.category === CATEGORIES[k])),
    state: [...new Set(listings.filter((l) => match(l, 'state') && l.state).map((l) => l.state))].sort(),
    status: Object.keys(STATUSES).filter((k) => listings.some((l) => match(l, 'status') && l.status === STATUSES[k])),
  }), [listings, status, category, stateSlug, center, q]); // eslint-disable-line react-hooks/exhaustive-deps

  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const rows = shown.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const filterCount = [status, category, !fixedState && stateSlug, loc].filter(Boolean).length;

  const setCenter = ({ lat, lng, label }, r = radius) => set({ _listing_location: `${lat.toFixed(5)},${lng.toFixed(5)},${r},${encodeURIComponent(label)}`, q: '' });
  const currentLabel = decodeURIComponent(loc.split(',').slice(3).join(','));
  async function applyLocation(text = locText, r = radius) {
    const t = text.trim();
    if (!t) { set({ _listing_location: '' }); return; }
    if (center && t === currentLabel && r === center.r) return;
    if (center && t === currentLabel) { setCenter({ lat: center.lat, lng: center.lng, label: t }, r); return; }
    setLocBusy(true);
    const hit = await geocode(t);
    if (hit) setCenter({ ...hit, label: t }, r);
    setLocBusy(false);
  }
  function locateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => {
      setLocText('Your location');
      set({ _listing_location: `${p.coords.latitude.toFixed(5)},${p.coords.longitude.toFixed(5)},${radius},${encodeURIComponent('Your location')}` });
    });
  }
  function resetAll() {
    setLocText(''); setRadius(100);
    router.replace(pathname, { scroll: false });
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setPanel(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Map: Google Maps when a key is configured (as on the old site), otherwise
  // an OpenStreetMap fallback so previews still show the pins.
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  useEffect(() => {
    if (!mapEl.current) return undefined;
    let cancelled = false;
    const pts = shown.filter((l) => l.lat && l.lng);
    // Hover card for a pin: photo slider (with small back/next arrows), title and price.
    const card = (l) => {
      const photos = l.photos?.length ? l.photos : (l.featuredImage ? [l.featuredImage] : []);
      const el = document.createElement('div');
      el.className = 'map-card';
      let i = 0;
      el.innerHTML = `${photos.length ? `<a class="mc-img" href="/listing/${l.slug}/"><img src="${photos[0]}" alt="" /></a>` : ''}${photos.length > 1 ? '<button type="button" class="mc-nav prev" aria-label="Previous photo"></button><button type="button" class="mc-nav next" aria-label="Next photo"></button><span class="mc-count"></span>' : ''}<a class="mc-title" href="/listing/${l.slug}/"></a>${l.priceUsd ? `<div class="mc-price">$ ${money(l.priceUsd)}</div>` : ''}`;
      el.querySelector('.mc-title').textContent = l.title;
      const img = el.querySelector('.mc-img img');
      const count = el.querySelector('.mc-count');
      const show = () => { img.src = photos[i]; if (count) count.textContent = `${i + 1} / ${photos.length}`; };
      if (count) show();
      el.querySelectorAll('.mc-nav').forEach((b) => b.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        i = (i + (b.classList.contains('next') ? 1 : -1) + photos.length) % photos.length;
        show();
      }));
      photos.slice(1).forEach((src) => { const im = new Image(); im.src = src; }); // preload so arrows feel instant
      return el;
    };
    // Open on hover; stay open while the pointer is on the pin or the card.
    let closeTimer = null;
    const hold = () => clearTimeout(closeTimer);
    const later = (fn) => { clearTimeout(closeTimer); closeTimer = setTimeout(fn, 300); };
    (key ? loadGoogleMaps() : loadLeaflet()).then(() => {
      if (cancelled) return;
      if (key) {
        const g = window.google.maps;
        map.current ||= new g.Map(mapEl.current, { center: { lat: 39, lng: -98 }, zoom: 4, streetViewControl: false });
        layer.current.forEach((m) => m.setMap(null));
        const info = new g.InfoWindow({ maxWidth: 280 });
        let pinned = false;
        info.addListener('closeclick', () => { pinned = false; });
        const bounds = new g.LatLngBounds();
        layer.current = pts.map((l) => {
          const m = new g.Marker({
            position: { lat: l.lat, lng: l.lng }, map: map.current,
            ...(pinColor !== 'red' && { icon: { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(pinSvg(PINS[pinColor]))}`, scaledSize: new g.Size(27, 43) } }),
          });
          const open = () => {
            hold();
            if (info.__for === l.slug && info.getMap()) return;
            const el = card(l);
            el.addEventListener('mouseenter', hold);
            el.addEventListener('mouseleave', () => { if (!pinned) later(() => info.close()); });
            info.__for = l.slug;
            info.setContent(el);
            info.open({ map: map.current, anchor: m, shouldFocus: false });
          };
          m.addListener('mouseover', () => { pinned = false; open(); });
          m.addListener('mouseout', () => { if (!pinned) later(() => info.close()); });
          m.addListener('click', () => { open(); pinned = true; });
          bounds.extend(m.getPosition());
          return m;
        });
        if (pts.length > 1) map.current.fitBounds(bounds, 40);
        else if (pts.length === 1) { map.current.setCenter(bounds.getCenter()); map.current.setZoom(8); }
      } else {
        const L = window.L;
        if (!map.current) {
          map.current = L.map(mapEl.current, { scrollWheelZoom: false, fadeAnimation: false }).setView([39, -98], 4);
          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
          }).addTo(map.current);
        }
        layer.current.forEach((m) => m.remove());
        const icon = L.divIcon({ html: pinSvg(PINS[pinColor] || PINS.red), className: 'map-pin', iconSize: [27, 43], iconAnchor: [13.5, 43], popupAnchor: [0, -38] });
        layer.current = pts.map((l) => {
          const mk = L.marker([l.lat, l.lng], { icon }).bindPopup(() => {
            const el = card(l);
            el.addEventListener('mouseenter', hold);
            el.addEventListener('mouseleave', () => later(() => mk.closePopup()));
            return el;
          }, { maxWidth: 280, minWidth: 240 }).addTo(map.current);
          mk.on('mouseover', () => { hold(); mk.openPopup(); });
          mk.on('mouseout', () => later(() => mk.closePopup()));
          return mk;
        });
        if (pts.length > 1) map.current.fitBounds(L.latLngBounds(pts.map((l) => [l.lat, l.lng])), { padding: [40, 40] });
        else if (pts.length === 1) map.current.setView([pts[0].lat, pts[0].lng], 8);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [shown, key]);

  const Label = ({ children, onReset }) => (
    <h3 className="facet-label">{children}<span className="reset"><a role="button" tabIndex={0} onClick={onReset}>Reset</a></span></h3>
  );

  return (
    <div className="arch">
      <div className="arch-list">
        <button type="button" className="btn btn-block filters-btn" onClick={() => setPanel(true)} aria-haspopup="dialog">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 3.5h19l-7.5 9v7l-4 2v-9z" /></svg>
          Filters{filterCount > 0 && <span className="n">{filterCount}</span>}
        </button>

        <div className="l-grid">
          {rows.length === 0 && <p className="no-results">No results found.</p>}
          {rows.map((l) => (
            <Link key={l.slug} href={`/listing/${l.slug}/`} className="l-row" aria-label={l.title}>
              {l.thumb || l.featuredImage ? <img src={l.thumb || l.featuredImage} alt="" loading="lazy" width="75" height="75" /> : <span className="noimg" />}
              <div className="l-body">
                <div className="l-top">
                  <h3>{l.title}</h3>
                  <span className="status">{l.status}</span>
                </div>
                {(money(l.priceUsd) || l.category) && (
                  <div className="l-meta">
                    {money(l.priceUsd) && <span className="price"><b>$</b>{money(l.priceUsd)}</span>}
                    {l.category && (
                      <span className="tax">
                        <svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M572.7 292.1L500.3 416.2c-9.2 15.8-26.1 25.5-44.4 25.5H48c-19.4 0-31.4-21.1-21.6-37.9l72.4-124.2c9.2-15.8 26.1-25.5 44.4-25.5H551c19.4 0 31.4 21.1 21.6 37.9zM144 224h352v-48c0-26.5-21.5-48-48-48H288l-64-64H48C21.5 64 0 85.5 0 112v278l69.1-118.5C86.2 242 113.9 224 144 224z" /></svg>
                        {l.category}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {pages > 1 && (
          <div className="pager" role="navigation">
            {page > 1 && <a role="link" tabIndex={0} onClick={() => set({ _paged: String(page - 1) })}>« Prev</a>}
            {Array.from({ length: pages }, (_, n) => n + 1).map((n) => (
              <a key={n} role="link" tabIndex={0} className={n === page ? 'active' : ''} aria-current={n === page} onClick={() => set({ _paged: n === 1 ? '' : String(n) })}>{n}</a>
            ))}
            {page < pages && <a role="link" tabIndex={0} onClick={() => set({ _paged: String(page + 1) })}>Next »</a>}
          </div>
        )}
      </div>

      <div className="arch-map"><div ref={mapEl} className="arch-map-canvas" /></div>

      <div className={`w-popup filters-pop ${panel ? 'open' : ''}`} aria-hidden={!panel}>
        <div className="w-popup-overlay" onClick={() => setPanel(false)} />
        <button type="button" className="w-popup-closer" aria-label="Close" onClick={() => setPanel(false)}>×</button>
        <div className="filters-box" role="dialog" aria-label="Filters">
          <div className="facet">
            <Label onReset={() => { setLocText(''); set({ _listing_location: '', q: '' }); }}>Location</Label>
            <div className="loc-row">
              <span className="loc-wrap">
                <LocationInput value={locText} onChange={setLocText} onEnter={() => applyLocation()}
                  onPick={(pl) => { setLocText(pl.label); setCenter(pl); }} />
                <button type="button" className="locate-me" aria-label="Use my location" onClick={locateMe}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="6.5" /><circle cx="12" cy="12" r="2" fill="currentColor" /><path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" /></svg>
                </button>
              </span>
              <select value={radius} aria-label="Radius" onChange={(e) => { const r = Number(e.target.value); setRadius(r); if (center) applyLocation(locText, r); }}>
                {RADII.map((r) => <option key={r} value={r}>{r} mi</option>)}
              </select>
            </div>
            {locBusy && <small>Finding location…</small>}
          </div>
          <div className="facet">
            <Label onReset={() => set({ _listing_category: '' })}>Category</Label>
            <select value={category} aria-label="Any category" onChange={(e) => set({ _listing_category: e.target.value })}>
              <option value="">Any category</option>
              {opts.category.map((k) => <option key={k} value={k}>{CATEGORIES[k]}</option>)}
            </select>
          </div>
          {!fixedState && (
            <div className="facet">
              <Label onReset={() => set({ _listing_state: '' })}>State</Label>
              <select value={stateSlug} aria-label="Any state" onChange={(e) => set({ _listing_state: e.target.value })}>
                <option value="">Any state</option>
                {opts.state.map((s) => <option key={s} value={slugify(s)}>{s} RV Parks and Campgrounds</option>)}
              </select>
            </div>
          )}
          <div className="facet">
            <Label onReset={() => set({ _listing_status: '' })}>Status</Label>
            <select value={status} aria-label="Status" onChange={(e) => set({ _listing_status: e.target.value })}>
              <option value="">Any status</option>
              {opts.status.map((k) => <option key={k} value={k}>{STATUSES[k]}</option>)}
            </select>
          </div>
          <div style={{ height: 27 }} />
          <div className="filters-btns">
            <button type="button" className="btn" onClick={async () => { await applyLocation(); setPanel(false); }}>Search</button>
            <button type="button" className="btn btn-2" onClick={resetAll}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}
