'use client';
import { useState } from 'react';

// Vendors and Services sign-up. The company fills in its details and uploads a
// logo and up to 6 photos (straight to storage), then goes to Stripe to pay.
// Their listing goes live by itself once the payment completes.
const MAX_PHOTOS = 6;
const MAX_MB = 8;

async function uploadFile(file) {
  const { upload } = await import('@vercel/blob/client');
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '') || 'photo.jpg';
  const blob = await upload(`uploads/vendors/${safe}`, file, { access: 'private', handleUploadUrl: '/api/vendors/upload/' });
  return `/media/${blob.pathname}`;
}

export default function VendorApply({ categories, price }) {
  const [logo, setLogo] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const tooBig = (f) => f.size > MAX_MB * 1024 * 1024;

  async function pickLogo(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (tooBig(f)) return setError(`The logo is larger than ${MAX_MB} MB. Please choose a smaller file.`);
    setError(''); setBusy('Uploading logo…');
    try { setLogo(await uploadFile(f)); } catch { setError('The logo could not be uploaded. Please try another file.'); }
    setBusy('');
  }

  async function pickPhotos(e) {
    const files = [...(e.target.files || [])].slice(0, MAX_PHOTOS - photos.length);
    e.target.value = '';
    if (!files.length) return;
    if (files.some(tooBig)) return setError(`Each photo must be under ${MAX_MB} MB.`);
    setError('');
    const added = [];
    for (let i = 0; i < files.length; i++) {
      setBusy(`Uploading photo ${i + 1} of ${files.length}…`);
      try { added.push(await uploadFile(files[i])); } catch { setError('A photo could not be uploaded. Please try another file.'); }
    }
    setPhotos((p) => [...p, ...added].slice(0, MAX_PHOTOS));
    setBusy('');
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    const get = (k) => String(f.get(k) || '').trim();
    setError(''); setBusy('Saving your listing…');
    try {
      const res = await fetch('/api/vendors/apply/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: get('name'), category: get('category'), tagline: get('tagline'), serviceArea: get('serviceArea'),
          website: get('companysite'), contactName: get('contactName'), email: get('email'), phone: get('phone'),
          logo, images: photos, hp: get('hp'),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || 'Something went wrong. Please call (850) 832-0022.');
      setBusy('Taking you to secure payment…');
      window.location.href = data.url;
    } catch (err) {
      setError(err.message); setBusy('');
    }
  }

  return (
    <form className="gf vapply" onSubmit={submit}>
      <div className="gf-row">
        <label className="gf-field"><b>Company name <span className="gf-req">*</span></b><input name="name" required maxLength={120} /></label>
        <label className="gf-field"><b>Category <span className="gf-req">*</span></b>
          <select name="category" required defaultValue="">
            <option value="">Select a category</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <label className="gf-field"><b>What does your company do or provide? <span className="gf-req">*</span></b>
        <textarea name="tagline" rows={3} required maxLength={300} placeholder="A short description shown on your listing, e.g. Feasibility and market studies for RV parks nationwide." />
      </label>
      <div className="gf-row">
        <label className="gf-field"><b>Where you work</b><input name="serviceArea" maxLength={160} placeholder="Nationwide, or e.g. Florida and Georgia" /></label>
        <label className="gf-field"><b>Company website</b><input name="companysite" maxLength={300} placeholder="www.yourcompany.com" /></label>
      </div>
      <div className="gf-row">
        <label className="gf-field"><b>Contact person</b><input name="contactName" maxLength={120} autoComplete="name" /></label>
        <label className="gf-field"><b>Phone</b><input name="phone" type="tel" maxLength={40} autoComplete="tel" /></label>
      </div>
      <label className="gf-field"><b>Email for inquiries <span className="gf-req">*</span></b><input name="email" type="email" required maxLength={200} autoComplete="email" /></label>

      <div className="vapply-uploads">
        <div>
          <b>Logo</b>
          <div className="vapply-grid">
            {logo
              ? <div className="vapply-thumb logo"><img src={logo} alt="Your logo" /><button type="button" aria-label="Remove logo" onClick={() => setLogo(null)}>×</button></div>
              : <label className="vapply-add">+<span>Add logo</span><input type="file" accept="image/*" onChange={pickLogo} hidden /></label>}
          </div>
        </div>
        <div>
          <b>Photos <small>(up to {MAX_PHOTOS}; the first one is your card cover)</small></b>
          <div className="vapply-grid">
            {photos.map((p, i) => (
              <div key={p} className="vapply-thumb"><img src={p} alt={`Photo ${i + 1}`} /><button type="button" aria-label="Remove photo" onClick={() => setPhotos((x) => x.filter((y) => y !== p))}>×</button></div>
            ))}
            {photos.length < MAX_PHOTOS && <label className="vapply-add">+<span>Add photos</span><input type="file" accept="image/*" multiple onChange={pickPhotos} hidden /></label>}
          </div>
        </div>
      </div>

      <input name="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      <button className="btn btn-lg" type="submit" disabled={!!busy}>{busy || `Continue to payment, $${price}/month`}</button>
      <p className="vapply-note">You will pay securely with Stripe. Your listing goes live as soon as the payment goes through. Cancel any time.</p>
      {error && <p role="status" className="gf-error">{error}</p>}
    </form>
  );
}
