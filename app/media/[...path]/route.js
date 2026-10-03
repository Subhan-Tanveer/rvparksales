// Photos uploaded in /admin live in the private Blob store; this serves them at
// /media/<path>. Upload names carry a random suffix and never change, so the
// response is cached for a year by browsers and Vercel's CDN.
export async function GET(req, { params }) {
  const { path } = await params;
  const pathname = path.map(decodeURIComponent).join('/');
  if (!pathname.startsWith('uploads/') || !process.env.BLOB_READ_WRITE_TOKEN) return new Response('Not found', { status: 404 });
  const { get } = await import('@vercel/blob');
  const res = await get(pathname, { access: 'private' }).catch(() => null);
  if (!res) return new Response('Not found', { status: 404 });
  return new Response(res.stream, {
    headers: {
      'Content-Type': res.blob.contentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
    },
  });
}
