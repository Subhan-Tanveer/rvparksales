import Link from 'next/link';

// One article card: photo on top, topic pill, title, two-line summary, date.
// `lead` makes it the wide feature story at the top of the blog.
const fmt = (d) => {
  const t = d ? new Date(d) : null;
  return t && !Number.isNaN(t.getTime()) ? t.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';
};

export default function PostCard({ p, lead = false }) {
  return (
    <Link href={`/${p.slug}/`} className={`post-card ${lead ? 'post-lead' : ''}`} aria-label={p.title} data-cursor="Read">
      <span className="pc-img">{p.featuredImage ? <img src={p.featuredImage} alt="" loading={lead ? 'eager' : 'lazy'} /> : <i />}</span>
      <span className="pc-body">
        <span className="pc-top">
          <span className="pc-topic">{p.topic}</span>
          {p.more > 0 && <span className="pc-more">+{p.more}</span>}
          {lead && <span className="pc-new">Latest</span>}
        </span>
        <span className="pc-title">{p.title}</span>
        {p.summary && <span className="pc-sum">{p.summary}</span>}
        <span className="pc-foot">
          <span>{fmt(p.date)}</span>
          <span className="pc-go">Read article <i>→</i></span>
        </span>
      </span>
    </Link>
  );
}
