import Link from 'next/link';
import { posts } from '@/lib/content';

export const metadata = {
  title: 'Blog',
  description: 'Articles on buying an RV park, selling an RV park or campground, financing, valuation and getting the best price.',
  alternates: { canonical: '/blog-buying-and-selling-rv-parks/' },
};

export default function BlogIndex() {
  return (
    <>
      <div className="title-band" style={{ height: 130, backgroundImage: 'url(/images/site/rv-parks-2.jpg)' }} />
      <section className="l-section">
        <div className="l-section-h page-title-wrap">
          <h1 className="page-title">Blog:</h1>
          <div className="news-grid" style={{ gridTemplateColumns: '1fr', marginTop: 20 }}>
            {posts().map((p) => (
              <Link key={p.slug} href={`/${p.slug}/`} className="news-card alt-card">
                {p.featuredImage ? <img src={p.featuredImage} alt="" loading="lazy" /> : <div />}
                <div className="body">
                  <span className="cat">{p.categories.join(', ') || 'Blog'}</span>
                  <h3>{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
