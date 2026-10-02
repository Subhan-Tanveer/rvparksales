import nodemailer from 'nodemailer';

// Contact form handler. Sends the message to Marie by email, with the
// visitor's address as reply-to so she can answer straight from her inbox.
// Until GMAIL_USER / GMAIL_APP_PASSWORD are set for this project it answers
// 503 with a friendly "call or email us" message instead of pretending to send.
// (The old site's form fed Keap; hooking this into Keap or another CRM is a
// separate step, see README.)

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Please enter your name, a valid email and a message.' }, { status: 400 });
  }

  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return Response.json(
      { error: 'Our contact form is being set up. Please call (850) 832-0022 or email marie@rvparksales.com.' },
      { status: 503 }
    );
  }

  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD } });
    await transporter.sendMail({
      from: `RVParkSales.com <${GMAIL_USER}>`,
      to: 'marie@rvparksales.com',
      replyTo: `${name} <${email}>`,
      subject: `New website message from ${name}${listing ? ` about ${listing}` : ''}`,
      html: `<h3>New message from rvparksales.com</h3>
        <p><strong>Name:</strong> ${esc(name)}<br><strong>Email:</strong> ${esc(email)}<br><strong>Phone:</strong> ${esc(phone) || '—'}<br><strong>I am a:</strong> ${esc(role) || '—'}<br><strong>Listing:</strong> ${esc(listing) || '—'}</p>
        <p style="white-space:pre-wrap">${esc(message)}</p>`,
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Contact email failed:', err.message);
    return Response.json({ error: 'We could not send your message. Please call (850) 832-0022 or email marie@rvparksales.com.' }, { status: 500 });
  }
}
