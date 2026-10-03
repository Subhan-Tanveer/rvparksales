'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HeroGlobe from '@/components/home/HeroGlobe';
import LocationInput from '@/components/LocationInput';
import { geocode } from '@/components/googleMaps';
import { CATEGORIES, PRICES } from '@/lib/search-options';

// Home hero (Marie's new plan): "America's RV Park Marketplace — Buy. Sell.
// Advertise. Grow." with the two main buttons, a quick park search, and the
// 3D globe of every park for sale. Words rise in with a 3D flip on load.
export default function Hero({ points, stats }) {
  const router = useRouter();
  const root = useRef(null);
  const [loc, setLoc] = useState('');
  const [place, setPlace] = useState(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { root.current?.classList.add('in'); return undefined; }
    let ctx;
    import('gsap').then(({ gsap }) => {
      if (!root.current) return;
      root.current.classList.add('in');
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.from('.h-kicker', { y: 20, autoAlpha: 0, duration: 0.7 })
          .from('.h-title .w', { yPercent: 110, rotateX: -80, autoAlpha: 0, duration: 1.1, stagger: 0.07, transformOrigin: '50% 100%' }, '-=0.3')
          .from('.h-sub', { y: 24, autoAlpha: 0, duration: 0.8 }, '-=0.6')
          .from('.h-ctas > *', { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, '-=0.5')
          .from('.h-search', { y: 30, autoAlpha: 0, duration: 0.8 }, '-=0.4')
          .from('.h-globe-wrap', { scale: 0.7, autoAlpha: 0, duration: 1.6, ease: 'expo.out' }, 0.2)
          .from('.h-chip', { y: 20, autoAlpha: 0, scale: 0.8, duration: 0.7, stagger: 0.15 }, 0.9);
        gsap.to('.h-chip', { y: '-=10', duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.4 });
      }, root);
    });
    return () => ctx?.revert();
  }, []);

  async function search(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = new URLSearchParams({ _listing_status: 'for-sale' });
    if (fd.get('category')) p.set('_listing_category', fd.get('category'));
    if (fd.get('price')) p.set('_listing_price', fd.get('price'));
    const text = loc.trim();
    const hit = text ? (place && place.label === text ? place : await geocode(text)) : null;
    if (hit) p.set('_listing_location', `${hit.lat.toFixed(5)},${hit.lng.toFixed(5)},100,${encodeURIComponent(text)}`);
    else if (text) p.set('q', text);
    router.push(`/listings/?${p.toString()}`);
  }

  const words = (s) => s.split(' ').map((w, i) => <span key={i} className="w-wrap"><span className="w">{w}</span> </span>);

  return (
    <section className="h-hero" ref={root}>
      <div className="h-bg" aria-hidden="true">
        <span className="h-orb a" /><span className="h-orb b" /><span className="h-grid" />
      </div>
      <div className="l-section-h h-hero-in">
        <div className="h-copy">
          <p className="h-kicker"><span className="dot" /> America’s RV Park Marketplace</p>
          <h1 className="h-title">{words('Buy. Sell.')}<br />{words('Advertise. Grow.')}</h1>
          <p className="h-sub">The place where RV park buyers, sellers, brokers and owners come together.</p>
          <div className="h-ctas">
            <Link href="/listings/?_listing_status=for-sale" className="btn btn-lg">Search RV Parks for Sale</Link>
            <Link href="/sell-my-rv-park/" className="btn btn-lg btn-ghost">Sell My RV Park</Link>
          </div>
          <form className="h-search" onSubmit={search} role="search">
            <div className="hs-field hs-loc">
              <span className="hs-label">Location</span>
              <LocationInput value={loc} onChange={(v) => { setLoc(v); setPlace(null); }} onPick={(pl) => { setLoc(pl.label); setPlace(pl); }} placeholder="City, state or ZIP" />
            </div>
            <label className="hs-field">
              <span className="hs-label">Property type</span>
              <select name="category" defaultValue="">
                <option value="">All property types</option>
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="hs-field">
              <span className="hs-label">Price</span>
              <select name="price" defaultValue="">
                {PRICES.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            </label>
            <button type="submit" className="btn hs-go" aria-label="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>
              <span>Search</span>
            </button>
          </form>
        </div>
        <div className="h-globe-wrap">
          <div className="h-globe-glow" />
          <HeroGlobe points={points} />
          <div className="h-chip c1"><b data-count={stats.forSale}>{stats.forSale}</b><span>parks for sale now</span></div>
          <div className="h-chip c2"><b data-count={stats.states}>{stats.states}</b><span>states with listings</span></div>
          <div className="h-chip c3"><b>4</b><span>ways to buy, sell &amp; grow</span></div>
        </div>
      </div>
      <a href="#ecosystem" className="h-scroll" aria-label="Scroll down"><span /></a>
    </section>
  );
}
