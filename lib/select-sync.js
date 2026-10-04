// Sends a listing saved here to RVParkSelect.com. This admin is the one place
// Marie manages every park; RVParkSelect shows it according to Visibility:
//   Public        -> RVParkSales.com and RVParkSelect members
//   Early access  -> RVParkSelect members now, RVParkSales.com on publicAt
//   Off-market    -> RVParkSelect members only (hidden on RVParkSales.com)
//   Private draft -> hidden on both
// Sold / archived parks are hidden on RVParkSelect (early access is for parks
// still on the market). Shared secret: SELECT_SYNC_URL + SELECT_SYNC_SECRET.
import { US_STATES, withIds } from './admin-schema.js';
import { readFresh } from './store.js';

const CODES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
export const stateCode = (name) => { const i = US_STATES.indexOf(name); return i >= 0 ? CODES[i] : null; };
export const stateName = (code) => { const i = CODES.indexOf(String(code || '').toUpperCase()); return i >= 0 ? US_STATES[i] : null; };

export const htmlToText = (html = '') => String(html)
  .replace(/<\s*br\s*\/?>/gi, '\n')
  .replace(/<\/(p|h[1-6]|li|div|blockquote)>/gi, '\n\n')
  .replace(/<li[^>]*>/gi, '• ')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '’').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

export function siteOrigin(reqUrl) {
  if (process.env.SITE_ORIGIN) return process.env.SITE_ORIGIN.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return new URL(reqUrl).origin;
}

export function selectVisibility(l, removed = false) {
  if (removed || l.status !== 'For Sale') return 'draft';
  if (['publish', 'early', 'offmarket'].includes(l.publishState)) return l.publishState === 'publish' ? 'public' : l.publishState;
  return 'draft';
}

const numOrNull = (v) => (v === '' || v == null || !Number.isFinite(Number(v)) ? null : Number(v));
const strOrNull = (v) => (v == null || v === '' ? null : String(v));

// The broker picked on the listing, as RVParkSelect knows it. Marie herself
// maps to null so RVParkSelect keeps its standard NDA wording for her parks.
async function brokerSalesIdFor(l) {
  const name = String(l.sellerName || '').trim().toLowerCase();
  if (!name || name === 'marie hansen') return null;
  const brokers = withIds('brokers', await readFresh('brokers'));
  return brokers.find((b) => String(b.name || '').trim().toLowerCase() === name)?.id ?? null;
}

const htmlText = (h) => htmlToText(h || '');

// The one broker roster (RVParkSales Brokers) copied to RVParkSelect, which
// names each listing's broker on its NDA. Sent whole after every broker change.
export async function syncBrokersToSelect(brokers, { origin } = {}) {
  const url = process.env.SELECT_SYNC_URL;
  const secret = process.env.SELECT_SYNC_SECRET;
  if (!url || !secret) return { skipped: true };
  const abs = (u) => (typeof u === 'string' && u.startsWith('/') ? `${origin}${u}` : u);
  const body = {
    kind: 'brokers',
    brokers: brokers.map((b) => ({
      salesId: String(b.id), name: b.name, brokerageName: b.brokerage || null,
      licenseState: stateCode(b.licenseState) || b.licenseState || null, licenseNumber: b.licenseNumber && b.licenseNumber !== 'None' ? b.licenseNumber : null,
      email: b.email || null, phone: b.phone || null, bio: htmlText(b.bioHtml) || null, photoUrl: abs(b.photo) || null,
    })),
  };
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-import-secret': secret }, body: JSON.stringify(body), signal: AbortSignal.timeout(25000) });
    const data = await res.json().catch(() => ({}));
    return res.ok ? { ok: true, ...data } : { ok: false, error: data.error || `RVParkSelect answered ${res.status}` };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function syncListingToSelect(l, { origin, removed = false, alert } = {}) {
  const url = process.env.SELECT_SYNC_URL;
  const secret = process.env.SELECT_SYNC_SECRET;
  if (!url || !secret) return { skipped: true, reason: 'RVParkSelect link is not set up' };
  const brokerSalesId = await brokerSalesIdFor(l).catch(() => undefined);
  const abs = (u) => (typeof u === 'string' && u.startsWith('/') ? `${origin}${u}` : u);
  const price = Number(String(l.priceUsd ?? '').replace(/[^0-9.]/g, ''));
  const desc = [l.summary, l.highlights, htmlToText(l.contentHtml)].filter(Boolean).join('\n\n');
  const body = {
    sourceSalesListingId: String(l.id),
    selectListingId: numOrNull(l.selectId),
    sourceAdsListingId: numOrNull(l.adsListingId),
    brokerSalesId,
    visibility: selectVisibility(l, removed),
    publicOn: l.publishState === 'early' ? (l.publicAt || null) : null,
    // "New listing" emails only for parks that are new (not the old
    // WordPress ones or parks that were already on RVParkSelect).
    alertMembers: alert ?? (!l.wpId && !l.selectId),
    category: l.category === 'RV Lots' ? 'lot' : 'park',
    listingName: l.title,
    listingAddress: l.address || [l.city, l.state].filter(Boolean).join(', '),
    state: stateCode(l.state),
    askingPriceCents: price > 0 ? Math.round(price * 100) : null,
    description: desc || null,
    photoUrls: (l.images || []).map(abs).filter((u) => /^https:\/\//.test(u || '')),
    videoUrls: (l.videoUrls || []).filter((u) => /^https:\/\//.test(u || '')),
    lat: numOrNull(l.lat),
    lng: numOrNull(l.lng),
    numSites: strOrNull(l.sites),
    acres: strOrNull(l.acres),
    roomToExpand: l.roomToExpand === 'Yes' ? true : l.roomToExpand === 'No' ? false : null,
    expansionLand: l.roomToExpand === 'Yes' ? true : l.roomToExpand === 'No' ? false : null,
    lotSize: l.lotSize || null,
    rvSpaces: strOrNull(l.rvSpaces),
    fullHookupSpaces: strOrNull(l.fullHookupSpaces),
    tentSpaces: strOrNull(l.tentSpaces),
    cabins: strOrNull(l.cabins),
    yurts: strOrNull(l.yurts),
    rentalTypes: l.rentalTypes || [],
    reservationSystem: strOrNull(l.reservationSystem),
    annualRevenueCents: numOrNull(l.annualRevenueCents),
    occupancyRate: numOrNull(l.occupancyRate),
    hoaFeesCents: numOrNull(l.hoaFeesCents),
    communityActivities: strOrNull(l.communityActivities),
    amenities: l.amenities || [],
    features: l.features || [],
    ownerFinancing: typeof l.ownerFinancing === 'boolean' ? l.ownerFinancing : null,
    sellerName: strOrNull(l.ownerName),
    sellerEmail: strOrNull(l.ownerEmail),
    sellerPhone: strOrNull(l.ownerPhone),
    infoPacketUrl: abs(l.infoPacketUrl) || null,
    byOwner: !!l.byOwner,
    // An avatar key, or the owner's uploaded photo (sent as a full URL).
    ownerAvatar: abs(l.ownerAvatar) || null,
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-import-secret': secret },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || `RVParkSelect answered ${res.status}` };
    return { ok: true, visibility: body.visibility, ...data };
  } catch (e) {
    return { ok: false, error: e.name === 'TimeoutError' ? 'RVParkSelect did not answer in time' : e.message };
  }
}

// After a sync: remember which RVParkSelect row this is, and fill in the map
// pin / state RVParkSelect looked up if this listing had none.
export function applySyncResult(l, r) {
  if (!r?.ok || !r.listingId) return false;
  let changed = false;
  if (String(l.selectId || '') !== String(r.listingId)) { l.selectId = r.listingId; changed = true; }
  if ((l.lat == null || l.lat === '') && r.lat != null) { l.lat = String(r.lat); l.lng = String(r.lng); changed = true; }
  if (!l.state && r.state) { const n = stateName(r.state); if (n) { l.state = n; changed = true; } }
  return changed;
}
