import Link from 'next/link';
import PageBand from '@/components/PageBand';
import { SITE } from '@/lib/content';

export const metadata = {
  title: { absolute: 'RV Park Sales - RV Parks - RV Campgrounds' },
  description: 'RVParkSales.com is a specialized marketing platform that connects RV park and campground owners with qualified buyers.',
  alternates: { canonical: '/about-selling-an-rv-park/' },
};

// Same as the old About Us page: text on the left two thirds, a full-height
// photo on the right third.
export default function AboutPage() {
  return (
    <>
      <PageBand title="About Us" kicker="Who we are" sub="America’s specialized marketplace for RV parks and campgrounds, connecting owners with serious buyers nationwide." crumbs={[{ label: 'About Us' }]} />
      <section className="l-section">
        <div className="l-section-h cols-2-1">
          <div>
            <div style={{ height: 81 }} />
            <h3 style={{ margin: '0 0 18px' }}>Advertise Your RV Park on RVParkSales.com</h3>
            <p>Welcome to RVParkSales.com, America’s premier specialized marketing platform that connects RV Park and Campground owners with thousands of qualified buyers actively searching for properties like yours.</p>
            <p>What makes RVParkSales.com different from every other platform?</p>
            <p>WE SPECIALIZE EXCLUSIVELY IN RV PARKS! We work with Brokers, Agents, and RV Park and Campground owners who are serious about getting results.</p>
            <p>Our advertising plans are designed to maximize your property’s exposure and attract serious buyers fast. Choose the plan that fits your goals and start receiving qualified inquiries immediately.</p>
            <p>Every advertiser receives direct buyer inquiries sent straight to them. You stay in control of your conversations and negotiations. RVParkSales.com puts the right buyers in front of you so you can focus on closing the deal.</p>
            <p>We invest heavily in marketing and promotion to drive qualified buyers to our platform every single day so your listing gets maximum visibility from day one.</p>
            <p>Results driven? YES!</p>
            <p>Does it work? ABSOLUTELY!</p>
            <p>To get started click on the ADVERTISE YOUR PARK button below.</p>
            <div className="btn-row">
              <Link href="/listings/?_listing_status=for-sale" className="btn btn-2" title="Explore Parks">Explore Parks for Sale</Link>
              <a href={SITE.ads} className="btn" target="_blank" rel="nofollow noopener" title="Sell Your Park">View Advertising Plans</a>
            </div>
            <hr className="hr-line" />
            <div style={{ height: 81 }} />
          </div>
          <div className="side-photo" style={{ backgroundImage: 'url(/images/site/mobile-home-parks-1.jpg)' }} />
        </div>
      </section>
    </>
  );
}
