// What Marie can edit in /admin, one entry per kind of content. The admin
// screens (list + edit form) are generated from these definitions, so a new
// field only needs a line here.
//
// Field types: text, textarea, richtext, number, select, slug, date, image,
// images, location, person (pick a broker), toggles, multicats (blog categories).
import { CATEGORIES } from './search-options.js';
import { REMOTE_SCHEMAS } from './admin-remote-schemas.js';

export const US_STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
const STATE_OPTS = [['', 'Choose a state'], ...US_STATES.map((s) => [s, s])];
const YESNO = [['', 'Not set'], ['Yes', 'Yes'], ['No', 'No']];
const VISIBILITY = [['publish', 'Published (visible on the site)'], ['draft', 'Draft (hidden)'], ['private', 'Private (hidden)']];
// Listings are shared with RVParkSelect.com (see lib/select-sync.js).
const LISTING_VISIBILITY = [['publish', 'Public: RVParkSales.com + RVParkSelect'], ['offmarket', 'Off-market: RVParkSelect members only'], ['draft', 'Private draft: hidden on both']];

export const SCHEMAS = {
  listings: {
    label: 'Listings', one: 'Listing', icon: 'home',
    blurb: 'Parks for sale, sold and off-market. Hidden listings are kept so they can be made active again.',
    path: (i) => `/listing/${i.slug}/`,
    columns: [['featuredImage', 'thumb'], ['title', 'Title'], ['status', 'Status'], ['publishState', 'Visibility'], ['state', 'State'], ['priceUsd', 'Price']],
    filters: [['status', [['', 'All statuses'], ['For Sale', 'For Sale'], ['Sold', 'Sold'], ['Archived', 'Archived']]], ['publishState', [['', 'Any visibility'], ...LISTING_VISIBILITY]]],
    sort: (a, b) => (b.date || '').localeCompare(a.date || ''),
    blank: () => ({ title: '', slug: '', status: 'For Sale', publishState: 'publish', category: 'RV Parks/Campgrounds', images: [], date: now() }),
    groups: [
      { title: 'Basics', fields: [
        { key: 'title', type: 'text', label: 'Listing title', required: true, wide: true },
        { key: 'slug', type: 'slug', from: 'title', label: 'Web address', prefix: '/listing/', wide: true },
        { key: 'status', type: 'select', label: 'Sale status', options: [['For Sale', 'For Sale'], ['Sold', 'Sold'], ['Archived', 'Archived (off-market)']] },
        { key: 'publishState', type: 'select', label: 'Visibility', options: LISTING_VISIBILITY, hint: 'Public shows it on both websites. Off-market shows it only to RVParkSelect members. Sold or archived parks are never shown on RVParkSelect.' },
        { key: 'category', type: 'select', label: 'Property type', options: Object.values(CATEGORIES).map((v) => [v, v]) },
        { key: 'date', type: 'date', label: 'Listed on' },
        { key: 'propertyId', type: 'text', label: 'Property ID' },
      ] },
      { title: 'Price & size', fields: [
        { key: 'priceUsd', type: 'number', label: 'Price (USD)', placeholder: 'Leave empty for “Call for price”' },
        { key: 'sites', type: 'number', label: 'Number of sites' },
        { key: 'acres', type: 'number', label: 'Acres' },
        { key: 'lotSize', type: 'text', label: 'Lot size' },
        { key: 'roomToExpand', type: 'select', label: 'Room to expand', options: YESNO },
        { key: 'hoaFee', type: 'text', label: 'HOA fee' },
        { key: 'fullHookups', type: 'select', label: 'Full hookups', options: YESNO },
        { key: 'pavedParking', type: 'select', label: 'Paved parking', options: YESNO },
        { key: 'park55', type: 'select', label: '55+ park', options: YESNO },
      ] },
      { title: 'Location', fields: [
        { key: 'address', type: 'location', label: 'Address (shown on the map)', wide: true },
        { key: 'city', type: 'text', label: 'City' },
        { key: 'state', type: 'select', label: 'State', options: STATE_OPTS },
      ] },
      { title: 'Photos', fields: [
        { key: 'images', type: 'images', label: 'Photos (the first one is the cover)', wide: true },
      ] },
      { title: 'Description', fields: [
        { key: 'summary', type: 'textarea', label: 'Short summary', wide: true, rows: 3 },
        { key: 'highlights', type: 'textarea', label: 'Highlights', wide: true, rows: 3 },
        { key: 'contentHtml', type: 'richtext', label: 'Full description', wide: true },
      ] },
      { title: 'Contact on this listing', fields: [
        { key: 'sellerName', type: 'person', label: 'Broker / contact', imageKey: 'sellerImage', wide: true },
      ] },
      { title: 'Search engines (optional)', fields: [
        { key: 'seoTitle', type: 'text', label: 'Google title', wide: true },
        { key: 'seoDescription', type: 'textarea', label: 'Google description', wide: true, rows: 2 },
      ] },
    ],
  },

  posts: {
    label: 'Blog posts', one: 'Blog post', icon: 'pen',
    blurb: 'Articles on the blog. Each post gets its own page.',
    path: (i) => `/${i.slug}/`,
    columns: [['featuredImage', 'thumb'], ['title', 'Title'], ['publishState', 'Visibility'], ['date', 'Date']],
    filters: [['publishState', [['', 'Any visibility'], ...VISIBILITY]]],
    sort: (a, b) => (b.date || '').localeCompare(a.date || ''),
    blank: () => ({ title: '', slug: '', publishState: 'publish', date: now(), categories: [], categorySlugs: [], author: 'Marie Hansen' }),
    groups: [
      { title: 'Post', fields: [
        { key: 'title', type: 'text', label: 'Title', required: true, wide: true },
        { key: 'slug', type: 'slug', from: 'title', label: 'Web address', prefix: '/', wide: true },
        { key: 'publishState', type: 'select', label: 'Visibility', options: VISIBILITY },
        { key: 'date', type: 'date', label: 'Publish date' },
        { key: 'author', type: 'text', label: 'Author' },
        { key: 'categorySlugs', type: 'multicats', label: 'Categories', wide: true },
        { key: 'featuredImage', type: 'image', label: 'Featured image', wide: true },
        { key: 'excerpt', type: 'textarea', label: 'Short summary (shown on the blog list)', wide: true, rows: 2 },
        { key: 'contentHtml', type: 'richtext', label: 'Article', wide: true },
      ] },
      { title: 'Search engines (optional)', fields: [
        { key: 'seoTitle', type: 'text', label: 'Google title', wide: true },
        { key: 'seoDescription', type: 'textarea', label: 'Google description', wide: true, rows: 2 },
      ] },
    ],
  },

  pages: {
    label: 'Pages', one: 'Page', icon: 'file',
    blurb: 'About Us, Privacy Policy and the other content pages.',
    path: (i) => (i.slug === 'about-selling-an-rv-park' ? '/about-selling-an-rv-park/' : `/${i.slug}/`),
    columns: [['title', 'Title'], ['slug', 'Address'], ['publishState', 'Visibility']],
    sort: (a, b) => (a.title || '').localeCompare(b.title || ''),
    blank: () => ({ title: '', slug: '', publishState: 'publish' }),
    groups: [
      { title: 'Page', fields: [
        { key: 'title', type: 'text', label: 'Title', required: true, wide: true },
        { key: 'slug', type: 'slug', from: 'title', label: 'Web address', prefix: '/', wide: true },
        { key: 'publishState', type: 'select', label: 'Visibility', options: VISIBILITY },
        { key: 'featuredImage', type: 'image', label: 'Header image', wide: true },
        { key: 'contentHtml', type: 'richtext', label: 'Content', wide: true },
      ] },
      { title: 'Search engines (optional)', fields: [
        { key: 'seoTitle', type: 'text', label: 'Google title', wide: true },
        { key: 'seoDescription', type: 'textarea', label: 'Google description', wide: true, rows: 2 },
      ] },
    ],
  },

  brokers: personSchema('Brokers', 'Broker', '/broker/', 'The brokers shown on the Brokers page and on listings.'),
  developers: personSchema('Developers', 'Developer', '/developer/', 'RV park developers shown on the Developers page.'),

  testimonials: {
    label: 'Reviews', one: 'Review', icon: 'star',
    blurb: 'Client reviews on the Reviews page and the home page.',
    path: () => '/reviews/',
    columns: [['name', 'Name'], ['quote', 'Review'], ['date', 'Date']],
    sort: (a, b) => (b.date || '').localeCompare(a.date || ''),
    blank: () => ({ name: '', quote: '', date: now().slice(0, 10) }),
    groups: [
      { title: 'Review', fields: [
        { key: 'name', type: 'text', label: 'Name (and role, after a comma, e.g. “Leo Decker, Broker FL”)', required: true, wide: true },
        { key: 'quote', type: 'textarea', label: 'What they said', required: true, wide: true, rows: 6 },
        { key: 'date', type: 'date', label: 'Date', dateOnly: true },
      ] },
    ],
  },

  faq: {
    label: 'FAQ', one: 'Question', icon: 'help',
    blurb: 'Questions and answers on the FAQ page. They show in the order listed here.',
    path: () => '/faq/',
    ordered: true,
    columns: [['q', 'Question']],
    blank: () => ({ q: '', a: '' }),
    groups: [
      { title: 'Question', fields: [
        { key: 'q', type: 'text', label: 'Question', required: true, wide: true },
        { key: 'a', type: 'richtext', label: 'Answer', wide: true },
      ] },
    ],
  },

  categories: {
    label: 'Blog categories', one: 'Category', icon: 'tag',
    blurb: 'Topics used to group blog posts.',
    path: (i) => `/category/${i.slug}/`,
    columns: [['name', 'Name'], ['slug', 'Address']],
    sort: (a, b) => (a.name || '').localeCompare(b.name || ''),
    blank: () => ({ name: '', slug: '', parent: null }),
    groups: [
      { title: 'Category', fields: [
        { key: 'name', type: 'text', label: 'Name', required: true, wide: true },
        { key: 'slug', type: 'slug', from: 'name', label: 'Web address', prefix: '/category/', wide: true },
        { key: 'descriptionHtml', type: 'richtext', label: 'Description', wide: true },
      ] },
    ],
  },
};

// RVParkSelect.com and RVParkAds.com sections (see lib/admin-remote-schemas.js).
Object.assign(SCHEMAS, REMOTE_SCHEMAS);

function personSchema(label, one, prefix, blurb) {
  return {
    label, one, icon: 'user', blurb,
    path: (i) => `${prefix}${i.slug}/`,
    columns: [['photo', 'thumb'], ['name', 'Name'], ['licenseState', 'State'], ['phone', 'Phone']],
    sort: (a, b) => (a.licenseState || '').localeCompare(b.licenseState || '') || (a.name || '').localeCompare(b.name || ''),
    blank: () => ({ name: '', slug: '' }),
    groups: [
      { title: one, fields: [
        { key: 'name', type: 'text', label: 'Name', required: true, wide: true },
        { key: 'slug', type: 'slug', from: 'name', label: 'Web address', prefix, wide: true },
        { key: 'photo', type: 'image', label: 'Photo', wide: true },
        { key: 'email', type: 'text', label: 'Email' },
        { key: 'phone', type: 'text', label: 'Phone' },
        { key: 'licenseState', type: 'select', label: 'License state', options: STATE_OPTS },
        { key: 'licenseNumber', type: 'text', label: 'License number' },
        { key: 'bioHtml', type: 'richtext', label: 'About / bio', wide: true },
      ] },
    ],
  };
}

export function now() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

export const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90);

// Items from the WordPress export have no id of their own; give each a stable
// one (kept once saved).
export function withIds(name, list) {
  return list.map((it, i) => (it.id ? it : { ...it, id: String(it.wpId || it.slug || (it.name ? slugify(`${it.name}-${it.date || i}`) : `${name}-${i}`)) }));
}
