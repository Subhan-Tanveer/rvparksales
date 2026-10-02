import { notFound } from 'next/navigation';
import PersonPage from '@/components/PersonPage';
import { brokers, brokerBySlug, textOf } from '@/lib/content';

export function generateStaticParams() { return brokers().map((b) => ({ slug: b.slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = brokerBySlug(slug);
  if (!b) return {};
  return { title: b.name, description: textOf(b.bioHtml, 155) || `${b.name}, RV park broker on RVParkSales.com.`, alternates: { canonical: `/broker/${b.slug}/` } };
}

export default async function BrokerPage({ params }) {
  const { slug } = await params;
  const b = brokerBySlug(slug);
  if (!b) notFound();
  return <PersonPage person={b} kind="broker" />;
}
