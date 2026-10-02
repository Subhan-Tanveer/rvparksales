import ContactForm from '@/components/ContactForm';
import { SITE } from '@/lib/content';

export const metadata = {
  title: 'Contact',
  description: 'Contact RV Park Sales to buy or sell an RV park or campground, or schedule a free consultation.',
  alternates: { canonical: '/contact/' },
};

export default async function ContactPage({ searchParams }) {
  const sp = await searchParams;
  const listing = typeof sp?.listing === 'string' ? sp.listing.slice(0, 200) : '';
  return (
    <section className="l-section">
      <div className="l-section-h page-title-wrap">
        <h1 className="page-title">Contact</h1>
        <div className="cols-2" style={{ marginTop: 30, alignItems: 'start' }}>
          <div id="buyers">
            <p>Buying, selling or just exploring? Send us a message and we will be in touch, or schedule a free consultation.</p>
            <ContactForm listing={listing} />
          </div>
          <div id="sellers" style={{ background: 'var(--bg-alt)', padding: 30 }}>
            <h3>Prefer to talk?</h3>
            <p><strong>Phone:</strong> <a href={SITE.phoneHref}>{SITE.phone}</a></p>
            <p><strong>Email:</strong> <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
            <p>Based in Panama City Beach, Florida, serving the entire USA.</p>
            <a href={SITE.calendly} className="btn" target="_blank" rel="noopener">Schedule a Free Consultation</a>
          </div>
        </div>
      </div>
    </section>
  );
}
