import Link from 'next/link';
import { notFound } from 'next/navigation';
import { posts, pages, postBySlug, pageBySlug, textOf, SITE } from '@/lib/content';

// Blog posts and ordinary pages both live at the root (/some-slug/) on the old
// WordPress site, so they share this one route and keep their exact addresses.
// Pages that get their own designed route are listed here so they are skipped.
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
  return {
    title: item.seoTitle || item.title,
    description: item.seoDescription || textOf(item.contentHtml, 155),
    alternates: { canonical: `/${item.slug}/` },
  };
}

export default async function ContentPage({ params }) {
  const { slug } = await params;
  const hit = find(slug);
  if (!hit) notFound();
  const { kind, item } = hit;

  const jsonLd = kind === 'post' ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.title,
    datePublished: item.date,
    mainEntityOfPage: `${SITE.url}/${item.slug}/`,
    publisher: { '@type': 'Organization', name: 'RVParkSales.com' },
  } : null;

  return (
    <article className="section" style={{ paddingTop: 28 }}>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <div className="wrap">
        {kind === 'post' && <div className="crumbs"><Link href="/blog-buying-and-selling-rv-parks/">← Blog</Link></div>}
        <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.6rem)', maxWidth: '22ch' }}>{item.title}</h1>
        {kind === 'post' && <p className="lcard-meta">{new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
        <div className="prose" dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
        {kind === 'post' && (
          <div className="banner banner-purple" style={{ marginTop: 34, maxWidth: 760 }}>
            <div>
              <h3>Ready to take the next step?</h3>
              <p>Search parks for sale, join RVParkSelect for first-look access, or talk with us about selling.</p>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <Link href="/listings/?_listing_status=for-sale" className="btn btn-primary btn-sm">Search Parks</Link>
              <Link href="/contact/" className="btn btn-ghost btn-sm">Contact Us</Link>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
