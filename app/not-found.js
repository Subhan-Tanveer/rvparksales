export const metadata = { title: 'Page not found' };

// Same wording and layout as the old site's 404 page.
export default function NotFound() {
  return (
    <section className="l-section s-medium-72">
      <div className="l-section-h center">
        <h1>Page not found</h1>
        <p>The link you followed may be broken, or the page may have been removed.</p>
      </div>
    </section>
  );
}
