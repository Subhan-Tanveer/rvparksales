'use client';
import { useEffect, useState } from 'react';

export default function ReviewsSlider({ items }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % items.length), 8000);
    return () => clearInterval(id);
  }, [items.length]);
  const t = items[i];
  return (
    <div>
      <div className="quote-bubble" aria-live="polite">{t.quote}</div>
      <div className="quote-name">{t.name.split(',')[0]}</div>
      <div className="quote-role">{t.name.includes(',') ? t.name.split(',').slice(1).join(',').trim() : 'RV Park Client'}</div>
      <div className="dots">
        {items.map((_, n) => <button key={n} className={n === i ? 'on' : ''} aria-label={`Review ${n + 1}`} onClick={() => setI(n)} />)}
      </div>
    </div>
  );
}
