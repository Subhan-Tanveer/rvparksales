import nodemailer from 'nodemailer';
import { isLive } from '@/lib/content';
import { renderEmail } from '@/lib/email-template';

// "Your listing is live" email, sent the moment a park becomes public on
// RVParkSales.com: Marie set it to Published, or its Early access go-public
// date passed (checked daily by /api/cron/live-notices).
//   RVParkAds parks   -> the seller who bought the plan (ownerEmail)
//   Parks added here  -> the listing broker (Broker / contact on the listing)
// Sent once per listing: liveNotifiedAt on the listing records it.
const SITE = 'https://www.rvparksales.com';
const MARIE = 'marie@rvparksales.com';
// Broker listings added before this went in were live long ago; never email them.
const BROKER_NOTICES_SINCE = '2026-10-29';
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');

// Who should hear that this listing is live, or null.
export function liveNoticeRecipient(l, brokers = []) {
  if (l?.status !== 'For Sale' || !isLive(l) || l.liveNotifiedAt) return null;
  if (l.source === 'ads') return validEmail(l.ownerEmail) ? { name: l.ownerName, email: l.ownerEmail } : null;
  if (!l.createdAt || l.createdAt < BROKER_NOTICES_SINCE) return null;
  const b = brokers.find((x) => (x.name || '').toLowerCase() === (l.sellerName || '').toLowerCase());
  return b && validEmail(b.email) && b.email.toLowerCase() !== MARIE ? { name: b.name, email: b.email } : null;
}

const titleCase = (s = '') => s.replace(/\b\w/g, (c) => c.toUpperCase());
const money = (v) => (v ? `$${Number(v).toLocaleString('en-US')}` : null);

// Sends the email; returns true when it went out (caller saves liveNotifiedAt).
export async function sendLiveNotice(l, brokers) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  const to = liveNoticeRecipient(l, brokers);
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !to) return false;
  const first = titleCase((to.name || '').trim().split(/\s+/)[0] || '');
  const url = `${SITE}/listing/${l.slug}/`;
  const html = renderEmail({
    preheader: `${l.title} is now public on RVParkSales.com.`,
    eyebrow: 'Your listing is live',
    title: l.title,
    intro: `${first ? `Hi ${first}, good news: ` : 'Good news: '}your listing is now public on RVParkSales.com, America’s RV park marketplace. Buyers can find it in search, see the photos and send you questions.`,
    sections: [{ heading: 'Your listing', rows: [
      ['Park', l.title, url],
      ['Location', l.address],
      ['Asking price', money(l.priceUsd)],
      ['Plan', l.adsPlan],
    ] }],
    buttons: [{ label: 'View your listing', href: url }],
    closing: 'When a buyer clicks Get More Information on your listing, their message comes straight to this email address, so keep an eye on your inbox. Questions or changes? Just reply to this email and Marie will help.',
  });
  const t = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
  await t.sendMail({
    from: `Marie Hansen, RVParkSales.com <${GMAIL_USER}>`,
    to: to.email, bcc: MARIE, replyTo: MARIE,
    subject: `Your listing is live: ${l.title}`,
    html,
  });
  return true;
}
