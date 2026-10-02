import fs from 'node:fs';
import path from 'node:path';

// Old WordPress addresses that no longer have a page. Search engines and old
// links still hit them, so they go to the nearest useful page instead of a 404.
function oldDeadListingRedirects() {
  try {
    const file = path.join(process.cwd(), 'data', 'old-404s.json');
    return JSON.parse(fs.readFileSync(file, 'utf8'))
      .filter((p) => /^listing\/\d+\/?$/.test(p))
      .map((p) => ({ source: '/' + p.replace(/\/?$/, '/'), destination: '/listings/', permanent: true }));
  } catch {
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The old site used a trailing slash on every address; keep it so existing
  // links and search results keep working without extra redirects.
  trailingSlash: true,
  images: {
    // Photos are still served from the old WordPress site during the preview.
    // Before cutover they are copied into this project (see README).
    remotePatterns: [{ protocol: 'https', hostname: 'www.rvparksales.com' }],
  },
  async redirects() {
    return [
      { source: '/blog/', destination: '/blog-buying-and-selling-rv-parks/', permanent: true },
      { source: '/my-account/', destination: '/', permanent: true },
      ...oldDeadListingRedirects(),
    ];
  },
};

export default nextConfig;
