import { readFresh, writeCollection } from '@/lib/store';
import { withIds, slugify } from '@/lib/admin-schema';
import { VENDOR_CATEGORIES } from '@/lib/vendor-categories';

// Vendors and Services sign-up: saves the company's details, logo and photos as
// a hidden "Awaiting payment" listing, then sends them to Stripe. The Stripe
// webhook (api/stripe/webhook) publishes it once the payment goes through.
export const dynamic = 'force-dynamic';

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');
const str = (v, n) => String(v ?? '').trim().slice(0, n);
const ownUpload = (u) => typeof u === 'string' && /^\/media\/uploads\/vendors\/[A-Za-z0-9._-]+$/.test(u);
const site = (u) => (!u ? '' : /^https?:\/\//i.test(u) ? u : `https://${u}`);
const STALE = 7 * 864e5;

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: 'Invalid request' }, { status: 400 });
  if (body.hp) return Response.json({ url: '/services/' }); // honeypot

  const pay = process.env.VENDOR_PAYMENT_URL;
  if (!pay) return Response.json({ error: 'Sign-up is not open yet. Please call (850) 832-0022.' }, { status: 503 });

  const name = str(body.name, 120);
  const category = VENDOR_CATEGORIES.includes(body.category) ? body.category : '';
  const tagline = str(body.tagline, 300);
  const email = str(body.email, 200);
  if (!name || !category || !tagline || !validEmail(email)) {
    return Response.json({ error: 'Please fill in your company name, category, what you do and a valid email.' }, { status: 400 });
  }
  const logo = ownUpload(body.logo) ? body.logo : null;
  const images = (Array.isArray(body.images) ? body.images : []).filter(ownUpload).slice(0, 6);

  const all = withIds('vendors', await readFresh('vendors'));
  // Sign-ups that never paid are dropped after a week.
  const list = all.filter((v) => v.publishState !== 'pending' || Date.now() - Date.parse(v.appliedAt || 0) < STALE);
  const taken = new Set(list.map((v) => v.slug));
  let slug = slugify(name) || 'vendor';
  for (let i = 2; taken.has(slug); i++) slug = `${slugify(name) || 'vendor'}-${i}`;

  const id = `vendors-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  list.unshift({
    id, name, slug, category, tagline, plan: 'listed', publishState: 'pending',
    email, phone: str(body.phone, 40), contactName: str(body.contactName, 120),
    website: site(str(body.website, 300)), serviceArea: str(body.serviceArea, 160),
    logo, images, appliedAt: new Date().toISOString(),
  });
  await writeCollection('vendors', list);

  const url = new URL(pay);
  url.searchParams.set('client_reference_id', id);
  url.searchParams.set('prefilled_email', email);
  return Response.json({ url: url.toString() });
}
