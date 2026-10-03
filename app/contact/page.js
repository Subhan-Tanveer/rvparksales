import PageBand from '@/components/PageBand';
import { GfForm } from '@/components/GfForm';

export const metadata = {
  title: { absolute: 'Contact - RV Park Sales - RV Campground - Florida' },
  description: 'Contact RVParkSales.com about buying or selling an RV park or campground. Call 850-832-0022 or send a message.',
  alternates: { canonical: '/contact/' },
};

// Same form as the old Contact page (Gravity Forms #1), with the photo column on the right.
const FIELDS = [
  { key: 'name', type: 'name', label: 'Name', required: true },
  { key: 'email', type: 'email2', label: 'Email', required: true, half: true },
  { key: 'phone', type: 'phone', label: 'Phone', half: true },
  { key: 'describe', type: 'select', label: 'What best describes you?', required: true, options: ['Agent', 'Broker', 'Lender', 'Property Owner', 'Other'] },
  { key: 'buysell', type: 'select', label: 'Are you looking to buy or sell?', required: true, options: ['Buy', 'Sell', 'Other'], placeholder: false },
  { key: 'park', type: 'text', label: 'Park Name' },
  { key: 'region', type: 'text', label: 'Region/State', required: true },
  { key: 'message', type: 'textarea', label: 'Message/Comments', required: true },
];

export default function ContactPage() {
  return (
    <>
      <PageBand title="Contact" image="/images/site/RV-PARKS.webp" />
      <section className="l-section" id="sellers">
        <div className="l-section-h cols-2-1">
          <div>
            <div style={{ height: 54 }} />
            <GfForm form="Contact" fields={FIELDS} />
            <div style={{ height: 54 }} />
          </div>
          <div className="side-photo" style={{ backgroundImage: 'url(/images/site/rv-parks-3.jpg)' }} />
        </div>
      </section>
    </>
  );
}
