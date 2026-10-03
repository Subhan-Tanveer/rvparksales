import Link from 'next/link';
import HomeHero from '@/components/HomeHero';
import ReviewsSlider from '@/components/ReviewsSlider';
import SellerForm from '@/components/SellerForm';
import { posts, testimonials } from '@/lib/content';

export const metadata = {
  title: { absolute: 'RV Park Sales - USA - RV Parks and Campgrounds For Sale' },
  alternates: { canonical: '/' },
};

// The home page follows the current rvparksales.com: hero, "Look to Us!",
// Latest News, Our Latest Reviews, then the footer.
export default function Home() {
  const latest = posts().slice(0, 2);
  // Same carousel as the old home page: newest reviews first (the three made-up
  // "RV Park Owner" reviews the old site still shows were never imported).
  const reviews = [...testimonials()].reverse().slice(0, 7);

  return (
    <>
      <HomeHero />

      <section className="l-section look-us">
        <div className="l-section-h">
          <div style={{ height: 81 }} />
          <p className="eyebrow">Buyers &amp; Sellers</p>
          <h2 className="sec-title">Look to Us!</h2>
          <p className="sec-lede">If you’re looking for an RV park and campground for sale, this is the right place!</p>
          <p className="sec-lede" style={{ marginBottom: 0 }}>On this site you can connect to an RV Park or Campground Broker for a Free Consultation.</p>
          <hr className="hr-blue" />

          <div className="cols-2">
            <div className="photo-card" style={{ backgroundImage: 'url(/images/site/RV-PARKS.webp)' }}>
              <h3>Buyers</h3>
              <p>Search our database to find RV Parks and Campgrounds for sale across the USA. Browse active listings, view property details, and connect directly with the listing broker to make your offer.</p>
              <div className="btns"><Link href="/listings/?_listing_status=for-sale" className="btn">Search for Parks</Link></div>
            </div>
            <div className="photo-card" style={{ backgroundImage: 'url(/images/site/mobile-home-parks-1.jpg)' }}>
              <h3>Sellers</h3>
              <p>Ready to get your RV park in front of thousands of qualified buyers? View our advertising plans and start getting serious inquiries today.</p>
              <div className="btns">
                <Link href="/sell-my-rv-park/" className="btn">Sell Your Park</Link>
                <Link href="/sell-my-rv-park/#plans" className="btn">View Advertising Plans</Link>
              </div>
            </div>
          </div>

          <hr className="hr-blue" />
          <div className="link-list sec-lede">
            <p>You can compare selling an RV Park privately vs a Broker.</p>
            <p>You can find out what you RV Park or Campground is worth.</p>
            <p>You can place your RV park for sale with photos and info.</p>
            <p>You can find the best Broker for your RV park sale.</p>
            <p>You can find an RV park business for sale here.</p>
            <p>You can search for an RV Resort for sale on this site.</p>
            <p>You can List with an RV Park Brokerage.</p>
            <p>You can find Mobile Home and RV Park combos here.</p>
          </div>
          <p className="sec-lede" style={{ marginBottom: 0 }}>We are constantly adding inventory, so if you are interested in buying a RV park or other property types, check back often or register to have property notices sent to you, and each time we add a park for sale, you will be notified!</p>
          <div style={{ height: 27 }} />
        </div>
      </section>

      <section className="l-section s-huge alt news-sec">
        <div className="sec-img" style={{ backgroundImage: 'url(/images/site/1956989740-scaled.jpg)' }} />
        <div className="l-section-h">
          <p className="eyebrow">From the Blog</p>
          <h2 className="sec-title">Latest News</h2>
          <hr className="hr-blue" />
          <div className="news-grid">
            {latest.map((p) => (
              <Link key={p.slug} href={`/${p.slug}/`} className="news-card" aria-label={p.title}>
                <div className="body">
                  <span className="cat">{(p.categories.length ? p.categories : ['Blog']).join(', ')}</span>
                  <h2>{p.title}</h2>
                </div>
                {p.featuredImage && <div className="img"><img src={p.featuredImage} alt="" loading="lazy" /></div>}
              </Link>
            ))}
          </div>
          <SellerForm />
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
    </>
  );
}
