import Link from 'next/link';

export const metadata = { title: 'Page not found' };

// 404 with a floating 3D "404" and quick ways back into the site.
export default function NotFound() {
  return (
    <section className="nf">
      <span className="h-orb a" aria-hidden="true" /><span className="h-orb b" aria-hidden="true" />
      <div className="l-section-h nf-in">
        <div className="nf-3d" aria-hidden="true"><span>4</span><span>0</span><span>4</span></div>
        <h1>Page not found</h1>
        <p>The link you followed may be broken, or the page may have been removed.</p>
        <div className="btn-row center-row">
          <Link href="/listings/?_listing_status=for-sale" className="btn btn-lg">Search RV Parks</Link>
          <Link href="/" className="btn btn-lg btn-ghost">Back to Home</Link>
        </div>
      </div>
    </section>
  );
}
