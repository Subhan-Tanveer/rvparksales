import Link from 'next/link';
import { posts, textOf } from '@/lib/content';

export const metadata = {
  title: 'Blog: Buying and Selling RV Parks',
  description: 'Articles on buying an RV park, selling an RV park or campground, financing, valuation and getting the best price.',
  alternates: { canonical: '/blog-buying-and-selling-rv-parks/' },
};

export default function BlogIndex() {
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow">Blog</p>
        <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.6rem)' }}>Buying &amp; Selling RV Parks</h1>
        <p className="lede" style={{ marginBottom: 24 }}>Practical advice for RV park buyers, sellers and owners.</p>
        <div className="grid grid-3">
          {posts().map((p) => (
            <Link key={p.slug} href={`/${p.slug}/`} className="card lcard">
              {p.featuredImage ? <div className="lcard-img"><img src={p.featuredImage} alt="" loading="lazy" /></div> : null}
              <div className="lcard-body">
                <div className="lcard-meta">{new Date(p.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <h3 style={{ margin: '6px 0' }}>{p.title}</h3>
                <p className="lcard-meta">{textOf(p.contentHtml, 130)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
