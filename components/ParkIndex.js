import Link from 'next/link';
import { stateSlug } from '@/lib/content';

// Plain, server-rendered park links under the interactive search, so search
// engines (and anyone without JavaScript) can reach every listing and state.
// `collapsed` folds the park list into a "Browse all" panel: still in the
// page for Google, but out of the way where the search above already shows it.
const money = (n) => (n ? `$${Number(n).toLocaleString('en-US')}` : 'Call for price');

function Row({ l }) {
  const where = l.city && !/\d/.test(l.city) && l.state ? `${l.city}, ${l.state}` : l.state;
  return (
    <li>
      <Link href={`/listing/${l.slug}/`} className="pi-row">
        <span className="pi-main">
          <span className="pi-title">{l.title}</span>
          <span className="pi-meta">{[where, l.sites ? `${l.sites} sites` : null, l.acres ? `${l.acres} acres` : null].filter(Boolean).join(' · ')}</span>
        </span>
        <span className={`pi-price ${l.status === 'For Sale' ? '' : 'sold'}`}>{l.status === 'For Sale' ? money(l.priceUsd) : l.status}</span>
      </Link>
    </li>
  );
}

export default function ParkIndex({ title, intro, listings, states, collapsed = false }) {
  const forSale = listings.filter((l) => l.status === 'For Sale');
  const other = listings.filter((l) => l.status !== 'For Sale');
  const lists = (
    <>
      {forSale.length > 0 && <ul className="pi-list">{forSale.map((l) => <Row key={l.slug} l={l} />)}</ul>}
      {other.length > 0 && (
        <>
          <h3>Recently sold and off-market</h3>
          <ul className="pi-list">{other.map((l) => <Row key={l.slug} l={l} />)}</ul>
        </>
      )}
    </>
  );
  return (
    <section className="l-section park-index">
      <div className="l-section-h">
        {title && <h2>{title}</h2>}
        {intro && <p className="park-index-intro">{intro}</p>}
        {listings.length > 0 && (collapsed
          ? <details className="pi-more"><summary>Browse all {listings.length} parks as a list</summary>{lists}</details>
          : lists)}
        {states?.length > 0 && (
          <>
            <h3>RV parks for sale by state</h3>
            <ul className="park-index-states">
              {states.map((s) => <li key={s}><Link href={`/listing-state/${stateSlug(s)}/`}>{s}</Link></li>)}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
