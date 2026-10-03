import { NextResponse } from 'next/server';
import { COOKIE, validSession } from '@/lib/auth';

// Everything under /admin and /api/admin needs Marie's login, except the
// login page and the login call themselves.
export async function middleware(req) {
  const { pathname } = req.nextUrl;
  if (/^\/admin\/login\/?$/.test(pathname) || /^\/api\/admin\/login\/?$/.test(pathname)) return NextResponse.next();
  if (await validSession(req.cookies.get(COOKIE)?.value)) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login/';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
