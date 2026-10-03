import SiteShell from '@/components/SiteShell';

// Public pages: wrapped in the site shell (header, footer, motion).
export default function SiteLayout({ children }) {
  return <SiteShell>{children}</SiteShell>;
}
