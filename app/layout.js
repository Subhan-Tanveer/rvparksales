import { Rubik, Montserrat, Anton } from 'next/font/google';
import { SITE } from '@/lib/content';

// Root: fonts and the <html>/<body> only. Public pages get the site shell
// from app/(site)/layout.js; the admin gets its own layout in app/admin.
// Same two fonts as the current site: Rubik for text and the menu,
// Montserrat for headings; Anton for the giant condensed headlines.
const rubik = Rubik({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-rubik', display: 'swap' });
const montserrat = Montserrat({ subsets: ['latin'], weight: ['600', '700', '900'], variable: '--font-montserrat', display: 'swap' });
const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' });

// Runs before first paint: marks motion as on (heroes start hidden, then rise
// in) and skips the preloader after the first page of a visit.
const BOOT = `(function(){var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('js-motion');try{if(sessionStorage.getItem('rv-pl'))d.classList.add('pl-seen')}catch(e){}})();`;

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'RV Park Sales - USA - RV Parks and Campgrounds For Sale', template: '%s - RV Park Sales' },
  description: 'RV Park Sales brings buyers and sellers together to sell RV parks and campgrounds all over the US. Based in Panama City Beach, Florida.',
  openGraph: { siteName: 'RV Park Sales', type: 'website' },
  // Browser tab icon: the palm tree from the logo.
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' }, { url: '/icon-512.png', type: 'image/png', sizes: '512x512' }],
    apple: '/apple-touch-icon.png',
  },
  // Preview copies must not be indexed (see app/robots.txt/route.js); switched on at launch.
  robots: process.env.ALLOW_INDEXING === 'true' ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${rubik.variable} ${montserrat.variable} ${anton.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <noscript><style>{'.preloader{display:none!important}'}</style></noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
