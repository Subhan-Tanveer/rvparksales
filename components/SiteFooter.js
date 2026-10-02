import Link from 'next/link';
import { allListings } from '@/lib/content';

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const Icon = ({ d }) => (
  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

export default function SiteFooter() {
  const counts = {};
  allListings().forEach((l) => { if (l.state) counts[l.state] = (counts[l.state] || 0) + 1; });
  const states = Object.keys(counts).sort();

  return (
    <footer className="l-footer">
      <section className="f-states" style={{ backgroundImage: 'url(/images/site/rv-parks-1.jpg)' }}>
        <div className="l-section-h">
          <h2>RV Parks for Sale by State</h2>
          <ul>
            {states.map((s) => (
              <li key={s}><Link href={`/listing-state/${slugify(s)}/`}>{s} RV Parks and Campgrounds<span>{counts[s]}</span></Link></li>
            ))}
          </ul>
          <Link href="/listings/?_listing_status=for-sale" className="btn">Explore All Parks for Sale</Link>
        </div>
      </section>

      <section className="f-mid">
        <div className="l-section-h f-mid-h">
          <div><img src="/images/site/RV-Parks-FF-02.webp" alt="RV Park Sales" /></div>
          <div className="f-contact">
            <div className="row">
              <a href="https://calendly.com/marie-rvparksales/30min" aria-label="Schedule"><Icon d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4M12 13v4" /></a>
              <a href="https://letsmeet.io/rvparksales/15-minute-initial-consultation">Schedule a Free Consultation</a>
            </div>
            <div className="row">
              <Link href="/contact/" aria-label="Contact"><Icon d="M3 8l9-5 9 5v12H3zM3 8l9 6 9-6" /></Link>
              <Link href="/contact/">Get in Touch</Link>
            </div>
            <div className="row">
              <a href="tel:8508320022" aria-label="Call"><Icon d="M8 2h8a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V4a2 2 0 012-2zM11 18h2" /></a>
              <a href="tel:8508320022">850-832-0022</a>
            </div>
            <div className="f-social">
              <a href="https://www.linkedin.com/in/mariehansenrvparksales/" aria-label="LinkedIn" target="_blank" rel="noopener">in</a>
              <a href="https://www.youtube.com/channel/UC7q3GTW05fYrttdIvSAZs4Q" aria-label="YouTube" target="_blank" rel="noopener">▶</a>
              <a href="https://www.pinterest.com/rvparksales" aria-label="Pinterest" target="_blank" rel="noopener">P</a>
              <a href="https://www.instagram.com/rvparksalesfl/" aria-label="Instagram" target="_blank" rel="noopener">◎</a>
            </div>
          </div>
          <ul className="f-menu">
            <li><Link href="/listings/?_listing_category=rv-mh-communities&_listing_status=for-sale">RV / MV Communities</Link></li>
            <li><Link href="/listings/?_listing_category=rv-parks-campgrounds&_listing_status=for-sale">RV Campgrounds</Link></li>
            <li><Link href="/listings/?_listing_status=for-sale">All Listing for Sale</Link></li>
            <li><Link href="/listings/?_listing_status=sold">Sold Listings</Link></li>
          </ul>
          <ul className="f-menu">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about-selling-an-rv-park/">About Us</Link></li>
            <li><Link href="/listings/?_listing_status=for-sale">Explore Parks</Link></li>
            <li><Link href="/brokers/">RV Park Brokers</Link></li>
            <li><Link href="/developers/">RV Park Developers</Link></li>
            <li><Link href="/reviews/">Reviews</Link></li>
            <li><Link href="/faq/">FAQ</Link></li>
            <li><Link href="/contact/">Contact</Link></li>
            <li><Link href="/blog-buying-and-selling-rv-parks/">Blog</Link></li>
          </ul>
        </div>
      </section>

      <section className="f-bar">
        <div className="l-section-h">
          <span>© {new Date().getFullYear()} RV Park Sales. All rights reserved.</span>
          <span><Link href="/sitemap/">Sitemap</Link> | <Link href="/privacy-policy-tos/">Privacy Policy and Terms of Service</Link></span>
        </div>
      </section>
    </footer>
  );
}
