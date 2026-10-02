import Link from 'next/link';
import { usd } from '@/lib/format';

export default function ListingCard({ l }) {
  const sold = l.status === 'Sold';
  const meta = [l.state, l.sites ? `${l.sites} sites` : null, l.acres ? `${l.acres} acres` : null].filter(Boolean).join(' · ');
  return (
    <Link href={`/listing/${l.slug}/`} className="card lcard">
      <div className="lcard-img">
        {l.featuredImage ? <img src={l.featuredImage} alt={l.title} loading="lazy" /> : null}
        <span className={`badge ${sold ? 'sold' : 'sale'}`}>{sold ? 'Sold' : 'For Sale'}</span>
      </div>
      <div className="lcard-body">
        <div className="lcard-price">{sold ? 'Sold' : usd(l.priceUsd)}</div>
        <h3>{l.title}</h3>
        <div className="lcard-meta">{meta}</div>
      </div>
    </Link>
  );
}
