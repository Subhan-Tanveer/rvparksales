// Sends a listing saved in the RVParkSales admin to RVParkSelect.com, whose
// members see it according to Marie's Visibility choice:
//   Public       -> RVParkSales.com and RVParkSelect members
//   Off-market   -> RVParkSelect members only (hidden on RVParkSales.com)
//   Private      -> hidden on both (draft)
// Sold / archived parks are hidden from RVParkSelect (early access is for
// parks on the market). Uses RVParkSelect's import endpoint with a shared
// secret: SELECT_SYNC_URL + SELECT_SYNC_SECRET.
import { US_STATES } from './admin-schema.js';

const CODES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
const stateCode = (name) => { const i = US_STATES.indexOf(name); return i >= 0 ? CODES[i] : null; };

const text = (html = '') => String(html)
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
  if (l.publishState === 'publish') return 'public';
  if (l.publishState === 'offmarket') return 'offmarket';
  return 'draft';
}

export async function syncListingToSelect(l, { origin, removed = false } = {}) {
  const url = process.env.SELECT_SYNC_URL;
  const secret = process.env.SELECT_SYNC_SECRET;
  if (!url || !secret) return { skipped: true, reason: 'RVParkSelect link is not set up' };
  const abs = (u) => (typeof u === 'string' && u.startsWith('/') ? `${origin}${u}` : u);
  const price = Number(String(l.priceUsd ?? '').replace(/[^0-9.]/g, ''));
  const desc = [l.summary, text(l.contentHtml)].filter(Boolean).join('\n\n');
  const body = {
    sourceSalesListingId: String(l.id),
    visibility: selectVisibility(l, removed),
    // Only parks Marie adds in this admin trigger "new listing" emails;
    // re-saving an old WordPress listing does not.
    alertMembers: !l.wpId,
    category: l.category === 'RV Lots' ? 'lot' : 'park',
    listingName: l.title,
    listingAddress: l.address || [l.city, l.state].filter(Boolean).join(', '),
    state: stateCode(l.state),
    askingPriceCents: price > 0 ? Math.round(price * 100) : null,
    description: desc || null,
    photoUrls: (l.images || []).map(abs).filter((u) => /^https:\/\//.test(u || '')),
    lat: l.lat !== '' && l.lat != null && Number.isFinite(Number(l.lat)) ? Number(l.lat) : null,
    lng: l.lng !== '' && l.lng != null && Number.isFinite(Number(l.lng)) ? Number(l.lng) : null,
    numSites: l.sites ? String(l.sites) : null,
    acres: l.acres ? String(l.acres) : null,
    roomToExpand: l.roomToExpand === 'Yes' ? true : l.roomToExpand === 'No' ? false : null,
    lotSize: l.lotSize || null,
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-import-secret': secret },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error || `RVParkSelect answered ${res.status}` };
    return { ok: true, visibility: body.visibility, ...data };
  } catch (e) {
    return { ok: false, error: e.name === 'TimeoutError' ? 'RVParkSelect did not answer in time' : e.message };
  }
}
