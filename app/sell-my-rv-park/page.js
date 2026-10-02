import Link from 'next/link';
import GhlForm from '@/components/GhlForm';
import { SITE } from '@/lib/content';

export const metadata = {
  title: 'Sell My RV Park',
  description: 'Sell your RV park or campground with an experienced RV park broker, or advertise it yourself to buyers with RVParkAds, plans from $99 a month.',
  alternates: { canonical: '/sell-my-rv-park/' },
};

// Plan details mirror RVParkAds (src/js/plans-data.js there). Keep in sync.
const PLANS = [
  { name: 'Level 1', price: '$99', tag: 'Basic listing on RVParkSales.com', terms: '3-month minimum, then month to month', items: ['Basic listing on RVParkSales.com', 'Featured in buyer search results', 'Email inquiry forwarding', 'Up to 6 photos'] },
  { name: 'Level 2', price: '$299', tag: 'Listing + social media promotion', terms: 'Month to month, cancel any time', featured: true, items: ['Everything in Level 1', 'Marketed to our buyer database', 'Facebook & Instagram promotion', 'Up to 10 photos + 1 video', 'Priority placement in search results'] },
  { name: 'Level 3', price: '$499', tag: 'Listing + social + video, 30-day campaign', terms: 'Month to month, cancel any time', items: ['Everything in Level 2', 'Professional video content creation', 'Regular social media posting', 'Up to 15 photos + 2 videos', 'Direct buyer outreach', 'Weekly performance report'] },
];

export default function SellPage() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow" style={{ color: '#9be3bd' }}>For sellers</p>
          <h1>Sell your RV park or campground</h1>
          <p className="lede">Work with an experienced RV park broker, or advertise your park yourself to buyers who are looking for RV parks. Choose what fits you.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
            <a href="#plans" className="btn btn-primary">See advertising plans</a>
            <a href={SITE.calendly} className="btn btn-white" target="_blank" rel="noopener">Free consultation</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="eyebrow">Your options</p>
          <h2>Three ways to sell</h2>
          <div className="grid grid-3" style={{ marginTop: 20 }}>
            <div className="card card-pad">
              <h3>1. Sell with a broker</h3>
              <p>Professional representation, pricing guidance, negotiation and transaction support from a broker who specializes in RV parks.</p>
              <Link href="/brokers/" className="link-arrow">Meet our brokers →</Link>
            </div>
            <div className="card card-pad">
              <h3>2. Advertise it yourself</h3>
              <p>Use RVParkAds to put your park in front of buyers without hiring a broker. You stay in control of your conversations and negotiations.</p>
              <a href="#plans" className="link-arrow">See plans →</a>
            </div>
            <div className="card card-pad">
              <h3>3. Talk it through first</h3>
              <p>Not sure which way to go, or what your park may be worth? A free 30-minute consultation is a good place to start.</p>
              <a href={SITE.calendly} className="link-arrow" target="_blank" rel="noopener">Schedule a consultation →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft" id="plans">
        <div className="wrap">
          <p className="eyebrow">Advertise with RVParkAds</p>
          <h2>Advertising plans</h2>
          <p className="lede" style={{ marginBottom: 24 }}>We specialize in RV parks, so your listing is seen by people who are looking for exactly that. Every inquiry goes straight to you.</p>
          <div className="grid grid-3">
            {PLANS.map((p) => (
              <div key={p.name} className="card card-pad" style={p.featured ? { borderColor: 'var(--purple)', borderWidth: 2 } : undefined}>
                {p.featured && <span className="path-tag tag-seller">Most popular</span>}
                <h3 style={{ marginBottom: 2 }}>{p.name}</h3>
                <p className="lcard-meta" style={{ marginBottom: 8 }}>{p.tag}</p>
                <div className="lcard-price" style={{ fontSize: '2rem' }}>{p.price}<span className="lcard-meta"> / month</span></div>
                <p className="lcard-meta">{p.terms}</p>
                <ul style={{ paddingLeft: '1.1em', margin: '12px 0 18px', flex: 1 }}>
                  {p.items.map((i) => <li key={i}>{i}</li>)}
                </ul>
                <a href={`${SITE.ads}/#plans`} className={`btn ${p.featured ? 'btn-purple' : 'btn-ghost'}`} target="_blank" rel="noopener">Choose {p.name}</a>
              </div>
            ))}
          </div>
          <div className="banner banner-green" style={{ marginTop: 30 }}>
            <div>
              <h3>Know who you're talking to</h3>
              <p>When a buyer from RVParkSelect contacts you about your park, we tell you which membership level they are on: just getting started, actively searching, or a verified Featured Buyer who says they are ready to sign a contract now, has cash or financing secured, and can close within 90 days, with proof of funds reviewed.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="eyebrow">Get started</p>
          <h2>Tell us about your park</h2>
          <p className="lede" style={{ marginBottom: 18 }}>Fill out the form and we'll be in touch about your options.</p>
          <div className="card card-pad"><GhlForm /></div>
        </div>
      </section>
    </>
  );
}
