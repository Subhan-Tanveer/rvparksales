import { Suspense } from 'react';
import Link from 'next/link';
import BlogSearch from '@/components/BlogSearch';
import PostCard from '@/components/PostCard';
import { posts, categories, textOf } from '@/lib/content';

// Blog list, magazine style: a search bar and a row of topic pills on top,
// the newest article as a wide lead story (first page only), then an airy
// three-column grid of cards (photo, topic, title, short summary, date) and
// numbered pages. No crowded sidebar: topics and search sit above the grid.
export const cardOf = (p) => ({
  slug: p.slug,
  title: p.title,
  topic: p.categories[0] || 'News',
  more: Math.max(0, p.categories.length - 1),
  featuredImage: p.featuredImage,
  date: p.date,
  summary: textOf(p.excerpt || p.contentHtml, 150),
});

export default function BlogList({ items, page = 1, pages = 1, base, searchable = false, lead = false }) {
  const href = (n) => (n === 1 ? base : `${base}page/${n}/`);
  const cards = items.map(cardOf);
  const [first, ...rest] = cards;
  const topics = categories().filter((c) => c.directCount > 0).sort((a, b) => b.directCount - a.directCount);
  const list = (
    <>
      {lead && first && <PostCard p={first} lead />}
      <div className="blog-cards">{(lead ? rest : cards).map((p) => <PostCard key={p.slug} p={p} />)}</div>
    </>
  );
  const all = searchable ? posts().map((p) => ({ ...cardOf(p), text: `${p.title} ${p.categories.join(' ')} ${textOf(p.contentHtml, 4000)}`.toLowerCase() })) : [];

  return (
    <section className="cn-sec cn-paper blog-wrap">
      <div className="l-section-h">
        <div className="blog-bar">
          <form className="blog-find" action="/blog-buying-and-selling-rv-parks/" method="get" role="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>
            <input type="search" name="s" placeholder="Search articles…" aria-label="Search articles" />
            <button type="submit" className="btn btn-sm btn-ink">Search</button>
          </form>
          <nav className="blog-topics" aria-label="Topics" data-lenis-prevent>
            <Link href="/blog-buying-and-selling-rv-parks/" className={base === '/blog-buying-and-selling-rv-parks/' ? 'on' : ''}>All articles</Link>
            {topics.map((c) => <Link key={c.slug} href={c.path} className={base === c.path ? 'on' : ''}>{c.name}<b>{c.directCount}</b></Link>)}
          </nav>
        </div>

        {searchable ? <Suspense fallback={list}><BlogSearch all={all}>{list}</BlogSearch></Suspense> : list}

        {pages > 1 && (
          <nav className="pagination" aria-label="Posts">
            {page > 1 && <Link className="page-numbers prev" href={href(page - 1)}>← Prev</Link>}
            {Array.from({ length: pages }, (_, k) => k + 1).map((n) => (
              n === page
                ? <span key={n} className="page-numbers current" aria-current="page">{n}</span>
                : <Link key={n} className="page-numbers" href={href(n)}>{n}</Link>
            ))}
            {page < pages && <Link className="page-numbers next" href={href(page + 1)}>Next →</Link>}
          </nav>
        )}
      </div>
    </section>
  );
}
