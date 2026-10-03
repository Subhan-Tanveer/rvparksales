import { notFound } from 'next/navigation';
import PageBand from '@/components/PageBand';
import BlogList from '@/components/BlogList';
import { posts, loadContent } from '@/lib/content';

// Old paged addresses: /blog-buying-and-selling-rv-parks/page/2/
const PER_PAGE = 10;
const pageCount = () => Math.ceil(posts().length / PER_PAGE);

export async function generateStaticParams() {
  await loadContent();
  return Array.from({ length: Math.max(0, pageCount() - 1) }, (_, k) => ({ n: String(k + 2) }));
}

export async function generateMetadata({ params }) {
  await loadContent();
  const { n } = await params;
  return {
    title: { absolute: `RV Park Sales - Florida - RV Campgrounds - RV Parks - Lots - Page ${n}` },
    alternates: { canonical: `/blog-buying-and-selling-rv-parks/page/${n}/` },
  };
}

export default async function BlogPage({ params }) {
  await loadContent();
  const { n } = await params;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2 || page > pageCount()) notFound();
  const all = posts();
  return (
    <>
      <PageBand title="The RV Park Blog" kicker="Resources" sub="Buying, selling, financing and growing RV parks: practical insights from the RVParkSales team." crumbs={[{ label: 'Blog' }]} />
      <BlogList items={all.slice((page - 1) * PER_PAGE, page * PER_PAGE)} page={page} pages={pageCount()} base="/blog-buying-and-selling-rv-parks/" />
    </>
  );
}
