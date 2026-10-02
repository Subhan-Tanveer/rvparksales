import Link from 'next/link';
import { notFound } from 'next/navigation';
import ListingCard from '@/components/ListingCard';
import { brokers, brokerBySlug, allListings, textOf } from '@/lib/content';

export function generateStaticParams() {
  return brokers().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = brokerBySlug(slug);
  if (!b) return {};
  return {
    title: `${b.name}, RV Park Broker`,
    description: textOf(b.bioHtml, 155) || `${b.name} is an RV park broker on RVParkSales.com.`,
    alternates: { canonical: `/broker/${b.slug}/` },
  };
}

export default async function BrokerPage({ params }) {
  const { slug } = await params;
  const b = brokerBySlug(slug);
  if (!b) notFound();
  const theirs = allListings().filter((l) => l.brokerName && l.brokerName.toLowerCase() === b.name.toLowerCase());

  return (
    <section className="section" style={{ paddingTop: 28 }}>
      <div className="wrap">
        <div className="crumbs"><Link href="/brokers/">← All brokers</Link></div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          {b.photo ? <img src={b.photo} alt={b.name} style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }} /> : null}
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.4rem)', marginBottom: 4 }}>{b.name}</h1>
            <p className="lcard-meta" style={{ margin: 0 }}>RV park broker{b.licenseState ? ` · Licensed in ${b.licenseState}` : ''}{b.licenseNumber ? ` · License #${b.licenseNumber}` : ''}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              {b.phone && <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`} className="btn btn-primary btn-sm">Call {b.phone}</a>}
              {b.email && <a href={`mailto:${b.email}`} className="btn btn-ghost btn-sm">Email</a>}
            </div>
          </div>
        </div>
        {b.bioHtml && <div className="prose" dangerouslySetInnerHTML={{ __html: b.bioHtml }} />}
        {theirs.length > 0 && (
          <>
            <h2 style={{ marginTop: 34 }}>Listings</h2>
            <div className="grid grid-3">{theirs.map((l) => <ListingCard key={l.slug} l={l} />)}</div>
          </>
        )}
      </div>
    </section>
  );
}
