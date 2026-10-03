'use client';
import { useEffect, useRef } from 'react';

// 3D globe for the home hero (cobe, WebGL): every park for sale is a glowing
// pin, with arcs flying to RVParkSales' home base in Panama City Beach, FL.
// It turns slowly around the USA and can be dragged to spin.
const HOME = [30.1766, -85.8055];
const toPhi = (lng) => Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2);

export default function HeroGlobe({ points }) {
  const canvas = useRef(null);
  const drag = useRef(null);

  useEffect(() => {
    let globe; let cancelled = false; let raf;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    import('cobe').then(({ default: createGlobe }) => {
      if (cancelled || !canvas.current) return;
      const c = canvas.current;
      const size = () => c.offsetWidth || 560;
      let width = size();
      const center = toPhi(-97);
      let phi = center - 0.55; let offset = 0; let t = 0;
      globe = createGlobe(c, {
        // cobe multiplies width by devicePixelRatio itself; cap it to keep the GPU load light.
        devicePixelRatio: Math.min(2, window.devicePixelRatio || 1),
        width, height: width,
        phi, theta: 0.42, dark: 1, diffuse: 1.4, scale: 1.02,
        mapSamples: 16000, mapBrightness: 5.5, mapBaseBrightness: 0.04,
        baseColor: [0.28, 0.2, 0.48], markerColor: [0.23, 0.73, 0.93], glowColor: [0.42, 0.3, 0.82],
        markers: [
          ...points.map((p) => ({ location: [p.lat, p.lng], size: 0.045 })),
          { location: HOME, size: 0.09, color: [1, 1, 1] },
        ],
        arcs: points.slice(0, 18).map((p) => ({ from: [p.lat, p.lng], to: HOME })),
        arcColor: [0.23, 0.73, 0.93], arcWidth: 0.6, arcHeight: 0.25,
      });
      // cobe v2: we drive the animation ourselves with globe.update().
      // Only draw while the globe is on screen.
      let visible = true;
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
      io.observe(c);
      const frame = () => {
        if (cancelled) { io.disconnect(); return; }
        if (!visible) { raf = requestAnimationFrame(frame); return; }
        if (!drag.current?.active) {
          t += reduce ? 0 : 0.0035;
          // Swing gently back and forth over the USA instead of spinning the whole Earth.
          phi = center + Math.sin(t) * 0.55;
        }
        const w = size();
        const patch = { phi: phi + offset };
        if (w !== width) { width = w; patch.width = w; patch.height = w; }
        globe.update(patch);
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      c.style.opacity = '1';

      const down = (e) => { drag.current = { active: true, x: e.clientX, start: offset }; c.style.cursor = 'grabbing'; };
      const move = (e) => { if (drag.current?.active) offset = drag.current.start + (e.clientX - drag.current.x) / 180; };
      const up = () => { if (drag.current) drag.current.active = false; c.style.cursor = 'grab'; };
      c.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      globe.__cleanup = () => { c.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    }).catch(() => {});
    return () => { cancelled = true; cancelAnimationFrame(raf); globe?.__cleanup?.(); globe?.destroy(); };
  }, [points]);

  return <canvas ref={canvas} className="hero-globe" aria-label="Globe showing RV parks for sale across the USA" />;
}
