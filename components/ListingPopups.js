'use client';
import { useEffect, useState } from 'react';

// The two listing-page forms from the old site:
//  - "Get More Information About <listing>" (any .trigger-contact-popup element)
//  - "Request Offering Memo" with the confidentiality agreement and signature
// Both go to /api/contact, which emails Marie with the listing attached.
export default function ListingPopups({ title, url, ndaHtml }) {
  const [open, setOpen] = useState(null); // 'info' | 'memo' | null
  const [state, setState] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest('.trigger-contact-popup, .trigger-memo-popup');
      if (!el) return;
      e.preventDefault();
      setState({ status: 'idle', message: '' });
      setOpen(el.classList.contains('trigger-memo-popup') ? 'memo' : 'info');
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, []);
  useEffect(() => { document.documentElement.style.overflow = open ? 'hidden' : ''; }, [open]);

  if (!open) return null;
  const memo = open === 'memo';
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  async function onSubmit(e) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
    const body = memo
      ? {
          form: 'Offering Memo', role: 'Buyer', listing: title,
          name: `${fd.first || ''} ${fd.last || ''}`.trim(), email: fd.email, phone: fd.phone, website: fd.website,
          details: { 'Listing URL': url, 'Agreed to Confidentiality and Non-Disclosure Agreement': fd.nda ? 'Yes' : 'No', Date: fd.date, Signature: fd.signature },
        }
      : {
          form: 'Listing Information', listing: title, role: fd.describe,
          name: fd.name, email: fd.email, phone: fd.phone, message: fd.message, website: fd.website,
          details: { 'Listing URL': url },
        };
    setState({ status: 'sending', message: '' });
    try {
      const res = await fetch('/api/contact/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
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
      <div className="w-popup-overlay" onClick={() => setOpen(null)} />
      <div className="w-popup-wrap" onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}>
        <button type="button" className="w-popup-closer" aria-label="Close" onClick={() => setOpen(null)}>×</button>
        <div className="w-popup-box">
          <h2>{memo ? 'Request Offering Memo' : `Get More Information About ${title}`}</h2>
          {state.status === 'done' ? <p className="gf-confirm">{state.message}</p> : (
            <form className="gf" onSubmit={onSubmit}>
              {memo ? (
                <>
                  <label className="gf-field"><b>Listing <Req /></b><input value={title} readOnly /></label>
                  <fieldset>
                    <legend>Name <Req /></legend>
                    <div className="gf-row">
                      <label><input name="first" required autoComplete="given-name" /><span>First</span></label>
                      <label><input name="last" required autoComplete="family-name" /><span>Last</span></label>
                    </div>
                  </fieldset>
                  <div className="gf-row">
                    <label className="gf-field"><b>Email <Req /></b><input name="email" type="email" required autoComplete="email" /></label>
                    <label className="gf-field"><b>Phone <Req /></b><input name="phone" type="tel" required autoComplete="tel" /></label>
                  </div>
                  <fieldset>
                    <legend>Confidentiality and Non-Disclosure Agreement <Req /></legend>
                    <div className="gf-terms" dangerouslySetInnerHTML={{ __html: ndaHtml }} />
                    <label className="gf-check"><input type="checkbox" name="nda" value="1" required /> I agree to the Confidentiality and Non-Disclosure Agreement</label>
                  </fieldset>
                  <label className="gf-field"><b>Date <Req /></b><input name="date" defaultValue={today} placeholder="mm/dd/yyyy" required /></label>
                  <label className="gf-field"><b>Signature <Req /></b><input name="signature" required placeholder="Type your full name" className="gf-sign" /></label>
                </>
              ) : (
                <>
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
                </>
              )}
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
