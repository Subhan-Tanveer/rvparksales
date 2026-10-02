import PeopleArchive from '@/components/PeopleArchive';
import { developers } from '@/lib/content';

export const metadata = {
  title: 'Developers',
  description: 'RV Park Developers on RVParkSales.com.',
  alternates: { canonical: '/developers/' },
};

export default function DevelopersPage() {
  return (
    <section className="l-section">
      <div className="l-section-h page-title-wrap">
        <h1 className="page-title">Developers</h1>
        <PeopleArchive people={developers()} basePath="developer" />
      </div>
    </section>
  );
}
