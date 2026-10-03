import Link from 'next/link';

// "What are you looking to do?" as an editorial index. Hovering a row (desktop)
// wipes it black, slides a small photo pill open where the number was, and
// rolls the title up into an accent copy of itself, so nothing ever covers the
// page. Phones show a fixed thumbnail instead.
export default function GoalList({ items }) {
  return (
    <div className="gl">
      {items.map((g, i) => {
        const inner = (
          <>
            <span className="gl-n">
              <b>0{i + 1}</b>
              <span className="gl-pill" style={{ backgroundImage: `url(${g.image})` }} aria-hidden="true" />
            </span>
            <span className="gl-thumb" style={{ backgroundImage: `url(${g.image})` }} aria-hidden="true" />
            <span className="gl-title">
              <span className="gl-roll">
                <span>{g.title}</span>
                <span aria-hidden="true">{g.title}</span>
              </span>
            </span>
            <span className="gl-text">{g.text}</span>
            <span className="gl-cta">{g.cta}<i>→</i></span>
          </>
        );
        return g.ext
          ? <a key={g.title} href={g.href} className="gl-row" target="_blank" rel="noopener">{inner}</a>
          : <Link key={g.title} href={g.href} className="gl-row">{inner}</Link>;
      })}
    </div>
  );
}
