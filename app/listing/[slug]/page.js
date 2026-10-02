import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allListings, listingBySlug, brokerByName, usd, textOf, SITE } from '@/lib/content';

export function generateStaticParams() {
  return allListings().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const l = listingBySlug(slug);
  if (!l) return {};
  const desc = l.seoDescription || textOf(l.summary || l.contentHtml, 155);
  return {
    title: l.seoTitle || `${l.title}${l.state ? ` | ${l.state} RV Park For Sale` : ''}`,
    description: desc,
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

  const facts = [
    ['Status', sold ? 'Sold' : 'For Sale'],
    ['Asking price', sold ? null : usd(l.priceUsd)],
    ['Sites', l.sites],
    ['Acres', l.acres],
    ['State', l.state],
    ['Type', l.category],
    ['Room to expand', l.roomToExpand],
    ['Location', l.address],
  ].filter(([, v]) => v);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: l.title,
    url: `${SITE.url}/listing/${l.slug}/`,
    description: textOf(l.summary || l.contentHtml, 300),
    image: photos.slice(0, 4),
    ...(l.priceUsd && !sold ? { offers: { '@type': 'Offer', price: l.priceUsd, priceCurrency: 'USD' } } : {}),
  };

  return (
    <section className="section" style={{ paddingTop: 28 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap">
        <div className="crumbs"><Link href="/listings/?_listing_status=for-sale">← All listings</Link>{l.state ? ` · ${l.state}` : ''}</div>
        {photos.length > 0 && (
          <div className="gallery">
            {photos.map((src, i) => <img key={src} src={src} alt={`${l.title} photo ${i + 1}`} loading={i < 2 ? 'eager' : 'lazy'} />)}
          </div>
        )}

        <div className="detail-grid">
          <div>
            <span className={`path-tag ${sold ? 'tag-seller' : 'tag-buyer'}`}>{sold ? 'Sold' : 'For Sale'}</span>
            <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)' }}>{l.title}</h1>
            {!sold && <div className="lcard-price" style={{ fontSize: '1.8rem' }}>{usd(l.priceUsd)}</div>}
            <div className="facts">
              {facts.map(([k, v]) => <div className="fact" key={k}><small>{k}</small><strong>{v}</strong></div>)}
            </div>
            {l.highlights && <><h2>Investment highlights</h2><div className="prose" style={{ whiteSpace: 'pre-line' }}>{l.highlights}</div></>}
            {l.summary && <><h2>Executive summary</h2><div className="prose" style={{ whiteSpace: 'pre-line' }}>{l.summary}</div></>}
            {l.contentHtml && <><h2>Description</h2><div className="prose" dangerouslySetInnerHTML={{ __html: l.contentHtml }} /></>}
            {l.hasOfferingMemorandum && (
              <p><strong>An offering memorandum is available.</strong> Request it from the listing broker; it is released after a confidentiality agreement is signed. <Link href="/confidentiality-and-non-disclosure-agreement/">Read the agreement</Link>.</p>
            )}
          </div>

          <aside>
            <div className="card card-pad sticky-box">
              {!sold ? (
                <>
                  <h3>Interested in this park?</h3>
                  <p className="lcard-meta">Talk with the listing broker.</p>
                  {broker && (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '10px 0 14px' }}>
                      {broker.photo ? <img src={broker.photo} alt={broker.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} /> : null}
                      <div><strong>{broker.name}</strong><div className="lcard-meta">{broker.licenseState ? `Licensed in ${broker.licenseState}` : 'RV park broker'}</div></div>
                    </div>
                  )}
                  <Link href={`/contact/?listing=${encodeURIComponent(l.title)}`} className="btn btn-primary btn-block">Request information</Link>
                  <a href={SITE.phoneHref} className="btn btn-ghost btn-block" style={{ marginTop: 10 }}>Call {SITE.phone}</a>
                  <hr style={{ border: 0, borderTop: '1px solid var(--line)', margin: '16px 0' }} />
                  <p className="lcard-meta" style={{ margin: 0 }}>Want to hear about parks like this first? <a href={SITE.select} target="_blank" rel="noopener"><strong>Join RVParkSelect</strong></a>.</p>
                </>
              ) : (
                <>
                  <h3>This park has sold</h3>
                  <p className="lcard-meta">Looking for something similar? See what is for sale now, or get first-look alerts.</p>
                  <Link href="/listings/?_listing_status=for-sale" className="btn btn-primary btn-block">Parks for sale</Link>
                  <a href={SITE.select} className="btn btn-ghost btn-block" style={{ marginTop: 10 }} target="_blank" rel="noopener">Join RVParkSelect</a>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
