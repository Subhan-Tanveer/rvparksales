import Script from 'next/script';

// Marie's GoHighLevel "Seller Form", embedded under Latest News exactly as on
// the old home page. Submissions go straight into her GoHighLevel account.
export default function SellerForm() {
  return (
    <>
      <div className="ghl-form" style={{ borderRadius: 8 }}>
        <iframe
          src="https://api.leadconnectorhq.com/widget/form/jBzQX8EI9wLL5d6XO7Ki"
          style={{ width: '100%', height: 1533, border: 'none', borderRadius: 8, display: 'block' }}
          id="inline-jBzQX8EI9wLL5d6XO7Ki"
          data-layout="{'id':'INLINE'}" data-trigger-type="alwaysShow" data-trigger-value=""
          data-activation-type="alwaysActivated" data-activation-value=""
          data-deactivation-type="neverDeactivate" data-deactivation-value=""
          data-form-name="Seller Form" data-height="1626" data-layout-iframe-id="inline-jBzQX8EI9wLL5d6XO7Ki"
          data-form-id="jBzQX8EI9wLL5d6XO7Ki" title="Seller Form" loading="lazy"
        />
      </div>
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
    </>
  );
}
