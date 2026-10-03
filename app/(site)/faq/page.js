import PageBand from '@/components/PageBand';
import FaqAccordion from '@/components/FaqAccordion';
import { SITE, loadContent, faqs } from '@/lib/content';

export const metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about RVParkSales.com, selling an RV park or campground, broker listings and advertising plans.',
  alternates: { canonical: '/faq/' },
};

export default async function FaqPage() {
  await loadContent();
  const items = faqs();
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: items.filter((i) => i.a).map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageBand title="Frequently Asked Questions" kicker="Answers" sub="Everything buyers, sellers and brokers ask us about RVParkSales.com." crumbs={[{ label: 'FAQ' }]} />
      <section className="l-section s-medium-72">
        <div className="l-section-h">
          <FaqAccordion items={items} adsUrl={SITE.ads} />
        </div>
      </section>
    </>
  );
}
