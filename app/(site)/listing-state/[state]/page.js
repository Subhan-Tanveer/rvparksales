import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ListingsArchive from '@/components/ListingsArchive';
import PageBand from '@/components/PageBand';
import ParkIndex from '@/components/ParkIndex';
import { JsonLd, breadcrumbs, itemList } from '@/lib/seo';
import Link from 'next/link';
import { allListings, featuredRank, statesWithListings, stateSlug, loadContent, SITE } from '@/lib/content';
import { US_STATES, neighborsOf } from '@/lib/states';

// Old address pattern kept for search engines: /listing-state/florida/
// Same layout as the old state archive: title + intro, then list and map
// (opens on parks for sale; sold ones via Filters, no State filter).
// All 50 states have a page; a state with no parks listed yet shows the
// parks for sale in the states around it instead of the search.
export async function generateStaticParams() {
  return US_STATES.map((s) => ({ state: stateSlug(s) }));
}

const stateName = (slug) => US_STATES.find((s) => stateSlug(s) === slug);
const inState = (name) => allListings().filter((l) => l.state === name);
const forSaleIn = (names) => allListings().filter((l) => l.status === 'For Sale' && names.includes(l.state));
// Bordering states first, then their neighbours, so every page has parks to show.
function nearbyParks(name) {
  const near = neighborsOf(name);
  let parks = forSaleIn(near);
  if (parks.length < 3) {
    const ring2 = [...new Set(near.flatMap(neighborsOf))].filter((s) => s !== name && !near.includes(s));
    parks = [...parks, ...forSaleIn(ring2)];
  }
  if (!parks.length) parks = allListings().filter((l) => l.status === 'For Sale').sort((a, b) => featuredRank(b) - featuredRank(a));
  return parks.slice(0, 12);
}
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
    parts.push(`No ${name} RV parks are publicly listed on RVParkSales.com this week. New parks come on the market every week, and RVParkSelect members see them before they go public.`);
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
  const listed = parks.length > 0;
  const nearby = parks.some((l) => l.status === 'For Sale') ? [] : nearbyParks(name);
  const nearStates = [...new Set(nearby.map((l) => l.state))];
  const bordering = nearby.length > 0 && nearby.every((l) => neighborsOf(name).includes(l.state) || neighborsOf(name).some((n) => neighborsOf(n).includes(l.state)));
  return (
    <>
      <JsonLd data={[breadcrumbs([['Home', '/'], ['RV Parks for Sale', '/listings/'], [`${name} RV Parks for Sale`]]), itemList(parks.filter((l) => l.status === 'For Sale'))]} />
      <PageBand title={`${name} RV Parks and Campgrounds`} kicker="Browse by state" sub={`This is where you will find a list of RV Parks for sale in ${name} as well as a list of Campgrounds for sale in ${name}.`} crumbs={[{ label: 'RV Parks for Sale', href: '/listings/?_listing_status=for-sale' }, { label: name }]} compact />
      {listed && (
        <Suspense fallback={<p style={{ padding: 40 }}>Loading listings…</p>}>
          <ListingsArchive listings={listings} fixedState={name} pinColor="purple" defaultStatus="for-sale" />
        </Suspense>
      )}
      <ParkIndex title={`RV parks and campgrounds for sale in ${name}`} intro={stateIntro(name, parks)} listings={parks} />
      {nearby.length > 0 && (
        <ParkIndex title={bordering ? `RV parks for sale near ${name}` : 'Featured RV parks for sale nationwide'} intro={`Parks for sale right now in ${nearStates.slice(0, 8).join(', ')}.`} listings={nearby} />
      )}
      <section className="l-section park-index state-cta">
        <div className="l-section-h">
          <h2>{`Buying or selling an RV park in ${name}?`}</h2>
          <p className="park-index-intro">
            {`RVParkSales.com markets RV parks, campgrounds and RV resorts in ${name} and all 50 states to buyers nationwide. `}
            <Link href="/sell-my-rv-park/">Sell your {name} RV park</Link>{' with a broker or advertise it yourself, or '}
            <a href={`${SITE.select}/#pricing`}>join RVParkSelect</a>{` to hear about new ${name} parks before they go public. Questions? Call Marie Hansen at `}
            <a href={SITE.phoneHref}>{SITE.phone}</a>.
          </p>
          <h3>RV parks for sale by state</h3>
          <ul className="park-index-states">
            {US_STATES.filter((s) => s !== name).map((s) => <li key={s}><Link href={`/listing-state/${stateSlug(s)}/`}>{s}</Link></li>)}
          </ul>
        </div>
      </section>
    </>
  );
}
