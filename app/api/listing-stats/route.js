import { NextResponse } from 'next/server';
import { statsFor, monthlyFor } from '@/lib/stats';

// Views and inquiries for one RVParkAds seller's listing, for their
// RVParkAds dashboard. Server to server only: same secret RVParkAds already
// uses to send listings here (ADS_IMPORT_SECRET).
//   GET /api/listing-stats?ads=<RVParkAds listing id>
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const secret = process.env.ADS_IMPORT_SECRET;
  if (!secret || req.headers.get('x-import-secret') !== secret) return NextResponse.json({ error: 'Not allowed' }, { status: 401 });
  const ads = new URL(req.url).searchParams.get('ads');
  if (!/^\d{1,10}$/.test(ads || '')) return NextResponse.json({ error: 'Bad listing id' }, { status: 400 });
  const id = `ads-${ads}`;
  const [totals, monthly] = await Promise.all([statsFor([id]), monthlyFor(id)]);
  return NextResponse.json({ ...(totals[id] || { views30: 0, inquiries30: 0, views: 0, inquiries: 0 }), monthly });
}
