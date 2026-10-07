import nodemailer from 'nodemailer';
import { bump } from '@/lib/stats';
import { renderEmail } from '@/lib/email-template';

// Contact form handler. Sends the message to Marie by email, with the
// visitor's address as reply-to so she can answer straight from her inbox.
// Until GMAIL_USER / GMAIL_APP_PASSWORD are set for this project it answers
// 503 with a friendly "call or email us" message instead of pretending to send.
// (The old site's form fed Keap; hooking this into Keap or another CRM is a
// separate step, see README.)


export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Honeypot: a real visitor never fills the hidden field. Pretend success.
  if (body.website) return Response.json({ ok: true });

  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().slice(0, 200);
  const phone = String(body.phone || '').trim().slice(0, 40);
  const role = String(body.role || '').trim().slice(0, 40);
  const listing = String(body.listing || '').trim().slice(0, 200);
  const message = String(body.message || '').trim().slice(0, 3000);
  // Consultation popups (buyer / seller) send their form name plus extra fields.
  const form = String(body.form || '').trim().slice(0, 80);
  const details = body.details && typeof body.details === 'object'
    ? Object.entries(body.details).slice(0, 20).map(([k, v]) => [String(k).slice(0, 60), String(v ?? '').trim().slice(0, 300)]).filter(([, v]) => v)
    : [];

  if (!name || (!message && !form) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: form ? 'Please fill in the required fields.' : 'Please enter your name, a valid email and a message.' }, { status: 400 });
  }

  // A buyer asked about a listing: counts toward that listing's inquiries
  // (even if the email below can't be sent, the buyer did reach out).
  if (body.listingId) await bump(String(body.listingId), 'inquiries');

  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return Response.json(
      { error: 'Our contact form is being set up. Please call (850) 832-0022 or email marie@rvparksales.com.' },
      { status: 503 }
    );
  }

  // What the message is about, for the subject line and the email heading.
  const what = form === 'Listing Information' ? 'Listing inquiry' : form || 'Website message';
  const listingUrl = details.find(([k]) => k === 'Listing URL')?.[1];
  const extra = details.filter(([k]) => k !== 'Listing URL');
  const telHref = phone ? `tel:${phone.replace(/[^d+]/g, '')}` : null;

  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
    // To Marie: who it is, how to reach them, what they asked. Reply goes to them.
    await transporter.sendMail({
      from: `RVParkSales.com <${GMAIL_USER}>`,
      to: 'marie@rvparksales.com',
      replyTo: `${name} <${email}>`,
      subject: listing ? `${what}: ${listing} (${name})` : `${what} from ${name}`,
      html: renderEmail({
        preheader: message ? message.slice(0, 120) : `${name} filled in the ${what.toLowerCase()} form.`,
        eyebrow: `New ${what.toLowerCase()}`,
        title: listing ? listing : `${name} reached out`,
        intro: listing
          ? `${name} wants more information about this listing. Reply to this email to answer them directly.`
          : `${name} sent a message through rvparksales.com. Reply to this email to answer them directly.`,
        sections: [
          { heading: 'Contact', rows: [['Name', name], ['Email', email, `mailto:${email}`], ['Phone', phone, telHref], ['I am a', role]] },
          { heading: 'Details', rows: [...(listing ? [['Listing', listing, listingUrl]] : []), ...extra] },
        ],
        message: { text: message },
        buttons: [
          { label: 'Reply to customer', href: `mailto:${email}?subject=${encodeURIComponent(`Re: ${listing || what}`)}` },
          ...(telHref ? [{ label: 'Call', href: telHref }] : []),
          ...(listingUrl ? [{ label: 'View listing', href: listingUrl }] : []),
        ],
      }),
    });
    // To the visitor: a branded receipt, so they know it arrived. Best-effort.
    await transporter.sendMail({
      from: `Marie Hansen, RVParkSales.com <${GMAIL_USER}>`,
      to: `${name} <${email}>`,
      replyTo: 'marie@rvparksales.com',
      subject: listing ? `We received your question about ${listing}` : 'We received your message | RVParkSales.com',
      html: renderEmail({
        preheader: 'Thanks for reaching out. We will be in touch shortly.',
        eyebrow: 'Message received',
        title: `Thanks, ${name.split(' ')[0]}!`,
        intro: listing
          ? `We received your request for more information about ${listing}. We will be in touch shortly with the details.`
          : 'We received your message and will be in touch shortly. If it is urgent, call us at (850) 832-0022.',
        sections: [{ heading: 'What you sent', rows: [...(listing ? [['Listing', listing, listingUrl]] : []), ['Name', name], ['Email', email], ['Phone', phone]] }],
        message: { heading: 'Your message', text: message },
        buttons: [
          listingUrl ? { label: 'Back to the listing', href: listingUrl } : { label: 'Browse parks for sale', href: 'https://www.rvparksales.com/listings/?_listing_status=for-sale' },
          { label: 'Get first look access', href: 'https://rvparkselect.com/#pricing' },
        ],
        closing: 'Marie Hansen, RVParkSales.com',
      }),
    }).catch((e) => console.error('Visitor receipt not sent:', e.message));
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Contact email failed:', err.message);
    return Response.json({ error: 'We could not send your message. Please call (850) 832-0022 or email marie@rvparksales.com.' }, { status: 500 });
  }
}
