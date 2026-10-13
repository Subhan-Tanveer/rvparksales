'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Menu from Marie's new plan (Oct 2026): RVParkSales is the hub, with its three
// sister services in the main bar, plus the two key buttons. On large screens
// the links sit in a row (sub-menus on hover); on tablets/phones they move into
// the slide-in MENU panel.
const MENU = [
  {
    label: 'Buy a Park', href: '/listings/?_listing_status=for-sale',
    sub: [
      { label: 'All RV Parks for Sale', href: '/listings/?_listing_status=for-sale' },
      { label: 'RV Parks / Campgrounds', href: '/listings/?_listing_category=rv-parks-campgrounds&_listing_status=for-sale' },
      { label: 'RV Lots', href: '/listings/?_listing_category=rv-lots&_listing_status=for-sale' },
      { label: 'RV / MH Communities', href: '/listings/?_listing_category=rv-mh-communities&_listing_status=for-sale' },
      { label: 'Sold Listings', href: '/listings/?_listing_status=sold' },
      { label: 'Request a Buyer Consultation', href: '#', popup: 'buyer-consultation' },
    ],
  },
  {
    label: 'Sell a Park', href: '/sell-my-rv-park/',
    sub: [
      { label: 'Selling Options', href: '/#selling' },
      { label: 'Sell With a Broker', href: '/brokers/' },
      { label: 'Advertise It Yourself (RVParkAds)', href: 'https://rvparkads.com/#plans', external: true },
      { label: 'Request a Seller Consultation', href: '/contact/#sellers', popup: 'seller-consultation' },
      { label: 'RV Park Developers', href: '/developers/' },
    ],
  },
  { label: 'RVParkSelect', href: 'https://rvparkselect.com', external: true },
  { label: 'RVParkAds', href: 'https://rvparkads.com', external: true },
  { label: 'RVParkSuccess', href: 'https://www.rvparksuccess.com', external: true },
  {
    label: 'Resources', href: '/blog-buying-and-selling-rv-parks/',
    sub: [
      { label: 'Blog', href: '/blog-buying-and-selling-rv-parks/' },
      { label: 'RV Park Services', href: '/services/' },
      { label: 'FAQ', href: '/faq/' },
      { label: 'Reviews', href: '/reviews/' },
      { label: 'About Us', href: '/about-selling-an-rv-park/' },
      { label: 'Contact', href: '/contact/' },
    ],
  },
];

const ItemLink = ({ item, className, children, ...rest }) => (item.external
  ? <a href={item.href} className={className} target="_blank" rel="noopener" {...rest}>{children}</a>
  : <Link href={item.href} className={className} {...rest}>{children}</Link>);

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
            <img src="/images/logo-light.png" alt="RV Park Sales" width="373" height="172" />
          </Link>
          {/* Large screens: all links in a row, sub-menus open on hover/focus. */}
          <nav className="nav-desk" aria-label="Main">
            <ul>
              {MENU.map((item) => (
                <li key={item.label} className={item.sub ? 'has-drop' : ''}>
                  <ItemLink item={item} className={!item.external && isActive(item.href) ? 'active' : ''} aria-haspopup={item.sub ? 'true' : undefined}>
                    {item.label}{item.sub && <span className="chev" aria-hidden="true" />}{item.external && <span className="ext" aria-hidden="true">↗</span>}
                  </ItemLink>
                  {item.sub && (
                    <ul className="drop">
                      {item.sub.map((s) => (
                        <li key={s.label}>
                          {s.external
                            ? <a href={s.href} target="_blank" rel="noopener">{s.label}</a>
                            : s.popup
                              ? <a href={s.href} className={s.popup}>{s.label}</a>
                              : <Link href={s.href}>{s.label}</Link>}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="nav-ctas">
            <Link href="/listings/?_listing_status=for-sale" className="btn btn-sm">Search Parks</Link>
            <a href="https://calendly.com/marie-rvparksales/30min" className="btn btn-sm btn-2" target="_blank" rel="noopener">Free Consultation</a>
          </div>
          {/* Phones and tablets: MENU button with the slide-in panel. */}
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
                  <div className="has-sub">
                    <ItemLink item={item} className={!item.external && isActive(item.href) ? 'active' : ''}>{item.label}{item.external && <span className="ext" aria-hidden="true"> ↗</span>}</ItemLink>
                    <button type="button" className="sub-toggle" aria-label={`${item.label} Menu`} aria-expanded={expanded === item.label} onClick={() => setExpanded(expanded === item.label ? null : item.label)}>
                      <span className="chev" />
                    </button>
                  </div>
                  {expanded === item.label && (
                    <ul className="sub">
                      {item.sub.map((s) => (
                        <li key={s.label}>
                          {s.external
                            ? <a href={s.href} target="_blank" rel="noopener">{s.label}</a>
                            : s.popup
                              ? <a href={s.href} className={s.popup} onClick={() => setOpen(false)}>{s.label}</a>
                              : <Link href={s.href}>{s.label}</Link>}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <ItemLink item={item} className={!item.external && isActive(item.href) ? 'active' : ''}>{item.label}{item.external && <span className="ext" aria-hidden="true"> ↗</span>}</ItemLink>
              )}
            </li>
          ))}
        </ul>
        <div className="panel-ctas">
          <Link href="/listings/?_listing_status=for-sale" className="btn btn-block">Search Parks</Link>
          <a href="https://calendly.com/marie-rvparksales/30min" className="btn btn-block btn-2" target="_blank" rel="noopener">Get a Free Consultation</a>
        </div>
      </nav>
    </>
  );
}
