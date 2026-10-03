'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Select from '@/components/fx/Select';

// Brokers and developers share this layout (as on the old site): Search and
// State filters on the left, a "Showing 1 - N of N results" line and a grid of
// cards (photo, name, purple state badge) on the right.
export default function PeopleArchive({ people, basePath }) {
  const [q, setQ] = useState('');
  const [state, setState] = useState('');
  const sorted = useMemo(() => [...people].sort((a, b) => (a.licenseState || '').localeCompare(b.licenseState || '') || a.wpId - b.wpId), [people]);
  const states = useMemo(() => [...new Set(people.map((p) => p.licenseState).filter(Boolean))].sort(), [people]);
  const shown = sorted.filter((p) => (!state || p.licenseState === state) && (!q || `${p.name} ${p.licenseState || ''}`.toLowerCase().includes(q.toLowerCase())));

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
          <h3 className="facet-label">State<span className="reset"><a role="button" tabIndex={0} onClick={() => setState('')}>Reset</a></span></h3>
          <Select value={state} label="State" onChange={setState} options={[['', 'Any state'], ...states.map((s) => [s, s])]} />
        </div>
      </aside>
      <div>
        <p className="results-count">Showing {shown.length ? 1 : 0} - {shown.length} of {shown.length} results</p>
        <div className="people-grid">
          {shown.map((p) => (
            <Link key={p.slug} href={`/${basePath}/${p.slug}/`} className="pcard" aria-label={p.name}>
              <div className="pcard-in">
                <div className="pcard-img">{p.photo ? <img src={p.photo} alt={p.name} loading="lazy" /> : null}</div>
                <h3>{p.name}</h3>
                {p.licenseState && <span className="state">{p.licenseState}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
