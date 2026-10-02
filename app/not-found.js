import Link from 'next/link';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <section className="l-section s-huge">
      <div className="l-section-h" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Page not found</h1>
        <p>The page you are looking for may have moved. Try our listings, or get in touch.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/listings/?_listing_status=for-sale" className="btn">Search Parks</Link>
          <Link href="/contact/" className="btn">Contact</Link>
        </div>
      </div>
    </section>
  );
}
