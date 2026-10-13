import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { readFresh } from '@/lib/store';

// Numbers for the admin dashboard.
export const dynamic = 'force-dynamic';

export async function GET(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const [listings, posts, pages, brokers, developers, vendors, testimonials, faq, categories] = await Promise.all(
    ['listings', 'posts', 'pages', 'brokers', 'developers', 'vendors', 'testimonials', 'faq', 'categories'].map(readFresh),
  );
  const pub = (x) => !x.publishState || x.publishState === 'publish';
  const recent = [...listings].sort((a, b) => String(b.updatedAt || b.date || '').localeCompare(String(a.updatedAt || a.date || ''))).slice(0, 6)
    .map((l) => ({ id: String(l.id || l.wpId || l.slug), title: l.title, status: l.status, publishState: l.publishState, image: l.featuredImage }));
  return NextResponse.json({
    listings: {
      total: listings.length,
      forSale: listings.filter((l) => pub(l) && l.status === 'For Sale').length,
      sold: listings.filter((l) => pub(l) && l.status === 'Sold').length,
      early: listings.filter((l) => l.publishState === 'early' && l.status === 'For Sale').length,
      offmarket: listings.filter((l) => l.publishState === 'offmarket' && l.status === 'For Sale').length,
      hidden: listings.filter((l) => ['draft', 'private'].includes(l.publishState) || l.status === 'Archived').length,
    },
    posts: posts.length, pages: pages.length, brokers: brokers.length, developers: developers.length, vendors: vendors.length,
    testimonials: testimonials.length, faq: faq.length, categories: categories.length,
    storage: !!process.env.BLOB_READ_WRITE_TOKEN,
    recent,
  });
}
