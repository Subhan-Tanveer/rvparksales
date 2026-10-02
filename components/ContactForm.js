'use client';
import { useState } from 'react';

export default function ContactForm({ listing = '' }) {
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState({ status: 'sending', message: '' });
    try {
      const res = await fetch('/api/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please call or email us instead.');
      setState({ status: 'done', message: 'Thank you! We received your message and will be in touch shortly.' });
      form.reset();
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <label className="field">I am a…
        <select name="role" defaultValue="Buyer">
          <option>Buyer</option><option>Seller</option><option>Broker</option><option>RV park owner</option><option>Other</option>
        </select>
      </label>
      <label className="field">Name *<input name="name" required /></label>
      <label className="field">Email *<input name="email" type="email" required /></label>
      <label className="field">Phone<input name="phone" type="tel" /></label>
      <label className="field">Park or listing (optional)<input name="listing" defaultValue={listing} /></label>
      <label className="field">How can we help? *<textarea name="message" rows={5} required /></label>
      {/* Honeypot: real visitors never see or fill this; bots do. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      <button className="btn" type="submit" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Sending…' : 'Send Message'}</button>
      {state.message && <p role="status" style={{ color: state.status === 'done' ? '#0f7a43' : '#b3261e', fontWeight: 500, marginTop: 14 }}>{state.message}</p>}
    </form>
  );
}
