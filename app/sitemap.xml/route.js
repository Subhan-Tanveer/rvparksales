import { allListings, brokers, developers, vendors, posts, pages, categories, statesWithListings, stateSlug, SITE, loadContent } from '@/lib/content';

// A plain route handler (not Next's special sitemap.js file) so it also builds
// from folders with an apostrophe in the path, like "Client's Project".
const SKIP = new Set(['home', 'sitemap', 'my-account', 'contact', 'reviews', 'blog-buying-and-selling-rv-parks', 'sell-my-rv-park', 'offering-memorandum', 'confidentiality-and-non-disclosure-agreement']);
const EXTRA = ['/sell-my-rv-park/'];

export const dynamic = 'force-static';

export async function GET() {
  await loadContent();
  const entries = [
    ['/', 'weekly', 1],
    ['/listings/', 'daily', 0.9],
    ['/brokers/', 'monthly', 0.6],
    ['/blog-buying-and-selling-rv-parks/', 'weekly', 0.7],
    ['/reviews/', 'monthly', 0.5],
    ['/contact/', 'yearly', 0.5],
    ...EXTRA.map((p) => [p, 'monthly', 0.7]),
    ['/developers/', 'monthly', 0.4],
    ['/services/', 'weekly', 0.6],
    ...vendors().map((v) => [`/services/${v.slug}/`, 'monthly', 0.4]),
    ...statesWithListings().map((st) => [`/listing-state/${stateSlug(st)}/`, 'weekly', 0.6]),
    ...developers().map((d) => [`/developer/${d.slug}/`, 'monthly', 0.4]),
    ...allListings().map((l) => [`/listing/${l.slug}/`, 'weekly', l.status === 'For Sale' ? 0.8 : 0.4]),
    ...brokers().map((b) => [`/broker/${b.slug}/`, 'monthly', 0.5]),
    ...posts().map((p) => [`/${p.slug}/`, 'monthly', 0.6]),
    ...categories().map((c) => [c.path, 'weekly', 0.4]),
    ...pages().filter((p) => p.slug && !SKIP.has(p.slug)).map((p) => [`/${p.slug}/`, 'yearly', 0.5]),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(([path, freq, pri]) => `  <url><loc>${SITE.url}${path}</loc><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
