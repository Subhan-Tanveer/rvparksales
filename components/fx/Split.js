// Splits a headline into words and letters so it can be revealed letter by
// letter (each letter rises out of a mask). Works in server components; the
// motion itself lives in Motion.js (on scroll) or in the page heroes (on load).
// Screen readers get the plain text through aria-label.
// Use "\n" in the text for a line break and *a few words* to colour them.
export default function Split({ text, as: Tag = 'span', className = '', by = 'char', ...rest }) {
  const lines = String(text).split('\n');
  let hi = false; // stays on from the opening star to the closing one
  return (
    <Tag className={`split ${className}`} aria-label={String(text).replace(/\*/g, '').replace(/\n/g, ' ')} data-split={by} {...rest}>
      {lines.map((line, li) => (
        <span key={li} className="sl" aria-hidden="true">
          {line.split(' ').filter(Boolean).map((word, wi) => {
            let w = word;
            if (w.startsWith('*')) { hi = true; w = w.slice(1); }
            const on = hi;
            if (w.endsWith('*')) { hi = false; w = w.slice(0, -1); }
            return (
              <span key={wi} className={`sw${on ? ' hi' : ''}`}>
                {by === 'word' ? <span className="sc">{w}</span> : [...w].map((c, ci) => <span key={ci} className="sc">{c}</span>)}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
