import Link from 'next/link';
import { posts, categories } from '@/lib/content';

// Right-hand column of the old blog pages: search, latest five posts,
// and the category list with post counts.
export default function BlogSidebar() {
  return (
    <aside className="blog-side">
      <div style={{ height: 27 }} />
      <h3>Search Posts</h3>
      <form className="blog-search" action="/blog-buying-and-selling-rv-parks/" method="get" role="search">
        <input type="text" name="s" placeholder="Search" aria-label="Search" />
        <button type="submit" aria-label="Search">
          <svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z" /></svg>
        </button>
      </form>
      <hr className="hr-line" />
      <h3>Latest Posts</h3>
      <ul className="side-list">
        {posts().slice(0, 5).map((p) => <li key={p.slug}><Link href={`/${p.slug}/`}>{p.title}</Link></li>)}
      </ul>
      <hr className="hr-line" />
      <h3>Blog Categories</h3>
      <ul className="side-list cats">
        {categories().filter((c) => c.directCount > 0).map((c) => <li key={c.slug}><Link href={c.path}>{c.name}&nbsp;<b>{c.directCount}</b></Link></li>)}
      </ul>
      <div style={{ height: 27 }} />
    </aside>
  );
}
