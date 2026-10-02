import Link from 'next/link';
import { allListings, brokers, posts } from '@/lib/content';

export const metadata = { title: 'Sitemap', alternates: { canonical: '/sitemap/' } };

export default function SitemapPage() {
  return (
    <section className="l-section">
      <div className="l-section-h page-title-wrap">
        <h1 className="page-title">Sitemap</h1>
        <div className="cols-2" style={{ marginTop: 24 }}>
          <div>
            <h3>Pages</h3>
            <ul className="prose">
              {[['/', 'Home'], ['/about-selling-an-rv-park/', 'About Us'], ['/listings/?_listing_status=for-sale', 'Explore Parks'], ['/brokers/', 'RV Park Brokers'], ['/developers/', 'RV Park Developers'], ['/reviews/', 'Reviews'], ['/faq/', 'FAQ'], ['/contact/', 'Contact'], ['/blog-buying-and-selling-rv-parks/', 'Blog'], ['/sell-my-rv-park/', 'Sell My RV Park'], ['/privacy-policy-tos/', 'Privacy Policy and Terms of Service']].map(([h, t]) => <li key={h}><Link href={h}>{t}</Link></li>)}
            </ul>
            <h3>Brokers</h3>
            <ul className="prose">{brokers().map((b) => <li key={b.slug}><Link href={`/broker/${b.slug}/`}>{b.name}</Link></li>)}</ul>
          </div>
          <div>
            <h3>Blog</h3>
            <ul className="prose">{posts().map((p) => <li key={p.slug}><Link href={`/${p.slug}/`}>{p.title}</Link></li>)}</ul>
            <h3>Listings</h3>
            <ul className="prose">{allListings().map((l) => <li key={l.slug}><Link href={`/listing/${l.slug}/`}>{l.title}</Link></li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}
