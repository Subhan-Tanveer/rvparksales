// Where the site's content lives once Marie edits it in /admin.
//
// Each collection (listings, posts, pages, brokers, ...) is one private JSON
// file in Vercel Blob: content/<name>.json. Until a collection has been saved
// from the admin for the first time, the copy bundled in data/<name>.json (the
// WordPress export) is used, so nothing changes for visitors before then.
// Every save also writes a dated copy under backups/ so any edit can be undone.
//
// Reads go through Next's data cache (tag "content"); saving clears that tag
// and every page re-renders with the new content on its next visit.
import fs from 'node:fs';
import path from 'node:path';
import { unstable_cache, revalidateTag, revalidatePath } from 'next/cache';

export const COLLECTIONS = ['listings', 'posts', 'pages', 'brokers', 'developers', 'testimonials', 'faq', 'categories'];
const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const bundled = (name) => JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', `${name}.json`), 'utf8'));

async function fetchCollection(name) {
  if (!hasBlob()) return bundled(name);
  const { get } = await import('@vercel/blob');
  try {
    const res = await get(`content/${name}.json`, { access: 'private', useCache: false });
    if (!res) return bundled(name);
    return JSON.parse(await new Response(res.stream).text());
  } catch (e) {
    // Never take the site down over storage: fall back to the bundled copy.
    console.error(`store: reading ${name} failed`, e?.message);
    return bundled(name);
  }
}

// Cached across requests until the next save.
export const readCollection = (name) => unstable_cache(() => fetchCollection(name), ['content', name], { tags: ['content', `content:${name}`] })();

// Uncached read for the admin (always the latest copy).
export const readFresh = (name) => fetchCollection(name);

export async function writeCollection(name, data) {
  if (!COLLECTIONS.includes(name)) throw new Error(`Unknown collection ${name}`);
  if (!hasBlob()) throw new Error('Storage is not connected (BLOB_READ_WRITE_TOKEN missing).');
  const { put } = await import('@vercel/blob');
  const body = JSON.stringify(data);
  const opts = { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true };
  await put(`content/${name}.json`, body, opts);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await put(`backups/${name}/${stamp}.json`, body, opts);
  revalidateTag('content');
  revalidatePath('/', 'layout');
}

// Everything the public pages need, loaded once per render (see lib/content.js).
export async function loadAll() {
  const entries = await Promise.all(COLLECTIONS.map(async (n) => [n, await readCollection(n)]));
  return Object.fromEntries(entries);
}
