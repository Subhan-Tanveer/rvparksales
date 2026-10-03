import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageBand from '@/components/PageBand';
import BlogSidebar from '@/components/BlogSidebar';
import { posts, pages, postBySlug, pageBySlug, categoryLinks, textOf, metaTitle, SITE } from '@/lib/content';

// Blog posts and ordinary pages both live at the root (/some-slug/) on the old
// WordPress site, so they share this one route and keep their exact addresses.
// Pages that have their own designed route are listed here so they are skipped.
const HANDLED_ELSEWHERE = new Set(['home', 'sitemap', 'my-account', 'contact', 'reviews', 'blog-buying-and-selling-rv-parks', 'sell-my-rv-park', 'offering-memorandum', 'about-selling-an-rv-park', 'faq']);

export function generateStaticParams() {
  return [
    ...posts().map((p) => ({ slug: p.slug })),
    ...pages().filter((p) => !HANDLED_ELSEWHERE.has(p.slug) && p.slug).map((p) => ({ slug: p.slug })),
  ];
}

function find(slug) {
  const post = postBySlug(slug);
  if (post) return { kind: 'post', item: post };
  const page = pageBySlug(slug);
  if (page && !HANDLED_ELSEWHERE.has(page.slug)) return { kind: 'page', item: page };
  return null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const hit = find(slug);
  if (!hit) return {};
  const { item } = hit;
  return {
    title: metaTitle(item),
    description: item.seoDescription || textOf(item.contentHtml, 155),
    alternates: { canonical: `/${item.slug}/` },
    openGraph: item.featuredImage ? { images: [item.featuredImage] } : undefined,
  };
}

const Ico = ({ d, vb = '0 0 448 512' }) => <svg viewBox={vb} aria-hidden="true"><path fill="currentColor" d={d} /></svg>;
const FOLDER = 'M572.7 292.1L500.3 416.2c-9.2 15.8-26.1 25.5-44.4 25.5H48c-19.4 0-31.4-21.1-21.6-37.9l72.4-124.2c9.2-15.8 26.1-25.5 44.4-25.5H551c19.4 0 31.4 21.1 21.6 37.9zM144 224h352v-48c0-26.5-21.5-48-48-48H288l-64-64H48C21.5 64 0 85.5 0 112v278l69.1-118.5C86.2 242 113.9 224 144 224z';
const USER = 'M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z';
const CAL = 'M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM192 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40zM64 268c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zm0 128c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12v-40zM400 64h-48V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H160V16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v48H48C21.5 64 0 85.5 0 112v48h448v-48c0-26.5-21.5-48-48-48z';

function PostView({ p }) {
  const all = posts();
  const i = all.findIndex((x) => x.slug === p.slug);
  const newer = i > 0 ? all[i - 1] : null;
  const older = i < all.length - 1 ? all[i + 1] : null;
  const url = `${SITE.url}/${p.slug}/`;
  const enc = encodeURIComponent;
  const cats = categoryLinks(p);
  const share = [
    ['email', 'Email this', `mailto:?subject=${enc(p.title)}&body=${enc(url)}`],
    ['facebook', 'Share this', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
    ['linkedin', 'Share this', `https://www.linkedin.com/shareArticle?mini=true&url=${enc(url)}`],
    ['pinterest', 'Pin this', `https://www.pinterest.com/pin/create/button/?url=${enc(url)}&media=${enc(p.featuredImage || '')}&description=${enc(p.title)}`],
    ['whatsapp', 'Share this', `https://web.whatsapp.com/send?text=${enc(p.title + ' ' + url)}`],
    ['reddit', 'Share this', `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(p.title)}`],
  ];
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: p.title, datePublished: p.date,
    mainEntityOfPage: url, publisher: { '@type': 'Organization', name: 'RVParkSales.com' },
    ...(p.author ? { author: { '@type': 'Person', name: p.author } } : {}),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageBand image={p.featuredImage || undefined} />
      <section className="l-section">
        <div className="l-section-h blog-grid">
          <div className="post-main">
            <div style={{ height: 81 }} />
            <div className="post-head">
              {cats.length > 0 && (
                <div className="post-tax">
                  <Ico d={FOLDER} vb="0 0 576 512" />
                  {cats.map((c, k) => <span key={c.slug}>{k > 0 && <b>, </b>}<Link href={c.path}>{c.name}</Link></span>)}
                </div>
              )}
              <h1>{p.title}</h1>
              <div className="status-bar">
                {p.author && <span><Ico d={USER} />{p.author}</span>}
                <span><Ico d={CAL} /><time dateTime={p.date.replace(' ', 'T')}>{new Date(p.date.replace(' ', 'T')).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time></span>
              </div>
            </div>
            <hr className="hr-line" />
            {p.featuredImage && <img className="post-img" src={p.featuredImage} alt="" />}
            <hr className="hr-line" />
            <div className="prose" dangerouslySetInnerHTML={{ __html: p.contentHtml }} />
            <hr className="hr-line" />
            <div className="sharing center-share">
              {share.map(([k, label, href]) => <a key={k} className={k} href={href} title={label} aria-label={label} target={k === 'email' ? undefined : '_blank'} rel="noopener nofollow"><ShareIcon k={k} /></a>)}
            </div>
            <hr className="hr-line" />
            <nav className="post-nav" aria-label="Post navigation">
              {newer ? (
                <Link href={`/${newer.slug}/`} className="to-next"><span className="arrow" aria-hidden="true" /><span className="meta">Next Post</span><span className="t">{newer.title}</span></Link>
              ) : <span />}
              {older ? (
                <Link href={`/${older.slug}/`} className="to-prev"><span className="arrow" aria-hidden="true" /><span className="meta">Previous Post</span><span className="t">{older.title}</span></Link>
              ) : <span />}
            </nav>
            <div style={{ height: 81 }} />
          </div>
          <BlogSidebar />
        </div>
      </section>
    </>
  );
}

const SHARE_PATHS = {
  email: ['0 0 512 512', 'M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z'],
  facebook: ['0 0 512 512', 'M504 256C504 119 393 8 256 8S8 119 8 256c0 123.8 90.7 226.4 209.3 245V327.7h-63V256h63v-54.6c0-62.2 37-96.5 93.7-96.5 27.1 0 55.5 4.8 55.5 4.8v61h-31.3c-30.8 0-40.4 19.1-40.4 38.7V256h68.8l-11 71.7h-57.8V501C413.3 482.4 504 379.8 504 256z'],
  linkedin: ['0 0 448 512', 'M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z'],
  pinterest: ['0 0 496 512', 'M496 256c0 137-111 248-248 248-25.6 0-50.2-3.9-73.4-11.1 10.1-16.5 25.2-43.5 30.8-65 3-11.6 15.4-59 15.4-59 8.1 15.4 31.7 28.5 56.8 28.5 74.8 0 128.7-68.8 128.7-154.3 0-81.9-66.9-143.2-152.9-143.2-107 0-163.9 71.8-163.9 150.1 0 36.4 19.4 81.7 50.3 96.1 4.7 2.2 7.2 1.2 8.3-3.3.8-3.4 5-20.3 6.9-28.1.6-2.5.3-4.7-1.7-7.1-10.1-12.5-18.3-35.3-18.3-56.6 0-54.7 41.4-107.6 112-107.6 60.9 0 103.6 41.5 103.6 100.9 0 67.1-33.9 113.6-78 113.6-24.3 0-42.6-20.1-36.7-44.8 7-29.5 20.5-61.3 20.5-82.6 0-19-10.2-34.9-31.4-34.9-24.9 0-44.9 25.7-44.9 60.2 0 22 7.4 36.8 7.4 36.8s-24.5 103.8-29 123.2c-5 21.4-3 51.6-.9 71.2C65.4 450.9 0 361.1 0 256 0 119 111 8 248 8s248 111 248 248z'],
  whatsapp: ['0 0 448 512', 'M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z'],
  reddit: ['0 0 512 512', 'M201.5 305.5c-13.8 0-24.9-11.1-24.9-24.6 0-13.8 11.1-24.9 24.9-24.9 13.6 0 24.6 11.1 24.6 24.9 0 13.6-11.1 24.6-24.6 24.6zM504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zm-132.3-41.2c-9.4 0-17.7 3.9-23.8 10-22.4-15.5-52.6-25.5-86.1-26.6l17.4-78.3 55.4 12.5c0 13.6 11.1 24.6 24.6 24.6 13.8 0 24.9-11.3 24.9-24.9s-11.1-24.9-24.9-24.9c-9.7 0-18 5.8-22.1 13.8l-61.2-13.6c-3-.8-6.1 1.4-6.9 4.4l-19.1 86.4c-33.2 1.4-63.1 11.3-85.5 26.8-6.1-6.4-14.7-10.2-24.1-10.2-34.9 0-46.3 46.9-14.4 62.8-1.1 5-1.7 10.2-1.7 15.5 0 52.6 59.2 95.2 132 95.2 73.1 0 132.3-42.6 132.3-95.2 0-5.3-.6-10.8-1.9-15.8 31.3-16 19.8-62.5-14.9-62.5zM302.8 331c-18.2 18.2-76.1 17.9-93.6 0-2.2-2.2-6.1-2.2-8.3 0-2.5 2.5-2.5 6.4 0 8.6 22.8 22.8 87.3 22.8 110.2 0 2.5-2.2 2.5-6.1 0-8.6-2.2-2.2-6.1-2.2-8.3 0zm7.7-75c-13.6 0-24.6 11.1-24.6 24.9 0 13.6 11.1 24.6 24.6 24.6 13.8 0 24.9-11.1 24.9-24.6 0-13.8-11-24.9-24.9-24.9z'],
};
const ShareIcon = ({ k }) => <Ico vb={SHARE_PATHS[k][0]} d={SHARE_PATHS[k][1]} />;

export default async function ContentPage({ params }) {
  const { slug } = await params;
  const hit = find(slug);
  if (!hit) notFound();
  const { kind, item } = hit;
  if (kind === 'post') return <PostView p={item} />;
  return (
    <>
      <PageBand title={item.title} image={item.featuredImage || undefined} />
      <section className="l-section s-medium-72">
        <div className="l-section-h">
          <div className="prose" dangerouslySetInnerHTML={{ __html: item.contentHtml }} />
        </div>
      </section>
    </>
  );
}
