import Link from 'next/link';
import { SITE } from '@/lib/content';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <span className="footer-logo"><img src="/images/logo.png" alt="RVParkSales.com" width="95" height="44" /></span>
            <p>America's RV park marketplace. Based in Panama City Beach, Florida, serving buyers, sellers and brokers of RV parks and campgrounds across the USA.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/listings/?_listing_status=for-sale">Parks For Sale</Link></li>
              <li><Link href="/listings/?_listing_status=sold">Sold Listings</Link></li>
              <li><Link href="/brokers/">RV Park Brokers</Link></li>
              <li><Link href="/blog-buying-and-selling-rv-parks/">Blog</Link></li>
              <li><Link href="/reviews/">Reviews</Link></li>
              <li><Link href="/faq/">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4>Our Services</h4>
            <ul>
              <li><a href={SITE.select} target="_blank" rel="noopener">RVParkSelect: first look for buyers</a></li>
              <li><a href={SITE.ads} target="_blank" rel="noopener">RVParkAds: advertise your park</a></li>
              <li><Link href="/sell-my-rv-park/">Sell My RV Park</Link></li>
              <li><Link href="/about-selling-an-rv-park/">About Selling an RV Park</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={SITE.phoneHref}>{SITE.phone}</a></li>
              <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              <li><a href={SITE.calendly} target="_blank" rel="noopener">Schedule a free consultation</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-fine">
          <p>&copy; {new Date().getFullYear()} RVParkSales.com. All rights reserved. · <Link href="/privacy-policy-tos/">Privacy &amp; Terms</Link> · <Link href="/confidentiality-and-non-disclosure-agreement/">Confidentiality Agreement</Link></p>
        </div>
      </div>
    </footer>
  );
}
