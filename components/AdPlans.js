import { SITE } from '@/lib/content';
import { AD_PLANS } from '@/lib/plans';

// The RVParkAds seller plans as price cards. Shown on the home page, the
// Sell page and /pricing/, so sellers find the prices wherever they land.
export default function AdPlans() {
  return (
    <>
      <div className="ad-plans" data-reveal="stagger">
        {AD_PLANS.map((p) => (
          <div key={p.key} className={`ad-plan ${p.badge ? 'pop' : ''}`}>
            {p.badge && <span className="ad-pop">{p.badge}</span>}
            <span className="ad-level">{p.level}</span>
            <h3>{p.name}</h3>
            <p className="ad-tag">{p.tagline}</p>
            <p className="ad-price"><b>${p.price}</b>/month</p>
            <p className="ad-min">{p.min}</p>
            <ul>
              {p.includes && <li className="inc">{p.includes}</li>}
              {p.features.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <a className={`btn btn-lg ${p.badge ? '' : 'btn-ink'}`} href={`${SITE.ads}/#plans`} target="_blank" rel="noopener">Choose {p.name} ↗</a>
          </div>
        ))}
      </div>
      <div className="ad-promise" data-reveal="stagger">
        <span><b>No commission</b> when you sell it yourself.</span>
        <span><b>Commission only if it sells</b> with Marie as your broker.</span>
        <span><b>Billed monthly.</b> 3-month minimum.</span>
        <span><b>Live</b> within one business day.</span>
      </div>
    </>
  );
}
