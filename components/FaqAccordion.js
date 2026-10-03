'use client';
import { useState } from 'react';

// The old FAQ toggles: questions with a thin blue line above each and a
// plus that turns into a minus; one answer open at a time.
export default function FaqAccordion({ items, adsUrl }) {
  const [open, setOpen] = useState(null);
  const [booking, setBooking] = useState(false);
  return (
    <div className="faq">
      {items.map((it, i) => (
        <div key={it.q} className={`faq-item ${open === i ? 'open' : ''}`}>
          {it.link === 'ads' ? (
            <a className="faq-head" href={adsUrl}><h3>{it.q}</h3><span className="ctl" aria-hidden="true" /></a>
          ) : (
            <button type="button" className="faq-head" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              <h3>{it.q}</h3><span className="ctl" aria-hidden="true" />
            </button>
          )}
          {open === i && (
            <div className="faq-body">
              <div dangerouslySetInnerHTML={{ __html: it.a }} />
              {it.booking && <p><button type="button" className="btn" onClick={() => setBooking(true)}>Book a Consultation</button></p>}
              {it.after && <div dangerouslySetInnerHTML={{ __html: it.after }} />}
            </div>
          )}
        </div>
      ))}
      {booking && (
        <div className="w-popup" role="dialog" aria-modal="true" aria-label="Book a Consultation">
          <div className="w-popup-overlay" onClick={() => setBooking(false)} />
          <div className="w-popup-wrap" onClick={(e) => { if (e.target === e.currentTarget) setBooking(false); }}>
            <button type="button" className="w-popup-closer" aria-label="Close" onClick={() => setBooking(false)}>×</button>
            <div className="w-popup-box">
              <iframe src="https://letsmeet.io/rvparksales/15-minute-seller-consultation" title="Book a consultation" style={{ border: 'none', minHeight: 700, width: '100%' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
