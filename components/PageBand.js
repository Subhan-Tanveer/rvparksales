// The photo strip under the header on every inner page of the old site:
// the same campground photo with the teal tint, page title in white.
// Listings and blog posts use their own photo and no title (tall = false).
export default function PageBand({ title, image = '/images/site/1956989740-scaled.jpg', as: Tag = 'h1' }) {
  if (!title) return <div className="title-band" style={{ backgroundImage: `url(${image})` }} />;
  return (
    <section className="page-band" style={{ backgroundImage: `url(${image})` }}>
      <div className="l-section-h"><Tag>{title}</Tag></div>
    </section>
  );
}
