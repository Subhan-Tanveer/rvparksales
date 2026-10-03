'use client';
import { useSearchParams } from 'next/navigation';
import PostCard from '@/components/PostCard';

// "Search Posts" box: with ?s=term the list shows matching posts instead.
export default function BlogSearch({ all, children }) {
  const sp = useSearchParams();
  const q = (sp.get('s') || '').trim().toLowerCase();
  if (!q) return children;
  const words = q.split(/\s+/);
  const hits = all.filter((p) => words.every((w) => p.text.includes(w)));
  return (
    <div className="blog-list">
      <p className="search-note">Search results for “{sp.get('s')}”: {hits.length} {hits.length === 1 ? 'post' : 'posts'}</p>
      {hits.map((p) => <PostCard key={p.slug} p={p} />)}
    </div>
  );
}
