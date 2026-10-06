// All site content (listings, brokers, posts, pages, reviews, FAQ) flows
// through here. It comes from lib/store.js: Marie's edits from /admin, or the
// WordPress export in data/ until a collection is first saved. Pages call
// `await loadContent()` first; after that these functions read synchronously.
import fs from 'node:fs';
import path from 'node:path';
import { loadAll } from './store.js';

const dir = path.join(process.cwd(), 'data');
const disk = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
let SNAP = null;
export async function loadContent() { SNAP = await loadAll(); return SNAP; }
// Old WordPress photo links (https://www.rvparksales.com/wp-content/...) are
// read as site-relative /wp-content/... so this site serves them itself
// (app/wp-content/uploads) and Next's image resizing can use them.
const OLD_HOST = /https?:\/\/(?:www\.)?rvparksales\.com(?=\/wp-content\/)/g;
const relinked = new WeakMap();
const relink = (data) => {
  if (!data || typeof data !== 'object') return data;
  if (!relinked.has(data)) relinked.set(data, JSON.parse(JSON.stringify(data).replace(OLD_HOST, '')));
  return relinked.get(data);
};
const diskCache = {};
const read = (f) => { const name = f.replace(/\.json$/, ''); return relink(SNAP && SNAP[name] ? SNAP[name] : (diskCache[f] ??= disk(f))); };
// Derived lists are rebuilt whenever the underlying content changes.
const memos = new Map();
const memo = (key, raw, fn, dep = null) => {
  const m = memos.get(key);
  if (m && m.raw === raw && m.dep === dep) return m.val;
  const val = fn(raw);
  memos.set(key, { raw, dep, val });
  return val;
};

export const SITE = {
  name: 'RVParkSales.com',
  url: 'https://www.rvparksales.com',
  phone: '(850) 832-0022',
  phoneHref: 'tel:+18508320022',
  email: 'marie@rvparksales.com',
  calendly: 'https://calendly.com/marie-rvparksales/30min',
  select: 'https://rvparkselect.com',
  ads: 'https://rvparkads.com',
  success: 'https://www.rvparksuccess.com',
};

// ----- listings -----
// Listing galleries only show pictures (one listing also attached a PDF site map).
const isImage = (u) => /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(u || '');
// Public on RVParkSales: Published, or Early access once its go-public date
// has passed (pages refresh hourly, see app/(site)/layout.js).
const isLive = (l) => l.publishState === 'publish' || (l.publishState === 'early' && !!l.publicAt && l.publicAt <= new Date().toISOString().slice(0, 10));
export function allListings() {
  return memo('listings', read('listings.json'), (raw) => raw
      // Only what the old site showed publicly: published For Sale / Sold.
      // Drafts, archived and private listings are left out on purpose.
      .filter((l) => isLive(l) && (l.status === 'For Sale' || l.status === 'Sold'))
      .map((l) => ({ ...l, images: (l.images || []).filter(isImage), title: texturize(l.title), contentHtml: texturize(autop(cleanHtml(l.contentHtml))) }))
      .sort((a, b) => featuredRank(b) - featuredRank(a) || (b.date || '').localeCompare(a.date || '')), new Date().toISOString().slice(0, 10));
}
// Featured parks (RVParkAds Buyer Exposure / Full Marketing Campaign, or set
// by Marie) come first in search. Spotlight also leads the home page.
export const featuredRank = (l) => (l.status !== 'For Sale' ? 0 : l.featured === 'spotlight' ? 2 : l.featured === 'featured' ? 1 : 0);
export const listingsForSale = () => allListings().filter((l) => l.status === 'For Sale');
export const listingsSold = () => allListings().filter((l) => l.status === 'Sold');
export const listingBySlug = (slug) => allListings().find((l) => l.slug === slug);

// ----- brokers -----
export const brokers = () => read('brokers.json');
export const brokerBySlug = (slug) => brokers().find((b) => b.slug === slug);
export const brokerByName = (name) => brokers().find((b) => b.name.toLowerCase() === (name || '').toLowerCase());

export const developers = () => read('developers.json');
export const developerBySlug = (slug) => developers().find((d) => d.slug === slug);
export const stateSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const statesForSale = () => [...new Set(listingsForSale().map((l) => l.state).filter(Boolean))].sort();
export const statesWithListings = () => [...new Set(allListings().map((l) => l.state).filter(Boolean))].sort();

// ----- posts & pages -----
export function posts() {
  return memo('posts', read('posts.json'), (raw) => {
    const list = raw
      .filter((p) => !p.publishState || p.publishState === 'publish')
      .map((p) => ({ ...p, title: texturize(p.title), contentHtml: texturize(autop(cleanHtml(p.contentHtml))) }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    // A post-grid block inside an article shows the latest ten posts, as it did.
    const grid = `<div class="inline-posts">${list.slice(0, 10).map((x) => `<a href="/${x.slug}/">${x.featuredImage ? `<img src="${x.featuredImage}" alt="" loading="lazy" />` : ''}<span>${x.title}</span></a>`).join('')}</div>`;
    list.forEach((p) => { p.contentHtml = p.contentHtml.replace(/(<p>)?<div data-post-grid><\/div>(<\/p>)?/g, grid); });
    return list;
  });
}
export function pages() {
  return memo('pages', read('pages.json'), (raw) => raw
    .filter((p) => !p.publishState || p.publishState === 'publish')
    .map((p) => ({ ...p, title: texturize(p.title), contentHtml: texturize(autop(cleanHtml(p.contentHtml))) })));
}
export const postBySlug = (slug) => posts().find((p) => p.slug === slug);

// Blog categories, with the old /category/<parent>/<child>/ addresses and the
// number of posts in each (a parent also counts its children's posts, as WP did).
export function categories() {
  const all = posts();
  return memo('categories', read('categories.json'), (raw) => {
    const bySlug = Object.fromEntries(raw.map((c) => [c.slug, c]));
    const pathOf = (c) => (c.parent && bySlug[c.parent] ? `${pathOf(bySlug[c.parent])}${c.slug}/` : `/category/${c.slug}/`);
    return raw.map((c) => {
      const family = [c.slug, ...raw.filter((x) => x.parent === c.slug).map((x) => x.slug)];
      const list = all.filter((p) => (p.categorySlugs || []).some((s) => family.includes(s)));
      const direct = all.filter((p) => (p.categorySlugs || []).includes(c.slug)).length;
      return { ...c, path: pathOf(c), count: list.length, directCount: direct, posts: list };
    }).filter((c) => c.count > 0).sort((a, b) => a.name.localeCompare(b.name));
  }, all);
}
export const categoryByPath = (segments) => categories().find((c) => c.path === `/category/${segments.join('/')}/`);
export const categoryLinks = (p) => (p.categorySlugs || []).map((s) => categories().find((c) => c.slug === s)).filter(Boolean);
export const pageBySlug = (slug) => pages().find((p) => p.slug === slug);

export const testimonials = () => read('testimonials.json');
export const faqs = () => read('faq.json');

// ----- helpers -----
// The old site's page builder (WPBakery/Impreza) wrapped content in
// shortcodes like [vc_row][vc_column_text]...[/vc_column_text]. Keep the text,
// drop the wrappers.
const shortAttrs = (s) => Object.fromEntries([...s.matchAll(/([a-z_0-9]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const linkOf = (v) => { try { return JSON.parse(decodeURIComponent(v || '')); } catch { return {}; } };
let _media;
const mediaUrl = (id) => { _media ||= disk('media-map.json'); return _media[String(id)]?.url; };

export function cleanHtml(html = '') {
  return html
    // Buttons, images and separators placed with the page builder become plain HTML.
    .replace(/\[us_btn([^\]]*)\]/g, (_, a) => {
      const at = shortAttrs(a); const l = linkOf(at.link);
      if (!l.url) return '';
      const url = l.url.replace(/^https?:\/\/(www\.)?rvparksales\.com/, '').replace(/^https?:\/\/park-sales\.vibepreview\.com\/?/, SITE.ads + '/');
      return `<p style="text-align:${at.align || 'left'}"><a class="btn" href="${url}"${l.target ? ' target="_blank" rel="noopener"' : ''}>${at.label || ''}</a></p>`;
    })
    .replace(/\[us_image([^\]]*)\]/g, (_, a) => { const u = mediaUrl(shortAttrs(a).image); return u ? `<p><img src="${u}" alt="" loading="lazy" /></p>` : ''; })
    .replace(/\[us_separator([^\]]*)\]/g, (_, a) => (/show_line="1"/.test(a) ? '<hr class="hr-line" />' : ''))
    .replace(/\[us_grid[^\]]*\]/g, '<div data-post-grid></div>')
    .replace(/\[us_text([^\]]*)\]/g, (_, a) => { const at = shortAttrs(a); const tag = /^h[1-6]$/.test(at.tag) ? at.tag : 'p'; return at.text ? `<${tag}>${at.text}</${tag}>` : ''; })
    .replace(/\[\/?(?:vc|us|ult|rev|gravityform|contact-form)[a-z0-9_-]*[^\]]*\]/gi, '')
    .replace(/\[caption[^\]]*\]|\[\/caption\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// WordPress's wptexturize: curly quotes and ellipses, as the old site showed.
export function texturize(s = '') {
  return String(s).split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]*>|\[[^\]]*\])/i).map((part) => (/^[<[]/.test(part) ? part : part
    .replace(/\.\.\./g, '…')
    .replace(/(^|[\s(\[{"“-])'/g, '$1‘')
    .replace(/'/g, '’')
    .replace(/(^|[\s(\[{‘-])"/g, '$1“')
    .replace(/"/g, '”')
    .replace(/ - /g, ' – ')
    .replace(/ -- /g, ' — '))).join('');
}

// WordPress's wpautop: blank-line separated text becomes paragraphs and single
// line breaks become <br>, unless the chunk is already a block element.
const BLOCK = /^<\/?(p|div|h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|blockquote|pre|figure|figcaption|iframe|hr|section|form|img|video|address|dl|dd|dt)\b/i;
export function autop(html = '') {
  if (!html.trim()) return '';
  return html.replace(/\r\n?/g, '\n').split(/\n\s*\n/).map((chunk) => {
    const c = chunk.trim();
    if (!c) return '';
    if (BLOCK.test(c)) return c;
    return `<p>${c.replace(/\n/g, '<br />\n')}</p>`;
  }).join('\n');
}

// Page <title>: the old SEOPress title when one was set (used as-is, with its
// %%variables%% filled in), otherwise "<title> - RV Park Sales" via the layout.
export function metaTitle(item) {
  if (!item.seoTitle) return item.title;
  const t = item.seoTitle
    .replace(/%%post_title%%/g, item.title)
    .replace(/%%sitetitle%%/g, 'RV Park Sales')
    .replace(/%%sep%%/g, '-')
    .replace(/%%[a-z_]+%%/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return { absolute: texturize(t) };
}

export function textOf(html = '', max = 200) {
  const t = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#8217;|&rsquo;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, '') + '…' : t;
}

export { usd } from './format.js';

export function siteStats() {
  const all = allListings();
  return {
    forSale: all.filter((l) => l.status === 'For Sale').length,
    sold: all.filter((l) => l.status === 'Sold').length,
    brokers: brokers().length,
    states: new Set(all.map((l) => l.state).filter(Boolean)).size,
  };
}
