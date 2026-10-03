'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import EditView from '@/components/admin/EditView';
import { SCHEMAS } from '@/lib/admin-schema';

export default function EditPage({ params }) {
  const { collection, id } = use(params);
  if (!SCHEMAS[collection]) notFound();
  return <EditView key={`${collection}/${id}`} name={collection} id={id} />;
}
