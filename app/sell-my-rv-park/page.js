import HeroSlides from '@/components/HeroSlides';
import ReviewsSlider from '@/components/ReviewsSlider';
import SellerForm from '@/components/SellerForm';
import { SITE, testimonials } from '@/lib/content';

export const metadata = {
  title: { absolute: 'Top RV Park Broker at RV Park Sales - USA RV Parks For Sale' },
  description: 'Get your RV park in front of thousands of qualified buyers. RVParkSales.com connects RV park owners with serious buyers nationwide.',
  alternates: { canonical: '/sell-my-rv-park/' },
};

// Same three parts as the old page: photo-slider hero with the headline,
// the "Advertising plans" text, then the button and the reviews carousel.
export default function SellPage() {
  const reviews = [...testimonials()].reverse().slice(0, 7);
  return (
    <>
      <section className="hero sell-hero">
        <HeroSlides />
        <div className="hero-inner" style={{ maxWidth: 900 }}>
          <h2 style={{ color: '#faf5fa', textAlign: 'center' }}>Get Your RV Park In Front of Thousands of Qualified Buyers</h2>
          <h4 style={{ color: '#faf5fa', textAlign: 'center', margin: '0 0 1.5rem' }}>RVParkSales.com is America’s premier marketplace connecting RV park owners with serious buyers nationwide. Choose your advertising plan and start getting inquiries today.</h4>
          <a className="btn" href={SITE.ads}>ADVERTISE YOUR PARK</a>
        </div>
      </section>

      <section className="l-section">
        <div className="l-section-h center">
          <div style={{ height: 196 }} />
          <p className="eyebrow">Advertising Plans</p>
          <h2 className="sec-title">Get Your RV Park In Front of Thousands of Qualified Buyers</h2>
          <div className="sell-copy">
            <p>Why Advertise With RVParkSales.com?</p>
            <p>RVParkSales.com is America’s premier specialized marketplace<br />connecting RV park and campground owners with thousands of<br />qualified buyers actively searching for properties like yours.</p>
            <p>What makes us different from every other platform?</p>
            <p>WE SPECIALIZE EXCLUSIVELY IN RV PARKS! We work with brokers,<br />agents, and RV park owners who are serious about getting results.</p>
            <p>Our advertising plans are designed to maximize your property’s<br />exposure and attract serious buyers fast. Every advertiser<br />receives direct buyer inquiries sent straight to them. You stay<br />in control of your conversations and negotiations.</p>
            <p>We invest heavily in marketing and promotion to drive qualified<br />buyers to our platform every single day so your listing gets<br />maximum visibility from day one.</p>
            <p>Results driven? YES!<br />Does it work? ABSOLUTELY!</p>
            <p>To get started click the ADVERTISE YOUR PARK button below.</p>
          </div>
          <hr className="hr-blue" />
        </div>
      </section>

      <section className="l-section reviews-sec">
        <div className="reviews-photo" style={{ backgroundImage: 'url(/images/site/rv-parks-3.jpg)' }} />
        <div className="l-section-h reviews">
          <div className="left">
            <div className="center" style={{ marginBottom: 72 }}><a className="btn" href={SITE.ads} target="_blank" rel="noopener">ADVERTISE YOUR PARK</a></div>
            <p className="eyebrow">Don’t Just Take Our Word For It</p>
            <h3 className="sec-title">Our Latest Reviews</h3>
            <ReviewsSlider items={reviews} action={<a href="https://reviews.digitalrez.com/feedback/pages/add-review/NjY3MzA=" className="btn" target="_blank" rel="noopener">Leave A Review</a>} />
          </div>
        </div>
      </section>

      <section className="l-section hm-sec hm-alt">
        <div className="l-section-h" style={{ maxWidth: 900 }}>
          <p className="eyebrow">Get started</p>
          <h2 className="sec-title">Tell Us About Your Park</h2>
          <p className="sec-lede">Fill out the form and we’ll be in touch about your selling options.</p>
          <SellerForm />
        </div>
      </section>
    </>
  );
}
