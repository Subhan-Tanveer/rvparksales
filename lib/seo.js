import { SITE } from './content.js';

// Structured data (schema.org JSON-LD) shared by the public pages, so Google
// can show RVParkSales as a business, its parks as listings, and breadcrumbs.

export const absUrl = (u) => (!u ? u : /^https?:\/\//.test(u) ? u : `${SITE.url}${u.startsWith('/') ? '' : '/'}${u}`);

// "2022-12-14 09:44:30" (WordPress style) -> ISO 8601.
export const isoDate = (d) => (d ? String(d).trim().replace(' ', 'T') : undefined);

export const ORG_ID = `${SITE.url}/#organization`;

export const organization = {
  '@type': ['Organization', 'RealEstateAgent'],
  '@id': ORG_ID,
  name: 'RV Park Sales',
  alternateName: 'RVParkSales.com',
  url: `${SITE.url}/`,
  logo: absUrl('/icon-512.png'),
  image: absUrl('/images/site/Parks-for-sale.webp'),
  description: 'America’s RV park marketplace: RV parks and campgrounds for sale nationwide, RV park brokers, and marketing for owners selling their park.',
  telephone: '+1-850-832-0022',
  email: SITE.email,
  founder: { '@type': 'Person', name: 'Marie Hansen' },
  address: { '@type': 'PostalAddress', addressLocality: 'Panama City Beach', addressRegion: 'FL', addressCountry: 'US' },
  areaServed: { '@type': 'Country', name: 'United States' },
  knowsAbout: ['RV parks for sale', 'Campgrounds for sale', 'RV park brokerage', 'Selling an RV park', 'RV park valuation', 'RV resort investing'],
};

export const website = {
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: 'RV Park Sales',
  url: `${SITE.url}/`,
  publisher: { '@id': ORG_ID },
  inLanguage: 'en-US',
};

export const breadcrumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, ...(path ? { item: absUrl(path) } : {}) })),
});

export const itemList = (listings) => ({
  '@type': 'ItemList',
  numberOfItems: listings.length,
  itemListElement: listings.slice(0, 50).map((l, i) => ({ '@type': 'ListItem', position: i + 1, url: absUrl(`/listing/${l.slug}/`), name: l.title })),
});

// One <script> holding several schema.org nodes.
export function JsonLd({ data }) {
  const graph = (Array.isArray(data) ? data : [data]).filter(Boolean);
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
