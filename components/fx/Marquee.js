'use client';
import { useEffect, useRef } from 'react';

// Endless ticker (Tandy / BWPro style). It speeds up and flips direction with
// the scroll, and the words lean slightly while the page is moving.
export default function Marquee({ items, speed = 40, className = '', sep = '✦', reverse = false }) {
  const root = useRef(null);
  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let tween; let lenisOff; let raf;
    let cancelled = false;
    import('gsap').then(({ gsap }) => {
      if (cancelled || !root.current) return;
      const track = el.querySelector('.mq-track');
      tween = gsap.fromTo(track, { xPercent: reverse ? -50 : 0 }, { xPercent: reverse ? 0 : -50, ease: 'none', duration: speed, repeat: -1 });
      let dir = 1;
      const skew = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3' });
      const onScroll = () => {
        const v = window.__lenis?.velocity || 0;
        if (Math.abs(v) > 0.5) dir = v > 0 ? 1 : -1;
        tween.timeScale(dir * (1 + Math.min(Math.abs(v) / 6, 4)));
        skew(Math.max(-8, Math.min(8, -v * 0.4)));
      };
      const settle = () => { onScroll(); raf = requestAnimationFrame(settle); };
      raf = requestAnimationFrame(settle);
      lenisOff = () => cancelAnimationFrame(raf);
    });
    return () => { cancelled = true; tween?.kill(); lenisOff?.(); };
  }, [speed, reverse]);

  const row = (key) => (
    <span className="mq-row" key={key} aria-hidden={key > 0 ? 'true' : undefined}>
      {[...items, ...items, ...items].map((t, i) => <span key={i} className="mq-item">{t}<i className="mq-sep">{sep}</i></span>)}
    </span>
  );
  return (
    <div className={`marquee ${className}`} ref={root}>
      <div className="mq-track">{row(0)}{row(1)}</div>
    </div>
  );
}
