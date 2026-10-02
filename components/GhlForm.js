'use client';
import Script from 'next/script';

// The GoHighLevel form the old site used for sellers ("Seller Form"). Embedding
// the same form keeps seller leads flowing into GoHighLevel exactly as before.
// The form id and height come from the old home page's embed code.
export default function GhlForm({ formId = 'jBzQX8EI9wLL5d6XO7Ki', name = 'Seller Form', height = 1626 }) {
  return (
    <>
      <iframe
        src={`https://api.leadconnectorhq.com/widget/form/${formId}`}
        id={`inline-${formId}`}
        title={name}
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-activation-type="alwaysActivated"
        data-deactivation-type="neverDeactivate"
        data-form-name={name}
        data-height={height}
        data-layout-iframe-id={`inline-${formId}`}
        data-form-id={formId}
        style={{ width: '100%', minHeight: 720, border: 'none', borderRadius: 8 }}
      />
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
    </>
  );
}
