import './globals.css';
import { Inter, Poppins } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBar from '@/components/MobileBar';
import { SITE } from '@/lib/content';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-poppins', display: 'swap' });

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'RV Park Sales — RV Parks and Campgrounds For Sale in the USA', template: '%s | RVParkSales.com' },
  description: 'America\'s RV park marketplace. Search RV parks and campgrounds for sale, connect with RV park brokers, get first-look access with RVParkSelect, or advertise your park with RVParkAds.',
  openGraph: { siteName: 'RVParkSales.com', type: 'website' },
  // Preview copies must not be indexed (see app/robots.js); switched on at launch.
  robots: process.env.ALLOW_INDEXING === 'true' ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileBar />
      </body>
    </html>
  );
}
