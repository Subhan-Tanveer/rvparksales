import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allListings, listingBySlug, brokerByName, usd, textOf, SITE } from '@/lib/content';

export function generateStaticParams() { return allListings().map((l) => ({ slug: l.slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const l = listingBySlug(slug);
  if (!l) return {};
  return {
    title: l.seoTitle || l.title,
    description: l.seoDescription || textOf(l.summary || l.contentHtml, 155),
    alternates: { canonical: `/listing/${l.slug}/` },
    openGraph: { images: l.featuredImage ? [l.featuredImage] : [] },
  };
}

export default async function ListingPage({ params }) {
  const { slug } = await params;
  const l = listingBySlug(slug);
  if (!l) notFound();
  const sold = l.status === 'Sold';
  const broker = brokerByName(l.brokerName) || brokerByName('Marie Hansen');
  const photos = l.images.length ? l.images : (l.featuredImage ? [l.featuredImage] : []);
  const url = `${SITE.url}/listing/${l.slug}/`;
  const enc = encodeURIComponent;

  const facts = [
    ['Status', sold ? 'Sold' : 'For Sale'],
    ['Price', sold ? null : usd(l.priceUsd)],
    ['Property type', l.category],
    ['Number of sites', l.sites],
    ['Acres', l.acres],
    ['Room to expand', l.roomToExpand],
    ['State', l.state],
    ['Location', l.address],
  ].filter(([, v]) => v);

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'RealEstateListing', name: l.title, url,
    description: textOf(l.summary || l.contentHtml, 300), image: photos.slice(0, 4),
    ...(l.priceUsd && !sold ? { offers: { '@type': 'Offer', price: l.priceUsd, priceCurrency: 'USD' } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="title-band" style={l.featuredImage ? { backgroundImage: `url(${l.featuredImage})` } : undefined} />
      <section className="l-section">
        <div className="l-section-h detail" style={{ paddingTop: 54 }}>
          <div>
            <h1 style={{ marginBottom: '.5em' }}>{l.title}</h1>
            <div className="status-bar">
              <span>{sold ? 'Sold' : 'For Sale'}</span>
              {l.address && <span>⌖ {l.address}</span>}
            </div>
            {photos.length > 0 && <div className="gallery">{photos.map((src, i) => <img key={src} src={src} alt={`${l.title} photo ${i + 1}`} loading={i < 2 ? 'eager' : 'lazy'} />)}</div>}

            <h2 style={{ marginTop: 48 }}><span className="h2-line">Details</span></h2>
            <table className="facts"><tbody>{facts.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody></table>

            <h2 style={{ marginTop: 48 }}><span className="h2-line">Description</span></h2>
            <div className="prose">
              {l.highlights && <div style={{ whiteSpace: 'pre-line' }}><h3>Investment Highlights</h3>{l.highlights}</div>}
              {l.summary && <div style={{ whiteSpace: 'pre-line' }}><h3>Executive Summary</h3>{l.summary}</div>}
              {l.contentHtml && <div dangerouslySetInnerHTML={{ __html: l.contentHtml }} />}
            </div>
          </div>

          <aside>
            <div className="side-card">
              <h3>Talk with Broker</h3>
              {broker && (
                <>
                  <p style={{ margin: '0 0 12px' }}><Link href={`/broker/${broker.slug}/`}>{broker.name}</Link></p>
                  {broker.photo ? <img src={broker.photo} alt={broker.name} style={{ width: 84, height: 84, objectFit: 'cover', marginBottom: 18 }} /> : null}
                </>
              )}
              <hr style={{ border: 0, borderTop: '1px solid #dde1ec', margin: '0 0 18px' }} />
              <Link href={`/contact/?listing=${enc(l.title)}`} className="btn btn-block">Get More Information</Link>
              <Link href={`/offering-memorandum/?listing=${enc(l.title)}`} className="btn btn-block">Request Offering Memo</Link>
            </div>
            <div className="side-card" style={{ background: 'transparent', padding: 0 }}>
              <h3>Share Listing</h3>
              <div className="share">
                <a href={`mailto:?subject=${enc(l.title)}&body=${enc(url)}`} aria-label="Email">✉</a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} aria-label="Facebook" target="_blank" rel="noopener">f</a>
                <a href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(l.title)}`} aria-label="X" target="_blank" rel="noopener">X</a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} aria-label="LinkedIn" target="_blank" rel="noopener">in</a>
                <a href={`https://pinterest.com/pin/create/button/?url=${enc(url)}&description=${enc(l.title)}`} aria-label="Pinterest" target="_blank" rel="noopener">P</a>
                <a href={`https://wa.me/?text=${enc(l.title + ' ' + url)}`} aria-label="WhatsApp" target="_blank" rel="noopener">W</a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
