'use client';
import { useEffect, useRef, useState } from 'react';

// Photo carousel from the old listing page: one photo at a time, white side
// arrows, round dots underneath, click a photo to see it full screen.
export default function ListingGallery({ photos, title }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [h, setH] = useState(null);
  const track = useRef(null);
  const n = photos.length;

  // Auto height, like the old carousel: the stage takes the current photo's height.
  useEffect(() => {
    const measure = () => {
      const img = track.current?.children[i]?.querySelector('img');
      if (img && img.complete && img.naturalWidth) setH(img.getBoundingClientRect().height);
    };
    measure();
    const img = track.current?.children[i]?.querySelector('img');
    img?.addEventListener('load', measure);
    window.addEventListener('resize', measure);
    return () => { img?.removeEventListener('load', measure); window.removeEventListener('resize', measure); };
  }, [i]);
  const go = (d) => setI((x) => (x + d + n) % n);

  useEffect(() => {
    if (!zoom) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!n) return null;
  return (
    <div className="gal">
      <div className="gal-stage" style={h ? { height: h } : undefined}>
        <div className="gal-track" ref={track} style={{ transform: `translateX(-${i * 100}%)` }}>
          {photos.map((src, k) => (
            <button type="button" key={src} className="gal-slide" onClick={() => setZoom(true)} aria-label={`Open photo ${k + 1}`}>
              <img src={src} alt={`${title} photo ${k + 1}`} loading={k < 2 ? 'eager' : 'lazy'} />
            </button>
          ))}
        </div>
        {n > 1 && (
          <>
            <button type="button" className="gal-nav prev" aria-label="Previous" onClick={() => go(-1)} />
            <button type="button" className="gal-nav next" aria-label="Next" onClick={() => go(1)} />
          </>
        )}
      </div>
      {n > 1 && (
        <div className="gal-dots">
          {photos.map((src, k) => <button type="button" key={src} className={k === i ? 'on' : ''} aria-label={`Photo ${k + 1}`} onClick={() => setI(k)}><span /></button>)}
        </div>
      )}
      {zoom && (
        <div className="gal-zoom" role="dialog" aria-label="Photo viewer" onClick={() => setZoom(false)}>
          <img src={photos[i]} alt={`${title} photo ${i + 1}`} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="w-popup-closer" aria-label="Close">×</button>
          {n > 1 && (
            <>
              <button type="button" className="gal-nav prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }} />
              <button type="button" className="gal-nav next" aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
