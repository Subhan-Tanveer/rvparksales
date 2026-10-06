// RVParkAds advertising packages, as shown on the RVParkSales sell page.
// Keep in step with RVParkAds/src/js/plans-data.js (prices, limits, wording).
export const AD_PLANS = [
  {
    key: 'level1', level: 'Level 1', name: 'Professional Listing', price: 99, min: '3-month minimum',
    tagline: 'Get listed in front of serious RV park buyers',
    features: ['Professional listing on RVParkSales.com', 'Sent first to RVParkSelect early-access buyers', 'Property details, financial highlights & map', 'Google-optimized listing page', 'Buyer inquiries sent straight to you', 'Up to 6 photos', 'Views & inquiries report'],
  },
  {
    key: 'level2', level: 'Level 2', name: 'Buyer Exposure', price: 299, min: 'Month to month', popular: true,
    tagline: 'Get buyers: social media + our buyer network',
    includes: 'Everything in Professional Listing',
    features: ['Featured badge & top placement in search', 'Marketed to our buyer database', 'Facebook & Instagram promotion', 'Up to 10 photos + 1 video', 'Monthly marketing report'],
  },
  {
    key: 'level3', level: 'Level 3', name: 'Full Marketing Campaign', price: 499, min: 'Month to month',
    tagline: 'Maximum exposure: a dedicated 30-day campaign',
    includes: 'Everything in Buyer Exposure',
    features: ['Professional video content creation', 'Dedicated 30-day marketing campaign', 'Spotlight on the RVParkSales.com home page', 'Regular social media posting', 'Direct buyer outreach', 'Up to 15 photos + 2 videos', 'Weekly performance report'],
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
