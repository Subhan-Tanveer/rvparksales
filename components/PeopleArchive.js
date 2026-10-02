'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';

// Brokers and developers share this layout (as on the current site): Search and
// State filters on the left, a "Showing 1 - N of N results" line and a grid of cards.
export default function PeopleArchive({ people, basePath }) {
  const [q, setQ] = useState('');
  const [state, setState] = useState('');
  const states = useMemo(() => [...new Set(people.map((p) => p.licenseState).filter(Boolean))].sort(), [people]);
  const shown = useMemo(() => people.filter((p) =>
    (!state || p.licenseState === state) && (!q || p.name.toLowerCase().includes(q.toLowerCase()))
  ), [people, q, state]);

  return (
    <div className="arch2">
      <aside>
        <div className="facet-label">Search <a onClick={() => setQ('')}>Reset</a></div>
        <input className="facet-in" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." aria-label="Search" />
        <div className="facet-label">State <a onClick={() => setState('')}>Reset</a></div>
        <select className="facet-in" value={state} onChange={(e) => setState(e.target.value)} aria-label="State">
          <option value="">Any state</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </aside>
      <div>
        <p style={{ fontSize: '.85rem', marginBottom: 14 }}>Showing {shown.length ? 1 : 0} - {shown.length} of {people.length} results</p>
        <div className="cards-3">
          {shown.map((p) => (
            <Link key={p.slug} href={`/${basePath}/${p.slug}/`} className="pcard">
              {p.photo ? <img src={p.photo} alt={p.name} loading="lazy" /> : null}
              <div className="cap">
                <h3>{p.name}</h3>
                {p.licenseState && <span className="badge">{p.licenseState}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
