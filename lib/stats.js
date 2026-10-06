// Listing performance: page views and buyer inquiries per listing per day.
// Kept in Postgres (the Neon database RVParkSelect also uses, DATABASE_URL),
// because a counter written on every page view doesn't suit the Blob store.
// Shown to Marie in the admin and to RVParkAds sellers on their dashboard.
// Every call is best-effort: no database, no stats, nothing breaks.
import pg from 'pg';

let pool;
let ready;
function db() {
  if (!process.env.DATABASE_URL) return null;
  pool ??= new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  ready ??= pool.query(`
    CREATE TABLE IF NOT EXISTS sales_listing_stats (
      listing_id TEXT NOT NULL,
      day DATE NOT NULL DEFAULT CURRENT_DATE,
      views INTEGER NOT NULL DEFAULT 0,
      inquiries INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (listing_id, day)
    )`).catch((e) => { ready = null; throw e; });
  return pool;
}

export const validListingId = (id) => typeof id === 'string' && /^[\w-]{1,60}$/.test(id);

// kind: 'views' | 'inquiries'
export async function bump(listingId, kind) {
  const p = db();
  if (!p || !validListingId(listingId) || !['views', 'inquiries'].includes(kind)) return;
  try {
    await ready;
    await p.query(
      `INSERT INTO sales_listing_stats (listing_id, ${kind}) VALUES ($1, 1)
       ON CONFLICT (listing_id, day) DO UPDATE SET ${kind} = sales_listing_stats.${kind} + 1`,
      [listingId],
    );
  } catch (e) {
    console.error('Listing stats not saved:', e.message);
  }
}

// { [listingId]: { views30, inquiries30, views, inquiries } } — all listings, or just `ids`.
export async function statsFor(ids) {
  const p = db();
  if (!p) return {};
  try {
    await ready;
    const { rows } = await p.query(
      `SELECT listing_id,
         COALESCE(SUM(views) FILTER (WHERE day > CURRENT_DATE - 30), 0)::int AS views30,
         COALESCE(SUM(inquiries) FILTER (WHERE day > CURRENT_DATE - 30), 0)::int AS inquiries30,
         SUM(views)::int AS views, SUM(inquiries)::int AS inquiries
       FROM sales_listing_stats ${ids ? 'WHERE listing_id = ANY($1)' : ''} GROUP BY listing_id`,
      ids ? [ids] : [],
    );
    return Object.fromEntries(rows.map(({ listing_id: id, ...r }) => [id, r]));
  } catch (e) {
    console.error('Listing stats not read:', e.message);
    return {};
  }
}

// Month by month for one listing (seller reports), newest first.
export async function monthlyFor(listingId) {
  const p = db();
  if (!p || !validListingId(listingId)) return [];
  try {
    await ready;
    const { rows } = await p.query(
      `SELECT to_char(date_trunc('month', day), 'YYYY-MM') AS month, SUM(views)::int AS views, SUM(inquiries)::int AS inquiries
       FROM sales_listing_stats WHERE listing_id = $1 GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
      [listingId],
    );
    return rows;
  } catch (e) {
    console.error('Listing stats not read:', e.message);
    return [];
  }
}
