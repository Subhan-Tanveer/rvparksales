import { notFound } from 'next/navigation';
import PageBand from '@/components/PageBand';
import BlogList from '@/components/BlogList';
import { categories, categoryByPath, textOf, loadContent } from '@/lib/content';

// Old blog category archives: /category/news/, /category/selling-an-rv-park/rv-park-brokers/
export async function generateStaticParams() {
  await loadContent();
  return categories().map((c) => ({ path: c.path.replace(/^\/category\/|\/$/g, '').split('/') }));
}

export async function generateMetadata({ params }) {
  await loadContent();
  const { path } = await params;
  const c = categoryByPath(path);
  if (!c) return {};
  return { title: c.name, description: textOf(c.descriptionHtml.replace(/\[[^\]]*\]/g, ''), 155) || undefined, alternates: { canonical: c.path } };
}

export default async function CategoryPage({ params }) {
  await loadContent();
  const { path } = await params;
  const c = categoryByPath(path);
  if (!c) notFound();
  return (
    <>
      <PageBand title={c.name} kicker="Blog category" sub={`${c.count} ${c.count === 1 ? 'article' : 'articles'} on this topic`} crumbs={[{ label: 'Blog', href: '/blog-buying-and-selling-rv-parks/' }, { label: c.name }]} />
      <BlogList items={c.posts} base={c.path} />
    </>
  );
}
