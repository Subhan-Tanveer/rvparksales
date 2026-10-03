'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SCHEMAS, slugify } from '@/lib/admin-schema';
import Field from '@/components/admin/Fields';
import { api, Toast } from '@/components/admin/util';

// Add / edit one entry. The form comes from lib/admin-schema.js.
export default function EditView({ name, id }) {
  const schema = SCHEMAS[name];
  const router = useRouter();
  const isNew = id === 'new';
  const [item, setItem] = useState(null);
  const [extra, setExtra] = useState({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api(name).then((d) => {
      setExtra(d.extra || {});
      if (isNew) {
        const copyOf = new URLSearchParams(window.location.search).get('copy');
        const src = copyOf && d.items.find((x) => x.id === copyOf);
        if (src) {
          const { id: _i, wpId: _w, slug: _s, createdAt: _c, updatedAt: _u, ...rest } = src;
          setItem({ ...rest, title: rest.title ? `${rest.title} (copy)` : rest.title, name: rest.name ? `${rest.name} (copy)` : rest.name, publishState: rest.publishState ? 'draft' : rest.publishState, _new: true });
        } else setItem({ ...schema.blank(), _new: true });
      } else {
        const it = d.items.find((x) => x.id === decodeURIComponent(id));
        if (it) setItem(it); else setMissing(true);
      }
    }).catch((e) => setToast({ err: true, text: e.message }));
  }, [name, id]);

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
    setSaving(true);
    try {
      const body = { ...item };
      const slugF = schema.groups.flatMap((g) => g.fields).find((f) => f.type === 'slug');
      if (slugF && item._new && !item._slugTouched) body.slug = slugify(item[slugF.from]);
      delete body._slugTouched;
      const { item: saved } = await api(name, { method: 'POST', body: { item: body } });
      setDirty(false);
      setToast({ text: 'Saved. The website updates in a few seconds.' });
      if (isNew) router.replace(`/admin/${name}/${encodeURIComponent(saved.id)}/`);
      else setItem(saved);
    } catch (err) {
      setToast({ err: true, text: err.message });
    }
    setSaving(false);
  }

  async function remove() {
    const label = item.title || item.name || item.q || 'this item';
    if (!confirm(`Delete “${label}”? (A backup copy is kept.)`)) return;
    try { await api(name, { method: 'DELETE', query: `id=${encodeURIComponent(item.id)}` }); setDirty(false); router.push(`/admin/${name}/`); } catch (err) { setToast({ err: true, text: err.message }); }
  }

  if (missing) return <div className="adm-card adm-empty">This item was not found. <Link href={`/admin/${name}/`} style={{ color: '#1f9ccb' }}>Back to {schema.label}</Link></div>;
  if (!item) return <p className="adm-count">Loading…</p>;

  const title = item.title || item.name || item.q || (isNew ? `New ${schema.one.toLowerCase()}` : schema.one);
  const hidden = item.publishState && item.publishState !== 'publish';
  return (
    <form onSubmit={save}>
      <div className="adm-head">
        <div>
          <div className="adm-crumb"><Link href="/admin/">Dashboard</Link> / <Link href={`/admin/${name}/`}>{schema.label}</Link> / {isNew ? 'New' : 'Edit'}</div>
          <h1 style={{ maxWidth: 900 }}>{title}</h1>
        </div>
      </div>
      <div className="adm-form">
        <div>
          {schema.groups.map((g) => (
            <section key={g.title} className="adm-group">
              <h2>{g.title}</h2>
              <div className="adm-fields">
                {g.fields.map((f) => <Field key={f.key} f={f} item={item} set={set} extra={extra} name={name} />)}
              </div>
            </section>
          ))}
        </div>
        <aside className="adm-aside">
          <div className="adm-card">
            <button type="submit" className="ab ab-primary" disabled={saving}>{saving ? 'Saving…' : isNew ? `Publish ${schema.one.toLowerCase()}` : 'Save changes'}</button>
            <span className={`adm-status ${dirty ? 'err' : 'ok'}`}>{dirty ? '● Unsaved changes' : isNew ? 'Not saved yet' : '✓ All changes saved'}</span>
            {hidden && <span className="adm-status">This is hidden from visitors (Visibility is not “Published”).</span>}
            {!isNew && <a className="ab" href={schema.path(item)} target="_blank" rel="noopener">View on website ↗</a>}
            {!isNew && <Link className="ab" href={`/admin/${name}/new/?copy=${encodeURIComponent(item.id)}`}>Duplicate</Link>}
            {!isNew && <button type="button" className="ab ab-danger" onClick={remove}>Delete</button>}
          </div>
          <div className="adm-card" style={{ fontSize: '.88rem', color: '#5d6067' }}>
            Changes appear on the website a few seconds after you save. Every save keeps a backup copy, so nothing is ever lost.
          </div>
        </aside>
      </div>
      <Toast toast={toast} onDone={() => setToast(null)} />
    </form>
  );
}
