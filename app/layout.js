import './globals.css';
import './redesign.css';
import Script from 'next/script';
import { Rubik, Montserrat } from 'next/font/google';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ConsultationPopup from '@/components/ConsultationPopup';
import Motion from '@/components/Motion';
import { SITE } from '@/lib/content';

// Same two fonts as the current site: Rubik for text and the menu,
// Montserrat for headings.
const rubik = Rubik({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-rubik', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['600', '700', '900'], variable: '--font-montserrat', display: 'swap' });

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'RV Park Sales - USA - RV Parks and Campgrounds For Sale', template: '%s - RV Park Sales' },
  description: 'RV Park Sales brings buyers and sellers together to sell RV parks and campgrounds all over the US. Based in Panama City Beach, Florida.',
  openGraph: { siteName: 'RV Park Sales', type: 'website' },
  // Preview copies must not be indexed (see app/robots.txt/route.js); switched on at launch.
  robots: process.env.ALLOW_INDEXING === 'true' ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }) {
  // Third-party widgets the current site already uses (GoHighLevel chat,
  // DigitalRez review popup, Google Analytics). They only load on the real
  // domain, so the preview does not send visits or chats to Marie's accounts.
  const live = process.env.ALLOW_INDEXING === 'true';
  return (
    <html lang="en" className={`${rubik.variable} ${montserrat.variable}`}>
      <body>
        <SiteHeader />
        <main className="l-main">{children}</main>
        <SiteFooter />
        <ConsultationPopup />
        <Motion />
        {live && (
          <>
            <Script src="https://widgets.leadconnectorhq.com/loader.js" data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js" data-widget-id="69ef73357ae751e214e5f227" strategy="lazyOnload" />
            <Script src="https://digitalrez.reviewbadges.com/website_marketing/show_popup_widget/RK-50161-51962-15921-v2.js" strategy="lazyOnload" />
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-XZM1G5ZK6S" strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-XZM1G5ZK6S');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
