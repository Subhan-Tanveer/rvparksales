// Branded HTML email for RVParkSales.com, in the site's look: ink header with
// the logo, warm paper background, blue accent, condensed uppercase titles.
// Same structure as the RVParkSelect / RVParkAds emails. Table layout with
// inline styles so Gmail, Outlook and Apple Mail all show it the same.
const C = {
  ink: '#0c0e11',
  ink2: '#1e2229',
  paper: '#f3efe7',
  paper2: '#ebe5d9',
  card: '#ffffff',
  line: '#e4ddcf',
  text: '#1d2026',
  dim: '#6b6559',
  accent: '#3bbbed',
  accentDark: '#1b93c4',
};
const DISPLAY = "'Anton', 'Oswald', Impact, 'Arial Narrow', Arial, sans-serif";
const BODY = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const SITE = 'https://www.rvparksales.com';

export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const has = (v) => v !== null && v !== undefined && String(v).trim() !== '';

function rowsTable(rows) {
  const list = rows.filter(([, v]) => has(v));
  if (!list.length) return '';
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}; border:1px solid ${C.line}; border-radius:14px;">
      ${list.map(([label, value, href], i) => {
        const b = i === list.length - 1 ? '' : `border-bottom:1px solid ${C.line};`;
        const v = href ? `<a href="${esc(href)}" style="color:${C.accentDark}; text-decoration:none; font-weight:600;">${esc(value)}</a>` : esc(value);
        return `<tr>
          <td style="padding:13px 18px; ${b} font-family:${BODY}; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:${C.dim}; white-space:nowrap; vertical-align:top;">${esc(label)}</td>
          <td style="padding:13px 18px; ${b} font-family:${BODY}; font-size:14px; color:${C.text}; text-align:right; font-weight:600; word-break:break-word;">${v}</td>
        </tr>`;
      }).join('')}
    </table>`;
}

const heading = (t) => `<p style="margin:26px 0 10px; font-family:${BODY}; font-size:11px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase; color:${C.accentDark};">${esc(t)}</p>`;

// Pill buttons; inline-block so they wrap onto a new line on narrow phones.
function button({ label, href }, primary) {
  return `<a href="${esc(href)}" style="display:inline-block; margin:0 8px 10px 0; padding:13px 26px; border-radius:999px; background:${primary ? C.accent : C.ink}; font-family:${BODY}; font-size:13px; font-weight:700; letter-spacing:.6px; text-transform:uppercase; color:${primary ? C.ink : '#ffffff'}; text-decoration:none;">${esc(label)}</a>`;
}

/**
 * @param {object} o
 * @param {string} o.eyebrow   small blue label above the title
 * @param {string} o.title     main heading
 * @param {string} [o.intro]   opening paragraph (plain text)
 * @param {Array<{heading?:string, rows:Array<[string,string,string?]>}>} [o.sections]  label/value rows; optional 3rd item = link
 * @param {{heading?:string, text:string}} [o.message]  a quoted message block
 * @param {Array<{label:string, href:string}>} [o.buttons]  first one is the main (blue) button
 * @param {string} [o.closing]  closing paragraph
 * @param {string} [o.preheader] inbox preview text
 */
export function renderEmail({ eyebrow, title, intro, sections = [], message, buttons = [], closing, preheader }) {
  const body = sections.map((s) => {
    const t = rowsTable(s.rows);
    return t ? (s.heading ? heading(s.heading) : '<div style="height:24px"></div>') + t : '';
  }).join('');
  const msg = message && has(message.text) ? `${heading(message.heading || 'Message')}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="border-left:4px solid ${C.accent}; background:${C.paper}; border-radius:0 14px 14px 0; padding:18px 20px; font-family:${BODY}; font-size:15px; line-height:1.65; color:${C.text}; white-space:pre-wrap;">${esc(message.text)}</td>
    </tr></table>` : '';
  const btns = buttons.length ? `<div style="margin:28px 0 0;">${buttons.map((b, i) => button(b, i === 0)).join('')}</div>` : '';

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(title)}</title></head>
<body style="margin:0; padding:0; background:${C.paper2};">
  ${preheader ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${esc(preheader)}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper2};">
    <tr><td align="center" style="padding:36px 14px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:${C.card}; border-radius:22px; overflow:hidden;">

        <tr><td style="background:${C.ink}; padding:28px 32px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td><a href="${SITE}"><img src="${SITE}/images/logo-light.png" width="150" height="69" alt="RVParkSales.com" style="display:block; width:150px; height:auto; border:0;"></a></td>
            <td align="right" style="font-family:${BODY}; font-size:10px; letter-spacing:2px; text-transform:uppercase; color:${C.accent}; font-weight:700;">America’s RV Park<br>Marketplace</td>
          </tr></table>
        </td></tr>
        <tr><td style="height:4px; line-height:4px; font-size:0; background:${C.accent};">&nbsp;</td></tr>

        <tr><td style="padding:36px 32px 34px;">
          <p style="margin:0 0 10px; font-family:${BODY}; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:${C.accentDark};">${esc(eyebrow)}</p>
          <h1 style="margin:0 0 14px; font-family:${DISPLAY}; font-weight:400; font-size:30px; line-height:1.08; text-transform:uppercase; letter-spacing:.3px; color:${C.ink};">${esc(title)}</h1>
          ${intro ? `<p style="margin:0; font-family:${BODY}; font-size:15px; line-height:1.65; color:${C.dim};">${esc(intro)}</p>` : ''}
          ${body}
          ${msg}
          ${btns}
          ${closing ? `<p style="margin:26px 0 0; font-family:${BODY}; font-size:14px; line-height:1.7; color:${C.dim};">${esc(closing)}</p>` : ''}
        </td></tr>

        <tr><td style="background:${C.ink}; padding:24px 32px; text-align:center;">
          <p style="margin:0 0 6px; font-family:${DISPLAY}; font-size:15px; letter-spacing:1px; text-transform:uppercase; color:#ffffff;">RVParkSales<span style="color:${C.accent};">.com</span></p>
          <p style="margin:0; font-family:${BODY}; font-size:12px; line-height:1.7; color:#9aa0a8;">
            <a href="tel:+18508320022" style="color:#9aa0a8; text-decoration:none;">(850) 832-0022</a> &nbsp;·&nbsp;
            <a href="mailto:marie@rvparksales.com" style="color:#9aa0a8; text-decoration:none;">marie@rvparksales.com</a><br>
            <a href="${SITE}/listings/?_listing_status=for-sale" style="color:${C.accent}; text-decoration:none;">Parks for sale</a> &nbsp;·&nbsp;
            <a href="https://rvparkselect.com" style="color:${C.accent}; text-decoration:none;">RVParkSelect</a> &nbsp;·&nbsp;
            <a href="https://www.rvparkads.com" style="color:${C.accent}; text-decoration:none;">RVParkAds</a> &nbsp;·&nbsp;
            <a href="https://www.rvparksuccess.com" style="color:${C.accent}; text-decoration:none;">RVParkSuccess</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
