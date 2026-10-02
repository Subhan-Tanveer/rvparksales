import Link from 'next/link';
import { testimonials } from '@/lib/content';

export const metadata = {
  title: 'Reviews',
  description: 'What RV park buyers, sellers and brokers say about working with RVParkSales.com and Marie Hansen.',
  alternates: { canonical: '/reviews/' },
};

export default function ReviewsPage() {
  const list = testimonials();
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow">Reviews</p>
        <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.6rem)' }}>What our clients say</h1>
        <p className="lede" style={{ marginBottom: 24 }}>Buyers, sellers and brokers who have worked with RVParkSales.com.</p>
        <div className="grid grid-3">
          {list.map((t) => (
            <figure key={t.name + t.date} className="card quote" style={{ margin: 0 }}>
              <p>“{t.quote}”</p>
              <cite>— {t.name}</cite>
            </figure>
          ))}
        </div>
        <div className="banner banner-purple" style={{ marginTop: 34 }}>
          <div><h2>Let's talk about your RV park</h2><p>Buying or selling, we're happy to help.</p></div>
          <Link href="/contact/" className="btn btn-purple">Contact Us</Link>
        </div>
      </div>
    </section>
  );
}
