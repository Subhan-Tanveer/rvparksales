import { Suspense } from 'react';
import ListingsArchive from '@/components/ListingsArchive';
import { allListings } from '@/lib/content';

export const metadata = {
  title: 'RV Parks and Campgrounds For Sale',
  description: 'Search RV parks, campgrounds, RV lots and RV/MH communities for sale across the USA.',
  alternates: { canonical: '/listings/' },
};

function leanListings() {
  return allListings().map((l) => ({
    slug: l.slug, title: l.title, status: l.status, category: l.category, state: l.state, city: l.city,
    priceUsd: l.priceUsd, sites: l.sites, acres: l.acres, featuredImage: l.featuredImage, address: l.address, lat: l.lat, lng: l.lng,
    photos: [...new Set([l.featuredImage, ...l.images].filter(Boolean))].slice(0, 8),
  }));
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<p style={{ padding: 40 }}>Loading listings…</p>}>
      <ListingsArchive listings={leanListings()} />
    </Suspense>
  );
}
