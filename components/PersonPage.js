import Link from 'next/link';
import { allListings } from '@/lib/content';

// A broker or developer profile (same fields for both).
export default function PersonPage({ person, kind }) {
  const theirs = kind === 'broker'
    ? allListings().filter((l) => l.brokerName && l.brokerName.toLowerCase() === person.name.toLowerCase() && l.status === 'For Sale')
    : [];
  return (
    <section className="l-section">
      <div className="l-section-h page-title-wrap">
        <div className="crumb"><Link href={kind === 'broker' ? '/brokers/' : '/developers/'}>← {kind === 'broker' ? 'All brokers' : 'All developers'}</Link></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) 1fr', gap: 40, alignItems: 'start' }} className="person-grid">
          {person.photo ? <img src={person.photo} alt={person.name} style={{ width: '100%' }} /> : <div style={{ background: 'var(--bg-alt)', height: 300 }} />}
          <div>
            <h1 className="page-title" style={{ fontSize: 'clamp(2rem,5vw,3rem)' }}>{person.name}</h1>
            {person.licenseState && <span className="badge" style={{ marginBottom: 16 }}>{person.licenseState}</span>}
            <div className="prose" style={{ marginTop: 14 }}>
              {person.licenseNumber && <p>License #{person.licenseNumber}{person.licenseState ? `, ${person.licenseState}` : ''}</p>}
              {person.phone && <p>Phone: <a href={`tel:${person.phone.replace(/[^\d+]/g, '')}`}>{person.phone}</a></p>}
              {person.email && <p>Email: <a href={`mailto:${person.email}`}>{person.email}</a></p>}
              {person.bioHtml && <div style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: person.bioHtml }} />}
            </div>
            <Link href={`/contact/?broker=${encodeURIComponent(person.name)}`} className="btn" style={{ marginTop: 10 }}>Get More Information</Link>
          </div>
        </div>
        {theirs.length > 0 && (
          <>
            <h2 style={{ marginTop: 60 }}>Listings</h2>
            <div className="cards-3">
              {theirs.map((l) => (
                <Link key={l.slug} href={`/listing/${l.slug}/`} className="pcard">
                  {l.featuredImage ? <img src={l.featuredImage} alt="" loading="lazy" /> : null}
                  <div className="cap"><h3>{l.title}</h3><span className="badge">For Sale</span></div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
