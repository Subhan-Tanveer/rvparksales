import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import { SITE, listingsForSale, listingsSold, brokers, testimonials, posts, siteStats, textOf } from '@/lib/content';

export const metadata = {
  title: { absolute: 'RV Park Sales — RV Parks and Campgrounds For Sale in the USA' },
};

function SearchBar({ states }) {
  return (
    <form className="searchbar" action="/listings/" method="get" aria-label="Search RV parks for sale">
      <input type="hidden" name="_listing_status" value="for-sale" />
      <select name="state" aria-label="State" defaultValue="">
        <option value="">Any state</option>
        {states.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <select name="_listing_category" aria-label="Property type" defaultValue="">
        <option value="">All property types</option>
        <option value="rv-parks-campgrounds">RV Parks / Campgrounds</option>
        <option value="rv-lots">RV Lots</option>
        <option value="rv-mh-communities">RV / MH Communities</option>
      </select>
      <select name="max" aria-label="Maximum price" defaultValue="">
        <option value="">Any price</option>
        <option value="500000">Up to $500,000</option>
        <option value="1000000">Up to $1 million</option>
        <option value="2500000">Up to $2.5 million</option>
        <option value="5000000">Up to $5 million</option>
      </select>
      <input name="q" placeholder="Keyword (optional)" aria-label="Keyword" />
      <button type="submit" className="btn btn-primary">Search Parks</button>
    </form>
  );
}

export default function Home() {
  const stats = siteStats();
  const forSale = listingsForSale().filter((l) => l.featuredImage && l.priceUsd).slice(0, 6);
  const sold = listingsSold().filter((l) => l.featuredImage).slice(0, 6);
  const states = [...new Set([...listingsForSale(), ...listingsSold()].map((l) => l.state).filter(Boolean))].sort();
  // Show three real, reasonably short reviews on the home page; all of them live on /reviews/.
  const quotes = testimonials().filter((t) => t.quote.length > 70 && t.quote.length < 330).slice(0, 3);
  const latest = posts().slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow" style={{ color: '#9be3bd' }}>America's RV Park Marketplace</p>
          <h1>Buy. Sell. Advertise.<br />RV Parks &amp; Campgrounds.</h1>
          <p className="lede">Where RV park buyers, sellers, brokers and owners come together. Choose your path:</p>

          <div className="hero-grid">
            <div className="path-card">
              <span className="path-tag tag-buyer">For Buyers</span>
              <h3>I want to buy an RV park</h3>
              <p>Search parks and campgrounds for sale nationwide and connect with the listing broker. Want to hear about new parks first? Join RVParkSelect from $29 a month.</p>
              <div className="btns">
                <Link href="/listings/?_listing_status=for-sale" className="btn btn-primary">Search Parks For Sale</Link>
                <a href={SITE.select} className="btn btn-ghost" target="_blank" rel="noopener">Get First-Look Access →</a>
              </div>
            </div>
            <div className="path-card">
              <span className="path-tag tag-seller">For Sellers</span>
              <h3>I want to sell my RV park</h3>
              <p>Work with an experienced RV park broker, or advertise your park yourself to qualified buyers with RVParkAds, plans from $99 a month.</p>
              <div className="btns">
                <Link href="/sell-my-rv-park/" className="btn btn-purple">Sell My RV Park</Link>
                <a href={SITE.ads} className="btn btn-ghost" target="_blank" rel="noopener">Advertise It Myself →</a>
              </div>
            </div>
          </div>

          <SearchBar states={states} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="stats">
            <div className="stat"><strong>{stats.forSale}</strong><span>parks for sale now</span></div>
            <div className="stat"><strong>{stats.sold}</strong><span>sold listings</span></div>
            <div className="stat"><strong>{stats.states}</strong><span>states with listings</span></div>
            <div className="stat"><strong>{stats.brokers}</strong><span>RV park brokers</span></div>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="wrap">
          <p className="eyebrow">One marketplace</p>
          <h2>Four ways to take part</h2>
          <p className="lede" style={{ marginBottom: 24 }}>RVParkSales.com is the marketplace. These services work alongside it.</p>
          <div className="grid grid-4">
            <div className="card brand-card">
              <h3>RVParkSales.com</h3>
              <div className="sub">Buy &amp; sell RV parks</div>
              <p>Search parks, campgrounds and RV communities for sale across the USA, and connect with RV park brokers.</p>
              <Link href="/listings/?_listing_status=for-sale" className="link-arrow">Explore properties →</Link>
            </div>
            <div className="card brand-card b-select">
              <h3>RVParkSelect</h3>
              <div className="sub">First look for buyers</div>
              <p>Get early alerts on new RV park listings, potentially up to five days before the public. Memberships from $29 a month.</p>
              <a href={SITE.select} className="link-arrow" target="_blank" rel="noopener">Become a member →</a>
            </div>
            <div className="card brand-card b-ads">
              <h3>RVParkAds</h3>
              <div className="sub">Advertise your park</div>
              <p>Sell it yourself: put your park in front of qualified buyers without a broker. Plans from $99 a month.</p>
              <a href={SITE.ads} className="link-arrow" target="_blank" rel="noopener">See ad plans →</a>
            </div>
            <div className="card brand-card b-success">
              <h3>RVParkSuccess</h3>
              <div className="sub">For park owners</div>
              <p>A done-for-you website, marketing and booking system to help RV park owners fill more sites.</p>
              <a href={SITE.success} className="link-arrow" target="_blank" rel="noopener">Learn more →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="head-row">
            <div><p className="eyebrow">Featured</p><h2>RV parks for sale</h2></div>
            <Link href="/listings/?_listing_status=for-sale" className="link-arrow">View all {stats.forSale} →</Link>
          </div>
          <div className="grid grid-3">{forSale.map((l) => <ListingCard key={l.slug} l={l} />)}</div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="banner banner-green">
            <div>
              <p className="eyebrow">RVParkSelect</p>
              <h2>Want to see RV parks before everyone else?</h2>
              <p>Choose your states and price range and get alerts on new listings before they are published here, potentially up to five days early. Private, members-only, built for serious buyers.</p>
            </div>
            <a href={SITE.select} className="btn btn-primary" target="_blank" rel="noopener">Get First-Look Access</a>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="wrap">
          <p className="eyebrow">For sellers</p>
          <h2>Thinking about selling your RV park?</h2>
          <p className="lede" style={{ marginBottom: 24 }}>You have more than one way to sell.</p>
          <div className="grid grid-3">
            <div className="card card-pad">
              <h3>1. Sell with a broker</h3>
              <p>Professional representation, pricing guidance, negotiation and transaction support from an experienced RV park broker.</p>
              <Link href="/brokers/" className="link-arrow">Meet our brokers →</Link>
            </div>
            <div className="card card-pad">
              <h3>2. Advertise it yourself</h3>
              <p>Use RVParkAds to put your park in front of RV park buyers without hiring a broker. Plans from $99 a month.</p>
              <a href={SITE.ads} className="link-arrow" target="_blank" rel="noopener">See RVParkAds plans →</a>
            </div>
            <div className="card card-pad">
              <h3>3. Not sure yet?</h3>
              <p>Talk it through with us. Whether you are ready now or thinking ahead, a free 30-minute conversation is a good place to start.</p>
              <a href={SITE.calendly} className="link-arrow" target="_blank" rel="noopener">Schedule a free consultation →</a>
            </div>
          </div>
        </div>
      </section>

      {sold.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="head-row">
              <div><p className="eyebrow">Track record</p><h2>Recently sold</h2></div>
              <Link href="/listings/?_listing_status=sold" className="link-arrow">All {stats.sold} sold listings →</Link>
            </div>
            <div className="grid grid-3">{sold.map((l) => <ListingCard key={l.slug} l={l} />)}</div>
          </div>
        </section>
      )}

      <section className="section soft">
        <div className="wrap">
          <div className="head-row">
            <div><p className="eyebrow">Our brokers</p><h2>RV park brokers nationwide</h2></div>
            <Link href="/brokers/" className="link-arrow">All brokers →</Link>
          </div>
          <div className="grid grid-4">
            {brokers().slice(0, 4).map((b) => (
              <Link key={b.slug} href={`/broker/${b.slug}/`} className="card broker-card">
                {b.photo ? <img src={b.photo} alt={b.name} loading="lazy" /> : null}
                <strong>{b.name}</strong>
                <span className="lcard-meta">{b.licenseState ? `Licensed in ${b.licenseState}` : 'RV park broker'}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {quotes.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="head-row">
              <div><p className="eyebrow">Reviews</p><h2>What buyers, sellers and brokers say</h2></div>
              <Link href="/reviews/" className="link-arrow">Read more reviews →</Link>
            </div>
            <div className="grid grid-3">
              {quotes.map((t) => (
                <figure key={t.name} className="card quote" style={{ margin: 0 }}>
                  <p>“{t.quote}”</p>
                  <cite>— {t.name}</cite>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section soft">
        <div className="wrap">
          <div className="head-row">
            <div><p className="eyebrow">From the blog</p><h2>RV park buying &amp; selling insights</h2></div>
            <Link href="/blog-buying-and-selling-rv-parks/" className="link-arrow">All articles →</Link>
          </div>
          <div className="grid grid-3">
            {latest.map((p) => (
              <Link key={p.slug} href={`/${p.slug}/`} className="card lcard">
                <div className="lcard-body">
                  <div className="lcard-meta">{new Date(p.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <h3 style={{ margin: '6px 0' }}>{p.title}</h3>
                  <p className="lcard-meta">{textOf(p.contentHtml, 120)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="banner banner-purple">
            <div>
              <h2>Let's talk about your RV park</h2>
              <p>Ready to buy, ready to sell, or just want to understand your options? Start with a free conversation.</p>
            </div>
            <a href={SITE.calendly} className="btn btn-purple" target="_blank" rel="noopener">Get a Free Consultation</a>
          </div>
        </div>
      </section>
    </>
  );
}
