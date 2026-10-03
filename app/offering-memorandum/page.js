import PageBand from '@/components/PageBand';

export const metadata = {
  title: 'Offering Memorandum',
  description: 'Request an offering memorandum for an RV park or campground listed on RVParkSales.com.',
  alternates: { canonical: '/offering-memorandum/' },
};

// On the old site this page is only its title band (requests are made from
// each listing's "Request Offering Memo" button), so it stays the same here.
export default function OfferingMemorandum() {
  return <PageBand title="Offering Memorandum" />;
}
