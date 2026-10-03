'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationInput from '@/components/LocationInput';
import Select from '@/components/fx/Select';
import { geocode } from '@/components/googleMaps';
import { CATEGORIES, PRICES, SITES } from '@/lib/search-options';

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// The big "Find Your Next RV Park" search: location, state, price, number of
// sites and property type, sent to the listings page as its usual filters.
export default function FindPark({ states }) {
  const router = useRouter();
  const [loc, setLoc] = useState('');
  const [place, setPlace] = useState(null);

  async function submit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = new URLSearchParams({ _listing_status: 'for-sale' });
    [['state', '_listing_state'], ['price', '_listing_price'], ['sites', '_listing_sites'], ['category', '_listing_category']]
      .forEach(([k, q]) => { if (fd.get(k)) p.set(q, fd.get(k)); });
    const text = loc.trim();
    const hit = text ? (place && place.label === text ? place : await geocode(text)) : null;
    if (hit) p.set('_listing_location', `${hit.lat.toFixed(5)},${hit.lng.toFixed(5)},100,${encodeURIComponent(text)}`);
    router.push(`/listings/?${p.toString()}`);
  }

  return (
    <form className="find-park" onSubmit={submit} role="search" data-reveal>
      <div className="fp-field fp-wide">
        <span className="hs-label">Location</span>
        <LocationInput value={loc} onChange={(v) => { setLoc(v); setPlace(null); }} onPick={(pl) => { setLoc(pl.label); setPlace(pl); }} placeholder="City, state or ZIP (100-mile radius)" />
      </div>
      <div className="fp-field">
        <span className="hs-label">State</span>
        <Select name="state" label="State" options={[['', 'Any state'], ...states.map((s) => [slugify(s), s])]} />
      </div>
      <div className="fp-field">
        <span className="hs-label">Price</span>
        <Select name="price" label="Price" options={PRICES} />
      </div>
      <div className="fp-field">
        <span className="hs-label">Number of sites</span>
        <Select name="sites" label="Number of sites" options={[['', 'Any size'], ...SITES.slice(1)]} />
      </div>
      <div className="fp-field">
        <span className="hs-label">Property type</span>
        <Select name="category" label="Property type" options={[['', 'All types'], ...Object.entries(CATEGORIES)]} />
      </div>
      <button type="submit" className="btn btn-lg fp-go">Search RV Parks</button>
    </form>
  );
}
