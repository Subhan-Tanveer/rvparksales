import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { siteOrigin } from '@/lib/select-sync';

// Lets this admin manage RVParkSelect.com and RVParkAds.com. The browser
// talks only to us (Marie's login here); this route forwards the request to
// the other site's own admin API with a server-only bridge key, so all of
// that site's rules (alert emails, NDA handling, Stripe checks, syncing)
// still run there.
//   /api/admin/remote/select/?path=admin-listings&id=12
export const dynamic = 'force-dynamic';

const SITES = {
  select: { base: () => process.env.SELECT_API_BASE, key: () => process.env.SELECT_BRIDGE_SECRET, paths: ['admin-listings', 'admin-buyers', 'admin-brokers', 'lenders'] },
  ads: { base: () => process.env.ADS_API_BASE, key: () => process.env.ADS_BRIDGE_SECRET, paths: ['admin-listings'] },
};

// Files uploaded here live at /media/...; the other sites need full links.
function absolutize(v, origin) {
  if (typeof v === 'string') return v.startsWith('/media/') ? `${origin}${v}` : v;
  if (Array.isArray(v)) return v.map((x) => absolutize(x, origin));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, absolutize(x, origin)]));
  return v;
}

async function forward(req, { params }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const { site } = await params;
  const cfg = SITES[site];
  const url = new URL(req.url);
  const path = url.searchParams.get('path');
  if (!cfg || !cfg.paths.includes(path)) return NextResponse.json({ error: 'Unknown section' }, { status: 404 });
  if (!cfg.base() || !cfg.key()) return NextResponse.json({ error: `The link to ${site === 'select' ? 'RVParkSelect' : 'RVParkAds'} is not set up yet.` }, { status: 503 });

  const qs = new URLSearchParams(url.searchParams);
  qs.delete('path');
  const target = `${cfg.base().replace(/\/$/, '')}/api/${path}${qs.toString() ? `?${qs}` : ''}`;
  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const json = await req.json().catch(() => undefined);
    if (json !== undefined) body = JSON.stringify(absolutize(json, siteOrigin(req.url)));
  }
  try {
    const res = await fetch(target, {
      method: req.method,
      headers: { 'x-admin-bridge': cfg.key(), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body,
      cache: 'no-store',
      redirect: 'follow',
      signal: AbortSignal.timeout(45000),
    });
    const data = await res.json().catch(() => ({ error: `Unexpected answer (${res.status})` }));
    // Their "not signed in" means our bridge key is wrong, not Marie's login.
    if (res.status === 401) return NextResponse.json({ error: 'The connection to that site was refused. Please tell Subi.' }, { status: 502 });
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: e.name === 'TimeoutError' ? 'That site took too long to answer. Please try again.' : `Could not reach that site: ${e.message}` }, { status: 502 });
  }
}

export { forward as GET, forward as POST, forward as PUT, forward as DELETE };
