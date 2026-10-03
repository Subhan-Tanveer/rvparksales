import PageBand from '@/components/PageBand';
import ReviewWall from '@/components/home/ReviewWall';
import Split from '@/components/fx/Split';
import { testimonials, loadContent } from '@/lib/content';

export const metadata = {
  title: { absolute: 'Reviews - RV Park Sales - Pick the best RV Park Broker' },
  description: 'What RV park buyers, sellers and brokers say about working with RVParkSales.com and Marie Hansen.',
  alternates: { canonical: '/reviews/' },
};

// Reviews page: every review on the same scattered, taped-card wall as the
// home page (full text, newest first; made-up reviews were not imported).
export default async function ReviewsPage() {
  await loadContent();
  const items = [...testimonials()].reverse();
  return (
    <>
      <PageBand title="What Our Clients Say" kicker="Reviews" sub="Real words from RV park buyers, sellers and brokers we have worked with." crumbs={[{ label: 'Reviews' }]} />
      <section className="cn-sec cn-paper reviews-wall">
        <div className="l-section-h">
          <div className="cn-head cn-head-row">
            <div>
              <p className="eyebrow">({items.length}) Five-star reviews</p>
              <Split as="h2" text={'Straight from\n*our clients*'} className="cn-title" />
            </div>
            <a href="https://reviews.digitalrez.com/feedback/pages/add-review/NjY3MzA=" className="btn btn-lg btn-ink" target="_blank" rel="noopener">Leave A Review ↗</a>
          </div>
          <ReviewWall items={items} full />
        </div>
      </section>
    </>
  );
}
