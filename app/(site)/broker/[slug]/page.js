import { notFound } from 'next/navigation';
import PersonPage from '@/components/PersonPage';
import { brokers, brokerBySlug, textOf, loadContent } from '@/lib/content';

export async function generateStaticParams() {
  await loadContent(); return brokers().map((b) => ({ slug: b.slug })); }

export async function generateMetadata({ params }) {
  await loadContent();
  const { slug } = await params;
  const b = brokerBySlug(slug);
  if (!b) return {};
  return { title: b.name, description: textOf(b.bioHtml, 155) || `${b.name}, RV park broker on RVParkSales.com.`, alternates: { canonical: `/broker/${b.slug}/` } };
}

export default async function BrokerPage({ params }) {
  await loadContent();
  const { slug } = await params;
  const b = brokerBySlug(slug);
  if (!b) notFound();
  return <PersonPage person={b} kind="broker" />;
}
