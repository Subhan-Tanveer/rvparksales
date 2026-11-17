import Link from 'next/link';
import AdPlans from '@/components/AdPlans';
import Split from '@/components/fx/Split';

// Seller prices as a full section (home, listings and state pages), and a
// slim strip that sits above the park search pointing down to it.
export default function PricingSection({ eyebrow = 'Pricing for sellers', tone = 'cn-paper2' }) {
  return (
    <section className={`cn-sec ${tone}`} id="pricing">
      <div className="l-section-h">
        <div className="cn-head">
          <p className="eyebrow">{eyebrow}</p>
          <Split as="h2" text={'Advertise your\npark from *$49/month*'} className="cn-title" />
          <p className="cn-lede">Sell it yourself for $99/month with no commission, or pay just $49/month with Marie Hansen as your broker. <Link href="/pricing/">See full pricing</Link>.</p>
        </div>
        <AdPlans />
      </div>
    </section>
  );
}

export function PricingStrip() {
  return (
    <div className="pricing-strip">
      <span><b>Selling an RV park?</b> List it here from <b>$49/month</b>, or $99/month with no commission.</span>
      <a href="#pricing" className="btn btn-sm">See Pricing</a>
    </div>
  );
}
