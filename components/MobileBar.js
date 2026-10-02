import Link from 'next/link';

// Two always-visible buttons on phones, so a visitor can reach the buyer or
// seller path from anywhere on the site (Marie's email: most visitors are on
// mobile, and buyers and sellers should both be visible together).
export default function MobileBar() {
  return (
    <div className="mobile-bar">
      <Link href="/listings/?_listing_status=for-sale" className="btn btn-primary btn-sm">I'm a Buyer</Link>
      <Link href="/sell-my-rv-park/" className="btn btn-purple btn-sm">I'm a Seller</Link>
    </div>
  );
}
