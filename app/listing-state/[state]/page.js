import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ListingsArchive from '@/components/ListingsArchive';
import { allListings, statesWithListings, stateSlug } from '@/lib/content';

// Old address pattern kept for search engines: /listing-state/florida/
// Same layout as the old state archive: title + intro, then list and map
// (for-sale and sold together, no State filter).
export function generateStaticParams() {
  return statesWithListings().map((s) => ({ state: stateSlug(s) }));
}

const stateName = (slug) => statesWithListings().find((s) => stateSlug(s) === slug);

export async function generateMetadata({ params }) {
  const { state } = await params;
  const name = stateName(state);
  if (!name) return {};
  return { title: `${name} RV Parks and Campgrounds`, description: `This is where you will find a list of RV Parks for sale in ${name} as well as a list of Campgrounds for sale in ${name}.`, alternates: { canonical: `/listing-state/${state}/` } };
}

export default async function StatePage({ params }) {
  const { state } = await params;
  const name = stateName(state);
  if (!name) notFound();
  const listings = allListings().map((l) => ({
    slug: l.slug, title: l.title, status: l.status, category: l.category, state: l.state, city: l.city,
    priceUsd: l.priceUsd, featuredImage: l.featuredImage, address: l.address, lat: l.lat, lng: l.lng,
  }));
  return (
    <>
      <section className="l-section s-medium-72">
        <div className="l-section-h">
          <h1 style={{ margin: '0 0 27px' }}>{name} RV Parks and Campgrounds</h1>
          <p style={{ margin: 0 }}>This is where you will find a list of RV Parks for sale in {name} as well as a list of Campgrounds for sale in {name}</p>
        </div>
      </section>
      <Suspense fallback={<p style={{ padding: 40 }}>Loading listings…</p>}>
        <ListingsArchive listings={listings} fixedState={name} pinColor="purple" />
      </Suspense>
    </>
  );
}
