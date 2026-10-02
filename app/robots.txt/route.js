import { SITE } from '@/lib/content';

// The preview copy of the site must NOT be indexed: two copies of the same
// content would compete with the live WordPress site. Indexing is switched on
// only at launch by setting ALLOW_INDEXING=true on the production deployment.
export const dynamic = 'force-dynamic';

export function GET() {
  const allow = process.env.ALLOW_INDEXING === 'true';
  const body = allow
    ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
