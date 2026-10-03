// Reads the JSON that scripts/extract-wordpress.py produced from the old
// WordPress site, at build time. Everything on the site that comes from the
// old site (listings, brokers, posts, pages, testimonials) flows through here.
// Later the live listings will come from the shared RVParkSelect database
// instead; the rest of the site only talks to these functions, so that swap
// stays in this one file.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

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
let _listings;
export function allListings() {
  if (!_listings) {
    _listings = read('listings.json')
      // Only what the old site showed publicly: published For Sale / Sold.
      // Drafts, archived and private listings are left out on purpose.
      .filter((l) => l.publishState === 'publish' && (l.status === 'For Sale' || l.status === 'Sold'))
      .map((l) => ({ ...l, title: texturize(l.title), contentHtml: texturize(autop(cleanHtml(l.contentHtml))) }))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }
  return _listings;
}
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
export const statesWithListings = () => [...new Set(allListings().map((l) => l.state).filter(Boolean))].sort();

// ----- posts & pages -----
let _posts;
export function posts() {
  if (!_posts) {
    _posts = read('posts.json').map((p) => ({ ...p, title: texturize(p.title), contentHtml: texturize(autop(cleanHtml(p.contentHtml))) }));
    // A post-grid block inside an article shows the latest ten posts, as it did.
    const grid = `<div class="inline-posts">${_posts.slice(0, 10).map((x) => `<a href="/${x.slug}/">${x.featuredImage ? `<img src="${x.featuredImage}" alt="" loading="lazy" />` : ''}<span>${x.title}</span></a>`).join('')}</div>`;
    _posts.forEach((p) => { p.contentHtml = p.contentHtml.replace(/(<p>)?<div data-post-grid><\/div>(<\/p>)?/g, grid); });
  }
  return _posts;
}
let _pages;
export function pages() {
  if (!_pages) _pages = read('pages.json').map((p) => ({ ...p, title: texturize(p.title), contentHtml: texturize(autop(cleanHtml(p.contentHtml))) }));
  return _pages;
}
export const postBySlug = (slug) => posts().find((p) => p.slug === slug);

// Blog categories, with the old /category/<parent>/<child>/ addresses and the
// number of posts in each (a parent also counts its children's posts, as WP did).
let _cats;
export function categories() {
  if (!_cats) {
    const raw = read('categories.json');
    const bySlug = Object.fromEntries(raw.map((c) => [c.slug, c]));
    const pathOf = (c) => (c.parent && bySlug[c.parent] ? `${pathOf(bySlug[c.parent])}${c.slug}/` : `/category/${c.slug}/`);
    _cats = raw.map((c) => {
      const family = [c.slug, ...raw.filter((x) => x.parent === c.slug).map((x) => x.slug)];
      const list = posts().filter((p) => (p.categorySlugs || []).some((s) => family.includes(s)));
      const direct = posts().filter((p) => (p.categorySlugs || []).includes(c.slug)).length;
      return { ...c, path: pathOf(c), count: list.length, directCount: direct, posts: list };
    }).filter((c) => c.count > 0).sort((a, b) => a.name.localeCompare(b.name));
  }
  return _cats;
}
export const categoryByPath = (segments) => categories().find((c) => c.path === `/category/${segments.join('/')}/`);
export const categoryLinks = (p) => (p.categorySlugs || []).map((s) => categories().find((c) => c.slug === s)).filter(Boolean);
export const pageBySlug = (slug) => pages().find((p) => p.slug === slug);

export const testimonials = () => read('testimonials.json');

// ----- helpers -----
// The old site's page builder (WPBakery/Impreza) wrapped content in
// shortcodes like [vc_row][vc_column_text]...[/vc_column_text]. Keep the text,
// drop the wrappers.
const shortAttrs = (s) => Object.fromEntries([...s.matchAll(/([a-z_0-9]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
const linkOf = (v) => { try { return JSON.parse(decodeURIComponent(v || '')); } catch { return {}; } };
let _media;
const mediaUrl = (id) => { _media ||= read('media-map.json'); return _media[String(id)]?.url; };

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
