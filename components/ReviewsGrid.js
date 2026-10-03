'use client';
import { useState } from 'react';

const Quote = () => (
  <svg className="q" viewBox="0 0 48 40" aria-hidden="true"><path d="M7 3h12a3 3 0 013 3v13c0 9-5 16-14 18l-1-3c6-2 9-6 9-12H7a3 3 0 01-3-3V6a3 3 0 013-3zm24 0h12a3 3 0 013 3v13c0 9-5 16-14 18l-1-3c6-2 9-6 9-12H31a3 3 0 01-3-3V6a3 3 0 013-3z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /></svg>
);

// Reviews page: two columns of speech-bubble reviews, ten at a time with
// "Load More", as the old site did.
export default function ReviewsGrid({ items }) {
  const [n, setN] = useState(10);
  return (
    <>
      <div className="reviews-grid">
        {items.slice(0, n).map((t) => {
          const [name, ...rest] = t.name.split(',');
          return (
            <div key={t.name + t.date} className="rv-item">
              <div className="quote-bubble"><p>{t.quote}</p><Quote /></div>
              <div className="quote-author">
                <div className="quote-name">{name.trim()}</div>
                {rest.length > 0 && <div className="quote-role">{rest.join(',').trim()}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {n < items.length && (
        <div className="center" style={{ marginTop: 36 }}>
          <button type="button" className="btn" onClick={() => setN(n + 10)}>Load More</button>
        </div>
      )}
    </>
  );
}
