'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Select from '@/components/fx/Select';

// RV Park Services directory: Search and Category filters on the left, cards
// (logo, name, category badge, one-line description) on the right. Same layout
// as the Brokers and Developers pages.
const initials = (name = '') => name.replace(/\.(com|net|org|co)$/i, '').split(/[\s.&-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '•';

export default function VendorArchive({ vendors }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const cats = useMemo(() => [...new Set(vendors.map((v) => v.category).filter(Boolean))].sort(), [vendors]);
  const shown = vendors.filter((v) => (!cat || v.category === cat) && (!q || `${v.name} ${v.category || ''} ${v.tagline || ''} ${v.serviceArea || ''}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="people">
      <aside className="people-filters">
        <div className="facet">
          <h3 className="facet-label">Search<span className="reset"><a role="button" tabIndex={0} onClick={() => setQ('')}>Reset</a></span></h3>
          <span className="loc-wrap">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." aria-label="Search" />
            <svg className="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>
          </span>
        </div>
        <div className="facet">
          <h3 className="facet-label">Category<span className="reset"><a role="button" tabIndex={0} onClick={() => setCat('')}>Reset</a></span></h3>
          <Select value={cat} label="Category" onChange={setCat} options={[['', 'All categories'], ...cats.map((c) => [c, c])]} />
        </div>
      </aside>
      <div>
        <p className="results-count">Showing {shown.length ? 1 : 0} - {shown.length} of {shown.length} results</p>
        {shown.length === 0 ? (
          <p>No listings match yet. <a href="#get-listed">Be the first to get listed.</a></p>
        ) : (
          <div className="people-grid">
            {shown.map((v) => (
              <Link key={v.slug} href={`/services/${v.slug}/`} className="vcard" aria-label={v.name}>
                <div className="vcard-cover">
                  {v.images?.[0] && <img src={v.images[0]} alt="" loading="lazy" />}
                  <div className="vcard-logo">{v.logo ? <img src={v.logo} alt={`${v.name} logo`} loading="lazy" /> : <span>{initials(v.name)}</span>}</div>
                  {v.plan === 'featured' && <span className="vcard-flag">Featured</span>}
                </div>
                <div className="vcard-body">
                  {v.category && <span className="vcard-cat">{v.category}</span>}
                  <h3>{v.name}</h3>
                  {v.tagline && <p>{v.tagline}</p>}
                  {v.serviceArea && <p className="vcard-area">{v.serviceArea}</p>}
                  <span className="vcard-more">View profile <span aria-hidden="true">→</span></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
