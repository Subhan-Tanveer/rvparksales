import { Suspense } from 'react';
import Link from 'next/link';
import BlogSidebar from '@/components/BlogSidebar';
import BlogSearch from '@/components/BlogSearch';
import PostCard from '@/components/PostCard';
import { posts, textOf } from '@/lib/content';

// Post list layout from the old blog page: cards on the left, sidebar on the
// right, numbered pages below, a small white tilt over the photo band above.
export default function BlogList({ items, page = 1, pages = 1, base, searchable = false }) {
  const href = (n) => (n === 1 ? base : `${base}page/${n}/`);
  const lean = (p) => ({ slug: p.slug, title: p.title, categories: p.categories, featuredImage: p.featuredImage });
  const list = <div className="blog-list">{items.map((p) => <PostCard key={p.slug} p={p} />)}</div>;
  const all = searchable ? posts().map((p) => ({ ...lean(p), text: `${p.title} ${p.categories.join(' ')} ${textOf(p.contentHtml, 4000)}`.toLowerCase() })) : [];
  return (
    <section className="l-section with-shape">
      <svg className="shape-tilt" viewBox="0 0 64 8" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M64 7.9 L64 10 L0 10 L0 0 Z" /></svg>
      <div className="l-section-h blog-grid">
        <div>
          <div style={{ height: 81 }} />
          {searchable ? <Suspense fallback={list}><BlogSearch all={all}>{list}</BlogSearch></Suspense> : list}
          {pages > 1 && (
            <nav className="pagination" aria-label="Posts">
              {Array.from({ length: pages }, (_, k) => k + 1).map((n) => (
                n === page
                  ? <span key={n} className="page-numbers current" aria-current="page">{n}</span>
                  : <Link key={n} className="page-numbers" href={href(n)}>{n}</Link>
              ))}
              {page < pages && <Link className="page-numbers next" href={href(page + 1)}>Next</Link>}
            </nav>
          )}
          <div style={{ height: 81 }} />
        </div>
        <BlogSidebar />
      </div>
    </section>
  );
}
