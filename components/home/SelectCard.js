'use client';
import { useEffect, useRef } from 'react';

// A 3D "RVParkSelect member card" that floats and turns toward the mouse,
// with a light sheen that follows the pointer.
export default function SelectCard() {
  const wrap = useRef(null);
  const card = useRef(null);

  useEffect(() => {
    const w = wrap.current; const c = card.current;
    if (!w || !c || matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf; let tx = -14; let ty = 8; let x = tx; let y = ty;
    const loop = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      c.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
      raf = requestAnimationFrame(loop);
    };
    const move = (e) => {
      const r = w.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tx = px * 30; ty = -py * 24;
      c.style.setProperty('--sx', `${(px + 0.5) * 100}%`);
      c.style.setProperty('--sy', `${(py + 0.5) * 100}%`);
    };
    const leave = () => { tx = -14; ty = 8; };
    w.addEventListener('pointermove', move);
    w.addEventListener('pointerleave', leave);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); w.removeEventListener('pointermove', move); w.removeEventListener('pointerleave', leave); };
  }, []);

  return (
    <div className="sel-card-wrap" ref={wrap} aria-hidden="true">
      <div className="sel-card" ref={card}>
        <span className="sel-sheen" />
        <span className="sel-top"><span className="sel-logo">RVParkSelect<sup>™</sup></span><span className="sel-chip" /></span>
        <span className="sel-tier">Premium Member</span>
        <span className="sel-alert">
          <span className="sel-dot" />
          Sample alert · New listing in your region
          <b>First look before the public</b>
        </span>
        <span className="sel-foot"><span>Members only</span><span>rvparkselect.com</span></span>
      </div>
      <div className="sel-shadow" />
    </div>
  );
}
