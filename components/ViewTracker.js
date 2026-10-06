'use client';
import { useEffect } from 'react';

// Counts one view of a listing page per browser session (lib/stats.js).
export default function ViewTracker({ id }) {
  useEffect(() => {
    const key = `rv-viewed-${id}`;
    try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch { /* private mode: still count */ }
    fetch('/api/track/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }), keepalive: true }).catch(() => {});
  }, [id]);
  return null;
}
