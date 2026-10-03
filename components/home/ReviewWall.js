// Reviews as a scattered wall (Tandy style): tilted cards in loose columns that
// fly in, drift at different speeds while you scroll, and straighten on hover.
const TILTS = [-4, 3, -2, 4.5, -3, 2, -1.5, 3.5, -2.5];
const SPEEDS = [0.25, -0.15, 0.4, -0.05, 0.3, -0.2];

export default function ReviewWall({ items, full = false }) {
  return (
    <div className="rwall">
      {items.map((t, i) => {
        const [name, ...rest] = t.name.split(',');
        const q = t.quote.replace(/^[\s"“”]+|[\s"“”]+$/g, '');
        return (
          <div key={t.name + (t.date || '')} className="rw-col" data-speed={SPEEDS[i % SPEEDS.length]}>
            <div data-pop>
              <figure className={`rw-card rw-${i % 4}`} style={{ '--r': `${TILTS[i % TILTS.length]}deg` }}>
                <div className="rw-stars" aria-label="5 stars">★★★★★</div>
                <blockquote>“{!full && q.length > 260 ? `${q.slice(0, 257).replace(/\s+\S*$/, '')}…` : q}”</blockquote>
                <figcaption><b>{name.trim()}</b><span>{rest.length ? rest.join(',').trim() : 'RVParkSales client'}</span></figcaption>
              </figure>
            </div>
          </div>
        );
      })}
    </div>
  );
}
