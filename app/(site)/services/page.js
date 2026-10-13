import PageBand from '@/components/PageBand';
import VendorArchive from '@/components/VendorArchive';
import VendorApply from '@/components/VendorApply';
import { vendors, loadContent } from '@/lib/content';
import { VENDOR_CATEGORIES, VENDOR_PRICE } from '@/lib/vendor-categories';

export const metadata = {
  title: 'Vendors and Services',
  description: 'Lenders, feasibility and market studies, appraisers, insurance and more: trusted services for RV park buyers, owners and developers.',
  alternates: { canonical: '/services/' },
};

export default async function ServicesPage() {
  await loadContent();
  return (
    <>
      <PageBand title="Vendors and Services" kicker="All things RV park" sub="Lenders, feasibility and market studies, appraisers, insurance and more: trusted services for RV park buyers, owners and developers." crumbs={[{ label: 'Services' }]}>
        <a href="#get-listed" className="btn btn-lg">Get Listed</a>
      </PageBand>
      <section className="l-section s-medium-72">
        <div className="l-section-h">
          <p className="lead-p">Buying, building or running an RV park takes more than a good property. Find the specialists who work with RV park investors every day, from financing to feasibility to insurance.</p>
          <div style={{ height: 40 }} />
          <VendorArchive vendors={vendors()} />
        </div>
      </section>
      <section className="l-section s-medium-72" id="get-listed">
        <div className="l-section-h">
          <h2>Put your company in front of RV park buyers</h2>
          <p className="lead-p">Do you serve RV park owners, buyers or developers? A listing in the Vendors and Services directory puts your firm where they are already looking.</p>
          <div style={{ height: 24 }} />
          <h3>${VENDOR_PRICE} per month</h3>
          <ul className="tick-list">
            <li>Your own page with your logo, up to 6 photos, a short description of what you do and your contact details</li>
            <li>Live as soon as you pay: no waiting, no emailing files</li>
            <li>Searchable by category on RVParkSales.com</li>
            <li>Inquiries from your listing come straight to you</li>
            <li>Cancel any time</li>
          </ul>
          <div style={{ height: 32 }} />
          <VendorApply categories={VENDOR_CATEGORIES} price={VENDOR_PRICE} />
        </div>
      </section>
    </>
  );
}
