import PeopleArchive from '@/components/PeopleArchive';
import { developers } from '@/lib/content';

export const metadata = {
  title: 'Developers',
  description: 'RV Park Developers on RVParkSales.com.',
  alternates: { canonical: '/developers/' },
};

export default function DevelopersPage() {
  return (
    <section className="l-section s-medium-72">
      <div className="l-section-h">
        <h1 style={{ margin: 0 }}>Developers</h1>
        <div style={{ height: 27 }} />
        <PeopleArchive people={developers()} basePath="developer" />
      </div>
    </section>
  );
}
