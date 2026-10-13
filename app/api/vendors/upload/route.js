import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';

// Gives a vendor's browser a one-time token to upload their logo and photos
// for the Vendors and Services sign-up form. Public, so it only allows images,
// only into uploads/vendors/, and caps the size.
export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  try {
    const result = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!/^uploads\/vendors\/[a-z0-9.-]+$/.test(pathname)) throw new Error('Bad upload path');
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
