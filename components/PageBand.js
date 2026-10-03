'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Split from '@/components/fx/Split';
import Marquee from '@/components/fx/Marquee';
import onReveal from '@/components/fx/onReveal';

// Cinematic page hero used on every inner page (ATX / BWPro style): a
// full-bleed photo (or video) that slowly pushes in, a giant condensed title
// that rises letter by letter as the curtain opens, and a ticker along the
// bottom. Scrolling away zooms and darkens the photo and lifts the copy.
// Without a title it is a tall photo band (listings, posts, profiles).
const TICKER = ['RV Parks', 'Campgrounds', 'RV Resorts', 'RV / MH Communities', 'Buy', 'Sell', 'Advertise', 'Grow'];

export default function PageBand({ title, image = '/images/site/1956989740-scaled.jpg', video, kicker, sub, crumbs, children, compact = false, ticker = TICKER, index }) {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.classList.add('ch-done'); return undefined; }
    let ctx; let cancelled = false; let stopReveal = () => {};
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const intro = gsap.timeline({ paused: true, onComplete: () => el.classList.add('ch-done') });
        intro.fromTo('.ch-media', { scale: 1.35 }, { scale: 1, duration: 2.4, ease: 'expo.out' }, 0)
          .fromTo('.ch-title .sc', { y: 0, yPercent: 115, rotate: 6 }, { y: 0, yPercent: 0, rotate: 0, duration: 1.1, ease: 'expo.out', stagger: 0.022 }, 0.1)
          .fromTo('.ch-anim', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.45)
          .fromTo('.ch-line', { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 0.3);
        stopReveal = onReveal(() => intro.play());
        // Scroll away: photo zooms + darkens, copy drifts up and fades.
        gsap.to('.ch-media-in', { yPercent: 18, scale: 1.12, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.ch-dark', { opacity: 0.75, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.ch-inner', { yPercent: -18, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
      }, el);
    });
    return () => { cancelled = true; stopReveal(); ctx?.revert(); };
  }, [title, image]);

  const media = (
    <div className="ch-media">
      <div className="ch-media-in">
        <div className="ch-img" style={{ backgroundImage: `url(${image})` }} />
        {video && <video className="ch-video" src={video} poster={image} autoPlay muted loop playsInline preload="auto" />}
      </div>
    </div>
  );

  if (!title) {
    return (
      <section className="cine-hero ch-band" ref={root} data-intro>
        {media}
        <div className="ch-shade" /><div className="ch-dark" />
      </section>
    );
  }

  const len = String(title).length;
  const size = len > 44 ? 'ch-xl' : len > 24 ? 'ch-l' : '';
  return (
    <section className={`cine-hero ${compact ? 'ch-compact' : ''}`} ref={root} data-intro>
      {media}
      <div className="ch-shade" /><div className="ch-dark" />
      <div className="l-section-h ch-inner">
        {crumbs && (
          <nav className="ch-crumbs ch-anim" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {crumbs.map((c) => <span key={c.label}><i>/</i>{c.href ? <Link href={c.href}>{c.label}</Link> : c.label}</span>)}
          </nav>
        )}
        {kicker && <p className="ch-kicker ch-anim"><span className="ch-idx">{index || '(RV)'}</span>{kicker}</p>}
        <Split as="h1" text={title} className={`ch-title ${size}`} />
        <span className="ch-line" aria-hidden="true" />
        <div className="ch-row">
          {sub && <p className="ch-sub ch-anim">{sub}</p>}
          {children && <div className="ch-extra ch-anim">{children}</div>}
        </div>
      </div>
      <div className="ch-foot ch-anim" aria-hidden="true">
        <span className="ch-scroll"><i />Scroll</span>
      </div>
      {ticker && ticker.length > 0 && <Marquee items={ticker} className="ch-ticker" speed={50} />}
    </section>
  );
}
