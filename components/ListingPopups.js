'use client';
import { useEffect, useState } from 'react';

// "Get More Information About <listing>" form from the old listing page.
// Opens from any .trigger-contact-popup element and goes to /api/contact,
// which emails Marie with the listing attached. (The old "Request Offering
// Memo" form was retired in Oct 2026 at Marie's request.)
export default function ListingPopups({ title, url }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest('.trigger-contact-popup')) return;
      e.preventDefault();
      setState({ status: 'idle', message: '' });
      setOpen(true);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, []);
  useEffect(() => { document.documentElement.style.overflow = open ? 'hidden' : ''; }, [open]);

  if (!open) return null;

  async function onSubmit(e) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState({ status: 'sending', message: '' });
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: 'Listing Information', listing: title, role: fd.describe,
          name: fd.name, email: fd.email, phone: fd.phone, message: fd.message, website: fd.website,
          details: { 'Listing URL': url },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please call 850-832-0022.');
      setState({ status: 'done', message: 'Thanks for contacting us! We will get in touch with you shortly.' });
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  const Req = () => <span className="gf-req">(Required)</span>;
  return (
    <div className="w-popup" role="dialog" aria-modal="true">
      <div className="w-popup-overlay" onClick={() => setOpen(false)} />
      <div className="w-popup-wrap" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
        <button type="button" className="w-popup-closer" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        <div className="w-popup-box">
          <h2>{`Get More Information About ${title}`}</h2>
          {state.status === 'done' ? <p className="gf-confirm">{state.message}</p> : (
            <form className="gf" onSubmit={onSubmit}>
              <label className="gf-field"><b>Your Name <Req /></b><input name="name" required autoComplete="name" /></label>
              <div className="gf-row">
                <label className="gf-field"><b>Email <Req /></b><input name="email" type="email" required autoComplete="email" /></label>
                <label className="gf-field"><b>Phone</b><input name="phone" type="tel" autoComplete="tel" /></label>
              </div>
              <label className="gf-field"><b>Select the Option Which Best Describes You <Req /></b>
                <select name="describe" required defaultValue="">
                  <option value="" disabled>Select</option>
                  <option>I am the end user buyer</option>
                  <option>I am representing an investor, and gathering vital information</option>
                  <option>I have verifiable personal proof of funds for a purchase</option>
                </select>
              </label>
              <label className="gf-field"><b>Message <Req /></b><textarea name="message" rows={5} required /></label>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
              <button className="btn" type="submit" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Sending…' : 'Submit'}</button>
              {state.message && <p role="status" className="gf-error">{state.message}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
