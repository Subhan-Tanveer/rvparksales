import { NextResponse } from 'next/server';
import { readFresh, writeCollection } from '@/lib/store';
import { withIds, slugify, now } from '@/lib/admin-schema';
import { syncListingToSelect, applySyncResult, siteOrigin } from '@/lib/select-sync';

// POST /api/import-listing — RVParkAds.com sends every seller submission and
// edit here (its SELECT_SITE_URL points at this site), with its shared
// secret ADS_IMPORT_SECRET. A new park lands in Marie's one Listings list as
// Early access: shown to RVParkSelect members right away (matching members
// get the alert email), public on RVParkSales.com 5 days later. RVParkAds
// already emails Marie about every submission. Later edits from the seller
// update the park; Marie's choices here (visibility, status, dates) are kept.
export const dynamic = 'force-dynamic';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (text) => (text ? String(text).split(/\n\s*\n/).map((p) => `<p>${esc(p.trim()).replace(/\n/g, '<br />')}</p>`).join('') : '');
const s = (v) => (v == null || v === '' ? null : String(v));

const PLAN_FEATURED = { level1: '', level2: 'featured', level3: 'spotlight' };
const PLAN_NAMES = { level1: 'Professional Listing', level2: 'Buyer Exposure', level3: 'Full Marketing Campaign' };

export async function POST(req) {
  const secret = process.env.ADS_IMPORT_SECRET;
  if (!secret || req.headers.get('x-import-secret') !== secret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  if (!b.sourceAdsListingId) return NextResponse.json({ error: 'sourceAdsListingId is required' }, { status: 400 });

  const list = withIds('listings', await readFresh('listings'));
  let l = list.find((x) => String(x.adsListingId) === String(b.sourceAdsListingId));
  const created = !l;

  const media = { images: (b.photoUrls || []).filter((u) => typeof u === 'string'), videoUrls: (b.videoUrls || []).filter((u) => typeof u === 'string') };
  const details = {
    title: s(b.listingName) || 'New RV park',
    address: s(b.listingAddress),
    category: b.category === 'lot' ? 'RV Lots' : 'RV Parks/Campgrounds',
    priceUsd: Number.isFinite(b.askingPriceCents) ? String(Math.round(b.askingPriceCents / 100)) : null,
    sites: s(b.numSites),
    rvSpaces: s(b.rvSpaces), fullHookupSpaces: s(b.fullHookupSpaces), tentSpaces: s(b.tentSpaces), cabins: s(b.cabins), yurts: s(b.yurts),
    rentalTypes: b.rentalTypes || [], reservationSystem: s(b.reservationSystem),
    annualRevenueCents: Number.isFinite(b.annualRevenueCents) ? b.annualRevenueCents : null,
    occupancyRate: Number.isFinite(b.occupancyRate) ? b.occupancyRate : null,
    roomToExpand: b.expansionLand === true ? 'Yes' : b.expansionLand === false ? 'No' : null,
    lotSize: s(b.lotSize),
    hoaFeesCents: Number.isFinite(b.hoaFeesCents) ? b.hoaFeesCents : null,
    communityActivities: s(b.communityActivities),
    amenities: b.amenities || [], features: b.features || [],
    ownerFinancing: typeof b.ownerFinancing === 'boolean' ? b.ownerFinancing : null,
    contentHtml: toHtml(b.description),
    ownerName: s(b.sellerName), ownerEmail: s(b.sellerEmail), ownerPhone: s(b.sellerPhone),
  };

  if (created) {
    const taken = new Set(list.map((x) => x.slug));
    let slug = slugify(details.title) || `park-${b.sourceAdsListingId}`;
    for (let n = 2; taken.has(slug); n++) slug = `${slugify(details.title)}-${n}`;
    l = {
      id: `ads-${b.sourceAdsListingId}`,
      adsListingId: Number(b.sourceAdsListingId),
      source: 'ads',
      slug,
      status: 'For Sale',
      publishState: 'early',
      publicAt: new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10),
      date: now(),
      createdAt: new Date().toISOString(),
      byOwner: b.byOwner === true,
      ...details,
      ...media,
    };
    l.featuredImage = l.images[0] || null;
    list.unshift(l);
  } else if (b.mediaOnly) {
    Object.assign(l, media, { featuredImage: media.images[0] || null, updatedAt: new Date().toISOString() });
  } else {
    Object.assign(l, details, media, { featuredImage: media.images[0] || null, updatedAt: new Date().toISOString() });
  }

  // The seller's plan sets Featured (sent on every sync, incl. plan changes).
  if (b.planKey && PLAN_FEATURED[b.planKey] !== undefined) {
    l.featured = PLAN_FEATURED[b.planKey];
    l.adsPlan = PLAN_NAMES[b.planKey];
  }

  await writeCollection('listings', list);
  // On to RVParkSelect: members see it now; matching members are emailed for a new park.
  const select = await syncListingToSelect(l, { origin: siteOrigin(req.url), alert: created });
  if (applySyncResult(l, select)) await writeCollection('listings', list).catch(() => {});
  return NextResponse.json({ ok: true, created, listingId: l.id, select });
}
