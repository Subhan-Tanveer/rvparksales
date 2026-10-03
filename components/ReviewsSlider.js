'use client';
import { useEffect, useState } from 'react';

// Review carousel: speech bubble (fixed height so the section doesn't jump as
// reviews change), author underneath, then one tidy row with back/next arrows,
// the dash dots, and an optional action (the "Leave A Review" button).
export default function ReviewsSlider({ items, action = null }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => setI((n) => (n + 1) % items.length), 6000);
    return () => clearInterval(id);
  }, [items.length, paused]);
  const go = (d) => setI((n) => (n + d + items.length) % items.length);
  const t = items[i];
  const [name, ...rest] = t.name.split(',');
  return (
    <div className="rv-carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="rv-item" aria-live="polite">
        <div className="quote-bubble">
          <p key={i} className="rv-fade">{t.quote}</p>
          <svg className="q" viewBox="0 0 48 40" aria-hidden="true"><path d="M7 3h12a3 3 0 013 3v13c0 9-5 16-14 18l-1-3c6-2 9-6 9-12H7a3 3 0 01-3-3V6a3 3 0 013-3zm24 0h12a3 3 0 013 3v13c0 9-5 16-14 18l-1-3c6-2 9-6 9-12H31a3 3 0 01-3-3V6a3 3 0 013-3z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /></svg>
        </div>
        <div className="quote-author">
          <div className="quote-name">{name.trim()}</div>
          {rest.length > 0 && <div className="quote-role">{rest.join(',').trim()}</div>}
        </div>
      </div>
      <div className="rv-foot">
        <div className="rv-controls">
          <button type="button" className="rv-nav prev" aria-label="Previous review" onClick={() => go(-1)} />
          <div className="dots">
            {items.map((_, n) => <button key={n} type="button" className={n === i ? 'on' : ''} aria-label={`Review ${n + 1}`} onClick={() => setI(n)}><span /></button>)}
          </div>
          <button type="button" className="rv-nav next" aria-label="Next review" onClick={() => go(1)} />
        </div>
        {action}
      </div>
    </div>
  );
}
