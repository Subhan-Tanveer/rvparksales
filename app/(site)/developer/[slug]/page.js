import { notFound } from 'next/navigation';
import PersonPage from '@/components/PersonPage';
import { developers, developerBySlug, textOf, loadContent } from '@/lib/content';

export async function generateStaticParams() {
  await loadContent(); return developers().map((d) => ({ slug: d.slug })); }

export async function generateMetadata({ params }) {
  await loadContent();
  const { slug } = await params;
  const d = developerBySlug(slug);
  if (!d) return {};
  return { title: d.name, description: textOf(d.bioHtml, 155) || `${d.name}, RV park developer.`, alternates: { canonical: `/developer/${d.slug}/` } };
}

export default async function DeveloperPage({ params }) {
  await loadContent();
  const { slug } = await params;
  const d = developerBySlug(slug);
  if (!d) notFound();
  return <PersonPage person={d} kind="developer" />;
}
