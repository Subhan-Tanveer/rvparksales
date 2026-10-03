import Link from 'next/link';
import PageBand from '@/components/PageBand';
import { allListings, pages, posts, categories } from '@/lib/content';

export const metadata = {
  title: { absolute: 'Sitemap - RV Park Sales - RV Campgrounds for Sale' },
  alternates: { canonical: '/sitemap/' },
};

// Same three lists as the old HTML sitemap: Pages, Posts (by category), Listings.
export default function SitemapPage() {
  // The Offering Memorandum was retired (Marie, Oct 2026), so it and its NDA are not listed.
  const RETIRED = new Set(['offering-memorandum', 'confidentiality-and-non-disclosure-agreement']);
  const pageList = [...pages()].filter((p) => !RETIRED.has(p.slug)).sort((a, b) => b.wpId - a.wpId);
  return (
    <>
      <PageBand title="Sitemap" kicker="Every page" sub="All pages, articles and listings on RVParkSales.com." crumbs={[{ label: 'Sitemap' }]} compact />
      <section className="l-section s-medium-72">
        <div className="l-section-h prose sitemap">
          <h2>Pages</h2>
          <ul>{pageList.map((p) => <li key={p.slug}><Link href={p.slug === 'home' ? '/' : `/${p.slug}/`}>{p.title}</Link></li>)}</ul>
          <h2>Posts</h2>
          {categories().filter((c) => c.directCount > 0).map((c) => (
            <div key={c.slug}>
              <h3><Link href={c.path}>{c.name}</Link></h3>
              <ul>{posts().filter((p) => (p.categorySlugs || []).includes(c.slug)).map((p) => <li key={p.slug}><Link href={`/${p.slug}/`}>{p.title}</Link></li>)}</ul>
            </div>
          ))}
          <h2>Listings</h2>
          <ul>{allListings().map((l) => <li key={l.slug}><Link href={`/listing/${l.slug}/`}>{l.title}</Link></li>)}</ul>
        </div>
      </section>
    </>
  );
}
