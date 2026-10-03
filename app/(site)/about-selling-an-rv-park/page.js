import PageBand from '@/components/PageBand';
import { loadContent, pageBySlug } from '@/lib/content';

export const metadata = {
  title: { absolute: 'RV Park Sales - RV Parks - RV Campgrounds' },
  description: 'RVParkSales.com is a specialized marketing platform that connects RV park and campground owners with qualified buyers.',
  alternates: { canonical: '/about-selling-an-rv-park/' },
};

// Same as the old About Us page: text on the left two thirds, a full-height
// photo on the right third. The text is the "About Us" page Marie edits in
// /admin (Pages); its header image, when set, replaces the side photo.
export default async function AboutPage() {
  await loadContent();
  const page = pageBySlug('about-selling-an-rv-park');
  return (
    <>
      <PageBand title="About Us" kicker="Who we are" sub="America’s specialized marketplace for RV parks and campgrounds, connecting owners with serious buyers nationwide." crumbs={[{ label: 'About Us' }]} />
      <section className="l-section">
        <div className="l-section-h cols-2-1">
          <div>
            <div style={{ height: 81 }} />
            <div className="prose about-copy" dangerouslySetInnerHTML={{ __html: page?.contentHtml || '' }} />
            <hr className="hr-line" />
            <div style={{ height: 81 }} />
          </div>
          <div className="side-photo" style={{ backgroundImage: `url(${page?.featuredImage || '/images/site/mobile-home-parks-1.jpg'})` }} />
        </div>
      </section>
    </>
  );
}
