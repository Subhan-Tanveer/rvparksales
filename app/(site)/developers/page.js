import PeopleArchive from '@/components/PeopleArchive';
import PageBand from '@/components/PageBand';
import { developers, loadContent } from '@/lib/content';

export const metadata = {
  title: 'Developers',
  description: 'RV Park Developers on RVParkSales.com.',
  alternates: { canonical: '/developers/' },
};

export default async function DevelopersPage() {
  await loadContent();
  return (
    <>
      <PageBand title="RV Park Developers" kicker="Build from the ground up" sub="Specialists who take bare land through entitlement, design and construction to a working RV park." crumbs={[{ label: 'Developers' }]} />
      <section className="l-section s-medium-72">
        <div className="l-section-h">
          <PeopleArchive people={developers()} basePath="developer" />
        </div>
      </section>
    </>
  );
}
