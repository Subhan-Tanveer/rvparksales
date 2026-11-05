import SiteShell from '@/components/SiteShell';
import { JsonLd, organization, website } from '@/lib/seo';

// Public pages: wrapped in the site shell (header, footer, motion).
// Refreshed at least hourly, so Early access parks go public on their date
// without anyone saving anything.
export const revalidate = 3600;

export default function SiteLayout({ children }) {
  return (
    <>
      <JsonLd data={[organization, website]} />
      <SiteShell>{children}</SiteShell>
    </>
  );
}
