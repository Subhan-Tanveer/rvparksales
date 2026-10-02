'use client';
import { useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import ListingCard from '@/components/ListingCard';

// The old site filtered with ?_listing_status=for-sale&_listing_category=rv-lots
// in the address; those exact links (menus, bookmarks, search results) keep working.
const CATEGORIES = {
  'rv-parks-campgrounds': 'RV Parks/Campgrounds',
  'rv-lots': 'RV Lots',
  'rv-mh-communities': 'RV/MH Communities',
};

export default function ListingsExplorer({ listings, states }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const status = sp.get('_listing_status') === 'sold' ? 'sold' : 'for-sale';
  const category = sp.get('_listing_category') || '';
  const state = sp.get('state') || '';
  const max = Number(sp.get('max')) || 0;
  const q = (sp.get('q') || '').trim().toLowerCase();
  const sort = sp.get('sort') || 'newest';

  function set(patch) {
    const next = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const shown = useMemo(() => {
    let rows = listings.filter((l) => (status === 'sold' ? l.status === 'Sold' : l.status === 'For Sale'));
    if (category && CATEGORIES[category]) rows = rows.filter((l) => l.category === CATEGORIES[category]);
    if (state) rows = rows.filter((l) => l.state === state);
    if (max) rows = rows.filter((l) => l.priceUsd && l.priceUsd <= max);
    if (q) rows = rows.filter((l) => `${l.title} ${l.state || ''} ${l.address || ''}`.toLowerCase().includes(q));
    if (sort === 'price-asc') rows = [...rows].sort((a, b) => (a.priceUsd || 1e12) - (b.priceUsd || 1e12));
    if (sort === 'price-desc') rows = [...rows].sort((a, b) => (b.priceUsd || 0) - (a.priceUsd || 0));
    return rows;
  }, [listings, status, category, state, max, q, sort]);

  return (
    <>
      <div className="tabs" role="tablist">
        <button className={`tab ${status === 'for-sale' ? 'on' : ''}`} onClick={() => set({ _listing_status: 'for-sale' })}>For Sale</button>
        <button className={`tab ${status === 'sold' ? 'on' : ''}`} onClick={() => set({ _listing_status: 'sold' })}>Sold</button>
      </div>
      <div className="filters">
        <select value={state} onChange={(e) => set({ state: e.target.value })} aria-label="State">
          <option value="">Any state</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={category} onChange={(e) => set({ _listing_category: e.target.value })} aria-label="Property type">
          <option value="">All property types</option>
          {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={String(max || '')} onChange={(e) => set({ max: e.target.value })} aria-label="Maximum price" disabled={status === 'sold'}>
          <option value="">Any price</option>
          <option value="500000">Up to $500,000</option>
          <option value="1000000">Up to $1 million</option>
          <option value="2500000">Up to $2.5 million</option>
          <option value="5000000">Up to $5 million</option>
        </select>
        <select value={sort} onChange={(e) => set({ sort: e.target.value === 'newest' ? '' : e.target.value })} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>
      <input
        style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--line)', font: '500 1rem var(--font-body)', marginBottom: 14 }}
        defaultValue={sp.get('q') || ''}
        placeholder="Search by name, city or state"
        aria-label="Search listings"
        onKeyDown={(e) => { if (e.key === 'Enter') set({ q: e.currentTarget.value }); }}
        onBlur={(e) => { if (e.currentTarget.value !== (sp.get('q') || '')) set({ q: e.currentTarget.value }); }}
      />
      <p className="count">{shown.length} {status === 'sold' ? 'sold listing' : 'listing'}{shown.length === 1 ? '' : 's'}</p>
      {shown.length === 0
        ? <p className="lede">No listings match those filters. Try widening your search.</p>
        : <div className="grid grid-3">{shown.map((l) => <ListingCard key={l.slug} l={l} />)}</div>}
    </>
  );
}
