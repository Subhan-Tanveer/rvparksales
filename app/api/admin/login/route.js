import { NextResponse } from 'next/server';
import { COOKIE, checkLogin, makeSession } from '@/lib/auth';

// Sign in / sign out for /admin.
export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!checkLogin(email, password)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return NextResponse.json({ error: 'That email or password is not right.' }, { status: 401 });
  }
  const s = await makeSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, s.value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: s.maxAge });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
