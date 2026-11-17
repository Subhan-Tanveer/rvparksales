// RVParkAds advertising packages, as shown on the RVParkSales sell page.
// Keep in step with RVParkAds/src/js/plans-data.js (prices, limits, wording).
export const AD_PLANS = [
  {
    key: 'level1', level: 'One simple plan', name: 'Professional Listing', price: 99, min: '3-month minimum',
    tagline: 'Get your park in front of serious RV park buyers',
    features: ['Professional listing on RVParkSales.com', 'Marketed to our buyer database', 'Sent first to RVParkSelect early-access buyers', 'Property details, financial highlights & map', 'Google-optimized listing page', 'Buyer inquiries sent straight to you', 'Up to 6 photos', 'Views & inquiries report'],
  },
];

// Live size of the RVParkSelect buyer network. Only returned once it's
// big enough to be a selling point; below that, pages keep their general
// wording. Cached for an hour with the page.
export const BUYER_COUNT_MIN = 100;
export async function buyerCount() {
  try {
    const res = await fetch('https://rvparkselect.com/api/listings?stats=1', { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    const { buyers } = await res.json();
    return Number.isFinite(buyers) && buyers >= BUYER_COUNT_MIN ? buyers : null;
  } catch {
    return null;
  }
}
