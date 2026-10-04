import SiteShell from '@/components/SiteShell';

// Public pages: wrapped in the site shell (header, footer, motion).
// Refreshed at least hourly, so Early access parks go public on their date
// without anyone saving anything.
export const revalidate = 3600;

export default function SiteLayout({ children }) {
  return <SiteShell>{children}</SiteShell>;
}
