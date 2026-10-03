'use client';
import { useEffect, useState } from 'react';

// The "Request a Buyer / Seller Consultation" popups from the old site.
// Any element with class "buyer-consultation" or "seller-consultation"
// opens the matching form (menu items, hero button, footer link), as before.
export default function ConsultationPopup() {
  const [kind, setKind] = useState(null);
  const [state, setState] = useState({ status: 'idle', message: '' });

  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest('.buyer-consultation, .seller-consultation');
      if (!el) return;
      e.preventDefault();
      setState({ status: 'idle', message: '' });
      setKind(el.classList.contains('seller-consultation') ? 'seller' : 'buyer');
    };
    const onKey = (e) => { if (e.key === 'Escape') setKind(null); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = kind ? 'hidden' : '';
  }, [kind]);

  if (!kind) return null;
  const seller = kind === 'seller';

  async function onSubmit(e) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
    const details = seller
      ? {
          'Park Name': fd.park,
          'Park Address': [fd.street, fd.street2, fd.city, fd.region, fd.zip, fd.country].filter(Boolean).join(', '),
        }
      : { 'Your Role': fd.investor ? 'Buyer/Investor' : '' };
    setState({ status: 'sending', message: '' });
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form: seller ? 'Seller Consultation' : 'Buyer Consultation',
          role: seller ? 'Seller' : 'Buyer',
          name: `${fd.first || ''} ${fd.last || ''}`.trim(),
          email: fd.email, phone: fd.phone, message: fd.message, website: fd.website, details,
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
    <div className="w-popup" role="dialog" aria-modal="true" aria-label={seller ? 'Request a Seller Consultation' : 'Request a Buyer Consultation'}>
      <div className="w-popup-overlay" onClick={() => setKind(null)} />
      <div className="w-popup-wrap" onClick={(e) => { if (e.target === e.currentTarget) setKind(null); }}>
        <button type="button" className="w-popup-closer" aria-label="Close" onClick={() => setKind(null)}>×</button>
        <div className="w-popup-box">
          <h2>{seller ? 'Request a Seller Consultation' : 'Request a Buyer Consultation'}</h2>
          {state.status === 'done' ? (
            <p className="gf-confirm">{state.message}</p>
          ) : (
            <form className="gf" onSubmit={onSubmit}>
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
              {seller ? (
                <>
                  <label className="gf-field"><b>Park Name <Req /></b><input name="park" required /></label>
                  <fieldset>
                    <legend>Park Address <Req /></legend>
                    <label><input name="street" required autoComplete="address-line1" /><span>Street Address</span></label>
                    <label><input name="street2" autoComplete="address-line2" /><span>Address Line 2</span></label>
                    <div className="gf-row">
                      <label><input name="city" required autoComplete="address-level2" /><span>City</span></label>
                      <label><input name="region" required autoComplete="address-level1" /><span>State / Province / Region</span></label>
                    </div>
                    <div className="gf-row">
                      <label><input name="zip" required autoComplete="postal-code" /><span>ZIP / Postal Code</span></label>
                      <label><select name="country" defaultValue="United States" autoComplete="country-name"><option>United States</option><option>Canada</option><option>Mexico</option></select><span>Country</span></label>
                    </div>
                  </fieldset>
                </>
              ) : (
                <fieldset>
                  <legend>Your Role <Req /></legend>
                  <label className="gf-check"><input type="checkbox" name="investor" value="1" required /> Buyer/Investor</label>
                </fieldset>
              )}
              <label className="gf-field"><b>Additional Info/Comments</b><textarea name="message" rows={4} /></label>
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
