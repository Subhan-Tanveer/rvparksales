'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

// "What are you looking to do?" as an editorial index: giant rows that fill
// with colour on hover while a photo floats after the cursor (Mando / Tandy
// style). On touch screens each row simply shows its photo thumbnail.
export default function GoalList({ items }) {
  const root = useRef(null);
  const float = useRef(null);

  useEffect(() => {
    const el = root.current;
    const fl = float.current;
    if (!el || !fl || !matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    let off = () => {};
    import('gsap').then(({ gsap }) => {
      const x = gsap.quickTo(fl, 'x', { duration: 0.6, ease: 'power3' });
      const y = gsap.quickTo(fl, 'y', { duration: 0.6, ease: 'power3' });
      const rot = gsap.quickTo(fl, 'rotate', { duration: 0.8, ease: 'power3' });
      let lastX = 0;
      const move = (e) => {
        const r = el.getBoundingClientRect();
        x(e.clientX - r.left); y(e.clientY - r.top);
        rot(Math.max(-12, Math.min(12, (e.clientX - lastX) * 0.6)));
        lastX = e.clientX;
      };
      const over = (e) => {
        const row = e.target.closest('.gl-row');
        if (!row) return;
        const i = Number(row.dataset.i);
        fl.querySelectorAll('.gl-img').forEach((im, k) => im.classList.toggle('on', k === i));
        gsap.to(fl, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'power3.out' });
      };
      const leave = () => gsap.to(fl, { scale: 0.6, autoAlpha: 0, duration: 0.35, ease: 'power3.in' });
      gsap.set(fl, { xPercent: -50, yPercent: -50, scale: 0.6, autoAlpha: 0 });
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerover', over);
      el.addEventListener('pointerleave', leave);
      off = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerover', over); el.removeEventListener('pointerleave', leave); };
    });
    return () => off();
  }, []);

  return (
    <div className="gl" ref={root}>
      <div className="gl-float" ref={float} aria-hidden="true">
        {items.map((g) => <div key={g.title} className="gl-img" style={{ backgroundImage: `url(${g.image})` }} />)}
      </div>
      {items.map((g, i) => {
        const inner = (
          <>
            <span className="gl-n">0{i + 1}</span>
            <span className="gl-thumb" style={{ backgroundImage: `url(${g.image})` }} aria-hidden="true" />
            <span className="gl-title">{g.title}</span>
            <span className="gl-text">{g.text}</span>
            <span className="gl-cta">{g.cta}<i>→</i></span>
          </>
        );
        return g.ext
          ? <a key={g.title} href={g.href} className="gl-row" data-i={i} target="_blank" rel="noopener" data-cursor="Open">{inner}</a>
          : <Link key={g.title} href={g.href} className="gl-row" data-i={i} data-cursor="Go">{inner}</Link>;
      })}
    </div>
  );
}
