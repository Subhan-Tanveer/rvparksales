import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ListingsArchive from '@/components/ListingsArchive';
import { allListings, statesWithListings, stateSlug } from '@/lib/content';

// Old address pattern kept for search engines: /listing-state/florida/
export function generateStaticParams() {
  return statesWithListings().map((s) => ({ state: stateSlug(s) }));
}

const stateName = (slug) => statesWithListings().find((s) => stateSlug(s) === slug);

export async function generateMetadata({ params }) {
  const { state } = await params;
  const name = stateName(state);
  if (!name) return {};
  return { title: `${name} RV Parks and Campgrounds`, description: `RV parks and campgrounds for sale in ${name}.`, alternates: { canonical: `/listing-state/${state}/` } };
}

export default async function StatePage({ params }) {
  const { state } = await params;
  const name = stateName(state);
  if (!name) notFound();
  const listings = allListings().map((l) => ({
    slug: l.slug, title: l.title, status: l.status, category: l.category, state: l.state,
    priceUsd: l.priceUsd, featuredImage: l.featuredImage, address: l.address, lat: l.lat, lng: l.lng,
  }));
  return (
    <Suspense fallback={<p style={{ padding: 40 }}>Loading listings…</p>}>
      <ListingsArchive listings={listings} states={statesWithListings()} fixedState={name} />
    </Suspense>
  );
}
