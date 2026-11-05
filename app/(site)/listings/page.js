import { Suspense } from 'react';
import ListingsArchive from '@/components/ListingsArchive';
import PageBand from '@/components/PageBand';
import ParkIndex from '@/components/ParkIndex';
import { US_STATES } from '@/lib/states';
import { JsonLd, breadcrumbs, itemList } from '@/lib/seo';
import { allListings, featuredRank, loadContent } from '@/lib/content';

export const metadata = {
  title: { absolute: 'RV Parks for Sale & Campgrounds for Sale | RV Park Sales' },
  description: 'Browse RV parks for sale, campgrounds for sale, RV resorts, RV lots and RV/MH communities across the USA. Photos, prices, sites and acreage, updated daily.',
  alternates: { canonical: '/listings/' },
};

function leanListings() {
  return allListings().map((l) => ({
    slug: l.slug, title: l.title, status: l.status, category: l.category, state: l.state, city: l.city,
    priceUsd: l.priceUsd, sites: l.sites, acres: l.acres, featuredImage: l.featuredImage, featured: featuredRank(l) > 0, address: l.address, lat: l.lat, lng: l.lng,
    photos: [...new Set([l.featuredImage, ...l.images].filter(Boolean))].slice(0, 8),
  }));
}

export default async function ListingsPage() {
  await loadContent();
  const all = allListings();
  return (
    <>
      <JsonLd data={[breadcrumbs([['Home', '/'], ['RV Parks for Sale']]), itemList(all.filter((l) => l.status === 'For Sale'))]} />
      <PageBand title="RV Parks & Campgrounds for Sale" kicker="Marketplace" sub="Search parks, campgrounds, RV lots and RV/MH communities across the USA. Use Filters to narrow by location, price, sites and more." crumbs={[{ label: 'RV Parks for Sale' }]} image="/images/site/Parks-for-sale.webp" compact />
      <Suspense fallback={<p style={{ padding: 40 }}>Loading listings…</p>}>
        <ListingsArchive listings={leanListings()} />
      </Suspense>
      <ParkIndex title="Every RV park and campground on RVParkSales.com" listings={all} states={US_STATES} />
    </>
  );
}
