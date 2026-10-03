'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HeroSlides from '@/components/HeroSlides';

// The home hero: photo slider under a teal tint, a Buyers / Sellers toggle,
// and the search row, as on the current site.
export default function HomeHero() {
  const router = useRouter();
  const [tab, setTab] = useState('buyers');

  function search(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = new URLSearchParams({ _listing_status: 'for-sale' });
    if (fd.get('category')) p.set('_listing_category', fd.get('category'));
    const loc = (fd.get('location') || '').toString().trim();
    if (loc) p.set('q', loc);
    router.push(`/listings/?${p.toString()}`);
  }

  return (
    <section className="hero">
      <HeroSlides />
      <div className="hero-inner">
        <div className="tabs-pill" role="tablist">
          <button role="tab" aria-selected={tab === 'buyers'} className={tab === 'buyers' ? 'on' : ''} onClick={() => setTab('buyers')}>Buyers</button>
          <button role="tab" aria-selected={tab === 'sellers'} className={tab === 'sellers' ? 'on' : ''} onClick={() => setTab('sellers')}>Sellers</button>
        </div>

        {tab === 'buyers' ? (
          <>
            <h1 className="kicker">Are you looking to buy an RV Park or Campground?</h1>
            <h2>We have RV Parks and Campgrounds for sale in the USA. What RV Property Type Are You Interested In?</h2>
            <form className="search-form" onSubmit={search}>
              <div className="fld"><input name="location" placeholder="Enter location" aria-label="Enter location" /></div>
              <div className="fld">
                <select name="category" aria-label="Property type" defaultValue="rv-parks-campgrounds">
                  <option value="rv-parks-campgrounds">RV Parks/Campgrounds</option>
                  <option value="rv-lots">RV Lots</option>
                  <option value="rv-mh-communities">RV/MH Communities</option>
                </select>
              </div>
              <button className="btn" type="submit">Search</button>
            </form>
          </>
        ) : (
          <>
            <div className="kicker">Looking to sell?</div>
            <h2>Have you decided it’s time to sell your RV Property?</h2>
            <div className="search-form">
              <button type="button" className="btn seller-consultation">Book a Consultation</button>
              <a className="btn" href="/listings/?_listing_status=sold">Search Sold Properties</a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
