'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const ICONS = {
  dash: 'M3 13h8V3H3zm0 8h8v-6H3zm10 0h8V11h-8zm0-18v6h8V3z',
  home: 'M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z',
  pen: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75z',
  file: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zm-1 7V3.5L18.5 9z',
  user: 'M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.4 0-8 2.2-8 5v3h16v-3c0-2.8-3.6-5-8-5z',
  star: 'M12 17.3l6.2 3.7-1.6-7 5.4-4.7-7.1-.6L12 2 9.1 8.7 2 9.3l5.4 4.7-1.6 7z',
  help: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 17h-2v-2h2zm2.1-7.8l-.9.9C13.4 12.9 13 13.5 13 15h-2v-.5c0-1.1.4-2.1 1.2-2.8l1.2-1.3A2 2 0 0012 7a2 2 0 00-2 2H8a4 4 0 118 0c0 .9-.4 1.7-.9 2.2z',
  tag: 'M21.4 11.6l-9-9A2 2 0 0011 2H4a2 2 0 00-2 2v7c0 .6.2 1.1.6 1.4l9 9c.4.4.9.6 1.4.6s1-.2 1.4-.6l7-7c.4-.4.6-.9.6-1.4s-.2-1.1-.6-1.4zM5.5 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z',
  ext: 'M14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3zm5 16H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2z',
  out: 'M10 17l1.4-1.4L8.8 13H20v-2H8.8l2.6-2.6L10 7l-5 5zM4 5h8V3H4a2 2 0 00-2 2v14a2 2 0 002 2h8v-2H4z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z',
};
export const Icon = ({ name }) => <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d={ICONS[name]} /></svg>;

const NAV = [
  ['/admin/', 'Dashboard', 'dash'],
  ['/admin/listings/', 'Listings', 'home'],
  ['/admin/posts/', 'Blog posts', 'pen'],
  ['/admin/categories/', 'Blog categories', 'tag'],
  ['/admin/pages/', 'Pages (About Us…)', 'file'],
  ['/admin/testimonials/', 'Reviews', 'star'],
  ['/admin/faq/', 'FAQ', 'help'],
  ['/admin/brokers/', 'Brokers', 'user'],
  ['/admin/developers/', 'Developers', 'user'],
];

export default function AdminShell({ children }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const on = (href) => (href === '/admin/' ? path === '/admin/' || path === '/admin' : path.startsWith(href.replace(/\/$/, '')));

  async function signOut() {
    await fetch('/api/admin/login/', { method: 'DELETE' });
    window.location.href = '/admin/login/';
  }

  return (
    <div className="adm-shell">
      <div className="adm-top">
        <img src="/images/logo-light.png" alt="RVParkSales" />
        <button type="button" onClick={() => setOpen(true)}>Menu</button>
      </div>
      {open && <div className="adm-scrim" onClick={() => setOpen(false)} />}
      <aside className={`adm-side ${open ? 'open' : ''}`}>
        <div className="adm-logo"><img src="/images/logo-light.png" alt="RVParkSales" /><span>Admin</span></div>
        <nav className="adm-nav">
          {NAV.map(([href, label, icon]) => (
            <Link key={href} href={href} className={on(href) ? 'on' : ''}><Icon name={icon} />{label}</Link>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a href="/" target="_blank" rel="noopener"><Icon name="ext" />View website</a>
          <button type="button" onClick={signOut}><Icon name="out" />Sign out</button>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
