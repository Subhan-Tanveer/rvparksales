import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ListingsArchive from '@/components/ListingsArchive';
import PageBand from '@/components/PageBand';
import ParkIndex from '@/components/ParkIndex';
import { JsonLd, breadcrumbs, itemList } from '@/lib/seo';
import { allListings, featuredRank, statesWithListings, stateSlug, loadContent } from '@/lib/content';

// Old address pattern kept for search engines: /listing-state/florida/
// Same layout as the old state archive: title + intro, then list and map
// (opens on parks for sale; sold ones via Filters, no State filter).
export async function generateStaticParams() {
  await loadContent();
  return statesWithListings().map((s) => ({ state: stateSlug(s) }));
}

const stateName = (slug) => statesWithListings().find((s) => stateSlug(s) === slug);
const inState = (name) => allListings().filter((l) => l.state === name);
const usd = (n) => `$${Number(n).toLocaleString('en-US')}`;

// A short, factual intro from the parks themselves (count, prices, towns).
function stateIntro(name, parks) {
  const forSale = parks.filter((l) => l.status === 'For Sale');
  const prices = forSale.map((l) => Number(l.priceUsd)).filter((n) => n > 0).sort((a, b) => a - b);
  const towns = [...new Set(forSale.map((l) => l.city).filter((c) => c && !/\d/.test(c)))].slice(0, 5);
  const parts = [];
  if (forSale.length) {
    parts.push(`There ${forSale.length === 1 ? 'is' : 'are'} ${forSale.length} RV ${forSale.length === 1 ? 'park or campground' : 'parks and campgrounds'} for sale in ${name} on RVParkSales.com right now`);
    if (prices.length > 1) parts[0] += `, priced from ${usd(prices[0])} to ${usd(prices[prices.length - 1])}`;
    else if (prices.length === 1) parts[0] += `, asking ${usd(prices[0])}`;
    parts[0] += '.';
    if (towns.length) parts.push(`Listings include parks in ${towns.join(', ')}.`);
  } else {
    parts.push(`No ${name} RV parks are publicly for sale this minute; new parks are added every week, and RVParkSelect members see them first.`);
  }
  parts.push(`Every listing shows photos, number of sites, acreage and asking price. To sell an RV park or campground in ${name}, talk with Marie Hansen at (850) 832-0022.`);
  return parts.join(' ');
}

export async function generateMetadata({ params }) {
  await loadContent();
  const { state } = await params;
  const name = stateName(state);
  if (!name) return {};
  const n = inState(name).filter((l) => l.status === 'For Sale').length;
  return {
    title: { absolute: `RV Parks for Sale in ${name} | ${name} Campgrounds for Sale | RV Park Sales` },
    description: `${n ? `${n} RV ${n === 1 ? 'park' : 'parks'} and campgrounds for sale in ${name}` : `RV parks and campgrounds for sale in ${name}`}: photos, prices, sites and acreage. Buy or sell an RV park in ${name} with RVParkSales.com.`,
    alternates: { canonical: `/listing-state/${state}/` },
  };
}

export default async function StatePage({ params }) {
  await loadContent();
  const { state } = await params;
  const name = stateName(state);
  if (!name) notFound();
  const listings = allListings().map((l) => ({
    slug: l.slug, title: l.title, status: l.status, category: l.category, state: l.state, city: l.city,
    priceUsd: l.priceUsd, sites: l.sites, acres: l.acres, featuredImage: l.featuredImage, featured: featuredRank(l) > 0, address: l.address, lat: l.lat, lng: l.lng,
    photos: [...new Set([l.featuredImage, ...l.images].filter(Boolean))].slice(0, 8),
  }));
  const parks = inState(name);
  return (
    <>
      <JsonLd data={[breadcrumbs([['Home', '/'], ['RV Parks for Sale', '/listings/'], [`${name} RV Parks for Sale`]]), itemList(parks.filter((l) => l.status === 'For Sale'))]} />
      <PageBand title={`${name} RV Parks and Campgrounds`} kicker="Browse by state" sub={`This is where you will find a list of RV Parks for sale in ${name} as well as a list of Campgrounds for sale in ${name}.`} crumbs={[{ label: 'RV Parks for Sale', href: '/listings/?_listing_status=for-sale' }, { label: name }]} compact />
      <Suspense fallback={<p style={{ padding: 40 }}>Loading listings…</p>}>
        <ListingsArchive listings={listings} fixedState={name} pinColor="purple" defaultStatus="for-sale" />
      </Suspense>
      <ParkIndex title={`RV parks and campgrounds for sale in ${name}`} intro={stateIntro(name, parks)} listings={parks} states={statesWithListings().filter((s) => s !== name)} />
    </>
  );
}
