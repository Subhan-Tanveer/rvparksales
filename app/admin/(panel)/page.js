'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/admin/AdminShell';

// Admin home: counts, quick actions and the most recently changed listings.
export default function Dashboard() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    fetch('/api/admin/summary/').then(async (r) => {
      if (r.status === 401) { window.location.href = '/admin/login/'; return; }
      setS(await r.json());
    }).catch(() => setErr('Could not load the dashboard.'));
  }, []);

  const tiles = s ? [
    ['/admin/listings/', s.listings.forSale, 'Parks for sale', 'home'],
    ['/admin/listings/', s.listings.sold, 'Sold', 'home'],
    ['/admin/listings/', s.listings.hidden, 'Hidden / off-market', 'home'],
    ['/admin/posts/', s.posts, 'Blog posts', 'pen'],
    ['/admin/testimonials/', s.testimonials, 'Reviews', 'star'],
    ['/admin/faq/', s.faq, 'FAQ questions', 'help'],
    ['/admin/brokers/', s.brokers, 'Brokers', 'user'],
    ['/admin/developers/', s.developers, 'Developers', 'user'],
  ] : [];

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Welcome back, Marie</h1>
          <p>Everything you change here shows on RVParkSales.com within a few seconds of saving.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/admin/listings/new/" className="ab ab-accent"><Icon name="plus" />New listing</Link>
          <Link href="/admin/posts/new/" className="ab"><Icon name="plus" />New blog post</Link>
        </div>
      </div>
      {err && <div className="adm-err">{err}</div>}
      {s && !s.storage && <div className="adm-err" style={{ marginBottom: 16 }}>Storage is not connected yet, so changes cannot be saved.</div>}
      {!s && !err && <p className="adm-count">Loading…</p>}
      <div className="adm-grid">
        {tiles.map(([href, n, label, icon]) => (
          <Link key={label} href={href} className="adm-tile">
            <em><Icon name={icon} />{label}</em>
            <b>{n}</b>
          </Link>
        ))}
      </div>
      {s?.recent?.length > 0 && (
        <div className="adm-card" style={{ marginTop: 22 }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Recently updated listings</h2>
          <table className="adm-table" style={{ border: 0 }}>
            <tbody>
              {s.recent.map((l) => (
                <tr key={l.id} onClick={() => { window.location.href = `/admin/listings/${encodeURIComponent(l.id)}/`; }}>
                  <td style={{ width: 70 }}>{l.image ? <img className="adm-thumb" src={l.image} alt="" /> : <span className="adm-thumb" />}</td>
                  <td className="t-title">{l.title}</td>
                  <td className="hide-sm"><span className={`pill ${l.status === 'For Sale' ? 'pill-green' : l.status === 'Sold' ? 'pill-blue' : 'pill-gray'}`}>{l.status || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
