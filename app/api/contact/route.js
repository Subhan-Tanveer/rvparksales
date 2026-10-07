import nodemailer from 'nodemailer';
import { bump } from '@/lib/stats';
import { renderEmail } from '@/lib/email-template';
import { loadContent, allListings, brokers, developers, brokerByName } from '@/lib/content';

// Every form on the site posts here. Marie always gets the message; when it's
// about a particular person or park, the right person gets it too:
//   broker profile      -> that broker
//   developer profile   -> that developer
//   listing             -> the listing's broker (Marie's own listings: just Marie),
//                          or the owner, for parks advertised on RVParkAds
// Those addresses are looked up here from the site's own data, never taken
// from the form, so the form can't be used to email anyone else.
// Replies go straight to the visitor, who also gets a branded receipt.
// Needs GMAIL_USER / GMAIL_APP_PASSWORD (answers 503 with a "call us" message until set).

const MARIE = 'marie@rvparksales.com';
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');

// Who else should get this message, besides Marie.
async function recipientsFor(body) {
  await loadContent();
  const out = [];
  const add = (name, email, why) => {
    if (validEmail(email) && email.toLowerCase() !== MARIE && !out.some((r) => r.email.toLowerCase() === email.toLowerCase())) out.push({ name, email, why });
  };
  const about = body.about && typeof body.about === 'object' ? body.about : {};
  if (about.kind === 'broker') { const b = brokers().find((x) => x.slug === about.slug); if (b) add(b.name, b.email, 'broker'); }
  if (about.kind === 'developer') { const d = developers().find((x) => x.slug === about.slug); if (d) add(d.name, d.email, 'developer'); }
  if (body.listingId) {
    const l = allListings().find((x) => String(x.id) === String(body.listingId));
    if (l?.source === 'ads') add(l.ownerName || 'Owner', l.ownerEmail, 'owner');
    else if (l?.sellerName) { const b = brokerByName(l.sellerName); if (b) add(b.name, b.email, 'broker'); }
  }
  return out;
}

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
  // Popups send their form name plus extra fields.
  const form = String(body.form || '').trim().slice(0, 80);
  const details = body.details && typeof body.details === 'object'
    ? Object.entries(body.details).slice(0, 20).map(([k, v]) => [String(k).slice(0, 60), String(v ?? '').trim().slice(0, 300)]).filter(([, v]) => v)
    : [];

  if (!name || (!message && !form) || !validEmail(email)) {
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

  // What the message is about, for subject lines and headings.
  const what = form === 'Listing Information' ? 'Listing inquiry' : form || 'Website message';
  const linkKey = details.find(([k]) => /(Listing URL| Link)$/.test(k));
  const pageUrl = linkKey?.[1];
  const extra = details.filter(([k]) => k !== linkKey?.[0]);
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;
  const subject = listing ? `${what}: ${listing} (${name})` : `${what} from ${name}`;
  const others = await recipientsFor(body).catch(() => []);

  // The alert itself; `note` says who else got it / why they're getting it.
  const alert = (note) => renderEmail({
    preheader: message ? message.slice(0, 120) : `${name} filled in the ${what.toLowerCase()} form.`,
    eyebrow: `New ${what.toLowerCase()}`,
    title: listing || `${name} reached out`,
    intro: `${listing ? `${name} wants more information about this listing.` : `${name} sent a message through rvparksales.com.`} Reply to this email to answer them directly.${note ? ` ${note}` : ''}`,
    sections: [
      { heading: 'Contact', rows: [['Name', name], ['Email', email, `mailto:${email}`], ['Phone', phone, telHref], ['I am a', role]] },
      { heading: 'Details', rows: [...(listing ? [['Listing', listing, pageUrl]] : []), ...extra] },
    ],
    message: { text: message },
    buttons: [
      { label: 'Reply to customer', href: `mailto:${email}?subject=${encodeURIComponent(`Re: ${listing || what}`)}` },
      ...(telHref ? [{ label: 'Call', href: telHref }] : []),
      ...(pageUrl ? [{ label: listing ? 'View listing' : 'View page', href: pageUrl }] : []),
    ],
  });

  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
    const send = (to, html) => transporter.sendMail({ from: `RVParkSales.com <${GMAIL_USER}>`, to, replyTo: { name, address: email }, subject, html });

    // Marie always.
    await send(MARIE, alert(others.length ? `A copy was also sent to ${others.map((r) => `${r.name} (${r.email})`).join(' and ')}.` : ''));
    // The broker / developer / owner it's about. One failing doesn't stop the rest.
    await Promise.all(others.map((r) => send({ name: r.name, address: r.email },
      alert(r.why === 'owner' ? 'This came from your listing on RVParkSales.com. Marie Hansen has a copy.' : 'Marie Hansen has a copy.'))
      .catch((e) => console.error(`Copy to ${r.email} not sent:`, e.message))));

    // The visitor: a branded receipt, so they know it arrived. Best-effort.
    const who = others.length ? `${others.map((r) => (r.why === 'owner' ? 'the owner' : r.name)).join(' and ')} and our team` : 'our team';
    await transporter.sendMail({
      from: `Marie Hansen, RVParkSales.com <${GMAIL_USER}>`,
      to: { name, address: email },
      replyTo: others[0] ? { name: others[0].name, address: others[0].email } : MARIE,
      subject: listing ? `We received your question about ${listing}` : 'We received your message | RVParkSales.com',
      html: renderEmail({
        preheader: 'Thanks for reaching out. We will be in touch shortly.',
        eyebrow: 'Message received',
        title: `Thanks, ${name.split(' ')[0]}!`,
        intro: `${listing ? `We received your request for more information about ${listing}.` : 'We received your message.'} It has been sent to ${who}, and you will hear back shortly. If it is urgent, call us at (850) 832-0022.`,
        sections: [{ heading: 'What you sent', rows: [...(listing ? [['Listing', listing, pageUrl]] : []), ['Name', name], ['Email', email], ['Phone', phone]] }],
        message: { heading: 'Your message', text: message },
        buttons: [
          listing && pageUrl ? { label: 'Back to the listing', href: pageUrl } : { label: 'Browse parks for sale', href: 'https://www.rvparksales.com/listings/?_listing_status=for-sale' },
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
