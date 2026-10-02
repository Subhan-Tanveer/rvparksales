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
      .map((l) => ({ ...l, contentHtml: cleanHtml(l.contentHtml) }))
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
  if (!_posts) _posts = read('posts.json').map((p) => ({ ...p, contentHtml: cleanHtml(p.contentHtml) }));
  return _posts;
}
let _pages;
export function pages() {
  if (!_pages) _pages = read('pages.json').map((p) => ({ ...p, contentHtml: cleanHtml(p.contentHtml) }));
  return _pages;
}
export const postBySlug = (slug) => posts().find((p) => p.slug === slug);
export const pageBySlug = (slug) => pages().find((p) => p.slug === slug);

export const testimonials = () => read('testimonials.json');

// ----- helpers -----
// The old site's page builder (WPBakery/Impreza) wrapped content in
// shortcodes like [vc_row][vc_column_text]...[/vc_column_text]. Keep the text,
// drop the wrappers.
export function cleanHtml(html = '') {
  return html
    .replace(/\[\/?(?:vc|us|ult|rev|gravityform|contact-form)[a-z0-9_-]*[^\]]*\]/gi, '')
    .replace(/\[caption[^\]]*\]|\[\/caption\]/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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
