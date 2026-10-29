// Server-side map pins for listings. A park only shows on the home page globe
// and the search map when it has lat/lng, so every listing saved in the admin
// or sent by RVParkAds gets its address looked up here automatically.
// US Census geocoder first (exact street addresses, no key), then
// OpenStreetMap for town-only addresses. geoAddress remembers which address
// the pin belongs to, so an edited address gets a fresh pin.
import { stateName } from './select-sync.js';

const t = () => AbortSignal.timeout(6000);

async function census(addr) {
  const u = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?benchmark=Public_AR_Current&format=json&address=${encodeURIComponent(addr)}`;
  const m = (await (await fetch(u, { signal: t() })).json())?.result?.addressMatches?.[0];
  return m ? { lat: m.coordinates.y, lng: m.coordinates.x, state: stateName(m.addressComponents?.state), exact: true } : null;
}

async function osm(addr) {
  const u = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&addressdetails=1&q=${encodeURIComponent(addr)}`;
  const [m] = await (await fetch(u, { signal: t(), headers: { 'User-Agent': 'RVParkSales.com listings (marie@rvparksales.com)' } })).json();
  return m ? { lat: Number(m.lat), lng: Number(m.lon), state: m.address?.state || null, exact: false } : null;
}

export async function geocodeAddress(addr) {
  for (const find of [census, osm]) {
    try { const hit = await find(addr); if (hit) return hit; } catch { /* try the next one */ }
  }
  return null;
}

const blank = (v) => v == null || v === '';

// Fills in l.lat / l.lng (and the state when it is missing or the pin is new
// from an exact match). prevAddress = the address before this save, if any.
// Returns true when the listing changed.
export async function placeListing(l, prevAddress) {
  const addr = String(l.address || '').trim();
  if (!addr) return false;
  const has = !blank(l.lat) && !blank(l.lng);
  const stale = l.geoAddress ? l.geoAddress !== addr : prevAddress != null && prevAddress !== addr;
  if (has && !stale) return false;
  const hit = await geocodeAddress(addr);
  if (!hit) return false;
  l.lat = hit.lat; l.lng = hit.lng; l.geoAddress = addr;
  if (hit.state && (!l.state || hit.exact)) l.state = hit.state;
  return true;
}
