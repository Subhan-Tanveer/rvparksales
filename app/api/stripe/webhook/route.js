import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { readFresh, writeCollection } from '@/lib/store';
import { withIds, slugify } from '@/lib/admin-schema';
import { renderEmail } from '@/lib/email-template';
import { VENDOR_CATEGORIES } from '@/lib/vendor-categories';

// Stripe tells us when someone pays for a Vendors and Services listing:
//   checkout.session.completed   publish their listing
//   invoice.paid                 update "paid through" on each renewal
//   customer.subscription.deleted  hide the listing when they cancel
// Every request is checked against STRIPE_WEBHOOK_SECRET (Stripe's signature),
// and only checkouts from our own payment link (STRIPE_VENDOR_LINK_ID) count.
export const dynamic = 'force-dynamic';

const CATEGORY_BY_VALUE = {
  lenders: VENDOR_CATEGORIES[0], feasibility: VENDOR_CATEGORIES[1], appraisers: VENDOR_CATEGORIES[2],
  inspections: VENDOR_CATEGORIES[3], insurance: VENDOR_CATEGORIES[4], legaltax: VENDOR_CATEGORIES[5],
  marketing: VENDOR_CATEGORIES[6], software: VENDOR_CATEGORIES[7], equipment: VENDOR_CATEGORIES[8],
  construction: VENDOR_CATEGORIES[9], other: VENDOR_CATEGORIES[10],
};

function verified(raw, header, secret) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  const given = header.split(',').filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  return given.some((g) => g.length === expected.length && crypto.timingSafeEqual(Buffer.from(g), Buffer.from(expected)));
}

const dateOf = (secs) => new Date(secs * 1000).toISOString().slice(0, 10);
const field = (session, key) => (session.custom_fields || []).find((f) => f.key === key);

async function notifyMarie(subject, title, intro, rows) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return;
  try {
    const t = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
    await t.sendMail({
      from: `RVParkSales.com <${GMAIL_USER}>`, to: 'marie@rvparksales.com', subject,
      html: renderEmail({ eyebrow: 'Vendors and Services', title, intro, sections: [{ heading: 'Details', rows }], buttons: [{ label: 'Open in admin', href: 'https://www.rvparksales.com/admin/vendors/' }] }),
    });
  } catch (e) { console.error('vendor notification not sent:', e.message); }
}

async function publish(session) {
  const list = withIds('vendors', await readFresh('vendors'));
  if (list.some((v) => v.stripeSubscriptionId && v.stripeSubscriptionId === session.subscription)) return; // Stripe retry
  const paid = {
    publishState: 'publish', paidThrough: dateOf(Date.now() / 1000 + 30 * 86400),
    stripeCustomerId: session.customer || null, stripeSubscriptionId: session.subscription || null,
  };
  // Signed up on our form first (logo, photos, details): publish that listing.
  const k = session.client_reference_id ? list.findIndex((v) => v.id === session.client_reference_id) : -1;
  if (k >= 0) {
    const v = list[k] = { ...list[k], ...paid, phone: list[k].phone || session.customer_details?.phone || '', createdAt: new Date().toISOString() };
    await writeCollection('vendors', list);
    await notifyMarie(`New paid listing: ${v.name}`, `${v.name} just got listed`,
      `${v.name} paid $29 and their listing is live at /services/${v.slug}/, with their logo and photos. Nothing for you to do unless you want to edit it.`,
      [['Company', v.name], ['Category', v.category], ['What they do', v.tagline], ['Email', v.email, v.email ? `mailto:${v.email}` : null], ['Phone', v.phone], ['Photos', `${(v.images || []).length} photo(s)${v.logo ? ' + logo' : ''}`], ['Listing', `rvparksales.com/services/${v.slug}/`, `https://www.rvparksales.com/services/${v.slug}/`]]);
    return;
  }
  // Paid on the Stripe link directly (no sign-up form): build it from checkout.
  const name = String(field(session, 'companyname')?.text?.value || session.customer_details?.name || 'New vendor').trim().slice(0, 120);
  const category = CATEGORY_BY_VALUE[field(session, 'category')?.dropdown?.value] || VENDOR_CATEGORIES[10];
  const tagline = String(field(session, 'whatwedo')?.text?.value || '').trim().slice(0, 255);
  const taken = new Set(list.map((v) => v.slug));
  let slug = slugify(name) || 'vendor';
  for (let i = 2; taken.has(slug); i++) slug = `${slugify(name)}-${i}`;
  const item = {
    id: `vendors-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name, slug, category, plan: 'listed', ...paid,
    tagline, email: session.customer_details?.email || '', phone: session.customer_details?.phone || '',
    contactName: session.customer_details?.name || '', createdAt: new Date().toISOString(),
  };
  list.unshift(item);
  await writeCollection('vendors', list);
  await notifyMarie(`New paid listing: ${name}`, `${name} just got listed`,
    `${name} paid $29 and their listing is live at /services/${slug}/. Add their logo and website in the admin when they email them.`,
    [['Company', name], ['Category', category], ['What they do', tagline], ['Email', item.email, item.email ? `mailto:${item.email}` : null], ['Phone', item.phone], ['Listing', `rvparksales.com/services/${slug}/`, `https://www.rvparksales.com/services/${slug}/`]]);
}

async function update(subscriptionId, patch) {
  if (!subscriptionId) return null;
  const list = withIds('vendors', await readFresh('vendors'));
  const i = list.findIndex((v) => v.stripeSubscriptionId === subscriptionId);
  if (i < 0) return null;
  list[i] = { ...list[i], ...patch, updatedAt: new Date().toISOString() };
  await writeCollection('vendors', list);
  return list[i];
}

export async function POST(request) {
  const raw = await request.text();
  if (!verified(raw, request.headers.get('stripe-signature'), process.env.STRIPE_WEBHOOK_SECRET)) {
    return Response.json({ error: 'Bad signature' }, { status: 400 });
  }
  let event;
  try { event = JSON.parse(raw); } catch { return Response.json({ error: 'Bad body' }, { status: 400 }); }
  const obj = event.data?.object || {};
  try {
    if (event.type === 'checkout.session.completed' && obj.payment_link && obj.payment_link === process.env.STRIPE_VENDOR_LINK_ID && obj.payment_status === 'paid') {
      await publish(obj);
    } else if (event.type === 'invoice.paid') {
      const end = obj.lines?.data?.[0]?.period?.end;
      if (end) await update(obj.subscription, { paidThrough: dateOf(end) });
    } else if (event.type === 'customer.subscription.deleted') {
      const v = await update(obj.id, { publishState: 'draft' });
      if (v) await notifyMarie(`Listing cancelled: ${v.name}`, `${v.name} cancelled`, `${v.name} cancelled their $29 listing. It has been hidden from the site (set to Draft). You can republish it in the admin if they come back.`, [['Company', v.name], ['Category', v.category], ['Email', v.email]]);
    }
  } catch (e) {
    console.error('stripe webhook failed:', e.message);
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
  return Response.json({ received: true });
}
