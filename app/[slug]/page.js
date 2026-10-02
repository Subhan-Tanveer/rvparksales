import Link from 'next/link';
import { notFound } from 'next/navigation';
import { posts, pages, postBySlug, pageBySlug, textOf, SITE } from '@/lib/content';

// Blog posts and ordinary pages both live at the root (/some-slug/) on the old
// WordPress site, so they share this one route and keep their exact addresses.
// Pages that have their own designed route are listed here so they are skipped.
const HANDLED_ELSEWHERE = new Set(['home', 'sitemap', 'my-account', 'contact', 'reviews', 'blog-buying-and-selling-rv-parks', 'sell-my-rv-park', 'offering-memorandum']);

export function generateStaticParams() {
  return [
    ...posts().map((p) => ({ slug: p.slug })),
    ...pages().filter((p) => !HANDLED_ELSEWHERE.has(p.slug) && p.slug).map((p) => ({ slug: p.slug })),
  ];
}

function find(slug) {
  const post = postBySlug(slug);
  if (post) return { kind: 'post', item: post };
  const page = pageBySlug(slug);
  if (page && !HANDLED_ELSEWHERE.has(page.slug)) return { kind: 'page', item: page };
  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const hit = find(slug);
  if (!hit) return {};
  const { item } = hit;
  return { title: item.seoTitle || item.title, description: item.seoDescription || textOf(item.contentHtml, 155), alternates: { canonical: `/${item.slug}/` } };
}

export default async function ContentPage({ params }) {
  const { slug } = await params;
  const hit = find(slug);
  if (!hit) notFound();
  const { kind, item } = hit;
  const jsonLd = kind === 'post' ? {
    '@context': 'https://schema.org', '@type': 'Article', headline: item.title, datePublished: item.date,
    mainEntityOfPage: `${SITE.url}/${item.slug}/`, publisher: { '@type': 'Organization', name: 'RVParkSales.com' },
  } : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <div className="title-band" style={{ height: 130, backgroundImage: `url(${item.featuredImage || '/images/site/rv-parks-2.jpg'})` }} />
      <section className="l-section">
        <div className="l-section-h page-title-wrap" style={{ maxWidth: 1000 }}>
          {kind === 'post' && <div className="crumb"><Link href="/blog-buying-and-selling-rv-parks/">← Blog</Link>{item.categories[0] ? ` · ${item.categories[0]}` : ''}</div>}
          <h1 className="page-title" style={{ fontSize: 'clamp(2rem,5vw,3.4rem)' }}>{item.title}</h1>
          {kind === 'post' && <p style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
          <div className="prose" dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
          {kind === 'post' && (
            <div style={{ marginTop: 40, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/listings/?_listing_status=for-sale" className="btn">Search Parks</Link>
              <Link href="/contact/" className="btn">Contact Us</Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
