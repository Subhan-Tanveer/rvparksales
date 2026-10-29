import nodemailer from 'nodemailer';
import { isLive } from '@/lib/content';
import { renderEmail } from '@/lib/email-template';

// "Your listing is live" email for RVParkAds sellers. A park bought on
// RVParkAds arrives as Early access; the seller hears from us the moment it
// becomes public on RVParkSales.com, either because Marie set it to Published
// or because its go-public date passed (checked daily by /api/cron/live-notices).
// Sent once per listing: liveNotifiedAt on the listing records it.
const SITE = 'https://www.rvparksales.com';
const MARIE = 'marie@rvparksales.com';

export const needsLiveNotice = (l) => l?.source === 'ads' && l.status === 'For Sale' && isLive(l) && !l.liveNotifiedAt && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.ownerEmail || '');

const titleCase = (s = '') => s.replace(/\b\w/g, (c) => c.toUpperCase());
const money = (v) => (v ? `$${Number(v).toLocaleString('en-US')}` : null);

// Sends the email; returns true when it went out (caller saves liveNotifiedAt).
export async function sendLiveNotice(l) {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !needsLiveNotice(l)) return false;
  const first = titleCase((l.ownerName || '').trim().split(/\s+/)[0] || '');
  const url = `${SITE}/listing/${l.slug}/`;
  const html = renderEmail({
    preheader: `${l.title} is now public on RVParkSales.com.`,
    eyebrow: 'Your listing is live',
    title: l.title,
    intro: `${first ? `Hi ${first}, good news: ` : 'Good news: '}your RV park is now public on RVParkSales.com, America’s RV park marketplace. Buyers can find it in search, see your photos and send you questions.`,
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
    to: l.ownerEmail, bcc: MARIE, replyTo: MARIE,
    subject: `Your listing is live: ${l.title}`,
    html,
  });
  return true;
}
