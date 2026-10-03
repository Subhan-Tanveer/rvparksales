'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

// Page header used on every inner page: a deep purple stage with the page's
// photo behind it, a moving 3D grid floor, glowing orbs and floating glass
// rings that drift with the mouse (3D parallax), and the title rising in word
// by word. Without a title it becomes a tall cinematic photo band (listings,
// blog posts, broker profiles) whose photo drifts as you scroll.
const words = (s) => String(s).split(' ').map((w, i) => <span key={i} className="pb-wrap"><span className="pb-w">{w}</span></span>);

export default function PageBand({ title, image = '/images/site/1956989740-scaled.jpg', kicker, sub, crumbs, children, compact = false }) {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.classList.add('pb-in');
    if (reduce) return undefined;
    let ctx;
    import('gsap').then(({ gsap }) => {
      if (!root.current) return;
      ctx = gsap.context(() => {
        gsap.from('.pb-w', { yPercent: 115, rotateX: -75, autoAlpha: 0, duration: 1, ease: 'power4.out', stagger: 0.06, transformOrigin: '50% 100%' });
        gsap.from('.pb-kicker, .pb-sub, .pb-crumbs, .pb-extra', { y: 18, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.25 });
        gsap.from('.pb-ring', { scale: 0.4, autoAlpha: 0, duration: 1.6, ease: 'expo.out', stagger: 0.12 });
      }, el);
    });
    // Mouse parallax: layers move by different amounts, the stage tilts slightly.
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    let raf; let tx = 0; let ty = 0; let x = 0; let y = 0;
    const loop = () => {
      x += (tx - x) * 0.07; y += (ty - y) * 0.07;
      el.style.setProperty('--px', x.toFixed(4));
      el.style.setProperty('--py', y.toFixed(4));
      raf = requestAnimationFrame(loop);
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
    };
    const leave = () => { tx = 0; ty = 0; };
    if (fine) { el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave); raf = requestAnimationFrame(loop); }
    return () => { ctx?.revert(); cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [title]);

  if (!title) {
    return (
      <div className="pb-cine" ref={root}>
        <div className="pb-cine-img" style={{ backgroundImage: `url(${image})` }} data-parallax="0.3" />
        <div className="pb-cine-shade" />
      </div>
    );
  }

  return (
    <section className={`pb ${compact ? 'pb-compact' : ''}`} ref={root}>
      <div className="pb-photo" style={{ backgroundImage: `url(${image})` }} />
      <div className="pb-tint" />
      <div className="pb-floor" aria-hidden="true" />
      <span className="pb-orb a" aria-hidden="true" /><span className="pb-orb b" aria-hidden="true" />
      <div className="pb-rings" aria-hidden="true">
        <span className="pb-ring r1" /><span className="pb-ring r2" /><span className="pb-ring r3" />
        <span className="pb-cube"><i /><i /><i /><i /><i /><i /></span>
      </div>
      <div className="l-section-h pb-inner">
        {crumbs && (
          <nav className="pb-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            {crumbs.map((c) => <span key={c.label}><i>/</i>{c.href ? <Link href={c.href}>{c.label}</Link> : c.label}</span>)}
          </nav>
        )}
        {kicker && <p className="pb-kicker"><span className="dot" />{kicker}</p>}
        <h1 className="pb-title">{words(title)}</h1>
        {sub && <p className="pb-sub">{sub}</p>}
        {children && <div className="pb-extra">{children}</div>}
      </div>
    </section>
  );
}
