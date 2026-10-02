import { Suspense } from 'react';
import ListingsExplorer from '@/components/ListingsExplorer';
import { allListings } from '@/lib/content';

export const metadata = {
  title: 'RV Parks and Campgrounds For Sale',
  description: 'Search RV parks, campgrounds, RV lots and RV/MH communities for sale across the USA. Filter by state, type and price, and see recently sold listings.',
  alternates: { canonical: '/listings/' },
};

export default function ListingsPage() {
  // Only the fields the cards and filters need are sent to the browser.
  const listings = allListings().map((l) => ({
    slug: l.slug, title: l.title, status: l.status, category: l.category, state: l.state,
    priceUsd: l.priceUsd, sites: l.sites, acres: l.acres, featuredImage: l.featuredImage, address: l.address,
  }));
  const states = [...new Set(listings.map((l) => l.state).filter(Boolean))].sort();
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow">Marketplace</p>
        <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.6rem)' }}>RV Parks &amp; Campgrounds</h1>
        <p className="lede" style={{ marginBottom: 22 }}>Browse parks for sale or see what has sold. Want to see new parks before they appear here? <a href="https://rvparkselect.com" target="_blank" rel="noopener"><strong>Join RVParkSelect</strong></a>.</p>
        <Suspense fallback={<p className="count">Loading listings…</p>}>
          <ListingsExplorer listings={listings} states={states} />
        </Suspense>
      </div>
    </section>
  );
}
