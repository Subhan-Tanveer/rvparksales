import Link from 'next/link';
import { brokers } from '@/lib/content';

export const metadata = {
  title: 'RV Park Brokers',
  description: 'Meet the RV park and campground brokers listed on RVParkSales.com.',
  alternates: { canonical: '/brokers/' },
};

export default function BrokersPage() {
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow">Our brokers</p>
        <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.6rem)' }}>RV Park Brokers</h1>
        <p className="lede" style={{ marginBottom: 24 }}>Experienced brokers who specialize in RV parks and campgrounds.</p>
        <div className="grid grid-4">
          {brokers().map((b) => (
            <Link key={b.slug} href={`/broker/${b.slug}/`} className="card broker-card">
              {b.photo ? <img src={b.photo} alt={b.name} loading="lazy" /> : null}
              <strong>{b.name}</strong>
              <span className="lcard-meta">{b.licenseState ? `Licensed in ${b.licenseState}` : 'RV park broker'}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
