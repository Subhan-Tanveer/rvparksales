import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { isAdmin } from '@/lib/auth';

// Gives the admin's browser a one-time token to upload a photo straight to
// the Blob store (no size limit from our own server). Signed-in admin only.
export async function POST(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const body = await req.json();
  try {
    const result = await handleUpload({
      request: req,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith('uploads/')) throw new Error('Bad upload path');
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf'],
          maximumSizeInBytes: 25 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
