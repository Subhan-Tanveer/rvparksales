'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Same layout as the current site's listings page: a Filters button and a
// scrolling list of listing rows on the left, a map on the right. The address
// filters match the old links (?_listing_status=for-sale&_listing_category=rv-lots).
const CATEGORIES = {
  'rv-parks-campgrounds': 'RV Parks/Campgrounds',
  'rv-lots': 'RV Lots',
  'rv-mh-communities': 'RV/MH Communities',
};
const usd = (n) => (n ? '$ ' + Number(n).toLocaleString('en-US') : null);

function loadMaps(key) {
  if (typeof window === 'undefined') return Promise.reject();
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (window.__gmapsPromise) return window.__gmapsPromise;
  window.__gmapsPromise = new Promise((resolve, reject) => {
    window.__gmapsReady = () => resolve(window.google.maps);
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=__gmapsReady`;
    s.async = true; s.onerror = reject;
    document.head.appendChild(s);
  });
  return window.__gmapsPromise;
}

export default function ListingsArchive({ listings, states, fixedState = '' }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [panel, setPanel] = useState(false);
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markers = useRef([]);
  const [mapState, setMapState] = useState('idle');

  const status = sp.get('_listing_status') === 'sold' ? 'sold' : (sp.get('_listing_status') === 'for-sale' || !sp.get('_listing_status') ? 'for-sale' : 'for-sale');
  const category = sp.get('_listing_category') || '';
  const state = fixedState || sp.get('state') || '';
  const max = Number(sp.get('max')) || 0;
  const q = (sp.get('q') || '').trim().toLowerCase();

  function set(patch) {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const shown = useMemo(() => {
    let rows = listings.filter((l) => (status === 'sold' ? l.status === 'Sold' : l.status === 'For Sale'));
    if (category && CATEGORIES[category]) rows = rows.filter((l) => l.category === CATEGORIES[category]);
    if (state) rows = rows.filter((l) => l.state === state);
    if (max) rows = rows.filter((l) => l.priceUsd && l.priceUsd <= max);
    if (q) rows = rows.filter((l) => `${l.title} ${l.state || ''} ${l.address || ''}`.toLowerCase().includes(q));
    return rows;
  }, [listings, status, category, state, max, q]);

  const filterCount = [category, !fixedState && state, max, q, status === 'sold'].filter(Boolean).length;

  // Map
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  useEffect(() => {
    if (!key || !mapEl.current) { setMapState('nokey'); return; }
    let cancelled = false;
    loadMaps(key).then((maps) => {
      if (cancelled) return;
      if (!mapRef.current) mapRef.current = new maps.Map(mapEl.current, { center: { lat: 38.5, lng: -96 }, zoom: 4, mapTypeControl: false, streetViewControl: false });
      markers.current.forEach((m) => m.setMap(null));
      markers.current = [];
      const bounds = new maps.LatLngBounds();
      const info = new maps.InfoWindow();
      shown.filter((l) => l.lat && l.lng).forEach((l) => {
        const m = new maps.Marker({ position: { lat: l.lat, lng: l.lng }, map: mapRef.current, title: l.title });
        m.addListener('click', () => {
          info.setContent(`<div style="font:14px Rubik,sans-serif;max-width:220px"><strong>${l.title.replace(/</g, '&lt;')}</strong><br/><a href="/listing/${l.slug}/">View listing</a></div>`);
          info.open(mapRef.current, m);
        });
        markers.current.push(m);
        bounds.extend(m.getPosition());
      });
      if (markers.current.length) mapRef.current.fitBounds(bounds, 60);
      setMapState('ready');
    }).catch(() => setMapState('error'));
    return () => { cancelled = true; };
  }, [shown, key]);

  return (
    <div className="arch">
      <div className="arch-list">
        <button type="button" className="filters-btn" onClick={() => setPanel(!panel)} aria-expanded={panel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 4h18l-7 8v7l-4 2v-9z" /></svg>
          Filters {filterCount > 0 && <span className="n">{filterCount}</span>}
        </button>
        {panel && (
          <div className="filters-panel">
            <select value={status} onChange={(e) => set({ _listing_status: e.target.value })} aria-label="Status">
              <option value="for-sale">For Sale</option>
              <option value="sold">Sold</option>
            </select>
            <select value={category} onChange={(e) => set({ _listing_category: e.target.value })} aria-label="Property type">
              <option value="">All property types</option>
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {!fixedState && (
              <select value={state} onChange={(e) => set({ state: e.target.value })} aria-label="State">
                <option value="">Any state</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            <select value={String(max || '')} onChange={(e) => set({ max: e.target.value })} aria-label="Maximum price">
              <option value="">Any price</option>
              <option value="500000">Up to $500,000</option>
              <option value="1000000">Up to $1 million</option>
              <option value="2500000">Up to $2.5 million</option>
              <option value="5000000">Up to $5 million</option>
            </select>
            <input defaultValue={sp.get('q') || ''} placeholder="Keyword, city or state" aria-label="Keyword"
              onKeyDown={(e) => { if (e.key === 'Enter') set({ q: e.currentTarget.value }); }}
              onBlur={(e) => { if (e.currentTarget.value !== (sp.get('q') || '')) set({ q: e.currentTarget.value }); }} />
          </div>
        )}

        {shown.length === 0 && <p style={{ padding: '10px 4px' }}>No listings match those filters.</p>}
        {shown.map((l) => (
          <Link key={l.slug} href={`/listing/${l.slug}/`} className="l-row">
            {l.featuredImage ? <img src={l.featuredImage} alt="" loading="lazy" /> : <div />}
            <div>
              <div className="t">{l.title}</div>
              <div className="meta">
                {l.status !== 'Sold' && usd(l.priceUsd) && <span className="badge">{usd(l.priceUsd)}</span>}
                <span className="cat-line">▤ {l.category}</span>
              </div>
            </div>
            <div><span className="badge">{l.status === 'Sold' ? 'Sold' : 'For Sale'}</span></div>
          </Link>
        ))}
      </div>
      <div className="arch-map">
        <div ref={mapEl} style={{ width: '100%', height: '100%' }} />
        {mapState === 'nokey' && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#777', fontSize: '.9rem', padding: 20, textAlign: 'center' }}>Map preview needs a Google Maps key (set NEXT_PUBLIC_GOOGLE_MAPS_KEY).</div>}
      </div>
    </div>
  );
}
