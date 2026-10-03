'use client';
import { useEffect, useState } from 'react';

const US_STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Puerto Rico', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
const Req = () => <span className="gf-req">(Required)</span>;

// Renders a form in the old Gravity Forms look from a small field list and
// sends it to /api/contact (which emails Marie). Field types: name, text,
// email, email2 (with confirm), phone, select, radio, textarea, address.
export function GfForm({ form, fields, extra = {}, onDone }) {
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k) => (fd.get(k) || '').toString().trim();
    if (fields.some((f) => f.type === 'email2') && get('email') !== get('email_confirm')) {
      setState({ status: 'error', message: 'Your emails do not match.' });
      return;
    }
    const details = { ...extra };
    let name = get('name');
    fields.forEach((f) => {
      if (f.type === 'name') name = `${get('first')} ${get('last')}`.trim();
      else if (f.type === 'address') details[f.label] = ['street', 'city', 'region', 'zip'].map((k) => get(`${f.key}_${k}`)).filter(Boolean).join(', ');
      else if (!['email', 'email2', 'phone', 'textarea', 'text-name'].includes(f.type) && f.key !== 'name') details[f.label] = get(f.key);
    });
    const message = fields.filter((f) => f.type === 'textarea').map((f) => get(f.key)).join('\n\n');
    setState({ status: 'sending', message: '' });
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form, name, email: get('email'), phone: get('phone'), message, website: get('website'), details }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please call 850-832-0022.');
      setState({ status: 'done', message: 'Thanks for contacting us! We will get in touch with you shortly.' });
      onDone?.();
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  if (state.status === 'done') return <p className="gf-confirm">{state.message}</p>;

  const field = (f) => {
    const req = f.required ? <Req /> : null;
    switch (f.type) {
      case 'name':
        return (
          <fieldset key={f.key}>
            <legend>{f.label} {req}</legend>
            <div className="gf-row">
              <label><input name="first" required={f.required} autoComplete="given-name" /><span>First</span></label>
              <label><input name="last" required={f.required} autoComplete="family-name" /><span>Last</span></label>
            </div>
          </fieldset>
        );
      case 'email2':
        return (
          <fieldset key={f.key} className={f.half ? 'gf-half' : ''}>
            <legend>{f.label} {req}</legend>
            <div className="gf-row">
              <label><input name="email" type="email" required autoComplete="email" /><span>Enter Email</span></label>
              <label><input name="email_confirm" type="email" required autoComplete="email" /><span>Confirm Email</span></label>
            </div>
          </fieldset>
        );
      case 'address':
        return (
          <fieldset key={f.key}>
            <legend>{f.label} {req}</legend>
            <label><input name={`${f.key}_street`} required={f.required} autoComplete="address-line1" /><span>Street Address</span></label>
            <div className="gf-row">
              <label><input name={`${f.key}_city`} required={f.required} autoComplete="address-level2" /><span>City</span></label>
              <label>
                <select name={`${f.key}_region`} required={f.required} defaultValue="" autoComplete="address-level1">
                  <option value="" />
                  {US_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                <span>State</span>
              </label>
            </div>
            <label className="gf-third"><input name={`${f.key}_zip`} required={f.required} autoComplete="postal-code" /><span>ZIP Code</span></label>
          </fieldset>
        );
      case 'radio':
        return (
          <fieldset key={f.key}>
            <legend>{f.label} {req}</legend>
            {f.options.map((o) => <label key={o} className="gf-check"><input type="radio" name={f.key} value={o} required={f.required} /> {o}</label>)}
          </fieldset>
        );
      case 'select':
        return (
          <label key={f.key} className="gf-field"><b>{f.label} {req}</b>
            <select name={f.key} required={f.required} defaultValue={f.placeholder === false ? f.options[0] : ''}>
              {f.placeholder !== false && <option value="">{f.placeholder || 'Select option'}</option>}
              {f.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        );
      case 'textarea':
        return <label key={f.key} className="gf-field"><b>{f.label} {req}</b><textarea name={f.key} rows={6} required={f.required} /></label>;
      default:
        return (
          <label key={f.key} className={`gf-field ${f.half ? 'gf-half' : ''}`}><b>{f.label} {req}</b>
            <input name={f.type === 'email' ? 'email' : f.type === 'phone' ? 'phone' : f.key} type={f.type === 'phone' ? 'tel' : f.type === 'email' ? 'email' : 'text'} required={f.required} autoComplete={f.type === 'email' ? 'email' : f.type === 'phone' ? 'tel' : undefined} />
          </label>
        );
    }
  };

  // Lay out consecutive "half" fields side by side, like the old forms.
  const rows = [];
  fields.forEach((f) => {
    const last = rows[rows.length - 1];
    if (f.half && last && last.half && last.items.length < 2) last.items.push(f);
    else rows.push({ half: !!f.half, items: [f] });
  });

  return (
    <form className="gf" onSubmit={onSubmit}>
      {rows.map((r, i) => (r.half ? <div key={i} className="gf-row">{r.items.map(field)}</div> : field(r.items[0])))}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      <button className="btn" type="submit" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Sending…' : 'Submit'}</button>
      {state.message && <p role="status" className="gf-error">{state.message}</p>}
    </form>
  );
}

// The same form inside the old popup (title bar on top, dark backdrop).
// Opens when an element with `triggerClass` is clicked.
export function GfPopup({ triggerClass, title, width = 600, ...formProps }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onClick = (e) => { if (e.target.closest(`.${triggerClass}`)) { e.preventDefault(); setOpen(true); } };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
  }, [triggerClass]);
  useEffect(() => { document.documentElement.style.overflow = open ? 'hidden' : ''; }, [open]);
  if (!open) return null;
  return (
    <div className="w-popup" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-popup-overlay" onClick={() => setOpen(false)} />
      <div className="w-popup-wrap" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
        <button type="button" className="w-popup-closer" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        <div className="w-popup-box with-title" style={{ width }}>
          <div className="w-popup-title">{title}</div>
          <div className="w-popup-content"><GfForm {...formProps} /></div>
        </div>
      </div>
    </div>
  );
}
