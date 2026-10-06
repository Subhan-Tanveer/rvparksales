'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

// Featured parks as a pinned sideways reel: on desktop the section holds
// still and scrolling down slides the park cards across (photos drift inside
// their frames); on phones it is a normal swipeable row.
const money = (n) => (n ? `$${Number(n).toLocaleString('en-US')}` : 'Call for price');
const thumb = (src) => (/^(https:\/\/www\.rvparksales\.com\/|\/media\/)/.test(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=1080&q=75` : src);

export default function HorizontalParks({ items, total }) {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let mm; let cancelled = false;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      mm = gsap.matchMedia();
      mm.add('(min-width: 900px)', () => {
        const track = el.querySelector('.hp-track');
        const dist = () => track.scrollWidth - innerWidth + 80;
        const tween = gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${dist()}`, pin: el.querySelector('.hp-pin'), scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => { const b = el.querySelector('.hp-prog i'); if (b) b.style.transform = `scaleX(${self.progress})`; } },
        });
        el.querySelectorAll('.hp-img img').forEach((img) => {
          gsap.fromTo(img, { xPercent: -12 }, { xPercent: 12, ease: 'none', scrollTrigger: { trigger: img.closest('.hp-card'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        });
      });
      ScrollTrigger.refresh();
    });
    return () => { cancelled = true; mm?.revert(); };
  }, []);

  return (
    <section className="hparks" ref={root}>
      <div className="hp-pin">
      <div className="hp-track">
        <div className="hp-intro">
          <p className="eyebrow light">Featured properties</p>
          <h2 className="hp-title">Parks<br /><em>For Sale</em><br />Right Now</h2>
          <p>Hand-picked RV parks, campgrounds and resorts from across the country. Keep scrolling.</p>
          <Link href="/listings/?_listing_status=for-sale" className="btn btn-lg">View all {total} parks</Link>
        </div>
        {items.map((l, i) => (
          <Link key={l.slug} href={`/listing/${l.slug}/`} className="hp-card" data-cursor="View">
            <span className="hp-img"><img src={thumb(l.image)} alt="" loading="lazy" /></span>
            <span className="hp-n">{String(i + 1).padStart(2, '0')}</span>
            <span className="hp-state">{l.state}</span>
            {l.featured && <span className="hp-feat">★ Featured</span>}
            <span className="hp-body">
              <span className="hp-name">{l.title}</span>
              <span className="hp-meta">
                {l.sites ? <span>{l.sites} Sites</span> : null}
                {l.acres ? <span>{l.acres} Acres</span> : null}
                {l.category ? <span>{l.category}</span> : null}
              </span>
              <span className="hp-price">{money(l.priceUsd)}</span>
            </span>
          </Link>
        ))}
        <Link href="/listings/?_listing_status=for-sale" className="hp-more" data-cursor="All">
          <span>See all<br />{total}<br />parks</span><i>→</i>
        </Link>
      </div>
      <div className="hp-prog" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}
