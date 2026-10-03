import PageBand from '@/components/PageBand';
import ReviewsGrid from '@/components/ReviewsGrid';
import { testimonials } from '@/lib/content';

export const metadata = {
  title: { absolute: 'Reviews - RV Park Sales - Pick the best RV Park Broker' },
  description: 'What RV park buyers, sellers and brokers say about working with RVParkSales.com and Marie Hansen.',
  alternates: { canonical: '/reviews/' },
};

export default function ReviewsPage() {
  // Newest first, like the old reviews grid (made-up reviews were not imported).
  const items = [...testimonials()].reverse();
  return (
    <>
      <PageBand title="What Our Clients Say" kicker="Reviews" sub="Real words from RV park buyers, sellers and brokers we have worked with." crumbs={[{ label: 'Reviews' }]} />
      <section className="l-section s-medium-72">
        <div className="l-section-h">
          <div className="center">
            <a href="https://reviews.digitalrez.com/feedback/pages/add-review/NjY3MzA=" className="btn" target="_blank" rel="noopener">Leave A Review</a>
          </div>
          <hr className="hr-line" style={{ height: 27 }} />
          <ReviewsGrid items={items} />
        </div>
      </section>
    </>
  );
}
