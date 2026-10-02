import Link from 'next/link';
import { SITE } from '@/lib/content';

export const metadata = {
  title: 'Offering Memorandum',
  description: 'How to request an offering memorandum for an RV park or campground listed on RVParkSales.com.',
  alternates: { canonical: '/offering-memorandum/' },
};

// The old page had no text of its own in the WordPress export (it was a title
// plus a form added by the page template). This short replacement explains the
// process; the real request form is wired up when the lead flow is connected.
export default function OfferingMemorandum() {
  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <p className="eyebrow">Buyers</p>
        <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.6rem)' }}>Offering Memorandum</h1>
        <p className="lede">For many listings an offering memorandum, with financial and operating details, is available to qualified buyers.</p>
        <ol className="prose">
          <li>Find a park on <Link href="/listings/?_listing_status=for-sale">our listings</Link> and open it.</li>
          <li>Read and sign the <Link href="/confidentiality-and-non-disclosure-agreement/">confidentiality agreement</Link>.</li>
          <li>The listing broker sends you the memorandum.</li>
        </ol>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          <Link href="/contact/" className="btn btn-primary">Request a memorandum</Link>
          <a href={SITE.phoneHref} className="btn btn-ghost">Call {SITE.phone}</a>
        </div>
      </div>
    </section>
  );
}
