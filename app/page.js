import Link from 'next/link';
import Hero from '@/components/home/Hero';
import FeaturedParks from '@/components/home/FeaturedParks';
import FindPark from '@/components/home/FindPark';
import SelectCard from '@/components/home/SelectCard';
import { listingsForSale, statesWithListings, posts, testimonials, SITE } from '@/lib/content';

export const metadata = {
  title: { absolute: 'RV Park Sales - America’s RV Park Marketplace - RV Parks and Campgrounds For Sale' },
  description: 'Buy, sell, advertise and grow RV parks and campgrounds. RVParkSales.com brings RV park buyers, sellers, brokers and owners together nationwide.',
  alternates: { canonical: '/' },
};

// Home page, following Marie's plan (Oct 2026): RVParkSales is the hub, with
// RVParkSelect (buyers), RVParkAds (sellers / FSBO) and RVParkSuccess (owners)
// presented as divisions of one marketplace.
const I = {
  search: 'M10.5 4a6.5 6.5 0 104.03 11.6l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0010.5 4zm0 2a4.5 4.5 0 110 9 4.5 4.5 0 010-9z',
  lock: 'M12 2a5 5 0 00-5 5v3H5v12h14V10h-2V7a5 5 0 00-5-5zm-3 5a3 3 0 016 0v3H9V7zm3 7a2 2 0 011 3.73V20h-2v-2.27A2 2 0 0112 14z',
  megaphone: 'M3 10v4a1 1 0 001 1h2l4 5h2v-5l8 4V5l-8 4H4a1 1 0 00-1 1zm9 1.24L18 8.3v7.4l-6-2.94z',
  chart: 'M3 21h18v-2H5V3H3v18zm4-4h2v-6H7v6zm4 0h2V7h-2v10zm4 0h2v-9h-2v9zm4-12l-1.4-1.4L14 7.2l-3-3-5 5L7.4 10.6 11 7l3 3z',
  tent: 'M12 3l-1.2 1.6L2 18v2h20v-2l-8.8-13.4zM12 6.3L19.3 18H14l-2-4-2 4H4.7z',
  dollar: 'M12 1v3.06c-2.64.36-4.5 2.16-4.5 4.44 0 2.7 2.26 3.68 4.68 4.3 1.98.5 2.82 1 2.82 2.2 0 1.03-.95 1.9-3 1.9-2.06 0-3.02-.9-3.13-2.2H6.4c.12 2.36 1.85 3.86 4.6 4.24V23h2v-3.08c2.66-.4 4.5-2.04 4.5-4.42 0-3.02-2.5-3.9-4.82-4.48-2.02-.5-2.68-1.02-2.68-1.94 0-1.02 1-1.8 2.5-1.8 1.66 0 2.38.8 2.48 1.92h2.48c-.1-2.04-1.42-3.66-3.96-4.12V1z',
  handshake: 'M12.2 5.3l-1.5-1.5a2 2 0 00-2.8 0L2.6 9.1a2 2 0 000 2.8l.7.7L8 8l1.4 1.4 1.4-1.4L13.6 11 9 15.6l1.4 1.4 4.6-4.6 1.4 1.4-4.6 4.6 1.4 1.4 4.6-4.6 1.4 1.4-3.2 3.2 1.4 1.4 4.6-4.6a2 2 0 000-2.8l-6.4-6.4a2 2 0 00-2.8 0z',
  shield: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1.5 15.5l-4-4 1.41-1.41 2.59 2.58 6.59-6.58L18.5 8.5l-8 8z',
  arrow: 'M13.2 5.3l-1.4 1.4 4.3 4.3H4v2h12.1l-4.3 4.3 1.4 1.4L20 12z',
};
const Ico = ({ d, className = 'ico' }) => <svg className={className} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={d} /></svg>;
const Arrow = () => <Ico d={I.arrow} className="arr" />;

const BRANDS = [
  { key: 'sales', name: 'RVParkSales.com', tag: 'Buy & Sell RV Parks', icon: I.tent, text: 'Search RV parks, campgrounds, resorts and RV/MH communities for sale nationwide. Connect with brokers, owners and opportunities.', cta: 'Explore Properties', href: '/listings/?_listing_status=for-sale' },
  { key: 'select', name: 'RVParkSelect.com', tag: 'Get First Look Access', icon: I.lock, text: 'Serious buyers can receive early notifications of qualifying RV park opportunities before they are released publicly.', cta: 'Become a Select Buyer', href: `${SITE.select}/#pricing`, ext: true },
  { key: 'ads', name: 'RVParkAds.com', tag: 'Sell Without a Broker', icon: I.megaphone, text: 'Owners who want to sell themselves can advertise directly to a nationwide audience of RV park buyers.', cta: 'Advertise My Park', href: SITE.ads, ext: true },
  { key: 'success', name: 'RVParkSuccess.com', tag: 'Build a More Successful Park', icon: I.chart, text: 'Resources, marketing, revenue strategies and operations help designed to increase the value and performance of your property.', cta: 'Explore RV Park Success', href: SITE.success, ext: true },
];

const GOALS = [
  { icon: I.tent, title: 'Buy an RV Park', text: 'Search parks and campgrounds for sale throughout the United States.', cta: 'Search Properties', href: '/listings/?_listing_status=for-sale' },
  { icon: I.dollar, title: 'Sell an RV Park', text: 'Explore your options for selling through a broker or advertising directly to buyers.', cta: 'Explore Selling Options', href: '#selling' },
  { icon: I.lock, title: 'Find Opportunities Before the Market', text: 'Join RVParkSelect and receive qualifying opportunities before they are publicly released.', cta: 'Get First Look Access', href: `${SITE.select}/#pricing`, ext: true },
  { icon: I.megaphone, title: 'Advertise Your Park', text: 'Reach RV park buyers without hiring a broker.', cta: 'See Advertising Plans', href: `${SITE.ads}/#plans`, ext: true },
  { icon: I.chart, title: 'Increase Your Park’s Value', text: 'Learn strategies for increasing revenue, improving operations and positioning your property for sale.', cta: 'Visit RVParkSuccess', href: SITE.success, ext: true },
];

const RESOURCES = [
  { q: 'How Much Is My RV Park Worth?', text: 'Learn the factors that affect RV park valuation.', slug: 'want-to-sell-your-rv-park-not-just-list-it-find-accurate-maximized-pricing' },
  { q: 'How Do I Sell My RV Park?', text: 'Understand the options available to RV park owners.', slug: 'list-rv-park-for-sale' },
  { q: 'How Can I Increase My RV Park Revenue?', text: 'Strategies for increasing income and property value.', slug: 'when-you-know-in-your-heart-your-rv-park-could-make-more-money' },
  { q: 'What Are RV Park Buyers Looking For?', text: 'Understand what today’s buyers evaluate.', slug: 'what-type-of-buyer-will-buy-your-rv-park-or-campground' },
];

const A = ({ item, className, children }) => (item.ext
  ? <a href={item.href} className={className} target="_blank" rel="noopener">{children}</a>
  : <Link href={item.href} className={className}>{children}</Link>);

export default function Home() {
  const forSale = listingsForSale();
  const points = forSale.filter((l) => l.lat && l.lng).map((l) => ({ lat: l.lat, lng: l.lng }));
  const stats = { forSale: forSale.length, states: new Set(forSale.map((l) => l.state).filter(Boolean)).size };
  const featured = forSale.filter((l) => l.featuredImage).slice(0, 8).map((l) => ({
    slug: l.slug, title: l.title, state: l.state, city: l.city, sites: l.sites, acres: l.acres, priceUsd: l.priceUsd, category: l.category,
    image: l.featuredImage,
  }));
  const allPosts = posts();
  const resources = RESOURCES.map((r) => ({ ...r, post: allPosts.find((p) => p.slug === r.slug) }));
  const quotes = [...testimonials()].reverse().filter((t) => t.quote.length > 120).slice(0, 3);

  return (
    <>
      <Hero points={points} stats={stats} />

      {/* One marketplace, four ways to participate */}
      <section className="l-section hm-sec" id="ecosystem">
        <div className="l-section-h">
          <p className="eyebrow">The RVParkSales Family</p>
          <h2 className="sec-title">One RV Park Marketplace.<br />Four Ways to Participate.</h2>
          <p className="sec-lede">Four specialized services under one roof, so buyers, sellers, brokers and owners always know where to go next.</p>

          <div className="eco-map" data-draw aria-hidden="true">
            <svg viewBox="0 0 900 170" preserveAspectRatio="none">
              <path d="M450 40 V85 M150 85 H750 M150 85 V130 M450 85 V130 M750 85 V130" fill="none" stroke="url(#ecoGrad)" strokeWidth="2.5" strokeLinecap="round" />
              <defs><linearGradient id="ecoGrad" x1="0" x2="1"><stop offset="0" stopColor="#3bbbed" /><stop offset=".5" stopColor="#8a5cf6" /><stop offset="1" stopColor="#3bbbed" /></linearGradient></defs>
            </svg>
            <div className="eco-hub"><b>RVParkSales.com</b><span>The RV Park Marketplace</span></div>
            <div className="eco-legs">
              <div><b>Buy</b><span>RVParkSelect · First look buyers</span></div>
              <div><b>Sell</b><span>RVParkAds · Advertise your park</span></div>
              <div><b>Own</b><span>RVParkSuccess · Grow value</span></div>
            </div>
          </div>

          <div className="brand-grid" data-reveal="stagger">
            {BRANDS.map((b) => (
              <A key={b.key} item={b} className={`brand-card b-${b.key}`}>
                <span className="brand-glow" aria-hidden="true" />
                <span className="brand-ico"><Ico d={b.icon} /></span>
                <span className="brand-name">{b.name}</span>
                <span className="brand-tag">{b.tag}</span>
                <span className="brand-text">{b.text}</span>
                <span className="brand-cta">{b.cta} <Arrow /></span>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* What brings you here? */}
      <section className="l-section hm-sec hm-alt">
        <div className="l-section-h">
          <p className="eyebrow">What brings you here?</p>
          <h2 className="sec-title">What Are You Looking To Do?</h2>
          <div className="goal-grid" data-reveal="stagger">
            {GOALS.map((g, i) => (
              <A key={g.title} item={g} className="goal-card">
                <span className="goal-num">0{i + 1}</span>
                <span className="goal-ico"><Ico d={g.icon} /></span>
                <span className="goal-title">{g.title}</span>
                <span className="goal-text">{g.text}</span>
                <span className="goal-cta">{g.cta} <Arrow /></span>
              </A>
            ))}
          </div>
        </div>
      </section>

      {/* Search + featured parks */}
      <section className="l-section hm-sec find-sec">
        <div className="l-section-h">
          <p className="eyebrow">Property search</p>
          <h2 className="sec-title">Find Your Next RV Park</h2>
          <FindPark states={statesWithListings()} />
          <div className="feat-head" data-reveal>
            <h3>Featured RV Parks For Sale</h3>
            <Link href="/listings/?_listing_status=for-sale" className="link-arrow">View all {forSale.length} parks <Arrow /></Link>
          </div>
        </div>
        <FeaturedParks items={featured} />
      </section>

      {/* RVParkSelect callout */}
      <section className="l-section select-sec">
        <div className="select-bg" aria-hidden="true"><span className="h-orb a" /><span className="h-orb b" /></div>
        <div className="l-section-h select-in">
          <div className="select-copy" data-reveal>
            <p className="eyebrow light">RVParkSelect™</p>
            <h2>Want to See RV Parks Before Everyone Else?</h2>
            <p>Get early access to qualifying RV park opportunities before they’re published to the general public. Choose the states, regions and price ranges you’re interested in.</p>
            <ul className="tick-list">
              <li>First look at new parks, potentially up to five days early</li>
              <li>Alerts matched to your states, regions and budget</li>
              <li>Private. Members-only. Built for serious RV park buyers.</li>
            </ul>
            <a href={`${SITE.select}/#pricing`} className="btn btn-lg" target="_blank" rel="noopener">Get First Look Access <Arrow /></a>
          </div>
          <SelectCard />
        </div>
      </section>

      {/* Selling options */}
      <section className="l-section hm-sec" id="selling">
        <div className="l-section-h">
          <p className="eyebrow">For owners</p>
          <h2 className="sec-title">Thinking About Selling Your RV Park?</h2>
          <p className="sec-lede">You have more than one way to sell.</p>
          <div className="opt-grid" data-reveal="stagger">
            <div className="opt-card" data-tilt="6">
              <span className="opt-num">Option 1</span>
              <span className="opt-ico"><Ico d={I.handshake} /></span>
              <h3>Sell With a Broker</h3>
              <p>Get professional representation, valuation assistance, negotiations and transaction support.</p>
              <Link href="/brokers/" className="btn">Talk With a Broker</Link>
            </div>
            <div className="opt-card featured" data-tilt="6">
              <span className="opt-num">Option 2</span>
              <span className="opt-ico"><Ico d={I.megaphone} /></span>
              <h3>Advertise It Yourself</h3>
              <p>Use RVParkAds.com to put your property in front of RV park buyers without hiring a broker.</p>
              <a href={`${SITE.ads}/#plans`} className="btn" target="_blank" rel="noopener">See RVParkAds Plans</a>
            </div>
            <div className="opt-card" data-tilt="6">
              <span className="opt-num">Option 3</span>
              <span className="opt-ico"><Ico d={I.chart} /></span>
              <h3>Not Ready to Sell Yet?</h3>
              <p>Learn how to increase revenue, improve operations and potentially increase the value of your park before you go to market.</p>
              <a href={SITE.success} className="btn" target="_blank" rel="noopener">Visit RVParkSuccess</a>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section className="l-section cred-sec">
        <div className="cred-photo" style={{ backgroundImage: 'url(/images/site/Parks-for-sale.webp)' }} data-parallax="0.25" aria-hidden="true" />
        <div className="l-section-h cred-in">
          <p className="eyebrow light">Since 2006</p>
          <h2>The RV Park Industry Is Our Business</h2>
          <div className="cred-grid" data-reveal="stagger">
            <div><b><span data-count="20">20</span>+</b><span>Years of industry experience</span></div>
            <div><b><span data-count="50">50</span></b><span>States in a nationwide marketplace</span></div>
            <div><b>Thousands</b><span>Of buyers reached</span></div>
            <div><b>Hundreds</b><span>Of owners &amp; buyers served</span></div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="l-section hm-sec hm-alt">
        <div className="l-section-h">
          <p className="eyebrow">Reviews</p>
          <h2 className="sec-title">What RV Park Buyers &amp; Sellers Say</h2>
          <div className="quote-grid" data-reveal="stagger">
            {quotes.map((t) => {
              const [name, ...rest] = t.name.split(',');
              return (
                <figure key={t.name} className="q-card" data-tilt="5">
                  <svg className="q-mark" viewBox="0 0 48 40" aria-hidden="true"><path d="M7 3h12a3 3 0 013 3v13c0 9-5 16-14 18l-1-3c6-2 9-6 9-12H7a3 3 0 01-3-3V6a3 3 0 013-3zm24 0h12a3 3 0 013 3v13c0 9-5 16-14 18l-1-3c6-2 9-6 9-12H31a3 3 0 01-3-3V6a3 3 0 013-3z" fill="currentColor" /></svg>
                  <div className="q-stars" aria-label="5 stars">★★★★★</div>
                  <blockquote>{t.quote}</blockquote>
                  <figcaption><b>{name.trim()}</b><span>{rest.length ? rest.join(',').trim() : 'RVParkSales client'}</span></figcaption>
                </figure>
              );
            })}
          </div>
          <div className="center" style={{ marginTop: 40 }}><Link href="/reviews/" className="btn">Read More Reviews</Link></div>
        </div>
      </section>

      {/* Resources */}
      <section className="l-section hm-sec">
        <div className="l-section-h">
          <p className="eyebrow">RV Park Resources</p>
          <h2 className="sec-title">Answers Before You Buy or Sell</h2>
          <div className="res-grid" data-reveal="stagger">
            {resources.map((r) => (
              <Link key={r.q} href={r.post ? `/${r.post.slug}/` : '/blog-buying-and-selling-rv-parks/'} className="res-card">
                <span className="res-img">{r.post?.featuredImage ? <img src={r.post.featuredImage} alt="" loading="lazy" /> : null}</span>
                <span className="res-body">
                  <span className="res-q">{r.q}</span>
                  <span className="res-text">{r.text}</span>
                  <span className="res-cta">Read More <Arrow /></span>
                </span>
              </Link>
            ))}
          </div>
          <div className="center" style={{ marginTop: 40 }}>
            <a href={SITE.success} className="btn" target="_blank" rel="noopener">Visit RVParkSuccess</a>
          </div>
        </div>
      </section>

      {/* Final seller CTA */}
      <section className="l-section final-cta">
        <div className="final-bg" style={{ backgroundImage: 'url(/images/site/rv-parks-3.jpg)' }} data-parallax="0.2" aria-hidden="true" />
        <div className="l-section-h final-in" data-reveal>
          <h2>Thinking About Selling Your RV Park?</h2>
          <p className="final-lede">Let’s talk about your property and your options.</p>
          <p>Whether you’re ready to sell today, considering selling in the future, or simply want to understand what your park could be worth, start with a conversation.</p>
          <div className="btn-row center-row">
            <button type="button" className="btn btn-lg seller-consultation">Get a Free RV Park Consultation</button>
            <a href={SITE.calendly} className="btn btn-lg btn-ghost" target="_blank" rel="noopener">Find Out What Your Park May Be Worth</a>
          </div>
        </div>
      </section>
    </>
  );
}
