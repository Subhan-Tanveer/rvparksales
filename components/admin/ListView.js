'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SCHEMAS } from '@/lib/admin-schema';
import { Icon } from '@/components/admin/AdminShell';
import { api, Toast } from '@/components/admin/util';

const money = (n) => (n ? `$${Number(n).toLocaleString('en-US')}` : '—');
const VIS = { publish: ['Published', 'pill-green'], draft: ['Hidden', 'pill-amber'], private: ['Private', 'pill-gray'] };
const STAT = { 'For Sale': 'pill-green', Sold: 'pill-blue', Archived: 'pill-gray' };

// One admin section: searchable table of everything in a collection.
export default function ListView({ name }) {
  const schema = SCHEMAS[name];
  const router = useRouter();
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [f, setF] = useState({});
  const [toast, setToast] = useState(null);

  const load = () => api(name).then((d) => setItems(d.items)).catch((e) => setToast({ err: true, text: e.message }));
  useEffect(() => { load(); }, [name]);

  const shown = useMemo(() => {
    if (!items) return [];
    let list = items.filter((it) => Object.entries(f).every(([k, v]) => !v || (it[k] || '') === v));
    if (q.trim()) {
      const words = q.toLowerCase().split(/\s+/);
      list = list.filter((it) => { const t = JSON.stringify([it.title, it.name, it.q, it.quote, it.city, it.state, it.slug]).toLowerCase(); return words.every((w) => t.includes(w)); });
    }
    return schema.sort && !schema.ordered ? [...list].sort(schema.sort) : list;
  }, [items, q, f, schema]);

  async function remove(it, e) {
    e.stopPropagation();
    const label = it.title || it.name || it.q || 'this item';
    if (!confirm(`Delete “${label}”? This cannot be undone from here (a backup copy is kept).`)) return;
    try { await api(name, { method: 'DELETE', query: `id=${encodeURIComponent(it.id)}` }); setToast({ text: 'Deleted' }); load(); } catch (err) { setToast({ err: true, text: err.message }); }
  }

  async function move(it, dir, e) {
    e.stopPropagation();
    const ids = items.map((x) => x.id);
    const i = ids.indexOf(it.id); const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    setItems(ids.map((id) => items.find((x) => x.id === id)));
    try { await api(name, { method: 'PUT', body: { order: ids } }); setToast({ text: 'Order saved' }); } catch (err) { setToast({ err: true, text: err.message }); load(); }
  }

  const cell = (it, [key, label]) => {
    const v = it[key];
    if (label === 'thumb') return v ? <img className={`adm-thumb ${name === 'brokers' || name === 'developers' ? 'round' : ''}`} src={v} alt="" loading="lazy" /> : <span className="adm-thumb" />;
    if (key === 'publishState') { const [t, c] = VIS[v || 'publish'] || [v, 'pill-gray']; return <span className={`pill ${c}`}>{t}</span>; }
    if (key === 'status') return v ? <span className={`pill ${STAT[v] || 'pill-gray'}`}>{v}</span> : '—';
    if (key === 'priceUsd') return money(v);
    if (key === 'date') return String(v || '').slice(0, 10) || '—';
    if (key === 'quote') return <div className="t-clip">{v}</div>;
    if (key === 'slug') return <span className="t-clip">/{v}/</span>;
    return v || '—';
  };

  return (
    <>
      <div className="adm-head">
        <div>
          <div className="adm-crumb"><Link href="/admin/">Dashboard</Link> / {schema.label}</div>
          <h1>{schema.label}</h1>
          <p>{schema.blurb}</p>
        </div>
        <Link href={`/admin/${name}/new/`} className="ab ab-accent"><Icon name="plus" />Add {schema.one.toLowerCase()}</Link>
      </div>

      <div className="adm-tools">
        <label className="adm-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${schema.label.toLowerCase()}…`} aria-label="Search" />
        </label>
        {(schema.filters || []).map(([key, opts]) => (
          <select key={key} value={f[key] || ''} onChange={(e) => setF({ ...f, [key]: e.target.value })} aria-label={key}>
            {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        ))}
      </div>

      {!items ? <p className="adm-count">Loading…</p> : shown.length === 0 ? (
        <div className="adm-card adm-empty">Nothing here yet. <Link href={`/admin/${name}/new/`} style={{ color: '#1f9ccb' }}>Add the first one</Link>.</div>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              {schema.ordered && <th style={{ width: 50 }}>Order</th>}
              {schema.columns.map(([key, label], k) => <th key={key} className={k > 1 ? 'hide-sm' : ''}>{label === 'thumb' ? '' : label}</th>)}
              <th />
            </tr>
          </thead>
          <tbody>
            {shown.map((it) => (
              <tr key={it.id} onClick={() => router.push(`/admin/${name}/${encodeURIComponent(it.id)}/`)}>
                {schema.ordered && (
                  <td><div className="ord"><button type="button" aria-label="Move up" onClick={(e) => move(it, -1, e)}>▲</button><button type="button" aria-label="Move down" onClick={(e) => move(it, 1, e)}>▼</button></div></td>
                )}
                {schema.columns.map((c, k) => <td key={c[0]} className={`${k > 1 ? 'hide-sm' : ''} ${c[0] === 'title' || c[0] === 'name' || c[0] === 'q' ? 't-title' : ''}`} style={c[1] === 'thumb' ? { width: 70 } : undefined}>{cell(it, c)}</td>)}
                <td>
                  <div className="adm-actions">
                    <a className="ab ab-sm hide-sm" href={schema.path(it)} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>View</a>
                    <button type="button" className="ab ab-sm ab-danger" onClick={(e) => remove(it, e)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {items && <p className="adm-count">{shown.length} of {items.length} shown</p>}
      <Toast toast={toast} onDone={() => setToast(null)} />
    </>
  );
}
