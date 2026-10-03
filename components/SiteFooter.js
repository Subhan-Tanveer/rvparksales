import Link from 'next/link';
import { allListings } from '@/lib/content';

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Thin-line icons standing in for the Font Awesome Pro "light" icons on the old site.
const ICONS = {
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="1.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4M12 12v4.2M12 18.2v.3" /></>,
  envelope: <><path d="M3 10l9-6.5 9 6.5v10.5H3z" /><path d="M3 10l9 6 9-6" /><path d="M7 8.5h10M7 11h10" /></>,
  mobile: <><rect x="6.5" y="2.5" width="11" height="19" rx="1.8" /><path d="M10.5 18.5h3M9 5.5h6" /></>,
};
const Icon = ({ name }) => (
  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[name]}</svg>
);

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mariehansenrvparksales/', cls: 'li', path: 'M6.9 8.6H3.6V20h3.3zM5.2 3.5a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM20.4 13.6c0-3-1.6-5.2-4.5-5.2-1.6 0-2.6.9-3 1.6V8.6H9.6V20h3.3v-5.8c0-1.6.6-2.9 2.2-2.9 1.6 0 1.9 1.4 1.9 2.9V20h3.4z' },
  { label: 'YouTube', href: 'https://www.youtube.com/channel/UC7q3GTW05fYrttdIvSAZs4Q', cls: 'yt', path: 'M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5.2 3z' },
  { label: 'Pinterest', href: 'https://www.pinterest.com/rvparksales', cls: 'pi', path: 'M12.3 2C6.8 2 4 5.9 4 9.2c0 2 .8 3.7 2.4 4.4.3.1.5 0 .6-.3l.2-.9c.1-.3 0-.4-.2-.7-.5-.6-.8-1.3-.8-2.4 0-3.1 2.3-5.9 6-5.9 3.3 0 5.1 2 5.1 4.7 0 3.5-1.6 6.5-3.9 6.5-1.3 0-2.2-1-1.9-2.3.4-1.5 1.1-3.2 1.1-4.3 0-1-.5-1.8-1.6-1.8-1.3 0-2.3 1.3-2.3 3.1 0 1.1.4 1.9.4 1.9l-1.5 6.5c-.4 1.9-.1 4.3 0 4.5 0 .1.2.2.3.1.1-.1 1.4-1.8 1.9-3.4l.7-2.9c.4.7 1.5 1.4 2.7 1.4 3.5 0 5.9-3.2 5.9-7.5C20 5.1 16.6 2 12.3 2z' },
  { label: 'Instagram', href: 'https://www.instagram.com/rvparksalesfl/', cls: 'ig', path: 'M12 7.3a4.7 4.7 0 100 9.4 4.7 4.7 0 000-9.4zm0 7.7a3 3 0 110-6 3 3 0 010 6zm6-7.9a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0zM21.9 8.2c-.1-1.6-.4-3-1.6-4.2S17.4 2.4 15.8 2.3C14.2 2.2 9.8 2.2 8.2 2.3 6.6 2.4 5.2 2.8 4 3.9S2.4 6.6 2.3 8.2c-.1 1.6-.1 6 0 7.6.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.6.1 6 .1 7.6 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.6.1-6 0-7.6zM19.8 17.6a3.1 3.1 0 01-1.7 1.7c-1.2.5-4 .4-5.3.4s-4.1.1-5.3-.4a3.1 3.1 0 01-1.7-1.7c-.5-1.2-.4-4-.4-5.3s-.1-4.1.4-5.3a3.1 3.1 0 011.7-1.7c1.2-.5 4-.4 5.3-.4s4.1-.1 5.3.4a3.1 3.1 0 011.7 1.7c.5 1.2.4 4 .4 5.3s.1 4.1-.4 5.3z' },
];

export default function SiteFooter() {
  const counts = {};
  allListings().forEach((l) => { if (l.state) counts[l.state] = (counts[l.state] || 0) + 1; });
  const states = Object.keys(counts).sort();

  return (
    <footer className="l-footer">
      <section className="f-states">
        <div className="f-states-img" style={{ backgroundImage: 'url(/images/site/rv-parks-1.jpg)' }} />
        <div className="l-section-h">
          <h2>RV Parks for Sale by State</h2>
          <div className="f-line" />
          <ul>
            {states.map((s) => (
              <li key={s}><Link href={`/listing-state/${slugify(s)}/`}>{s} RV Parks and Campgrounds&nbsp;<b>{counts[s]}</b></Link></li>
            ))}
          </ul>
          <div className="f-line" />
          <Link href="/listings/?_listing_status=for-sale" className="btn btn-2">Explore All Parks for Sale</Link>
        </div>
      </section>

      <section className="f-mid">
        <div className="f-mid-img" style={{ backgroundImage: 'url(/images/site/1956989740-scaled.jpg)' }} />
        <div className="l-section-h f-mid-h">
          <div className="f-card f-card-main">
            <div className="f-logo"><img src="/images/logo-light.png" alt="RV Park Sales" width="373" height="172" /></div>
            <div className="f-contact">
              <div className="row">
                <a href="https://calendly.com/marie-rvparksales/30min" target="_blank" rel="noopener" aria-label="Schedule"><Icon name="calendar" /></a>
                <a className="buyer-consultation" href="https://letsmeet.io/rvparksales/15-minute-initial-consultation">Schedule a Free Consultation</a>
              </div>
              <div className="f-dots" />
              <div className="row">
                <Link href="/contact/" aria-label="Contact"><Icon name="envelope" /></Link>
                <Link href="/contact/">Get in Touch</Link>
              </div>
              <div className="f-dots" />
              <div className="row">
                <a href="tel:8508320022" aria-label="Call"><Icon name="mobile" /></a>
                <a href="tel:8508320022">850-832-0022</a>
              </div>
              <div className="f-dots" />
              <div className="f-social">
                {SOCIAL.map((s) => (
                  <a key={s.cls} className={s.cls} href={s.href} aria-label={s.label} target="_blank" rel="nofollow noopener">
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={s.path} /></svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="f-card">
            <ul className="f-menu">
              <li><Link href="/listings/?_listing_category=rv-mh-communities&_listing_status=for-sale">RV / MV Communities</Link></li>
              <li><Link href="/listings/?_listing_category=rv-parks-campgrounds&_listing_status=for-sale">RV Campgrounds</Link></li>
              <li><Link href="/listings/?_listing_status=for-sale">All Listing for Sale</Link></li>
              <li><Link href="/listings/?_listing_status=sold">Sold Listings</Link></li>
            </ul>
          </div>
          <div className="f-card">
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
        </div>
      </section>

      <div className="f-word" aria-hidden="true">{'RVParkSales'.split('').map((c, i) => <span key={i}>{c}</span>)}</div>

      <section className="f-bar">
        <div className="l-section-h">
          <p>© {new Date().getFullYear()} RV Park Sales. All Rights Reserved.</p>
          <p>Web Design by <a href="https://www.appnet.com/" target="_blank" rel="noopener">Appnet.com</a> |&nbsp;<Link href="/sitemap/">Sitemap</Link> | <Link href="/privacy-policy-tos/">Privacy Policy and Terms of Service</Link></p>
        </div>
      </section>
    </footer>
  );
}
