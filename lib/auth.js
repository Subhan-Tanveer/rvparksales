// Admin sign-in: one account (Marie) set by environment variables
//   ADMIN_EMAIL, ADMIN_PASSWORD, SESSION_SECRET
// A successful login sets an HTTP-only cookie holding "<expiry>.<signature>",
// signed with SESSION_SECRET (HMAC-SHA256). Uses Web Crypto so the same code
// runs in middleware (edge) and in route handlers (node).
export const COOKIE = 'rv_admin';
const DAYS = 14;
const enc = new TextEncoder();

async function hmac(text) {
  const secret = process.env.SESSION_SECRET || '';
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const same = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
};

export async function makeSession() {
  const exp = Date.now() + DAYS * 864e5;
  return { value: `${exp}.${await hmac(String(exp))}`, maxAge: DAYS * 86400 };
}

export async function validSession(value) {
  if (!value || !process.env.SESSION_SECRET) return false;
  const [exp, sig] = String(value).split('.');
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, await hmac(exp));
}

export function checkLogin(email, password) {
  const E = process.env.ADMIN_EMAIL || '';
  const P = process.env.ADMIN_PASSWORD || '';
  if (!E || !P) return false;
  return same(String(email || '').trim().toLowerCase(), E.trim().toLowerCase()) && same(String(password || ''), P);
}

// For route handlers: true when the request carries a valid admin session.
export async function isAdmin(req) {
  return validSession(req.cookies.get(COOKIE)?.value);
}
