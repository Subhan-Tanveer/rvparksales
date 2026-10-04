import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { COLLECTIONS, readFresh, writeCollection } from '@/lib/store';
import { cleanHtml, autop } from '@/lib/content';
import { SCHEMAS, withIds, slugify } from '@/lib/admin-schema';
import { syncListingToSelect, siteOrigin } from '@/lib/select-sync';

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
    HTML_FIELDS.forEach((k) => { if (typeof out[k] === 'string') out[k] = autop(cleanHtml(out[k])); });
    return out;
  });
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
  const clean = { ...item };
  delete clean._new;

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
    clean.images = (clean.images || []).filter(Boolean);
    clean.featuredImage = clean.images[0] || null;
    ['priceUsd', 'sites', 'acres'].forEach((k) => { if (clean[k] === '') clean[k] = null; });
  }
  if (name === 'posts') {
    const cats = await load('categories');
    clean.categorySlugs = (clean.categorySlugs || []).filter((s) => cats.some((c) => c.slug === s));
    clean.categories = clean.categorySlugs.map((s) => cats.find((c) => c.slug === s).name);
  }
  if (name === 'categories' && clean.parent === '') clean.parent = null;

  const i = list.findIndex((x) => x.id === clean.id);
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
  const select = name === 'listings' ? await syncListingToSelect(saved, { origin: siteOrigin(req.url) }) : undefined;
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
  // A deleted listing is hidden on RVParkSelect too (kept there as a draft).
  const select = name === 'listings' ? await syncListingToSelect(gone, { origin: siteOrigin(req.url), removed: true }) : undefined;
  return NextResponse.json({ ok: true, select });
}
