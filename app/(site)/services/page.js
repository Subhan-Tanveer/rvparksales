import PageBand from '@/components/PageBand';
import VendorArchive from '@/components/VendorArchive';
import { GfPopup } from '@/components/GfForm';
import { vendors, loadContent } from '@/lib/content';
import { VENDOR_CATEGORIES, VENDOR_PRICE } from '@/lib/vendor-categories';

export const metadata = {
  title: 'Vendors and Services',
  description: 'Lenders, feasibility and market studies, appraisers, insurance and more: trusted services for RV park buyers, owners and developers.',
  alternates: { canonical: '/services/' },
};

const FIELDS = [
  { key: 'name', type: 'text', label: 'Your Name', required: true },
  { key: 'email', type: 'email', label: 'Email', required: true, half: true },
  { key: 'phone', type: 'phone', label: 'Phone', half: true },
  { key: 'company', type: 'text', label: 'Company Name', required: true },
  { key: 'companysite', type: 'text', label: 'Company Website' },
  { key: 'category', type: 'select', label: 'Category', required: true, options: VENDOR_CATEGORIES },
  { key: 'message', type: 'textarea', label: 'What does your company do or provide? (a short description for your listing)', required: true },
];

export default async function ServicesPage() {
  await loadContent();
  const pay = process.env.VENDOR_PAYMENT_URL;
  return (
    <>
      <PageBand title="Vendors and Services" kicker="All things RV park" sub="Lenders, feasibility and market studies, appraisers, insurance and more: trusted services for RV park buyers, owners and developers." crumbs={[{ label: 'Services' }]}>
        <button type="button" className="btn btn-lg vendor-list">Get Listed</button>
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
            <li>Your own page with your logo, a short description of what you do or provide, your service area and contact details</li>
            <li>Searchable by category on RVParkSales.com</li>
            <li>Inquiries from your listing come straight to you</li>
            <li>Cancel any time</li>
          </ul>
          <div style={{ height: 24 }} />
          {pay
            ? <a href={pay} className="btn btn-lg" target="_blank" rel="noopener">Get Listed, ${VENDOR_PRICE}/month</a>
            : <button type="button" className="btn btn-lg vendor-list">Get Listed, ${VENDOR_PRICE}/month</button>}
        </div>
      </section>
      <GfPopup triggerClass="vendor-list" title="Get Listed in Vendors and Services" width={800} form="Services Directory Listing" fields={FIELDS} />
    </>
  );
}
