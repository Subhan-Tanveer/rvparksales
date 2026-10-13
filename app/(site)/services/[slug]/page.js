import { notFound } from 'next/navigation';
import PageBand from '@/components/PageBand';
import ListingGallery from '@/components/ListingGallery';
import { GfPopup } from '@/components/GfForm';
import { vendors, vendorBySlug, textOf, autop, SITE, loadContent } from '@/lib/content';

export async function generateStaticParams() {
  await loadContent();
  return vendors().map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }) {
  await loadContent();
  const { slug } = await params;
  const v = vendorBySlug(slug);
  if (!v) return {};
  return { title: v.name, description: v.tagline || textOf(v.bioHtml, 155) || `${v.name}, ${v.category || 'RV park services'}.`, alternates: { canonical: `/services/${v.slug}/` } };
}

const FIELDS = [
  { key: 'name', type: 'text', label: 'Your Name', required: true },
  { key: 'email', type: 'email', label: 'Email', required: true, half: true },
  { key: 'phone', type: 'phone', label: 'Phone', half: true },
  { key: 'message', type: 'textarea', label: 'Message', required: true },
];

const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : u ? `https://${u}` : null);

export default async function ServicePage({ params }) {
  await loadContent();
  const { slug } = await params;
  const v = vendorBySlug(slug);
  if (!v) notFound();
  const url = `${SITE.url}/services/${v.slug}/`;
  const site = safeUrl(v.website);
  return (
    <>
      <PageBand image="/images/site/rv-parks-1.jpg" />
      <section className="l-section">
        <div className="l-section-h detail">
          <div className="detail-main">
            <div style={{ height: 81 }} />
            <div className="detail-head">
              <h1>{v.name}</h1>
              {v.category && <div className="detail-price">{v.category}</div>}
            </div>
            <div className="status-bar person-info">
              {v.serviceArea && <span><b>Service area&nbsp;</b>{v.serviceArea}</span>}
              {v.contactName && <span><b>Contact&nbsp;</b>{v.contactName}</span>}
            </div>
            <hr className="hr-line" />
            <div className="vprofile-head">
              {v.logo && <img className="vprofile-logo" src={v.logo} alt={`${v.name} logo`} />}
              {v.tagline && <p className="lead-p">{v.tagline}</p>}
            </div>
            {v.images?.length > 0 && <><hr className="hr-line" /><ListingGallery photos={v.images} title={v.name} /></>}
            <hr className="hr-line" />
            {v.bioHtml && <><h2 style={{ margin: '0 0 27px' }}>About</h2><div className="prose" dangerouslySetInnerHTML={{ __html: autop(v.bioHtml) }} /></>}
            <div style={{ height: 81 }} />
          </div>
          <aside className="detail-side">
            <div className="detail-side-in">
              <h3>Talk with {v.name}</h3>
              <hr className="hr-line" />
              <button type="button" className="btn btn-block service-contact">Get More Information</button>
              {site && <><div style={{ height: 12 }} /><a className="btn btn-block" href={site} target="_blank" rel="noopener nofollow">Visit Website</a></>}
              {v.phone && <p style={{ marginTop: 16 }}><a href={`tel:${v.phone.replace(/[^\d+]/g, '')}`}>{v.phone}</a></p>}
              <div style={{ height: 27 }} />
            </div>
          </aside>
        </div>
      </section>
      <div className="mobile-cta"><button type="button" className="btn btn-block service-contact">Get More Information</button></div>
      <GfPopup triggerClass="service-contact" title={`Contact ${v.name}`} form="Services Contact" fields={FIELDS}
        extra={{ Company: v.name, 'Company Link': url }} about={{ kind: 'vendor', slug: v.slug }} />
    </>
  );
}
