import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ListingsArchive from '@/components/ListingsArchive';
import PageBand from '@/components/PageBand';
import { allListings, statesWithListings, stateSlug, loadContent } from '@/lib/content';

// Old address pattern kept for search engines: /listing-state/florida/
// Same layout as the old state archive: title + intro, then list and map
// (for-sale and sold together, no State filter).
export async function generateStaticParams() {
  await loadContent();
  return statesWithListings().map((s) => ({ state: stateSlug(s) }));
}

const stateName = (slug) => statesWithListings().find((s) => stateSlug(s) === slug);

export async function generateMetadata({ params }) {
  await loadContent();
  const { state } = await params;
  const name = stateName(state);
  if (!name) return {};
  return { title: `${name} RV Parks and Campgrounds`, description: `This is where you will find a list of RV Parks for sale in ${name} as well as a list of Campgrounds for sale in ${name}.`, alternates: { canonical: `/listing-state/${state}/` } };
}

export default async function StatePage({ params }) {
  await loadContent();
  const { state } = await params;
  const name = stateName(state);
  if (!name) notFound();
  const listings = allListings().map((l) => ({
    slug: l.slug, title: l.title, status: l.status, category: l.category, state: l.state, city: l.city,
    priceUsd: l.priceUsd, sites: l.sites, acres: l.acres, featuredImage: l.featuredImage, address: l.address, lat: l.lat, lng: l.lng,
    photos: [...new Set([l.featuredImage, ...l.images].filter(Boolean))].slice(0, 8),
  }));
  return (
    <>
      <PageBand title={`${name} RV Parks and Campgrounds`} kicker="Browse by state" sub={`This is where you will find a list of RV Parks for sale in ${name} as well as a list of Campgrounds for sale in ${name}.`} crumbs={[{ label: 'RV Parks for Sale', href: '/listings/?_listing_status=for-sale' }, { label: name }]} compact />
      <Suspense fallback={<p style={{ padding: 40 }}>Loading listings…</p>}>
        <ListingsArchive listings={listings} fixedState={name} pinColor="purple" />
      </Suspense>
    </>
  );
}
