import ContactForm from '@/components/ContactForm';
import { SITE } from '@/lib/content';

export const metadata = {
  title: 'Contact Us',
  description: 'Contact RVParkSales.com to buy or sell an RV park or campground, or schedule a free consultation.',
  alternates: { canonical: '/contact/' },
};

export default async function ContactPage({ searchParams }) {
  const sp = await searchParams;
  const listing = typeof sp?.listing === 'string' ? sp.listing.slice(0, 200) : '';
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow">Contact</p>
        <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.6rem)' }}>Let's talk about your RV park</h1>
        <p className="lede" style={{ marginBottom: 26 }}>Buying, selling or just exploring? Send us a message or book a free 30-minute consultation.</p>
        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          <div className="card card-pad"><ContactForm listing={listing} /></div>
          <div className="card card-pad">
            <h3>Prefer to talk?</h3>
            <p><strong>Phone:</strong> <a href={SITE.phoneHref}>{SITE.phone}</a></p>
            <p><strong>Email:</strong> <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
            <p>Based in Panama City Beach, Florida, serving the entire USA.</p>
            <a href={SITE.calendly} className="btn btn-purple" target="_blank" rel="noopener">Schedule a Free Consultation</a>
          </div>
        </div>
      </div>
    </section>
  );
}
