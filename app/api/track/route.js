import { bump, validListingId } from '@/lib/stats';

// A listing page was viewed (sent once per visit by components/ViewTracker.js).
export const dynamic = 'force-dynamic';
const BOTS = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit/i;

export async function POST(req) {
  const { id } = await req.json().catch(() => ({}));
  if (validListingId(id) && !BOTS.test(req.headers.get('user-agent') || '')) await bump(id, 'views');
  return new Response(null, { status: 204 });
}
