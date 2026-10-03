import Link from 'next/link';
import PageBand from '@/components/PageBand';
import ReviewsSlider from '@/components/ReviewsSlider';
import SellerForm from '@/components/SellerForm';
import { SITE, testimonials, listingsForSale } from '@/lib/content';

export const metadata = {
  title: { absolute: 'Top RV Park Broker at RV Park Sales - USA RV Parks For Sale' },
  description: 'Get your RV park in front of thousands of qualified buyers. Sell with a broker, advertise it yourself with RVParkAds, or grow its value first with RVParkSuccess.',
  alternates: { canonical: '/sell-my-rv-park/' },
};

const STEPS = [
  { n: '01', t: 'Tell us about your park', d: 'Share the basics (sites, acreage, location, income) with us or your broker.' },
  { n: '02', t: 'Choose how you sell', d: 'List with a broker, advertise it yourself on RVParkAds, or do both.' },
  { n: '03', t: 'Reach serious buyers', d: 'Your park goes out to buyers searching RVParkSales and to RVParkSelect members first.' },
  { n: '04', t: 'Talk, negotiate, close', d: 'Inquiries come straight to you or your broker. You stay in control.' },
];

// Sell page: Marie's copy in the new design, plus the three ways to sell, how
// it works, reviews and Marie's GoHighLevel seller form.
export default function SellPage() {
  const reviews = [...testimonials()].reverse().slice(0, 7);
  const forSale = listingsForSale().length;
  return (
    <>
      <PageBand title="Get Your RV Park In Front of Thousands of Qualified Buyers" kicker="Sell my RV park" image="/images/site/mobile-home-parks-1.jpg"
        sub="RVParkSales.com is America’s premier marketplace connecting RV park owners with serious buyers nationwide. Choose your path and start getting inquiries today."
        crumbs={[{ label: 'Sell My RV Park' }]}>
        <div className="btn-row">
          <a className="btn btn-lg" href={SITE.ads}>Advertise Your Park</a>
          <button type="button" className="btn btn-lg btn-ghost seller-consultation">Talk to a Broker</button>
        </div>
      </PageBand>

      <section className="l-section hm-sec">
        <div className="l-section-h sell-why">
          <div data-reveal>
            <p className="eyebrow" style={{ textAlign: 'left' }}>Advertising plans</p>
            <h2 className="sec-title" style={{ textAlign: 'left' }}>Why Advertise With RVParkSales.com?</h2>
            <p>RVParkSales.com is America’s premier specialized marketplace connecting RV park and campground owners with thousands of qualified buyers actively searching for properties like yours.</p>
            <p><b>We specialize exclusively in RV parks.</b> We work with brokers, agents and RV park owners who are serious about getting results.</p>
            <p>Our advertising plans are designed to maximize your property’s exposure and attract serious buyers fast. Every advertiser receives direct buyer inquiries sent straight to them, so you stay in control of your conversations and negotiations.</p>
            <p>We invest heavily in marketing and promotion to drive qualified buyers to our platform every single day, so your listing gets maximum visibility from day one.</p>
            <p className="sell-punch">Results driven? <b>YES!</b> Does it work? <b>ABSOLUTELY!</b></p>
            <a className="btn btn-lg" href={`${SITE.ads}/#plans`} target="_blank" rel="noopener">See Advertising Plans</a>
          </div>
          <div className="sell-stats" data-reveal="stagger">
            <div className="stat-3d" data-tilt="10"><b data-count={forSale}>{forSale}</b><span>Parks for sale right now</span></div>
            <div className="stat-3d alt" data-tilt="10"><b>50</b><span>States reached by our marketing</span></div>
            <div className="stat-3d" data-tilt="10"><b>3</b><span>Ways to sell, one marketplace</span></div>
            <div className="stat-3d alt" data-tilt="10"><b>0%</b><span>Commission when you advertise yourself</span></div>
          </div>
        </div>
      </section>

      <section className="l-section hm-sec hm-alt">
        <div className="l-section-h">
          <p className="eyebrow">Your options</p>
          <h2 className="sec-title">Three Ways to Sell Your Park</h2>
          <div className="opt-grid" data-reveal="stagger">
            <div className="opt-card" data-tilt="6">
              <span className="opt-num">Option 1</span>
              <h3>Sell With a Broker</h3>
              <p>Professional representation, valuation help, negotiation and transaction support from brokers who specialize in RV parks.</p>
              <Link href="/brokers/" className="btn">Meet Our Brokers</Link>
            </div>
            <div className="opt-card featured" data-tilt="6">
              <span className="opt-num">Option 2</span>
              <h3>Advertise It Yourself</h3>
              <p>Put your park in front of RV park buyers with RVParkAds, with no broker and no commission. Inquiries go straight to you.</p>
              <a href={`${SITE.ads}/#plans`} className="btn" target="_blank" rel="noopener">See RVParkAds Plans</a>
            </div>
            <div className="opt-card" data-tilt="6">
              <span className="opt-num">Option 3</span>
              <h3>Grow Its Value First</h3>
              <p>Not ready yet? Learn how to raise revenue and improve operations so your park is worth more when you go to market.</p>
              <a href={SITE.success} className="btn" target="_blank" rel="noopener">Visit RVParkSuccess</a>
            </div>
          </div>
        </div>
      </section>

      <section className="l-section hm-sec">
        <div className="l-section-h">
          <p className="eyebrow">How it works</p>
          <h2 className="sec-title">From First Call to Closing</h2>
          <div className="steps" data-reveal="stagger">
            {STEPS.map((s) => (
              <div key={s.n} className="step" data-tilt="6">
                <span className="step-n">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="l-section reviews-sec">
        <div className="reviews-photo" style={{ backgroundImage: 'url(/images/site/rv-parks-3.jpg)' }} />
        <div className="l-section-h reviews">
          <div className="left">
            <p className="eyebrow">Don’t Just Take Our Word For It</p>
            <h3 className="sec-title">Our Latest Reviews</h3>
            <ReviewsSlider items={reviews} action={<a href="https://reviews.digitalrez.com/feedback/pages/add-review/NjY3MzA=" className="btn" target="_blank" rel="noopener">Leave A Review</a>} />
          </div>
        </div>
      </section>

      <section className="l-section hm-sec hm-alt">
        <div className="l-section-h" style={{ maxWidth: 940 }}>
          <p className="eyebrow">Get started</p>
          <h2 className="sec-title">Tell Us About Your Park</h2>
          <p className="sec-lede">Fill out the form and we’ll be in touch about your selling options.</p>
          <div className="form-card"><SellerForm /></div>
        </div>
      </section>
    </>
  );
}
