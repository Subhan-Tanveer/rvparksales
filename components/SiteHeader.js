'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Same menu as the current rvparksales.com: a white bar with the logo on the
// left and MENU on the right; the menu slides in from the left as a panel.
const MENU = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-selling-an-rv-park/' },
  {
    label: 'Explore Parks', href: '/listings/?_listing_status=for-sale',
    sub: [
      { label: 'RV Parks / Campgrounds', href: '/listings/?_listing_category=rv-parks-campgrounds&_listing_status=for-sale' },
      { label: 'RV Lots', href: '/listings/?_listing_category=rv-lots&_listing_status=for-sale' },
      { label: 'All Listings for Sale', href: '/listings/?_listing_status=for-sale' },
      { label: 'Sold Listings', href: '/listings/?_listing_status=sold' },
    ],
  },
  { label: 'RV Park Brokers', href: '/brokers/' },
  { label: 'RV Park Developers', href: '/developers/' },
  { label: 'Reviews', href: '/reviews/' },
  { label: 'FAQ', href: '/faq/' },
  {
    label: 'Contact', href: '/contact/',
    sub: [
      { label: 'Send a Message', href: '/contact/' },
      { label: 'Buyers', href: '/contact/#buyers' },
      { label: 'Sellers', href: '/contact/#sellers' },
      { label: 'Schedule a Free Consultation', href: 'https://calendly.com/marie-rvparksales/30min', external: true },
    ],
  },
  { label: 'Blog', href: '/blog-buying-and-selling-rv-parks/' },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href.split('?')[0].replace(/\/$/, '') + '/') || pathname === href.split('?')[0]);

  return (
    <>
      <header className={`l-header ${sticky ? 'is-sticky' : ''} ${open ? 'menu-open' : ''}`}>
        <div className="l-header-h">
          <Link href="/" className="logo" aria-label="RVParkSales.com home">
            <img src="/images/site/RV-Parks-FF-02.webp" alt="RV Park Sales" width="360" height="167" />
          </Link>
          <button type="button" className="menu-ctl" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(!open)}>
            <span>Menu</span><span className="burger"><i /></span>
          </button>
        </div>
      </header>
      <div className={`menu-scrim ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <nav id="site-menu" className={`menu-panel ${open ? 'open' : ''}`} aria-label="Main" aria-hidden={!open}>
        <ul>
          {MENU.map((item) => (
            <li key={item.label}>
              {item.sub ? (
                <>
                  <button type="button" className="sub-toggle" aria-expanded={expanded === item.label} onClick={() => setExpanded(expanded === item.label ? null : item.label)}>
                    <span>{item.label}</span><span className="chev" />
                  </button>
                  {expanded === item.label && (
                    <ul className="sub">
                      {item.sub.map((s) => (
                        <li key={s.label}>
                          {s.external
                            ? <a href={s.href} target="_blank" rel="noopener">{s.label}</a>
                            : <Link href={s.href}>{s.label}</Link>}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link href={item.href} className={isActive(item.href) ? 'active' : ''}>{item.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
