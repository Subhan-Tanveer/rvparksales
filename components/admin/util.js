'use client';
import { useEffect } from 'react';

// Small helpers shared by the admin screens.
export async function api(name, { method = 'GET', body, query } = {}) {
  const res = await fetch(`/api/admin/${name}/${query ? `?${query}` : ''}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });
  if (res.status === 401) { window.location.href = '/admin/login/'; throw new Error('Please sign in again.'); }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

// Uploads a photo straight to storage and returns its address on the site.
export async function uploadImage(file, folder = 'misc', onProgress) {
  const { upload } = await import('@vercel/blob/client');
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '') || 'photo.jpg';
  const blob = await upload(`uploads/${folder}/${safe}`, file, {
    access: 'private',
    handleUploadUrl: '/api/admin/upload/',
    onUploadProgress: onProgress ? (p) => onProgress(Math.round(p.percentage)) : undefined,
  });
  return `/media/${blob.pathname}`;
}

export function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onDone, toast.err ? 6000 : 2600);
    return () => clearTimeout(t);
  }, [toast, onDone]);
  if (!toast) return null;
  return <div className={`adm-toast ${toast.err ? 'err' : ''}`} role="status">{toast.text}</div>;
}
