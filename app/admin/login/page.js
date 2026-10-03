'use client';
import { useState } from 'react';

// Sign-in screen for /admin.
export default function LoginPage() {
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/login/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }) });
    if (res.ok) { window.location.href = '/admin/'; return; }
    const j = await res.json().catch(() => ({}));
    setErr(j.error || 'Could not sign in.');
    setBusy(false);
  }

  return (
    <div className="adm-login">
      <form onSubmit={submit}>
        <img src="/images/logo.png" alt="RVParkSales.com" />
        <h1>Website admin</h1>
        <p>Sign in to manage listings, blog posts, reviews and pages.</p>
        {err && <div className="adm-err" role="alert">{err}</div>}
        <div className="af"><label htmlFor="em">Email</label><input id="em" name="email" type="email" autoComplete="username" required /></div>
        <div className="af"><label htmlFor="pw">Password</label><input id="pw" name="password" type="password" autoComplete="current-password" required style={{ width: '100%', border: '1px solid #d9d5cc', borderRadius: 10, padding: '10px 12px', minHeight: 44 }} /></div>
        <button type="submit" className="ab ab-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
