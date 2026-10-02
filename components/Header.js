'use client';
import { useState } from 'react';
import Link from 'next/link';

const NAV = [
  { href: '/listings/?_listing_status=for-sale', label: 'Buy a Park' },
  { href: '/sell-my-rv-park/', label: 'Sell a Park' },
  { href: 'https://rvparkselect.com', label: 'RVParkSelect', external: true },
  { href: 'https://rvparkads.com', label: 'RVParkAds', external: true },
  { href: '/brokers/', label: 'Brokers' },
  { href: '/blog-buying-and-selling-rv-parks/', label: 'Blog' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const linkProps = (n) => (n.external ? { target: '_blank', rel: 'noopener' } : {});
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="logo" aria-label="RVParkSales.com home">
          <img src="/images/logo.png" alt="RVParkSales.com" width="108" height="50" />
        </Link>
        <nav className="nav-desktop" aria-label="Main">
          {NAV.map((n) => (n.external
            ? <a key={n.label} href={n.href} {...linkProps(n)}>{n.label}</a>
            : <Link key={n.label} href={n.href}>{n.label}</Link>))}
        </nav>
        <div className="header-cta">
          <Link href="/listings/?_listing_status=for-sale" className="btn btn-ghost btn-sm">Search Parks</Link>
          <Link href="/contact/" className="btn btn-primary btn-sm">Free Consultation</Link>
        </div>
        <button type="button" className="menu-btn" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <nav id="mobile-nav" className={`nav-mobile ${open ? 'open' : ''}`} aria-label="Mobile">
        {NAV.map((n) => (n.external
          ? <a key={n.label} href={n.href} {...linkProps(n)} onClick={() => setOpen(false)}>{n.label}</a>
          : <Link key={n.label} href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>))}
        <Link href="/contact/" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>Get a Free Consultation</Link>
      </nav>
    </header>
  );
}
