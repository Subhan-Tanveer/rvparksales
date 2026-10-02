import { testimonials } from '@/lib/content';

export const metadata = {
  title: 'Reviews',
  description: 'What RV park buyers, sellers and brokers say about working with RVParkSales.com and Marie Hansen.',
  alternates: { canonical: '/reviews/' },
};

export default function ReviewsPage() {
  return (
    <section className="l-section">
      <div className="l-section-h page-title-wrap">
        <h1 className="page-title">Reviews</h1>
        <div className="grid-3" style={{ marginTop: 30 }}>
          {testimonials().map((t) => (
            <div key={t.name + t.date} className="testi">
              <p style={{ margin: 0 }}>{t.quote}</p>
              <div className="quote-name" style={{ marginLeft: 0 }}>{t.name.split(',')[0]}</div>
              <div className="quote-role" style={{ marginLeft: 0 }}>{t.name.includes(',') ? t.name.split(',').slice(1).join(',').trim() : 'RV Park Client'}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 34 }}><a href="https://reviews.digitalrez.com/feedback/pages/add-review/NjY3MzA=" className="btn" target="_blank" rel="noopener">Leave A Review</a></p>
      </div>
    </section>
  );
}
