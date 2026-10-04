// One-time: make every park exist once. Links each RVParkSelect listing to the
// same park in RVParkSales' listings (by name; two by hand), copies the
// RVParkSelect-only details into RVParkSales where it has none, and records
// the link on both sides. Nothing visible changes: descriptions, photos and
// visibility stay as they are. Parks that only exist on RVParkSelect are
// added to RVParkSales as Off-market (members only), so nothing new appears on
// the public site. A dated backup of the listings is written first.
//
//   node scripts/link-select-listings.mjs <file with DATABASE_URL> [--apply]
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { get, put } from '@vercel/blob';

const require = createRequire(new URL('../../RVParkSelect/package.json', import.meta.url));
const { Client } = require('pg');
const APPLY = process.argv.includes('--apply');
const dbUrl = fs.readFileSync(process.argv[2], 'utf8').trim();
for (const line of fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^BLOB_READ_WRITE_TOKEN="?([^"]+)"?/);
  if (m) process.env.BLOB_READ_WRITE_TOKEN = m[1];
}

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const BY_HAND = { 17: 'central-florida-newly-contructed-rv-and-boat-storage-facility', 3: 'woodland-campground' };
const CODES = { AL: 'Alabama', AZ: 'Arizona', FL: 'Florida', GA: 'Georgia', ID: 'Idaho', KY: 'Kentucky', MT: 'Montana', NC: 'North Carolina', PA: 'Pennsylvania', TX: 'Texas', WY: 'Wyoming', MO: 'Missouri', TN: 'Tennessee' };

const res = await get('content/listings.json', { access: 'private', useCache: false });
const listings = JSON.parse(await new Response(res.stream).text());
const db = new Client({ connectionString: dbUrl });
await db.connect();
const rows = (await db.query('SELECT * FROM select_listings ORDER BY id')).rows;

const fill = (l, k, v) => { if ((l[k] == null || l[k] === '' || (Array.isArray(l[k]) && !l[k].length)) && v != null && v !== '' && !(Array.isArray(v) && !v.length)) l[k] = v; };
const links = [];
for (const r of rows) {
  if (r.source_sales_listing_id) { links.push([r.id, r.source_sales_listing_id, 'already linked']); continue; }
  let l = BY_HAND[r.id] ? listings.find((x) => x.slug === BY_HAND[r.id]) : listings.find((x) => norm(x.title) === norm(r.listing_name));
  let how = BY_HAND[r.id] ? 'matched by hand' : 'same name';
  if (!l) {
    // Only on RVParkSelect: add it here as Off-market (members only).
    l = {
      id: r.source_ads_listing_id ? `ads-${r.source_ads_listing_id}` : `select-${r.id}`,
      source: r.source_ads_listing_id ? 'ads' : 'select',
      adsListingId: r.source_ads_listing_id || undefined,
      slug: norm(r.listing_name).slice(0, 60) || `park-${r.id}`,
      title: r.listing_name, address: r.listing_address, state: CODES[r.state] || null,
      status: 'For Sale', publishState: r.is_draft ? 'draft' : 'offmarket',
      category: r.category === 'lot' ? 'RV Lots' : 'RV Parks/Campgrounds',
      priceUsd: r.asking_price_cents ? String(Math.round(r.asking_price_cents / 100)) : null,
      sites: r.num_sites, acres: r.acres, lat: r.lat != null ? String(r.lat) : null, lng: r.lng != null ? String(r.lng) : null,
      images: r.photo_urls || [], featuredImage: (r.photo_urls || [])[0] || null,
      contentHtml: r.description ? `<p>${String(r.description).replace(/&/g, '&amp;').replace(/</g, '&lt;').split(/\n\s*\n/).join('</p><p>')}</p>` : '',
      date: new Date(r.created_at).toISOString().replace('T', ' ').slice(0, 19), createdAt: new Date(r.created_at).toISOString(),
    };
    listings.unshift(l);
    how = `added here as ${l.publishState}`;
  }
  l.selectId = r.id;
  if (r.source_ads_listing_id) { l.adsListingId = r.source_ads_listing_id; l.source = 'ads'; }
  fill(l, 'ownerName', r.seller_name); fill(l, 'ownerEmail', r.seller_email); fill(l, 'ownerPhone', r.seller_phone);
  fill(l, 'infoPacketUrl', r.info_packet_url); fill(l, 'rvSpaces', r.rv_spaces); fill(l, 'fullHookupSpaces', r.full_hookup_spaces);
  fill(l, 'tentSpaces', r.tent_spaces); fill(l, 'cabins', r.cabins); fill(l, 'yurts', r.yurts); fill(l, 'rentalTypes', r.rental_types);
  fill(l, 'reservationSystem', r.reservation_system); fill(l, 'annualRevenueCents', r.annual_revenue_cents);
  fill(l, 'occupancyRate', r.occupancy_rate != null ? Number(r.occupancy_rate) : null); fill(l, 'amenities', r.amenities);
  fill(l, 'features', r.features); fill(l, 'videoUrls', r.video_urls); fill(l, 'communityActivities', r.community_activities);
  fill(l, 'hoaFeesCents', r.hoa_fees_cents);
  if (l.ownerFinancing == null && r.owner_financing != null) l.ownerFinancing = r.owner_financing;
  if (l.byOwner == null && r.by_owner) { l.byOwner = true; l.ownerAvatar = r.owner_avatar || ''; }
  links.push([r.id, l.id, how, r.listing_name, l.title]);
}

for (const [sid, lid, how, a, b] of links) console.log(`Select #${sid} -> RVParkSales ${lid} (${how})${a ? `\n    ${a}\n    ${b}` : ''}`);

if (APPLY) {
  const opts = { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true };
  await put(`backups/listings/${new Date().toISOString().replace(/[:.]/g, '-')}-before-linking.json`, JSON.stringify(JSON.parse(await new Response((await get('content/listings.json', { access: 'private', useCache: false })).stream).text())), opts);
  await put('content/listings.json', JSON.stringify(listings), opts);
  for (const [sid, lid, how] of links) if (how !== 'already linked') await db.query('UPDATE select_listings SET source_sales_listing_id = $2 WHERE id = $1', [sid, String(lid)]);
  console.log('Applied.');
} else console.log('\nDry run. Add --apply to save.');
await db.end();
