import Link from 'next/link';
import PageBand from '@/components/PageBand';
import ReviewWall from '@/components/home/ReviewWall';
import SellerForm from '@/components/SellerForm';
import Split from '@/components/fx/Split';
import Marquee from '@/components/fx/Marquee';
import { SITE, testimonials, listingsForSale, loadContent } from '@/lib/content';

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

const OPTIONS = [
  { n: '01', t: 'Sell With a Broker', d: 'Professional representation, valuation help, negotiation and transaction support from brokers who specialize in RV parks.', cta: 'Meet Our Brokers', href: '/brokers/', img: '/images/site/1956989740-scaled.jpg' },
  { n: '02', t: 'Advertise It Yourself', d: 'Put your park in front of RV park buyers with RVParkAds, with no broker and no commission. Inquiries go straight to you.', cta: 'See RVParkAds Plans ↗', href: `${SITE.ads}/#plans`, ext: true, img: '/images/site/rv-parks-2.jpg' },
  { n: '03', t: 'Grow Its Value First', d: 'Not ready yet? Learn how to raise revenue and improve operations so your park is worth more when you go to market.', cta: 'Visit RVParkSuccess ↗', href: SITE.success, ext: true, img: '/images/site/mobile-home-parks-1.jpg' },
];

// Sell page: Marie's copy as a run of cinematic scenes: hero, why advertise
// with live numbers, ticker, stacked option cards, the four steps, the review
// wall and Marie's GoHighLevel seller form.
export default async function SellPage() {
  await loadContent();
  const reviews = [...testimonials()].reverse().filter((t) => t.quote.length > 60).slice(0, 6);
  const forSale = listingsForSale().length;
  return (
    <>
      <PageBand title="Get Your RV Park In Front of Thousands of Qualified Buyers" kicker="Sell my RV park" index="(Sellers)" image="/images/site/mobile-home-parks-1.jpg"
        sub="RVParkSales.com is America’s premier marketplace connecting RV park owners with serious buyers nationwide. Choose your path and start getting inquiries today."
        crumbs={[{ label: 'Sell My RV Park' }]}>
        <div className="btn-row">
          <a className="btn btn-lg" href={SITE.ads}>Advertise Your Park</a>
          <button type="button" className="btn btn-lg btn-ghost seller-consultation">Talk to a Broker</button>
        </div>
      </PageBand>

      <section className="cn-sec cn-paper">
        <div className="l-section-h sell-why">
          <div>
            <p className="eyebrow">(01) Advertising plans</p>
            <Split as="h2" text={'Why advertise\nwith *RVParkSales?*'} className="cn-title" />
            <div data-reveal>
              <p className="st-lede">America’s premier specialized marketplace connecting RV park and campground owners with thousands of qualified buyers actively searching for properties like yours.</p>
              <p><b>We specialize exclusively in RV parks.</b> We work with brokers, agents and RV park owners who are serious about getting results.</p>
              <p>Our advertising plans are designed to maximize your property’s exposure and attract serious buyers fast. Every advertiser receives direct buyer inquiries sent straight to them, so you stay in control of your conversations and negotiations.</p>
              <p>We invest heavily in marketing and promotion to drive qualified buyers to our platform every single day, so your listing gets maximum visibility from day one.</p>
              <p className="sell-punch">Results driven? <b>YES!</b> Does it work? <b>ABSOLUTELY!</b></p>
              <a className="btn btn-lg btn-ink" href={`${SITE.ads}/#plans`} target="_blank" rel="noopener">See Advertising Plans ↗</a>
            </div>
          </div>
          <div className="nation-stats sell-nums" data-reveal="stagger">
            <div><b><span data-count={forSale}>{forSale}</span></b><span>Parks for sale right now</span></div>
            <div><b>50</b><span>States reached by our marketing</span></div>
            <div><b>3</b><span>Ways to sell, one marketplace</span></div>
            <div><b>0%</b><span>Commission when you advertise yourself</span></div>
          </div>
        </div>
      </section>

      <Marquee items={['Sell with a broker', 'Advertise it yourself', 'Grow its value first']} className="mq-big" speed={34} />

      <section className="cn-sec cn-paper2">
        <div className="l-section-h">
          <div className="cn-head">
            <p className="eyebrow">(02) Your options</p>
            <Split as="h2" text={'Three ways\nto *sell your park*'} className="cn-title" />
          </div>
          <div className="stack" data-stack>
            {OPTIONS.map((o) => (
              <div key={o.n} className="stack-card">
                <div className="stc-copy">
                  <span className="stc-n">{o.n}</span>
                  <h3>{o.t}</h3>
                  <p>{o.d}</p>
                  {o.ext
                    ? <a href={o.href} className="btn btn-lg" target="_blank" rel="noopener">{o.cta}</a>
                    : <Link href={o.href} className="btn btn-lg">{o.cta}</Link>}
                </div>
                <div className="stc-img" style={{ backgroundImage: `url(${o.img})` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cn-sec cn-ink">
        <div className="l-section-h">
          <div className="cn-head">
            <p className="eyebrow light">(03) How it works</p>
            <Split as="h2" text={'From first call\nto *closing*'} className="cn-title" />
          </div>
          <div className="steps-x" data-reveal="stagger">
            {STEPS.map((s) => (
              <div key={s.n} className="sx">
                <span className="sx-n">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cn-sec cn-paper reviews-wall">
        <div className="l-section-h">
          <div className="cn-head cn-head-row">
            <div>
              <p className="eyebrow">(04) Don’t just take our word for it</p>
              <Split as="h2" text={'Our latest\n*reviews*'} className="cn-title" />
            </div>
            <a href="https://reviews.digitalrez.com/feedback/pages/add-review/NjY3MzA=" className="btn btn-lg btn-ink" target="_blank" rel="noopener">Leave A Review ↗</a>
          </div>
          <ReviewWall items={reviews} />
        </div>
      </section>

      <section className="cn-sec cn-paper2">
        <div className="l-section-h" style={{ maxWidth: 1100 }}>
          <div className="cn-head">
            <p className="eyebrow">(05) Get started</p>
            <Split as="h2" text={'Tell us about\n*your park*'} className="cn-title" />
            <p className="cn-lede">Fill out the form and we’ll be in touch about your selling options.</p>
          </div>
          <div className="form-card" data-reveal><SellerForm /></div>
        </div>
      </section>
    </>
  );
}
