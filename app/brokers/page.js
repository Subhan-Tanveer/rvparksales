import PeopleArchive from '@/components/PeopleArchive';
import { brokers } from '@/lib/content';

export const metadata = {
  title: 'Brokers',
  description: 'RV Park Brokers on RVParkSales.com: experienced brokers who specialize in RV parks and campgrounds.',
  alternates: { canonical: '/brokers/' },
};

export default function BrokersPage() {
  return (
    <section className="l-section">
      <div className="l-section-h page-title-wrap">
        <h1 className="page-title">Brokers</h1>
        <p className="lede-sm" style={{ maxWidth: 1250 }}>
          Thanks for checking out the RV Park Brokers section of RVParkSales.com.  If you are considering selling your RV Park or Campground soon or if you are waiting into the future, it’s never too soon to get acquainted with an experienced RV Park Broker.  You may have questions that only an experienced Broker can answer.  There’s no obligation, so start your research here by filling in the contact info and add any extra info you want to share in the Add Note box. A professional Broker who is licensed in your state will be in touch.
        </p>
        <a href="/contact/#sellers" className="btn">Get Broker Information</a>
        <div style={{ height: 36 }} />
        <PeopleArchive people={brokers()} basePath="broker" />
      </div>
    </section>
  );
}
