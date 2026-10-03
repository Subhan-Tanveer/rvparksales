'use client';

// Loads the Google Maps JavaScript API once (with the Places library for the
// location search box). Resolves to window.google.maps.
export const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export function loadGoogleMaps() {
  if (typeof window === 'undefined' || !MAPS_KEY) return Promise.reject(new Error('no key'));
  if (window.google?.maps?.places) return Promise.resolve(window.google.maps);
  if (!window.__gmapsPromise) {
    window.__gmapsPromise = new Promise((resolve, reject) => {
      window.__gmapsReady = () => resolve(window.google.maps);
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&callback=__gmapsReady`;
      s.async = true;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return window.__gmapsPromise;
}

// Turns typed text into a place: Google Geocoding when the key is set,
// otherwise the free OpenStreetMap lookup. Resolves to {lat, lng, label} or null.
export async function geocode(text) {
  const t = (text || '').trim();
  if (!t) return null;
  if (MAPS_KEY) {
    try {
      const maps = await loadGoogleMaps();
      const { results } = await new maps.Geocoder().geocode({ address: t, componentRestrictions: { country: 'us' } });
      const r = results?.[0];
      if (r) return { lat: r.geometry.location.lat(), lng: r.geometry.location.lng(), label: r.formatted_address };
    } catch { /* fall through to OpenStreetMap */ }
  }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(t)}`);
    const [hit] = await res.json();
    if (hit) return { lat: Number(hit.lat), lng: Number(hit.lon), label: t };
  } catch { /* ignore */ }
  return null;
}
