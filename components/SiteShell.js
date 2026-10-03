import '@/app/globals.css';
import '@/app/redesign.css';
import '@/app/modern.css';
import '@/app/cinema.css';
import Script from 'next/script';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ConsultationPopup from '@/components/ConsultationPopup';
import Motion from '@/components/Motion';
import Chrome from '@/components/fx/Chrome';
import { loadContent } from '@/lib/content';

// Everything around a public page: preloader, header, footer, popups, the
// motion layer and the third-party widgets. The admin (/admin) has its own
// plain layout and never loads any of this.
export default async function SiteShell({ children }) {
  await loadContent();
  // Third-party widgets the current site already uses (GoHighLevel chat,
  // DigitalRez review popup, Google Analytics). They only load on the real
  // domain, so the preview does not send visits or chats to Marie's accounts.
  const live = process.env.ALLOW_INDEXING === 'true';
  return (
    <>
      <div className="preloader" aria-hidden="true">
        <img className="pl-logo" src="/images/logo-light.png" alt="" width="260" height="120" />
        <p className="pl-tag">America’s RV Park Marketplace</p>
        <div className="pl-bar"><i /></div>
        <span className="pl-num">000</span>
      </div>
      <SiteHeader />
      <main className="l-main">{children}</main>
      <SiteFooter />
      <ConsultationPopup />
      <Motion />
      <Chrome />
      {live && (
        <>
          <Script src="https://widgets.leadconnectorhq.com/loader.js" data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js" data-widget-id="69ef73357ae751e214e5f227" strategy="lazyOnload" />
          <Script src="https://digitalrez.reviewbadges.com/website_marketing/show_popup_widget/RK-50161-51962-15921-v2.js" strategy="lazyOnload" />
          <Script src="https://www.googletagmanager.com/gtag/js?id=G-XZM1G5ZK6S" strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-XZM1G5ZK6S');`}</Script>
        </>
      )}
    </>
  );
}
