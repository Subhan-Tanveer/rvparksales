import Link from 'next/link';
import Hero from '@/components/home/Hero';
import BrandScene from '@/components/home/BrandScene';
import GoalList from '@/components/home/GoalList';
import HorizontalParks from '@/components/home/HorizontalParks';
import ReviewWall from '@/components/home/ReviewWall';
import HeroGlobe from '@/components/home/HeroGlobe';
import FindPark from '@/components/home/FindPark';
import SelectCard from '@/components/home/SelectCard';
import Split from '@/components/fx/Split';
import Marquee from '@/components/fx/Marquee';
import { listingsForSale, statesForSale, posts, testimonials, SITE, loadContent } from '@/lib/content';

export const metadata = {
  title: { absolute: 'RV Park Sales - America’s RV Park Marketplace - RV Parks and Campgrounds For Sale' },
  description: 'Buy, sell, advertise and grow RV parks and campgrounds. RVParkSales.com brings RV park buyers, sellers, brokers and owners together nationwide.',
  alternates: { canonical: '/' },
};

// Home page, following Marie's plan (Oct 2026): RVParkSales is the hub, with
// RVParkSelect (buyers), RVParkAds (sellers / FSBO) and RVParkSuccess (owners)
// presented as divisions of one marketplace. Built as a sequence of cinematic
// scenes: full-screen photo film hero, ticker, pinned brand scene, hover index,
// sideways park reel, stacked selling options, globe, scattered review wall.
const Arrow = () => <svg className="arr" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.2 5.3l-1.4 1.4 4.3 4.3H4v2h12.1l-4.3 4.3 1.4 1.4L20 12z" /></svg>;

const BRANDS = [
  { key: 'sales', word: 'Buy', image: '/images/site/rv-parks-3.jpg', name: 'RVParkSales.com', tag: 'Buy & Sell RV Parks', text: 'Search RV parks, campgrounds, resorts and RV/MH communities for sale nationwide. Connect with brokers, owners and opportunities.', cta: 'Explore Properties', href: '/listings/?_listing_status=for-sale' },
  { key: 'select', word: 'First Look', image: '/images/site/Parks-for-sale.webp', name: 'RVParkSelect.com', tag: 'Get First Look Access', text: 'Serious buyers can receive early notifications of qualifying RV park opportunities before they are released publicly.', cta: 'Become a Select Buyer', href: `${SITE.select}/#pricing`, ext: true },
  { key: 'ads', word: 'Sell', image: '/images/site/rv-parks-2.jpg', name: 'RVParkAds.com', tag: 'Sell Without a Broker', text: 'Owners who want to sell themselves can advertise directly to a nationwide audience of RV park buyers.', cta: 'Advertise My Park', href: SITE.ads, ext: true },
  { key: 'success', word: 'Grow', image: '/images/site/mobile-home-parks-1.jpg', name: 'RVParkSuccess.com', tag: 'Build a More Successful Park', text: 'Resources, marketing, revenue strategies and operations help designed to increase the value and performance of your property.', cta: 'Explore RV Park Success', href: SITE.success, ext: true },
];

const GOALS = [
  { image: '/images/site/rv-parks-1.jpg', title: 'Buy an RV Park', text: 'Search parks and campgrounds for sale throughout the United States.', cta: 'Search Properties', href: '/listings/?_listing_status=for-sale' },
  { image: '/images/site/rv-parks-2.jpg', title: 'Sell an RV Park', text: 'Explore your options for selling through a broker or advertising directly to buyers.', cta: 'Explore Selling Options', href: '/sell-my-rv-park/' },
  { image: '/images/site/RV-PARKS.webp', title: 'First Look Access', text: 'Join RVParkSelect and receive qualifying opportunities before they are publicly released.', cta: 'Get First Look Access', href: `${SITE.select}/#pricing`, ext: true },
  { image: '/images/site/Parks-for-sale.webp', title: 'Advertise Your Park', text: 'Reach RV park buyers without hiring a broker.', cta: 'See Advertising Plans', href: `${SITE.ads}/#plans`, ext: true },
  { image: '/images/site/mobile-home-parks-1.jpg', title: 'Grow Its Value', text: 'Learn strategies for increasing revenue, improving operations and positioning your property for sale.', cta: 'Visit RVParkSuccess', href: SITE.success, ext: true },
];

const RESOURCES = [
  { q: 'How Much Is My RV Park Worth?', text: 'Learn the factors that affect RV park valuation.', slug: 'want-to-sell-your-rv-park-not-just-list-it-find-accurate-maximized-pricing' },
  { q: 'How Do I Sell My RV Park?', text: 'Understand the options available to RV park owners.', slug: 'list-rv-park-for-sale' },
  { q: 'How Can I Increase My RV Park Revenue?', text: 'Strategies for increasing income and property value.', slug: 'when-you-know-in-your-heart-your-rv-park-could-make-more-money' },
  { q: 'What Are RV Park Buyers Looking For?', text: 'Understand what today’s buyers evaluate.', slug: 'what-type-of-buyer-will-buy-your-rv-park-or-campground' },
];

export default async function Home() {
  await loadContent();
  const forSale = listingsForSale();
  const points = forSale.filter((l) => l.lat && l.lng).map((l) => ({ lat: l.lat, lng: l.lng }));
  const stats = { forSale: forSale.length, states: new Set(forSale.map((l) => l.state).filter(Boolean)).size };
  const featured = forSale.filter((l) => l.featuredImage).slice(0, 8).map((l) => ({
    slug: l.slug, title: l.title, state: l.state, city: l.city, sites: l.sites, acres: l.acres, priceUsd: l.priceUsd, category: l.category,
    image: l.featuredImage,
  }));
  const allPosts = posts();
  const resources = RESOURCES.map((r) => ({ ...r, post: allPosts.find((p) => p.slug === r.slug) }));
  const quotes = [...testimonials()].reverse().filter((t) => t.quote.length > 100).slice(0, 6);

  return (
    <>
      <Hero stats={stats} />

      <Marquee items={['Buy', 'Sell', 'Advertise', 'Grow', 'RV Parks', 'Campgrounds', 'RV Resorts', 'MH Communities']} className="mq-big" speed={36} />

      {/* Statement */}
      <section className="cn-sec cn-paper statement">
        <div className="l-section-h st-grid">
          <div>
            <p className="eyebrow">(01) The marketplace</p>
            <Split as="h2" text={'One RV park\nmarketplace.\n*Four* ways in.'} className="cn-title" />
          </div>
          <div className="st-side">
            <p className="st-lede" data-reveal>RVParkSales.com is the hub. Buyers search and get first look access, owners sell through a broker or advertise it themselves, and every park owner can learn to grow its value.</p>
            <div className="st-photos">
              <div className="st-ph a" data-speed="0.2"><div data-img-reveal><div className="img" style={{ backgroundImage: 'url(/images/site/rv-parks-1.jpg)' }} /></div></div>
              <div className="st-ph b" data-speed="-0.25"><div data-img-reveal><div className="img" style={{ backgroundImage: 'url(/images/site/rv-parks-2.jpg)' }} /></div></div>
            </div>
          </div>
        </div>
      </section>

      <BrandScene items={BRANDS} />

      {/* What brings you here? */}
      <section className="cn-sec cn-paper">
        <div className="l-section-h">
          <div className="cn-head">
            <p className="eyebrow">(02) What brings you here?</p>
            <Split as="h2" text="Pick your *path*" className="cn-title" />
          </div>
          <GoalList items={GOALS} />
        </div>
      </section>

      <HorizontalParks items={featured} total={forSale.length} />

      {/* Detailed search */}
      <section className="cn-sec cn-paper find-sec">
        <div className="l-section-h">
          <div className="cn-head">
            <p className="eyebrow">(03) Property search</p>
            <Split as="h2" text={'Find your\nnext *RV park*'} className="cn-title" />
          </div>
          <FindPark states={statesForSale()} />
        </div>
      </section>

      {/* RVParkSelect callout */}
      <section className="cn-sec cn-ink select-sec">
        <div className="l-section-h select-in">
          <div className="select-copy">
            <p className="eyebrow light">(04) RVParkSelect™</p>
            <Split as="h2" text={'See parks\nbefore\n*everyone else*'} className="cn-title" />
            <p>Get early access to qualifying RV park opportunities before they’re published to the general public. Choose the states, regions and price ranges you’re interested in.</p>
            <ul className="tick-list" data-reveal="stagger">
              <li>First look at new parks, potentially up to five days early</li>
              <li>Alerts matched to your states, regions and budget</li>
              <li>Private. Members-only. Built for serious RV park buyers.</li>
            </ul>
            <a href={`${SITE.select}/#pricing`} className="btn btn-lg" target="_blank" rel="noopener">Get First Look Access ↗</a>
          </div>
          <SelectCard />
        </div>
      </section>

      {/* Selling options: stacked cards */}
      <section className="cn-sec cn-paper" id="selling">
        <div className="l-section-h">
          <div className="cn-head">
            <p className="eyebrow">(05) For owners</p>
            <Split as="h2" text={'Three ways\nto *sell*'} className="cn-title" />
            <p className="cn-lede">Thinking about selling your RV park? You have more than one way to do it.</p>
          </div>
          <div className="stack" data-stack>
            <div className="stack-card">
              <div className="stc-copy">
                <span className="stc-n">01</span>
                <h3>Sell With a Broker</h3>
                <p>Get professional representation, valuation assistance, negotiations and transaction support from brokers who specialize in RV parks.</p>
                <Link href="/brokers/" className="btn btn-lg">Talk With a Broker</Link>
              </div>
              <div className="stc-img" style={{ backgroundImage: 'url(/images/site/1956989740-scaled.jpg)' }} />
            </div>
            <div className="stack-card">
              <div className="stc-copy">
                <span className="stc-n">02</span>
                <h3>Advertise It Yourself</h3>
                <p>Use RVParkAds.com to put your property in front of RV park buyers without hiring a broker. Inquiries come straight to you.</p>
                <a href={`${SITE.ads}/#plans`} className="btn btn-lg" target="_blank" rel="noopener">See RVParkAds Plans ↗</a>
              </div>
              <div className="stc-img" style={{ backgroundImage: 'url(/images/site/rv-parks-2.jpg)' }} />
            </div>
            <div className="stack-card">
              <div className="stc-copy">
                <span className="stc-n">03</span>
                <h3>Not Ready Yet? Grow Its Value</h3>
                <p>Learn how to increase revenue, improve operations and potentially raise the value of your park before you go to market.</p>
                <a href={SITE.success} className="btn btn-lg" target="_blank" rel="noopener">Visit RVParkSuccess ↗</a>
              </div>
              <div className="stc-img" style={{ backgroundImage: 'url(/images/site/mobile-home-parks-1.jpg)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Nationwide: globe + numbers */}
      <section className="cn-sec cn-ink nation">
        <div className="l-section-h nation-in">
          <div className="nation-copy">
            <p className="eyebrow light">(06) Since 2017</p>
            <Split as="h2" text={'The RV park\nindustry is\n*our business*'} className="cn-title" />
            <div className="nation-stats" data-reveal="stagger">
              <div><b><span data-count="9">9</span></b><span>Years in business</span></div>
              <div><b><span data-count={stats.forSale}>{stats.forSale}</span></b><span>Parks for sale right now</span></div>
              <div><b><span data-count={stats.states}>{stats.states}</span></b><span>States with active listings</span></div>
              <div><b>50</b><span>States in one nationwide marketplace</span></div>
            </div>
          </div>
          <div className="nation-globe">
            <div className="h-globe-glow" />
            <HeroGlobe points={points} />
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="cn-sec cn-paper reviews-wall">
        <div className="l-section-h">
          <div className="cn-head cn-head-row">
            <div>
              <p className="eyebrow">(07) Reviews</p>
              <Split as="h2" text={'What buyers\n& sellers *say*'} className="cn-title" />
            </div>
            <Link href="/reviews/" className="btn btn-lg btn-ink">Read More Reviews</Link>
          </div>
          <ReviewWall items={quotes} />
        </div>
      </section>

      {/* Resources */}
      <section className="cn-sec cn-paper2">
        <div className="l-section-h">
          <div className="cn-head cn-head-row">
            <div>
              <p className="eyebrow">(08) RV park resources</p>
              <Split as="h2" text={'Answers before\nyou *buy or sell*'} className="cn-title" />
            </div>
            <a href={SITE.success} className="btn btn-lg btn-ink" target="_blank" rel="noopener">Visit RVParkSuccess ↗</a>
          </div>
          <div className="res-grid">
            {resources.map((r, i) => (
              <Link key={r.q} href={r.post ? `/${r.post.slug}/` : '/blog-buying-and-selling-rv-parks/'} className="res-card" data-cursor="Read">
                <span className="res-img" data-img-reveal>{r.post?.featuredImage ? <img src={r.post.featuredImage} alt="" loading="lazy" /> : null}</span>
                <span className="res-body">
                  <span className="res-n">0{i + 1}</span>
                  <span className="res-q">{r.q}</span>
                  <span className="res-text">{r.text}</span>
                  <span className="res-cta">Read More <Arrow /></span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final seller CTA */}
      <section className="final-cta cn-ink">
        <div className="final-bg" style={{ backgroundImage: 'url(/images/site/rv-parks-3.jpg)' }} data-parallax="0.2" aria-hidden="true" />
        <Marquee items={['Let’s talk', 'Free consultation', 'What is my park worth?']} className="mq-giant" speed={30} sep="●" />
        <div className="l-section-h final-in">
          <p className="final-lede" data-reveal>Thinking about selling your RV park? Whether you’re ready today, considering it for the future, or simply want to know what your park could be worth, start with a conversation.</p>
          <div className="btn-row center-row" data-reveal>
            <button type="button" className="btn btn-lg seller-consultation" data-magnetic="0.4">Get a Free RV Park Consultation</button>
            <a href={SITE.calendly} className="btn btn-lg btn-ghost" target="_blank" rel="noopener">Find Out What Your Park May Be Worth ↗</a>
          </div>
        </div>
      </section>
    </>
  );
}
