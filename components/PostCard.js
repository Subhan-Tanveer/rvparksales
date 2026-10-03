import Link from 'next/link';

// One post in the old blog list: wide photo, white text box over its right edge.
export default function PostCard({ p }) {
  return (
    <Link href={`/${p.slug}/`} className="blog-card" aria-label={p.title}>
      <div className="img">{p.featuredImage ? <img src={p.featuredImage} alt="" loading="lazy" /> : <span />}</div>
      <div className="box">
        <span className="tax">{p.categories.join(', ')}</span>
        <h2>{p.title}</h2>
      </div>
    </Link>
  );
}
