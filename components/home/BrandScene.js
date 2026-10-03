'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

// Pinned scroll scene (the BWPro "scroll film" idea, built from photos): the
// section holds still while you scroll, and each of the four RVParkSales
// brands takes over the screen in turn. The next photo wipes up over the last
// while it settles from a zoom, a giant word slides past, the copy swaps, and
// the bar along the top tracks progress through the scene.
export default function BrandScene({ items }) {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let ctx; let cancelled = false;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const slides = gsap.utils.toArray('.bs-slide');
        const panels = gsap.utils.toArray('.bs-panel');
        const words = gsap.utils.toArray('.bs-word');
        const count = el.querySelector('.bs-count b');
        const bar = el.querySelector('.bs-prog i');
        gsap.set(slides.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.set(el.querySelectorAll('.bs-photo'), { filter: 'brightness(1)' });
        gsap.set(panels.slice(1), { autoAlpha: 0, y: 80 });
        gsap.set(words.slice(1), { autoAlpha: 0, xPercent: 30 });
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el, start: 'top top', end: () => `+=${innerHeight * (slides.length - 0.4) * (innerWidth < 700 ? 0.8 : 1.1)}`,
            pin: '.bs-pin', scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar) bar.style.transform = `scaleX(${self.progress})`;
              const i = Math.min(slides.length - 1, Math.floor(self.progress * slides.length * 0.999 + 0.25));
              if (count && count.textContent !== String(i + 1).padStart(2, '0')) count.textContent = String(i + 1).padStart(2, '0');
            },
          },
        });
        tl.fromTo(slides[0].querySelector('.bs-photo'), { scale: 1.15 }, { scale: 1, duration: 1 }, 0)
          .fromTo(words[0], { xPercent: 0 }, { xPercent: -20, duration: 1 }, 0);
        slides.forEach((s, i) => {
          if (i === 0) return;
          const at = i * 1.2 - 0.2;
          tl.to(panels[i - 1], { autoAlpha: 0, y: -60, duration: 0.3 }, at)
            .to(words[i - 1], { autoAlpha: 0, xPercent: -50, duration: 0.5 }, at)
            .to(slides[i - 1].querySelector('.bs-photo'), { scale: 1.12, filter: 'brightness(0.4)', duration: 1 }, at)
            .to(s, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power2.inOut' }, at)
            .fromTo(s.querySelector('.bs-photo'), { scale: 1.45 }, { scale: 1, duration: 1.3 }, at)
            .to(words[i], { autoAlpha: 1, xPercent: -20, duration: 1.3 }, at + 0.2)
            .to(panels[i], { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, at + 0.32);
        });
        tl.to({}, { duration: 0.4 });
      }, el);
      ScrollTrigger.refresh();
    });
    return () => { cancelled = true; ctx?.revert(); };
  }, []);

  return (
    <section className="bscene" ref={root} id="ecosystem">
      <div className="bs-pin">
        {items.map((b, i) => (
          <div key={b.key} className={`bs-slide b-${b.key}`} style={{ zIndex: i + 1 }}>
            <div className="bs-photo" style={{ backgroundImage: `url(${b.image})` }} />
            <div className="bs-shade" />
          </div>
        ))}
        {items.map((b, i) => <span key={b.key} className="bs-word" style={{ zIndex: 20 }} aria-hidden="true">{b.word}</span>)}
        <div className="bs-top l-section-h">
          <p className="bs-eyebrow">The RVParkSales Family · One marketplace, four ways in</p>
          <div className="bs-count"><b>01</b><span>/ {String(items.length).padStart(2, '0')}</span></div>
        </div>
        <div className="bs-prog" aria-hidden="true"><i /></div>
        <div className="bs-panels l-section-h">
          {items.map((b, i) => {
            const cls = 'btn btn-lg';
            return (
              <div key={b.key} className="bs-panel">
                <span className="bs-tag">{String(i + 1).padStart(2, '0')} — {b.tag}</span>
                <h2 className="bs-name">{b.name}</h2>
                <p>{b.text}</p>
                {b.ext
                  ? <a href={b.href} className={cls} target="_blank" rel="noopener">{b.cta} ↗</a>
                  : <Link href={b.href} className={cls}>{b.cta} →</Link>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
