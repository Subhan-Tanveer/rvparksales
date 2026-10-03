'use client';
import { useRef } from 'react';
import Link from 'next/link';

// Featured parks: large photo cards in a sideways row (drag, swipe, or use the
// arrows). Each card tilts in 3D toward the mouse (see Motion.js .feat-card).
const money = (n) => (n ? `$${Number(n).toLocaleString('en-US')}` : 'Call for price');
const thumb = (src) => (/^https:\/\/www\.rvparksales\.com\//.test(src) ? `/_next/image?url=${encodeURIComponent(src)}&w=828&q=75` : src);

export default function FeaturedParks({ items }) {
  const track = useRef(null);
  const drag = useRef(null);
  const step = (d) => track.current?.scrollBy({ left: d * (track.current.clientWidth * 0.8), behavior: 'smooth' });

  const down = (e) => {
    if (e.pointerType !== 'mouse') return;
    drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
  };
  const move = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    track.current.scrollLeft = drag.current.left - dx;
  };
  const up = () => { setTimeout(() => { drag.current = null; }, 0); };

  return (
    <div className="feat">
      <div
        className="feat-track" ref={track} data-lenis-prevent
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}
        onClickCapture={(e) => { if (drag.current?.moved) { e.preventDefault(); e.stopPropagation(); } }}
      >
        {items.map((l) => (
          <Link key={l.slug} href={`/listing/${l.slug}/`} className="feat-card" draggable={false}>
            <span className="feat-img"><img src={thumb(l.image)} alt="" loading="lazy" draggable={false} /></span>
            <span className="feat-shade" aria-hidden="true" />
            <span className="feat-state">{l.state}</span>
            <span className="feat-body">
              <span className="feat-title">{l.title}</span>
              <span className="feat-meta">
                {l.sites ? <span>{l.sites} Sites</span> : null}
                {l.acres ? <span>{l.acres} Acres</span> : null}
                {l.category ? <span>{l.category}</span> : null}
              </span>
              <span className="feat-foot"><b>{money(l.priceUsd)}</b><span className="feat-view">View Property →</span></span>
            </span>
          </Link>
        ))}
      </div>
      <div className="feat-nav l-section-h">
        <button type="button" className="rv-nav prev" aria-label="Previous parks" onClick={() => step(-1)} />
        <button type="button" className="rv-nav next" aria-label="More parks" onClick={() => step(1)} />
      </div>
    </div>
  );
}
