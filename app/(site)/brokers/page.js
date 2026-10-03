import PeopleArchive from '@/components/PeopleArchive';
import PageBand from '@/components/PageBand';
import { GfPopup } from '@/components/GfForm';
import { brokers, loadContent } from '@/lib/content';

export const metadata = {
  title: 'Brokers',
  description: 'RV Park Brokers on RVParkSales.com: experienced brokers who specialize in RV parks and campgrounds.',
  alternates: { canonical: '/brokers/' },
};

const FIELDS = [
  { key: 'name', type: 'text', label: 'Your Name', required: true },
  { key: 'email', type: 'email', label: 'Email', required: true, half: true },
  { key: 'phone', type: 'phone', label: 'Phone', half: true },
  { key: 'sell', type: 'radio', label: 'Are you looking to sell?', required: true, options: ['Yes', 'No'] },
  { key: 'park', type: 'text', label: 'Name of RV Park or Campground', required: true },
  { key: 'addr', type: 'address', label: 'Property Address' },
  { key: 'message', type: 'textarea', label: 'Message', required: true },
];

export default async function BrokersPage() {
  await loadContent();
  return (
    <>
    <PageBand title="RV Park Brokers" kicker="Our network" sub="Experienced brokers who specialize in RV parks and campgrounds, licensed across the country." crumbs={[{ label: 'Brokers' }]}>
      <button type="button" className="btn btn-lg broker-info">Get Broker Information</button>
    </PageBand>
    <section className="l-section s-medium-72">
      <div className="l-section-h">
        <p className="lead-p">Thanks for checking out the RV Park Brokers section of RVParkSales.com.&nbsp; If you are considering selling your RV Park or Campground soon or if you are waiting into the future, it’s never too soon to get acquainted with an experienced RV Park Broker.&nbsp; You may have questions that only an experienced Broker can answer.&nbsp; There’s no obligation, so start your research here by filling in the contact info and add any extra info you want to share in the Add Note box. A professional Broker who is licensed in your state will be in touch.</p>
        <div style={{ height: 40 }} />
        <PeopleArchive people={brokers()} basePath="broker" />
      </div>
      <GfPopup triggerClass="broker-info" title="Get Broker Information" width={800} form="Broker Information" fields={FIELDS} />
    </section>
    </>
  );
}
