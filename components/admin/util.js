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

// Calls RVParkSelect / RVParkAds through our own server (see
// app/api/admin/remote/[site]/route.js).
export async function remote(site, path, { method = 'GET', body, query } = {}) {
  const qs = new URLSearchParams(query || '');
  qs.set('path', path);
  const res = await fetch(`/api/admin/remote/${site}/?${qs}`, {
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

// One interface for the list/edit screens, whether the content lives here
// (RVParkSales) or on one of Marie's other sites.
export function source(name, schema) {
  if (!schema.remote) {
    return {
      list: () => api(name),
      save: (item) => api(name, { method: 'POST', body: { item } }),
      remove: (item) => api(name, { method: 'DELETE', query: `id=${encodeURIComponent(item.id)}` }),
      reorder: (ids) => api(name, { method: 'PUT', body: { order: ids } }),
    };
  }
  const r = schema.remote;
  const from = schema.fromRemote || ((x) => ({ ...x, id: String(x.id) }));
  const to = schema.toRemote || ((x) => x);
  return {
    async list() {
      const [main, ...more] = await Promise.all([
        remote(r.site, r.path, { query: r.listQuery }),
        ...(r.extras || []).map((x) => remote(r.site, x.path, { query: x.query }).catch(() => ({}))),
      ]);
      const extra = {};
      (r.extras || []).forEach((x, k) => { extra[x.key] = more[k][x.listKey] || []; });
      return { items: (main[r.listKey] || []).map(from), extra };
    },
    async detail(item) {
      if (!r.detailKey) return null;
      const d = await remote(r.site, r.path, { query: `id=${encodeURIComponent(item.id)}` });
      return d[r.detailKey] || null;
    },
    async save(item, isNew) {
      const d = await remote(r.site, r.path, isNew
        ? { method: 'POST', body: to(item) }
        : { method: 'PUT', query: `id=${encodeURIComponent(item.id)}`, body: to(item) });
      const raw = d[r.itemKey];
      return { item: raw ? from(raw) : item };
    },
    remove: (item) => (r.remove
      ? remote(r.site, r.path, r.remove(item))
      : remote(r.site, r.path, { method: 'DELETE', query: `id=${encodeURIComponent(item.id)}` })),
    run: (call) => remote(r.site, r.path, call),
  };
}

// Uploads a photo straight to storage and returns its address on the site.
export async function uploadImage(file, folder = 'misc', onProgress) {
  folder = folder.replace(/[^a-z0-9-]/gi, '');
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
