'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// The home hero: six photos cross-fading every 7 seconds under a teal tint,
// a Buyers / Sellers toggle, and the search row, as on the current site.
const SLIDES = [
  'rv-parks-3.jpg', 'Parks-for-sale.webp', '1956989740-scaled.jpg',
  'RV-PARKS.webp', 'rv-parks-2.jpg', 'mobile-home-parks-1.jpg',
];

export default function HomeHero({ states }) {
  const router = useRouter();
  const [tab, setTab] = useState('buyers');
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);

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
      <div className="hero-slides" aria-hidden="true">
        {SLIDES.map((f, i) => <div key={f} className={`slide ${i === slide ? 'on' : ''}`} style={{ backgroundImage: `url(/images/site/${f})` }} />)}
      </div>
      <div className="hero-overlay" />
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
              <a className="btn" href="https://calendly.com/marie-rvparksales/30min" target="_blank" rel="noopener">Book a Consultation</a>
              <a className="btn" href="/listings/?_listing_status=sold">Search Sold Properties</a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
