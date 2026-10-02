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
      <section className="l-section s-large">
        <div className="l-section-h">
          <h1 className="page-title">Sell My RV Park</h1>
          <p className="sec-lede" style={{ textAlign: 'left', margin: '0 0 1.4rem' }}>Work with an experienced RV park broker, or advertise your park yourself to buyers who are looking for RV parks. Choose what fits you.</p>
          <div className="grid-3">
            <div className="side-card">
              <h3>1. Sell with a broker</h3>
              <p>Professional representation, pricing guidance, negotiation and transaction support from a broker who specializes in RV parks.</p>
              <Link href="/brokers/">Meet our brokers →</Link>
            </div>
            <div className="side-card">
              <h3>2. Advertise it yourself</h3>
              <p>Use RVParkAds to put your park in front of buyers without hiring a broker. You stay in control of your conversations and negotiations.</p>
              <a href="#plans">See plans →</a>
            </div>
            <div className="side-card">
              <h3>3. Talk it through first</h3>
              <p>Not sure which way to go, or what your park may be worth? A free 30-minute consultation is a good place to start.</p>
              <a href={SITE.calendly} target="_blank" rel="noopener">Schedule a consultation →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="l-section s-large alt" id="plans">
        <div className="l-section-h">
          <p className="eyebrow">Advertise with RVParkAds</p>
          <h2 className="sec-title">Advertising plans</h2>
          <p className="sec-lede">We specialize in RV parks, so your listing is seen by people who are looking for exactly that. Every inquiry goes straight to you.</p>
          <div className="grid-3" style={{ marginTop: 30 }}>
            {PLANS.map((p) => (
              <div key={p.name} style={{ background: '#fff', padding: 30, border: p.featured ? '2px solid var(--purple)' : '1px solid #e3e6ef', display: 'flex', flexDirection: 'column' }}>
                {p.featured && <span className="badge" style={{ alignSelf: 'flex-start', marginBottom: 8 }}>Most popular</span>}
                <h3 style={{ marginBottom: 4 }}>{p.name}</h3>
                <p style={{ fontSize: '.85rem', marginBottom: 8 }}>{p.tag}</p>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '2.2rem', color: 'var(--purple)' }}>{p.price}<span style={{ fontSize: '.8rem', fontWeight: 400 }}> / month</span></div>
                <p style={{ fontSize: '.8rem' }}>{p.terms}</p>
                <ul style={{ paddingLeft: '1.1em', margin: '8px 0 20px', flex: 1, fontSize: '.9rem' }}>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                <a href={`${SITE.ads}/#plans`} className="btn" target="_blank" rel="noopener">Choose {p.name}</a>
              </div>
            ))}
          </div>
          <div className="side-card" style={{ marginTop: 34, background: '#fff' }}>
            <h3>Know who you’re talking to</h3>
            <p style={{ margin: 0 }}>When a buyer from RVParkSelect contacts you about your park, we tell you which membership level they are on: just getting started, actively searching, or a verified Featured Buyer who says they are ready to sign a contract now, has cash or financing secured, and can close within 90 days, with proof of funds reviewed.</p>
          </div>
        </div>
      </section>

      <section className="l-section s-large">
        <div className="l-section-h" style={{ maxWidth: 860 }}>
          <p className="eyebrow">Get started</p>
          <h2 className="sec-title">Tell us about your park</h2>
          <p className="sec-lede">Fill out the form and we’ll be in touch about your options.</p>
          <GhlForm />
        </div>
      </section>
    </>
  );
}
