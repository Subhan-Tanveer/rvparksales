import Link from 'next/link';
import { stateSlug } from '@/lib/content';

// Plain, server-rendered park links under the interactive search, so search
// engines (and anyone without JavaScript) can reach every listing and state.
const money = (n) => (n ? `$${Number(n).toLocaleString('en-US')}` : 'Call for price');

export default function ParkIndex({ title, intro, listings, states }) {
  const forSale = listings.filter((l) => l.status === 'For Sale');
  const other = listings.filter((l) => l.status !== 'For Sale');
  const row = (l) => (
    <li key={l.slug}>
      <Link href={`/listing/${l.slug}/`}>{l.title}</Link>
      <span>{[l.city && l.state ? `${l.city}, ${l.state}` : l.state, l.sites ? `${l.sites} sites` : null, l.acres ? `${l.acres} acres` : null, l.status === 'For Sale' ? money(l.priceUsd) : l.status].filter(Boolean).join(' · ')}</span>
    </li>
  );
  return (
    <section className="l-section park-index">
      <div className="l-section-h">
        <h2>{title}</h2>
        {intro && <p className="park-index-intro">{intro}</p>}
        {forSale.length > 0 && <ul className="park-index-list">{forSale.map(row)}</ul>}
        {other.length > 0 && (
          <>
            <h3>Recently sold and off-market</h3>
            <ul className="park-index-list">{other.map(row)}</ul>
          </>
        )}
        {states?.length > 0 && (
          <>
            <h3>RV parks for sale by state</h3>
            <ul className="park-index-states">
              {states.map((s) => <li key={s}><Link href={`/listing-state/${stateSlug(s)}/`}>{s} RV parks for sale</Link></li>)}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
