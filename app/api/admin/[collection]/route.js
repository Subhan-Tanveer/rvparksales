import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { COLLECTIONS, readFresh, writeCollection } from '@/lib/store';
import { cleanHtml, autop } from '@/lib/content';
import { SCHEMAS, SOURCE, withIds, slugify } from '@/lib/admin-schema';
import { syncListingToSelect, syncBrokersToSelect, siteOrigin, applySyncResult } from '@/lib/select-sync';
import { statsFor } from '@/lib/stats';
import { liveNoticeRecipient, sendLiveNotice } from '@/lib/live-notice';
import { placeListing } from '@/lib/geocode';

// The admin's data API, one collection at a time:
//   GET     everything in the collection (rich text cleaned up for the editor)
//   POST    { item }        create or update one entry (matched by id)
//   PUT     { order: [ids] } save a new order (FAQ)
//   DELETE  ?id=...          remove one entry
// Every write saves the whole collection and keeps a dated backup (lib/store.js).
export const dynamic = 'force-dynamic';

const HTML_FIELDS = ['contentHtml', 'bioHtml', 'a', 'descriptionHtml'];
// Pages the site builds itself (home, contact, ...); kept in the data, not shown in the admin.
const SYSTEM_PAGES = new Set(['home', 'sell-my-rv-park', 'faq', 'reviews', 'contact', 'blog-buying-and-selling-rv-parks', 'my-account', 'sitemap', 'offering-memorandum', 'confidentiality-and-non-disclosure-agreement']);

const deny = () => NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
const bad = (error, status = 400) => NextResponse.json({ error }, { status });

async function load(name) {
  return withIds(name, await readFresh(name));
}

export async function GET(req, { params }) {
  if (!(await isAdmin(req))) return deny();
  const { collection: name } = await params;
  if (!COLLECTIONS.includes(name)) return bad('Unknown section', 404);
  let items = await load(name);
  if (name === 'pages') items = items.filter((p) => !SYSTEM_PAGES.has(p.slug));
  items = items.map((it) => {
    const out = { ...it };
    // Imported posts/pages were all live on the old site.
    if ((name === 'posts' || name === 'pages') && !out.publishState) out.publishState = 'publish';
    // Listings have Public / Off-market / Private draft; old "private" ones are drafts.
    if (name === 'listings' && out.publishState === 'private') out.publishState = 'draft';
    if (name === 'listings') out._source = SOURCE[out.source || (out.wpId ? 'wordpress' : 'admin')];
    HTML_FIELDS.forEach((k) => { if (typeof out[k] === 'string') out[k] = autop(cleanHtml(out[k])); });
    return out;
  });
  // Listing performance (screen-only, never saved: keys starting with _).
  if (name === 'listings') {
    const stats = await statsFor();
    items.forEach((it) => {
      const s = stats[String(it.id)];
      it._views30 = s?.views30 ?? 0; it._inquiries30 = s?.inquiries30 ?? 0;
      it._stats = s ? `${s.views30} views and ${s.inquiries30} inquiries in the last 30 days (${s.views} views, ${s.inquiries} inquiries in total)` : 'No views counted yet.';
    });
  }
  // Lookups the forms need: brokers for the listing contact, blog categories for posts.
  const extra = {};
  if (name === 'listings') extra.brokers = (await load('brokers')).map((b) => ({ name: b.name, photo: b.photo, phone: b.phone, email: b.email }));
  if (name === 'posts') extra.categories = (await load('categories')).map((c) => ({ slug: c.slug, name: c.name }));
  return NextResponse.json({ items, extra });
}

export async function POST(req, { params }) {
  if (!(await isAdmin(req))) return deny();
  const { collection: name } = await params;
  const schema = SCHEMAS[name];
  if (!schema || schema.remote) return bad('Unknown section', 404);
  const { item } = await req.json().catch(() => ({}));
  if (!item || typeof item !== 'object') return bad('Nothing to save');

  // Required fields.
  const fields = schema.groups.flatMap((g) => g.fields);
  const missing = fields.filter((f) => f.required && !String(item[f.key] ?? '').trim()).map((f) => f.label);
  if (missing.length) return bad(`Please fill in: ${missing.join(', ')}`);

  const list = await load(name);
  // Keys starting with _ are screen-only (e.g. _source).
  const clean = Object.fromEntries(Object.entries(item).filter(([k]) => !k.startsWith('_')));

  // Web address: from the title/name when empty; must be unique.
  const slugField = fields.find((f) => f.type === 'slug');
  if (slugField) {
    clean.slug = slugify(clean.slug || clean[slugField.from]);
    if (!clean.slug) return bad('Please give it a web address');
    const taken = new Set(list.filter((x) => x.id !== clean.id).map((x) => x.slug));
    // Posts and pages share the same addresses (/<slug>/).
    if (name === 'posts' || name === 'pages') (await load(name === 'posts' ? 'pages' : 'posts')).forEach((x) => taken.add(x.slug));
    if (taken.has(clean.slug)) return bad(`The web address “${clean.slug}” is already used. Please choose another.`);
  }

  // Derived values the site uses.
  if (name === 'listings') {
    if (clean.publishState === 'early' && !clean.publicAt) clean.publicAt = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
    clean.images = (clean.images || []).filter(Boolean);
    clean.featuredImage = clean.images[0] || null;
    ['priceUsd', 'sites', 'acres'].forEach((k) => { if (clean[k] === '') clean[k] = null; });
    // Map pin from the address, so the park shows on the home page globe.
    const prev = list.find((x) => x.id === clean.id);
    await placeListing(clean, prev ? prev.address || '' : null).catch(() => {});
  }
  if (name === 'posts') {
    const cats = await load('categories');
    clean.categorySlugs = (clean.categorySlugs || []).filter((s) => cats.some((c) => c.slug === s));
    clean.categories = clean.categorySlugs.map((s) => cats.find((c) => c.slug === s).name);
  }
  if (name === 'categories' && clean.parent === '') clean.parent = null;

  const i = list.findIndex((x) => x.id === clean.id);
  const renamedFrom = name === 'brokers' && i >= 0 && list[i].name !== clean.name ? list[i].name : null;
  if (i >= 0) list[i] = { ...list[i], ...clean, updatedAt: new Date().toISOString() };
  else {
    clean.id = clean.id || `${name}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    clean.createdAt = new Date().toISOString();
    if (name === 'faq') list.push(clean); else list.unshift(clean);
  }
  try {
    await writeCollection(name, list);
  } catch (e) {
    return bad(e.message, 500);
  }
  const saved = list.find((x) => x.id === clean.id);
  // Listings also go to RVParkSelect.com (members' early-access site).
  let select;
  if (name === 'listings') {
    select = await syncListingToSelect(saved, { origin: siteOrigin(req.url) });
    let changed = applySyncResult(saved, select);
    // A park just made public: tell its seller or broker (once).
    const brokers = await load('brokers');
    if (liveNoticeRecipient(saved, brokers) && await sendLiveNotice(saved, brokers).catch((e) => console.error('live notice', e?.message))) {
      saved.liveNotifiedAt = new Date().toISOString();
      changed = true;
    }
    if (changed) await writeCollection(name, list).catch(() => {});
  }
  if (name === 'brokers') {
    // A renamed broker stays on the listings that name them.
    if (renamedFrom) {
      const ls = await load('listings');
      let n = 0;
      ls.forEach((l) => { if (l.sellerName === renamedFrom) { l.sellerName = saved.name; l.sellerImage = saved.photo || l.sellerImage; n++; } });
      if (n) await writeCollection('listings', ls).catch(() => {});
    }
    // One broker list for every site: RVParkSelect gets the same roster.
    select = await syncBrokersToSelect(list, { origin: siteOrigin(req.url) });
  }
  return NextResponse.json({ ok: true, item: saved, select });
}

export async function PUT(req, { params }) {
  if (!(await isAdmin(req))) return deny();
  const { collection: name } = await params;
  if (!SCHEMAS[name] || SCHEMAS[name].remote) return bad('Unknown section', 404);
  const { order } = await req.json().catch(() => ({}));
  if (!Array.isArray(order)) return bad('Nothing to reorder');
  const list = await load(name);
  const pos = new Map(order.map((id, k) => [id, k]));
  list.sort((a, b) => (pos.get(a.id) ?? 1e9) - (pos.get(b.id) ?? 1e9));
  try { await writeCollection(name, list); } catch (e) { return bad(e.message, 500); }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  if (!(await isAdmin(req))) return deny();
  const { collection: name } = await params;
  if (!SCHEMAS[name] || SCHEMAS[name].remote) return bad('Unknown section', 404);
  const id = new URL(req.url).searchParams.get('id');
  const list = await load(name);
  const gone = list.find((x) => x.id === id);
  const next = list.filter((x) => x.id !== id);
  if (!gone) return bad('Not found', 404);
  try { await writeCollection(name, next); } catch (e) { return bad(e.message, 500); }
  // A deleted listing is hidden on RVParkSelect too (kept there as a draft);
  // a deleted broker leaves RVParkSelect's roster as well.
  const select = name === 'listings' ? await syncListingToSelect(gone, { origin: siteOrigin(req.url), removed: true })
    : name === 'brokers' ? await syncBrokersToSelect(next, { origin: siteOrigin(req.url) }) : undefined;
  return NextResponse.json({ ok: true, select });
}
