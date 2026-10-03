import PeopleArchive from '@/components/PeopleArchive';
import { GfPopup } from '@/components/GfForm';
import { brokers } from '@/lib/content';

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

export default function BrokersPage() {
  return (
    <section className="l-section s-medium-72">
      <div className="l-section-h">
        <h1 style={{ margin: 0 }}>Brokers</h1>
        <div style={{ height: 27 }} />
        <p>Thanks for checking out the RV Park Brokers section of RVParkSales.com.&nbsp; If you are considering selling your RV Park or Campground soon or if you are waiting into the future, it’s never too soon to get acquainted with an experienced RV Park Broker.&nbsp; You may have questions that only an experienced Broker can answer.&nbsp; There’s no obligation, so start your research here by filling in the contact info and add any extra info you want to share in the Add Note box. A professional Broker who is licensed in your state will be in touch.</p>
        <button type="button" className="btn broker-info">Get Broker Information</button>
        <div style={{ height: 54 }} />
        <PeopleArchive people={brokers()} basePath="broker" />
      </div>
      <GfPopup triggerClass="broker-info" title="Get Broker Information" width={800} form="Broker Information" fields={FIELDS} />
    </section>
  );
}
