'use client';
import { useEffect, useState } from 'react';

// Background photo slider used behind the home and "sell my rv park" heroes:
// six photos cross-fading (2s) every 7 seconds, as on the old site.
export const SLIDES = ['rv-parks-3.jpg', 'Parks-for-sale.webp', '1956989740-scaled.jpg', 'RV-PARKS.webp', 'rv-parks-2.jpg', 'mobile-home-parks-1.jpg'];

export default function HeroSlides() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 7000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <div className="hero-slides" aria-hidden="true">
        {SLIDES.map((f, i) => <div key={f} className={`slide ${i === slide ? 'on' : ''}`} style={{ backgroundImage: `url(/images/site/${f})` }} />)}
      </div>
      <div className="hero-overlay" />
    </>
  );
}
