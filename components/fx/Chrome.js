'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// The site-wide "cinema" layer, the same kit as the ATX / Mando / BWPro / Tandy
// builds:
//   - preloader (first visit of a session): logo, counter to 100, wipe up
//   - page transition: a two-colour curtain wipes over on every internal link,
//     the page changes underneath, then the curtain wipes off
//   - custom cursor (dot + trailing ring that grows over links, labels from
//     data-cursor) and magnetic buttons, mouse/trackpad only
//   - scroll progress bar along the top
// Heroes wait for the "rv:reveal" event (or window.__rvReady) so their intro
// plays as the curtain/preloader opens rather than behind it.
function announceReady() {
  window.__rvReady = true;
  window.dispatchEvent(new Event('rv:reveal'));
}

export default function Chrome() {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef(null);
  const covering = useRef(false);
  const first = useRef(true);
  const gsapRef = useRef(null);

  // Load GSAP once, run the preloader.
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('js-motion');
    const pre = document.querySelector('.preloader');
    // Never leave content hidden if anything below fails.
    const failSafe = setTimeout(() => { if (pre) pre.style.display = 'none'; announceReady(); }, 4500);
    import('gsap').then(({ gsap }) => {
      gsapRef.current = gsap;
      if (!pre || reduce || getComputedStyle(pre).display === 'none') {
        if (pre) pre.style.display = 'none';
        clearTimeout(failSafe);
        announceReady();
        return;
      }
      try { sessionStorage.setItem('rv-pl', '1'); } catch (e) { /* private mode */ }
      const num = pre.querySelector('.pl-num');
      const bar = pre.querySelector('.pl-bar i');
      const o = { v: 0 };
      const tl = gsap.timeline({ onComplete: () => { pre.style.display = 'none'; } });
      tl.from(pre.querySelectorAll('.pl-logo, .pl-tag'), { y: 30, autoAlpha: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 })
        .to(o, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => {
          const v = Math.round(o.v);
          if (num) num.textContent = String(v).padStart(3, '0');
          if (bar) bar.style.transform = `scaleX(${o.v / 100})`;
        } }, 0.1)
        .to(pre.querySelectorAll('.pl-logo, .pl-tag, .pl-num, .pl-bar'), { y: -40, autoAlpha: 0, duration: 0.5, ease: 'power3.in', stagger: 0.04 })
        .to(pre, { yPercent: -100, duration: 1, ease: 'expo.inOut', onStart: () => { clearTimeout(failSafe); setTimeout(announceReady, 350); } }, '-=0.15');
    });
    return () => clearTimeout(failSafe);
  }, []);

  // Intercept internal link clicks: wipe the curtain on, then navigate.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.noTransition !== undefined) return;
      if (/(^|\s)(buyer|seller)-consultation(\s|$)/.test(a.className)) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return; // same page: hash/filters, let Next handle it
      const gsap = gsapRef.current;
      const el = curtain.current;
      if (!gsap || !el || covering.current) return;
      e.preventDefault();
      e.stopPropagation();
      covering.current = true;
      window.__rvReady = false;
      const label = el.querySelector('.ct-label');
      if (label) label.textContent = a.dataset.label || a.textContent.trim().slice(0, 40) || 'RVParkSales';
      gsap.set(el, { autoAlpha: 1 });
      gsap.timeline()
        .fromTo(el.querySelectorAll('.ct-panel'), { y: 0, yPercent: 100 }, { y: 0, yPercent: 0, duration: 0.7, ease: 'expo.inOut', stagger: 0.08 })
        .fromTo(el.querySelectorAll('.ct-logo, .ct-label'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out', stagger: 0.05 }, '-=0.25')
        .add(() => router.push(url.pathname + url.search + url.hash));
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [router]);

  // New page in place: wipe the curtain off (or just announce on back/forward).
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const gsap = gsapRef.current;
    const el = curtain.current;
    if (!covering.current || !gsap || !el) { announceReady(); return; }
    gsap.timeline({ delay: 0.15, onComplete: () => { covering.current = false; gsap.set(el, { autoAlpha: 0 }); } })
      .to(el.querySelectorAll('.ct-logo, .ct-label'), { y: -30, autoAlpha: 0, duration: 0.3, ease: 'power3.in' })
      .to([...el.querySelectorAll('.ct-panel')].reverse(), { yPercent: -100, duration: 0.8, ease: 'expo.inOut', stagger: 0.08 }, '-=0.05')
      .add(announceReady, '-=0.55');
  }, [pathname]);

  // Cursor, magnetic buttons, progress bar.
  useEffect(() => {
    const bar = document.querySelector('.scroll-prog i');
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });

    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return () => removeEventListener('scroll', onScroll);

    let off = () => {};
    import('gsap').then(({ gsap }) => {
      const dot = document.querySelector('.cur-dot');
      const ring = document.querySelector('.cur-ring');
      const label = ring?.querySelector('span');
      if (!dot || !ring) return;
      document.documentElement.classList.add('has-cursor');
      const dx = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power3' });
      const dy = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power3' });
      const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
      const ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
      let magnet = null;
      const NATIVE = 'input, textarea, select, iframe, .gm-style, .leaflet-container, .arch-map';
      const move = (e) => {
        dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
        document.documentElement.classList.add('cur-on');
        const t = e.target;
        const native = t.closest?.(NATIVE);
        document.documentElement.classList.toggle('cur-native', !!native);
        const hot = !native && t.closest?.('a, button, [role="button"], label, summary, [data-cursor]');
        const text = hot?.closest('[data-cursor]')?.dataset.cursor || '';
        ring.classList.toggle('hot', !!hot);
        ring.classList.toggle('label', !!text);
        if (label && label.textContent !== text) label.textContent = text;
        // Magnetic pull on buttons.
        const m = !native && t.closest?.('.btn, [data-magnetic]');
        if (m !== magnet) {
          if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
          magnet = m;
        }
        if (magnet) {
          const r = magnet.getBoundingClientRect();
          const k = Number(magnet.dataset.magnetic) || 0.3;
          gsap.to(magnet, { x: (e.clientX - (r.left + r.width / 2)) * k, y: (e.clientY - (r.top + r.height / 2)) * k, duration: 0.4, ease: 'power3.out' });
        }
      };
      const leave = () => document.documentElement.classList.remove('cur-on');
      const down = () => ring.classList.add('down');
      const up = () => ring.classList.remove('down');
      addEventListener('pointermove', move, { passive: true });
      document.addEventListener('pointerleave', leave);
      addEventListener('pointerdown', down);
      addEventListener('pointerup', up);
      off = () => {
        removeEventListener('pointermove', move);
        document.removeEventListener('pointerleave', leave);
        removeEventListener('pointerdown', down);
        removeEventListener('pointerup', up);
        document.documentElement.classList.remove('has-cursor');
      };
    });
    return () => { removeEventListener('scroll', onScroll); off(); };
  }, []);

  return (
    <>
      <div className="scroll-prog" aria-hidden="true"><i /></div>
      <div className="grain" aria-hidden="true" />
      <div className="cur-ring" aria-hidden="true"><span /></div>
      <div className="cur-dot" aria-hidden="true" />
      <div className="curtain" ref={curtain} aria-hidden="true">
        <div className="ct-panel ct-a" />
        <div className="ct-panel ct-b">
          <img className="ct-logo" src="/images/logo-light.png" alt="" width="186" height="86" />
          <span className="ct-label" />
        </div>
      </div>
    </>
  );
}
