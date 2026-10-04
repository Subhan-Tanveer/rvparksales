'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LocationInput from '@/components/LocationInput';
import Split from '@/components/fx/Split';
import Select from '@/components/fx/Select';
import onReveal from '@/components/fx/onReveal';
import { geocode } from '@/components/googleMaps';
import { CATEGORIES, PRICES } from '@/lib/search-options';

// Home hero, full screen like the reference sites: real RV park photos play
// like a film (slow push-in, crossfade every few seconds), the headline
// "Buy. Sell. Advertise. Grow." rises letter by letter as the preloader opens,
// with the two main buttons, a quick park search and live counts.
const SLIDES = [
  { src: '/images/site/rv-parks-3.jpg', label: 'Mountain lake RV resort' },
  { src: '/images/site/rv-parks-2.jpg', label: 'Oceanfront RV park' },
  { src: '/images/site/rv-parks-1.jpg', label: 'Forest campground' },
  { src: '/images/site/1956989740-scaled.jpg', label: 'Shaded RV sites' },
  { src: '/images/site/RV-PARKS.webp', label: 'Lakeside RV community' },
];

export default function Hero({ stats }) {
  const router = useRouter();
  const root = useRef(null);
  const [loc, setLoc] = useState('');
  const [place, setPlace] = useState(null);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('ch-done'); return undefined; }
    let ctx; let cancelled = false; let stop = () => {};
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const tl = gsap.timeline({ paused: true, onComplete: () => el.classList.add('ch-done') });
        tl.fromTo('.hh-stage', { scale: 1.3 }, { scale: 1, duration: 2.6, ease: 'expo.out' }, 0)
          .fromTo('.hh-title .sc', { y: 0, yPercent: 120, rotate: 8 }, { y: 0, yPercent: 0, rotate: 0, duration: 1.2, ease: 'expo.out', stagger: 0.03 }, 0.1)
          .fromTo('.ch-anim', { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.09 }, 0.6)
          .fromTo('.ch-line', { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'expo.inOut' }, 0.4);
        stop = onReveal(() => tl.play());
        gsap.to('.hh-stage-in', { yPercent: 20, scale: 1.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.hh-title', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.ch-dark', { opacity: 0.8, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
      }, el);
    });
    return () => { cancelled = true; stop(); ctx?.revert(); };
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

  return (
    <section className="cine-hero hh" ref={root} data-intro>
      <div className="hh-stage" aria-hidden="true">
        <div className="hh-stage-in">
          {SLIDES.map((s, i) => (
            <div key={s.src} className={`hh-slide ${i === slide ? 'on' : ''}`} style={{ backgroundImage: `url(${s.src})` }} />
          ))}
        </div>
      </div>
      <div className="ch-shade" /><div className="ch-dark" />

      <div className="l-section-h hh-in">
        <p className="ch-kicker ch-anim"><span className="ch-idx">(Since 2017)</span>America’s RV Park Marketplace</p>
        <Split as="h1" text={'Buy. *Sell.*\nAdvertise. *Grow.*'} className="hh-title" />
        <span className="ch-line" aria-hidden="true" />
        <div className="hh-row">
          <p className="ch-sub ch-anim">The place where RV park buyers, sellers, brokers and owners come together.</p>
          <div className="hh-ctas ch-anim">
            <Link href="/listings/?_listing_status=for-sale" className="btn btn-lg" data-label="RV Parks for Sale">Search RV Parks for Sale</Link>
            <Link href="/sell-my-rv-park/" className="btn btn-lg btn-ghost">Sell My RV Park</Link>
          </div>
        </div>
        <form className="h-search ch-anim" onSubmit={search} role="search">
          <div className="hs-field hs-loc">
            <span className="hs-label">Location</span>
            <LocationInput value={loc} onChange={(v) => { setLoc(v); setPlace(null); }} onPick={(pl) => { setLoc(pl.label); setPlace(pl); }} placeholder="City, state or ZIP" />
          </div>
          <div className="hs-field">
            <span className="hs-label">Property type</span>
            <Select name="category" label="Property type" variant="dark" options={[['', 'All property types'], ...Object.entries(CATEGORIES)]} />
          </div>
          <div className="hs-field">
            <span className="hs-label">Price</span>
            <Select name="price" label="Price" variant="dark" options={PRICES} />
          </div>
          <button type="submit" className="btn hs-go" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>
            <span>Search</span>
          </button>
        </form>
      </div>

      <div className="hh-side ch-anim" aria-hidden="true">
        <div><b>{stats.forSale}</b><span>Parks for sale</span></div>
        <div><b>{stats.states}</b><span>States listed</span></div>
        <div className="hh-slide-n"><b>{String(slide + 1).padStart(2, '0')}</b><span>/ {String(SLIDES.length).padStart(2, '0')} · {SLIDES[slide].label}</span></div>
      </div>
      <div className="ch-foot ch-anim" aria-hidden="true"><span className="ch-scroll"><i />Scroll</span></div>
    </section>
  );
}
