'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Site-wide motion: smooth scrolling (Lenis), elements easing in as they scroll
// into view (GSAP ScrollTrigger), 3D tilt on cards that follows the mouse, and
// counting numbers. Everything is skipped for visitors who ask their device for
// reduced motion. Pages opt in with data attributes:
//   data-reveal            fade/slide up when it scrolls into view
//   data-reveal="stagger"  same, one child after another
//   data-tilt              3D tilt toward the mouse (desktop only)
//   data-count="23"        count up from 0 when visible
//   data-parallax="0.15"   drift slower than the page while scrolling
// Common blocks (cards, section titles) also reveal without any attribute.
const AUTO = [
  '.l-section .sec-title', '.l-section .eyebrow', '.page-band h1',
  '.blog-card', '.pcard', '.l-row', '.news-card', '.photo-card', '.faq-item',
  '.reviews-grid .rv-item', '.side-list li', '.detail-head', '.status-bar',
].join(',');

export default function Motion() {
  const pathname = usePathname();

  // Smooth scrolling, once for the whole visit.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let lenis; let raf; let obs; let gsapRef; let tick;
    let cancelled = false;
    Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      gsapRef = gsap;
      lenis = new Lenis({ duration: 1.2, smoothWheel: true, prevent: (node) => !!node.closest?.('[data-lenis-prevent], .w-popup, .menu-panel, .arch-map, .filters-box, .gm-style, .leaflet-container, .pac-container') });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      tick = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      // Popups lock the page (overflow hidden): pause smooth scrolling meanwhile.
      obs = new MutationObserver(() => {
        if (document.documentElement.style.overflow === 'hidden') lenis.stop(); else lenis.start();
      });
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    });
    return () => {
      cancelled = true;
      obs?.disconnect();
      if (gsapRef && tick) gsapRef.ticker.remove(tick);
      lenis?.destroy();
      cancelAnimationFrame(raf);
      window.__lenis = null;
    };
  }, []);

  // Per page: reveals, tilt, counters, parallax.
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.__lenis?.scrollTo(0, { immediate: true });
    if (reduce) return undefined;
    let ctx; let cancelled = false; let refreshT;
    const cleanups = [];
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      // Let page components build their pinned scenes first.
      ctx = gsap.context(() => {
        const auto = [...document.querySelectorAll(AUTO)].filter((el) => !el.closest('[data-reveal], [data-intro], .hero, .h-hero') && !el.matches('[data-split]'));
        // Headlines split into letters rise out of their masks.
        document.querySelectorAll('[data-split]').forEach((el) => {
          if (el.closest('[data-intro]')) return;
          gsap.fromTo(el.querySelectorAll('.sc'), { yPercent: 115, rotate: 5 }, {
            yPercent: 0, rotate: 0, duration: 1, ease: 'expo.out', stagger: el.dataset.split === 'word' ? 0.06 : 0.018,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });
        // Photos unveil from the bottom while settling from a zoom.
        document.querySelectorAll('[data-img-reveal]').forEach((el) => {
          gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
          const img = el.querySelector('img, .img');
          if (img) gsap.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        });
        // Cards that fly in from a scattered pile.
        document.querySelectorAll('[data-pop]').forEach((el, i) => {
          gsap.fromTo(el, { y: 140, rotate: i % 2 ? 14 : -14, autoAlpha: 0, scale: 0.9 }, {
            y: 0, rotate: 0, autoAlpha: 1, scale: 1, duration: 1.1, ease: 'expo.out', delay: (i % 3) * 0.08,
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          });
        });
        // Stacked sticky cards: each one sinks back as the next slides over it.
        document.querySelectorAll('[data-stack]').forEach((wrap) => {
          const cards = [...wrap.children];
          cards.forEach((card, i) => {
            const next = cards[i + 1];
            if (!next) return;
            gsap.to(card, { scale: 0.9 - (cards.length - i) * 0.01, filter: 'brightness(0.55)', ease: 'none',
              scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true } });
          });
        });
        // Layers drifting at their own speed (scattered cards, floating art).
        document.querySelectorAll('[data-speed]').forEach((el) => {
          const k = Number(el.dataset.speed) || 0;
          gsap.fromTo(el, { y: () => k * 120 }, { y: () => -k * 120, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
        });
        const singles = [...document.querySelectorAll('[data-reveal]:not([data-reveal="stagger"])'), ...auto];
        singles.forEach((el) => {
          gsap.fromTo(el, { autoAlpha: 0, y: 40 }, {
            autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        });
        document.querySelectorAll('[data-reveal="stagger"]').forEach((wrap) => {
          gsap.fromTo(wrap.children, { autoAlpha: 0, y: 50, rotateX: -12, transformPerspective: 900 }, {
            autoAlpha: 1, y: 0, rotateX: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12,
            scrollTrigger: { trigger: wrap, start: 'top 85%', once: true },
          });
        });
        document.querySelectorAll('[data-count]').forEach((el) => {
          const end = Number(el.dataset.count) || 0;
          const obj = { v: 0 };
          gsap.to(obj, {
            v: end, duration: 2, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(obj.v).toLocaleString('en-US'); },
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          });
        });
        document.querySelectorAll('[data-parallax]').forEach((el) => {
          const k = Number(el.dataset.parallax) || 0.15;
          gsap.fromTo(el, { yPercent: -k * 50 }, {
            yPercent: k * 50, ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });
        // Lines that draw themselves (SVG paths with data-draw).
        document.querySelectorAll('[data-draw] path, [data-draw] line').forEach((p) => {
          const len = p.getTotalLength?.() || 300;
          gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, {
            strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut',
            scrollTrigger: { trigger: p.closest('[data-draw]'), start: 'top 80%', once: true },
          });
        });
      });
      // Pinned scenes may have been built before or after these: put every
      // trigger back in page order, then measure again once images settle.
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      refreshT = setTimeout(() => ScrollTrigger.refresh(), 1200);
    });

    // 3D tilt toward the mouse on cards (desktop pointers only).
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.querySelectorAll('[data-tilt], .pcard-in, .blog-card .img, .feat-card').forEach((el) => {
        const max = Number(el.dataset.tilt) || 8;
        const move = (e) => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(0)`;
          el.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
          el.style.setProperty('--my', `${(y + 0.5) * 100}%`);
        };
        const leave = () => { el.style.transform = ''; };
        el.classList.add('tilt');
        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', leave);
        cleanups.push(() => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); });
      });
    }

    return () => { cancelled = true; clearTimeout(refreshT); ctx?.revert(); cleanups.forEach((f) => f()); };
  }, [pathname]);

  return null;
}
