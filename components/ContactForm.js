'use client';
import { useState } from 'react';

export default function ContactForm({ listing = '' }) {
  const [state, setState] = useState({ status: 'idle', message: '' });

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
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
      e.currentTarget.reset();
    } catch (err) {
      setState({ status: 'error', message: err.message });
    }
  }

  const field = { padding: 13, borderRadius: 10, border: '1px solid var(--line)', font: '500 1rem var(--font-body)', width: '100%' };
  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
      <label>I am a…
        <select name="role" style={field} defaultValue="Buyer">
          <option>Buyer</option><option>Seller</option><option>Broker</option><option>RV park owner</option><option>Other</option>
        </select>
      </label>
      <label>Name *<input name="name" required style={field} /></label>
      <label>Email *<input name="email" type="email" required style={field} /></label>
      <label>Phone<input name="phone" type="tel" style={field} /></label>
      <label>Park or listing (optional)<input name="listing" defaultValue={listing} style={field} /></label>
      <label>How can we help? *<textarea name="message" rows={5} required style={field} /></label>
      {/* Honeypot: real visitors never see or fill this; bots do. */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
      <button className="btn btn-primary" type="submit" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Sending…' : 'Send Message'}</button>
      {state.message && <p role="status" style={{ color: state.status === 'done' ? 'var(--green-dark)' : '#b3261e', fontWeight: 600, margin: 0 }}>{state.message}</p>}
    </form>
  );
}
