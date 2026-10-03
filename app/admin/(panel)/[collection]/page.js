'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import ListView from '@/components/admin/ListView';
import { SCHEMAS } from '@/lib/admin-schema';

export default function CollectionPage({ params }) {
  const { collection } = use(params);
  if (!SCHEMAS[collection]) notFound();
  return <ListView key={collection} name={collection} />;
}
