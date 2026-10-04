'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SCHEMAS, slugify } from '@/lib/admin-schema';
import Field from '@/components/admin/Fields';
import { source, Toast } from '@/components/admin/util';

const SITE_NAME = { select: 'RVParkSelect.com', ads: 'RVParkAds.com' };

// What the save did on RVParkSelect.com (RVParkSales listings only).
function selectToast(select) {
  const base = 'Saved. The website updates in a few seconds.';
  if (!select || select.skipped) return { text: base };
  if (!select.ok) return { err: true, text: `Saved on RVParkSales.com, but RVParkSelect could not be updated: ${select.error}. Save again to retry.` };
  if (select.visibility === 'public') return { text: `${base} Also live on RVParkSelect for members.${select.alerted ? ' Matching members were emailed.' : ''}` };
  if (select.visibility === 'offmarket') return { text: `Saved as off-market: hidden on RVParkSales.com, shown to RVParkSelect members.${select.alerted ? ' Matching members were emailed.' : ''}` };
  return { text: `${base} Hidden on RVParkSelect.` };
}

const when = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '');

// Add / edit one entry. The form comes from lib/admin-schema.js (this site)
// or lib/admin-remote-schemas.js (RVParkSelect / RVParkAds).
export default function EditView({ name, id }) {
  const schema = SCHEMAS[name];
  const src = useMemo(() => source(name, schema), [name, schema]);
  const router = useRouter();
  const isNew = id === 'new';
  const [item, setItem] = useState(null);
  const [extra, setExtra] = useState({});
  const [activity, setActivity] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [missing, setMissing] = useState(false);
  const readOnly = !!schema.readOnly;

  const load = () => src.list().then((d) => {
    setExtra(d.extra || {});
    if (isNew) {
      const copyOf = new URLSearchParams(window.location.search).get('copy');
      const it = copyOf && d.items.find((x) => x.id === copyOf);
      if (it) {
        const { id: _i, wpId: _w, slug: _s, createdAt: _c, updatedAt: _u, ...rest } = it; // eslint-disable-line no-unused-vars
        setItem({ ...rest, title: rest.title ? `${rest.title} (copy)` : rest.title, name: rest.name ? `${rest.name} (copy)` : rest.name, publishState: rest.publishState ? 'draft' : rest.publishState, _new: true });
      } else setItem({ ...schema.blank(), _new: true });
    } else {
      const it = d.items.find((x) => x.id === decodeURIComponent(id));
      if (it) {
        setItem(it);
        if (src.detail) src.detail(it).then(setActivity).catch(() => {});
      } else setMissing(true);
    }
  }).catch((e) => setToast({ err: true, text: e.message }));
  useEffect(() => { load(); }, [name, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return undefined;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const set = (k, v) => { setItem((it) => ({ ...it, [k]: v })); if (!k.startsWith('_')) setDirty(true); };

  async function save(e) {
    e?.preventDefault();
    if (readOnly) return;
    setSaving(true);
    try {
      const body = { ...item };
      const slugF = schema.groups.flatMap((g) => g.fields).find((f) => f.type === 'slug');
      if (slugF && item._new && !item._slugTouched) body.slug = slugify(item[slugF.from]);
      delete body._slugTouched;
      if (schema.remote) delete body._new;
      const res = await src.save(body, isNew);
      setDirty(false);
      setToast(schema.remote ? { text: `Saved on ${SITE_NAME[schema.site]}.` } : selectToast(res.select));
      if (isNew) router.replace(`/admin/${name}/${encodeURIComponent(res.item.id)}/`);
      else setItem(res.item);
    } catch (err) {
      setToast({ err: true, text: err.message });
    }
    setSaving(false);
  }

  async function remove() {
    const label = item.title || item.name || item.q || item.listingName || item.companyName || 'this item';
    if (!confirm(`Delete “${label}”${schema.remote ? ` from ${SITE_NAME[schema.site]}? This cannot be undone.` : '? (A backup copy is kept.)'}`)) return;
    try { await src.remove(item); setDirty(false); router.push(`/admin/${name}/`); } catch (err) { setToast({ err: true, text: err.message }); }
  }

  async function runAction(a) {
    if (dirty && !confirm('You have unsaved changes. Continue without saving them?')) return;
    if (a.confirm && !confirm(a.confirm)) return;
    try {
      await src.run(a.call(item));
      setToast({ text: a.done || 'Done.' });
      setDirty(false);
      load();
    } catch (err) { setToast({ err: true, text: err.message }); }
  }

  if (missing) return <div className="adm-card adm-empty">This item was not found. <Link href={`/admin/${name}/`} style={{ color: '#1f9ccb' }}>Back to {schema.label}</Link></div>;
  if (!item) return <p className="adm-count">Loading{schema.remote ? ` from ${SITE_NAME[schema.site]}` : ''}…</p>;

  const title = item.title || item.name || item.q || item.listingName || item.companyName || (isNew ? `New ${schema.one.toLowerCase()}` : schema.one);
  const hidden = item.publishState && item.publishState !== 'publish';
  const notice = schema.notice?.(item);
  const actions = (schema.actions || []).filter((a) => !isNew && a.show(item));
  return (
    <form onSubmit={save}>
      <div className="adm-head">
        <div>
          <div className="adm-crumb"><Link href="/admin/">Dashboard</Link> / <Link href={`/admin/${name}/`}>{schema.label}</Link> / {isNew ? 'New' : readOnly ? 'Details' : 'Edit'}</div>
          <h1 style={{ maxWidth: 900 }}>{title}</h1>
          {schema.remote && <p>On {SITE_NAME[schema.site]}</p>}
        </div>
      </div>
      {notice && <div className="adm-card" style={{ marginBottom: 16, borderColor: '#f0c674', background: '#fffaf0' }}>{notice}</div>}
      <div className="adm-form">
        <div>
          {schema.groups.filter((g) => !g.showIf || g.showIf(item)).map((g) => (
            g.activity ? (
              <section key={g.title} className="adm-group">
                <h2>{g.title}</h2>
                <Activity data={activity} />
              </section>
            ) : (
              <section key={g.title} className="adm-group">
                <h2>{g.title}</h2>
                <div className="adm-fields">
                  {g.fields.filter((f) => !f.showIf || f.showIf(item)).map((f) => <Field key={f.key} f={f} item={item} set={set} extra={extra} name={name} />)}
                </div>
              </section>
            )
          ))}
        </div>
        <aside className="adm-aside">
          <div className="adm-card">
            {!readOnly && <button type="submit" className="ab ab-primary" disabled={saving}>{saving ? 'Saving…' : isNew ? (schema.remote ? `Add ${schema.one.toLowerCase()}` : `Publish ${schema.one.toLowerCase()}`) : 'Save changes'}</button>}
            {!readOnly && <span className={`adm-status ${dirty ? 'err' : 'ok'}`}>{dirty ? '● Unsaved changes' : isNew ? 'Not saved yet' : '✓ All changes saved'}</span>}
            {actions.map((a) => <button key={a.label} type="button" className={`ab ${a.danger ? 'ab-danger' : 'ab-accent'}`} onClick={() => runAction(a)}>{a.label}</button>)}
            {hidden && item.publishState === 'offmarket' && <span className="adm-status">Off-market: only RVParkSelect members can see this park.</span>}
            {hidden && item.publishState !== 'offmarket' && <span className="adm-status">This is hidden from visitors (Visibility is not “Published”).</span>}
            {!isNew && <a className="ab" href={schema.path(item)} target="_blank" rel="noopener">View on {schema.remote ? SITE_NAME[schema.site] : 'website'} ↗</a>}
            {!isNew && !schema.remote && <Link className="ab" href={`/admin/${name}/new/?copy=${encodeURIComponent(item.id)}`}>Duplicate</Link>}
            {!isNew && schema.canDelete !== false && <button type="button" className="ab ab-danger" onClick={remove}>Delete</button>}
          </div>
          <div className="adm-card" style={{ fontSize: '.88rem', color: '#5d6067' }}>
            {schema.remote
              ? `Changes save straight to ${SITE_NAME[schema.site]} and show there right away.`
              : 'Changes appear on the website a few seconds after you save. Every save keeps a backup copy, so nothing is ever lost.'}
          </div>
        </aside>
      </div>
      <Toast toast={toast} onDone={() => setToast(null)} />
    </form>
  );
}

// A member's NDAs, saved parks and questions (RVParkSelect).
function Activity({ data }) {
  if (!data) return <p className="af-hint">Loading activity…</p>;
  const block = (title, list, render) => (
    <div style={{ marginBottom: 16 }}>
      <div className="af-label" style={{ fontWeight: 500, marginBottom: 6 }}>{title} ({list.length})</div>
      {list.length ? <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>{list.map(render)}</ul> : <span className="af-hint">None yet.</span>}
    </div>
  );
  return (
    <>
      {block('NDAs signed', data.ndas || [], (n) => <li key={`${n.listingId}-${n.signedAt}`}>{n.listingName} · {when(n.signedAt)} · wants {n.lastIntent === 'unlock' ? 'details' : n.lastIntent}{n.pdfUrl && <> · <a href={n.pdfUrl} target="_blank" rel="noopener" style={{ color: '#1f9ccb' }}>NDA PDF</a></>}</li>)}
      {block('Saved parks', data.favorites || [], (f) => <li key={`${f.listingId}`}>{f.listingName} · {when(f.createdAt)}</li>)}
      {block('Questions asked', data.inquiries || [], (i) => <li key={`${i.listingId}-${i.createdAt}`}><b>{i.listingName}</b> · {when(i.createdAt)}{i.buyerType ? ` · ${i.buyerType}` : ''}<br /><span style={{ color: '#5d6067' }}>{i.message}</span></li>)}
    </>
  );
}
