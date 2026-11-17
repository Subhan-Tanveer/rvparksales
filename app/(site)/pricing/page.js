import Link from 'next/link';
import PageBand from '@/components/PageBand';
import AdPlans from '@/components/AdPlans';
import Split from '@/components/fx/Split';
import { SITE } from '@/lib/content';
import { JsonLd, breadcrumbs } from '@/lib/seo';
import { AD_PLANS } from '@/lib/plans';

export const metadata = {
  title: { absolute: 'Pricing: Advertise Your RV Park for Sale from $49/month | RV Park Sales' },
  description: 'What it costs to sell your RV park on RVParkSales.com: $99/month to sell it yourself with no commission, or $49/month with Marie Hansen as your broker. Buyer memberships from $59/month.',
  alternates: { canonical: '/pricing/' },
};

// Buyer memberships live on RVParkSelect.com (keep in step with its plans).
const BUYER_PLANS = [
  { name: 'Pro', price: 59, text: 'New-listing alerts for every state, your buyer profile visible to sellers, lender intro.' },
  { name: 'Premium', price: 99, text: 'Everything in Pro, plus the Featured Buyer badge and Proof of Funds verification.' },
];

const FAQ = [
  ['What is the difference between the two seller plans?', 'Sell It Yourself ($99/month): we market your park and buyers contact you directly, with no commission. Sell With Marie ($49/month): Marie Hansen of RVParkSales is your listing broker and handles buyers, negotiation and closing, and is paid a commission only if your park sells.'],
  ['How is the broker commission set?', 'In Marie’s listing agreement, which you sign before your park goes live. It is paid only at closing; if your park doesn’t sell, you never pay it.'],
  ['Is there a contract?', 'Both plans are billed monthly with a 3-month minimum. After that you can cancel any month.'],
  ['How fast does my listing go live?', 'Usually within one business day of completing your park details.'],
];

export default function PricingPage() {
  const offers = AD_PLANS.map((p) => ({ '@type': 'Offer', name: p.name, price: p.price, priceCurrency: 'USD', url: `${SITE.ads}/#plans` }));
  return (
    <>
      <JsonLd data={[
        breadcrumbs([['Home', '/'], ['Pricing']]),
        { '@type': 'Service', name: 'RV park advertising', provider: { '@id': `${SITE.url}/#organization` }, areaServed: 'US', offers },
        { '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      ]} />
      <PageBand title="Pricing" kicker="Simple, monthly" sub="Advertise your RV park from $49/month. No hidden fees." crumbs={[{ label: 'Pricing' }]} compact />

      <section className="cn-sec cn-paper" id="sellers">
        <div className="l-section-h">
          <div className="cn-head">
            <p className="eyebrow">For sellers</p>
            <Split as="h2" text={'Sell it yourself,\nor sell it *with Marie*'} className="cn-title" />
            <p className="cn-lede">Both plans put your park on RVParkSales.com and market it to our buyer database. Pick the one that fits how you want to sell.</p>
          </div>
          <AdPlans />
        </div>
      </section>

      <section className="cn-sec cn-paper2" id="buyers">
        <div className="l-section-h">
          <div className="cn-head">
            <p className="eyebrow">For buyers</p>
            <Split as="h2" text={'See parks\n*before everyone else*'} className="cn-title" />
            <p className="cn-lede">Browsing RVParkSales.com is free. RVParkSelect members get new parks first, before they go public.</p>
          </div>
          <div className="ad-plans buyer-plans" data-reveal="stagger">
            {BUYER_PLANS.map((b) => (
              <div key={b.name} className="ad-plan">
                <span className="ad-level">RVParkSelect</span>
                <h3>{b.name}</h3>
                <p className="ad-price"><b>${b.price}</b>/month</p>
                <p className="ad-tag">{b.text}</p>
                <a className="btn btn-lg btn-ink" href={`${SITE.select}/#pricing`} target="_blank" rel="noopener">Join RVParkSelect ↗</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cn-sec cn-paper" id="faq">
        <div className="l-section-h" style={{ maxWidth: 900 }}>
          <div className="cn-head">
            <p className="eyebrow">Questions</p>
            <Split as="h2" text="Pricing *FAQ*" className="cn-title" />
          </div>
          <div className="pricing-faq">
            {FAQ.map(([q, a]) => (
              <details key={q}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
          <p className="cn-lede" style={{ marginTop: 30 }}>Not sure which plan fits? <Link href="/contact/">Talk with Marie</Link> or call <a href={SITE.phoneHref}>{SITE.phone}</a>.</p>
        </div>
      </section>
    </>
  );
}
