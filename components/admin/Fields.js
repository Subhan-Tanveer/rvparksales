'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { slugify } from '@/lib/admin-schema';
import { uploadImage } from '@/components/admin/util';

const RichText = dynamic(() => import('@/components/admin/RichText'), { ssr: false, loading: () => <div className="rte"><div className="rte-body"><div className="ProseMirror" /></div></div> });

// One form field, chosen by its type in lib/admin-schema.js.
export default function Field({ f, item, set, extra, name }) {
  const v = item[f.key];
  const id = `f-${f.key}`;
  const label = <label htmlFor={id}>{f.label}{f.required && <span className="req"> *</span>}</label>;
  const wrap = (children, hint) => <div className={`af ${f.wide ? 'wide' : ''}`}>{label}{children}{hint && <span className="af-hint">{hint}</span>}</div>;

  switch (f.type) {
    case 'text':
      return wrap(<input id={id} type="text" value={v ?? ''} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />);
    case 'number':
      return wrap(<input id={id} type="number" inputMode="decimal" min="0" step="any" value={v ?? ''} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />);
    case 'textarea':
      return wrap(<textarea id={id} rows={f.rows || 4} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} />);
    case 'select': {
      // Options can come from live data, e.g. the RVParkSelect broker list.
      const options = f.optionsFrom
        ? [['', f.emptyLabel || 'None'], ...(extra?.[f.optionsFrom] || []).map((x) => [String(x.id), x.name])]
        : f.options;
      return wrap(
        <select id={id} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)}>
          {!options.some(([o]) => o === (v ?? '')) && <option value={v ?? ''}>{v || 'Choose…'}</option>}
          {options.map(([o, t]) => <option key={o} value={o}>{t}</option>)}
        </select>,
        f.hint,
      );
    }
    case 'money': {
      // Stored in cents (RVParkSelect / RVParkAds), typed in dollars.
      const dollars = v == null || v === '' ? '' : String(Math.round(Number(v) / 100));
      return wrap(
        <div className="af-slug"><span>$</span><input id={id} type="text" inputMode="numeric" value={dollars ? Number(dollars).toLocaleString('en-US') : ''} placeholder={f.placeholder || '0'} onChange={(e) => { const n = e.target.value.replace(/[^0-9]/g, ''); set(f.key, n ? Number(n) * 100 : null); }} /></div>,
      );
    }
    case 'toggle':
      return (
        <div className={`af ${f.wide ? 'wide' : ''}`}>
          <label className="af-toggle"><input id={id} type="checkbox" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} /><span>{f.label}</span></label>
        </div>
      );
    case 'checks':
      return (
        <div className={`af ${f.wide ? 'wide' : ''}`}>
          <span className="af-label">{f.label}</span>
          <div className="chips">
            {f.options.map((o) => {
              const on = (v || []).includes(o);
              return <button type="button" key={o} className={`chip ${on ? 'on' : ''}`} onClick={() => set(f.key, on ? v.filter((x) => x !== o) : [...(v || []), o])}>{on ? '✓ ' : ''}{o}</button>;
            })}
          </div>
        </div>
      );
    case 'lines':
      return wrap(<textarea id={id} rows={3} value={(v || []).join(String.fromCharCode(10))} onChange={(e) => set(f.key, e.target.value.split(String.fromCharCode(10)).map((x) => x.trim()).filter(Boolean))} />, 'One link per line.');
    case 'readonly':
      return <div className={`af ${f.wide ? 'wide' : ''}`}><span className="af-label">{f.label}</span><div className="af-ro">{show(v, f.format)}</div></div>;
    case 'file':
      return wrap(<FileField value={v} onChange={(u) => set(f.key, u)} folder={name} accept={f.accept} />);
    case 'date': {
      const val = String(v || '').replace(' ', 'T').slice(0, f.dateOnly ? 10 : 16);
      return wrap(<input id={id} type={f.dateOnly ? 'date' : 'datetime-local'} value={val} onChange={(e) => set(f.key, f.dateOnly ? e.target.value : `${e.target.value.replace('T', ' ')}:00`)} />);
    }
    case 'slug': {
      const auto = !item._slugTouched && item._new;
      return wrap(
        <div className="af-slug">
          <span>{f.prefix}</span>
          <input id={id} type="text" value={auto ? slugify(item[f.from]) : (v ?? '')} onChange={(e) => { set('_slugTouched', true); set(f.key, e.target.value); }} onBlur={(e) => set(f.key, slugify(e.target.value))} />
        </div>,
        item._new ? 'Filled in from the title. Only letters, numbers and dashes.' : 'Changing this changes the page address; old links to it will stop working.',
      );
    }
    case 'richtext':
      return <div className={`af ${f.wide ? 'wide' : ''}`}><span className="af-label">{f.label}</span><RichText value={v || ''} onChange={(h) => set(f.key, h)} folder={name} /></div>;
    case 'image':
      return wrap(<ImageField value={v} onChange={(u) => set(f.key, u)} folder={name} />);
    case 'images':
      return <div className="af wide"><span className="af-label">{f.label}</span><Gallery value={v || []} onChange={(list) => set(f.key, list)} folder={name} /></div>;
    case 'location':
      return <div className="af wide"><span className="af-label">{f.label}</span><Location item={item} set={set} /></div>;
    case 'person':
      return <div className="af wide"><span className="af-label">{f.label}</span><Person item={item} set={set} f={f} brokers={extra?.brokers || []} folder={name} /></div>;
    case 'multicats':
      return (
        <div className="af wide">
          <span className="af-label">{f.label}</span>
          <div className="chips">
            {(extra?.categories || []).map((c) => {
              const on = (v || []).includes(c.slug);
              return <button type="button" key={c.slug} className={`chip ${on ? 'on' : ''}`} onClick={() => set(f.key, on ? v.filter((s) => s !== c.slug) : [...(v || []), c.slug])}>{on ? '✓ ' : ''}{c.name}</button>;
            })}
          </div>
        </div>
      );
    default:
      return null;
  }
}

// Read-only values (members, lenders, seller info).
function show(v, format) {
  if (v == null || v === '' || (Array.isArray(v) && !v.length)) return <span className="af-hint">—</span>;
  if (format === 'images') return <div className="af-gallery">{v.map((u) => <div key={u} className="af-ph"><img src={u} alt="" loading="lazy" /></div>)}</div>;
  if (format === 'money') return `$${Math.round(Number(v) / 100).toLocaleString('en-US')}`;
  if (format === 'date') return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'string' && /^https?:\/\//.test(v)) return <a href={v} target="_blank" rel="noopener" style={{ color: '#1f9ccb' }}>{v}</a>;
  return String(v);
}

// PDF / document upload (e.g. a listing's info packet).
function FileField({ value, onChange, folder, accept }) {
  const input = useRef(null);
  const [pct, setPct] = useState(null);
  async function pick(e) {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    setPct(0);
    try { onChange(await uploadImage(f, folder, setPct)); } catch (err) { alert(err.message); }
    setPct(null);
  }
  return (
    <div className="af-img">
      {value ? <a href={value} target="_blank" rel="noopener" className="ab ab-sm">Open current file ↗</a> : <span className="af-hint">No file yet.</span>}
      <button type="button" className="ab" onClick={() => input.current?.click()}>{value ? 'Replace file' : 'Upload file'}</button>
      {value && <button type="button" className="ab ab-danger" onClick={() => onChange(null)}>Remove</button>}
      {pct !== null && <span className="af-progress">Uploading… {pct}%</span>}
      <input ref={input} type="file" accept={accept || 'application/pdf'} hidden onChange={pick} />
    </div>
  );
}

function ImageField({ value, onChange, folder }) {
  const input = useRef(null);
  const [pct, setPct] = useState(null);
  async function pick(e) {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    setPct(0);
    try { onChange(await uploadImage(f, folder, setPct)); } catch (err) { alert(err.message); }
    setPct(null);
  }
  return (
    <div className="af-img">
      {value ? <img src={value} alt="" /> : null}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="ab" onClick={() => input.current?.click()}>{value ? 'Replace photo' : 'Upload photo'}</button>
        {value && <button type="button" className="ab ab-danger" onClick={() => onChange(null)}>Remove</button>}
      </div>
      {pct !== null && <span className="af-progress">Uploading… {pct}%</span>}
      <input ref={input} type="file" accept="image/*" hidden onChange={pick} />
    </div>
  );
}

// Listing photos: drop or pick several at once, drag to reorder, the first is the cover.
function Gallery({ value, onChange, folder }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const [drag, setDrag] = useState(null);
  const [status, setStatus] = useState('');

  async function addFiles(files) {
    const list = [...files].filter((f) => f.type.startsWith('image/'));
    if (!list.length) return;
    let urls = [...value];
    for (let i = 0; i < list.length; i++) {
      setStatus(`Uploading ${i + 1} of ${list.length}…`);
      try { const u = await uploadImage(list[i], folder, (p) => setStatus(`Uploading ${i + 1} of ${list.length}… ${p}%`)); urls = [...urls, u]; onChange(urls); } catch (err) { alert(`${list[i].name}: ${err.message}`); }
    }
    setStatus('');
  }
  const moveTo = (from, to) => { const l = [...value]; const [x] = l.splice(from, 1); l.splice(to, 0, x); onChange(l); };

  return (
    <>
      <div className="af-gallery">
        {value.map((u, i) => (
          <div
            key={u + i} className={`af-ph ${i === 0 ? 'cover' : ''} ${drag === i ? 'drag' : ''}`} draggable
            onDragStart={() => setDrag(i)} onDragEnd={() => setDrag(null)}
            onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (drag !== null && drag !== i) moveTo(drag, i); setDrag(null); }}
          >
            <img src={u} alt="" loading="lazy" />
            {i === 0 && <span className="tag">Cover</span>}
            <div className="ops">
              {i > 0 && <button type="button" title="Make cover photo" onClick={() => moveTo(i, 0)}>★</button>}
              {i > 0 && <button type="button" title="Move left" onClick={() => moveTo(i, i - 1)}>←</button>}
              {i < value.length - 1 && <button type="button" title="Move right" onClick={() => moveTo(i, i + 1)}>→</button>}
              <button type="button" title="Remove photo" onClick={() => onChange(value.filter((_, k) => k !== i))}>✕</button>
            </div>
          </div>
        ))}
        <div
          className={`af-drop ${over ? 'over' : ''}`} role="button" tabIndex={0}
          onClick={() => input.current?.click()} onKeyDown={(e) => { if (e.key === 'Enter') input.current?.click(); }}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); }}
        >
          <span><b>+ Add photos</b>Click or drop images here</span>
        </div>
      </div>
      {status && <span className="af-progress">{status}</span>}
      <span className="af-hint">Drag photos to change the order. ★ makes a photo the cover.</span>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
    </>
  );
}

// Address with a "Find on map" button that fills in the map pin (lat/lng).
function Location({ item, set }) {
  const [msg, setMsg] = useState('');
  async function find() {
    if (!item.address) { setMsg('Type an address first.'); return; }
    setMsg('Looking up…');
    try {
      const { geocode } = await import('@/components/googleMaps');
      const hit = await geocode(item.address);
      if (!hit) { setMsg('Could not find that address. Check it, or type the coordinates below.'); return; }
      set('lat', String(hit.lat)); set('lng', String(hit.lng));
      setMsg('Map pin updated.');
    } catch { setMsg('Map lookup is not available right now.'); }
  }
  const has = item.lat && item.lng;
  return (
    <div className="af-loc">
      <div className="af-loc-row">
        <input type="text" value={item.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="Street, city, state" aria-label="Address" style={{ border: '1px solid #d9d5cc', borderRadius: 10, padding: '10px 12px', minHeight: 44 }} />
        <button type="button" className="ab" onClick={find}>Find on map</button>
      </div>
      <div className="af-latlng">
        <div className="af"><label>Latitude</label><input type="text" value={item.lat || ''} onChange={(e) => set('lat', e.target.value)} /></div>
        <div className="af"><label>Longitude</label><input type="text" value={item.lng || ''} onChange={(e) => set('lng', e.target.value)} /></div>
      </div>
      {msg && <span className="af-hint">{msg}</span>}
      {has && <iframe className="af-map" title="Map preview" loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(`${item.lat},${item.lng}`)}&z=11&output=embed`} />}
    </div>
  );
}

// Who buyers contact about a listing: pick a broker, or type someone else.
function Person({ item, set, f, brokers, folder }) {
  const name = item[f.key] || '';
  const match = brokers.find((b) => b.name === name);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <select
        value={match ? name : name ? '__other' : ''}
        onChange={(e) => {
          const b = brokers.find((x) => x.name === e.target.value);
          if (b) { set(f.key, b.name); set(f.imageKey, b.photo || null); } else if (e.target.value === '') { set(f.key, ''); set(f.imageKey, null); } else set(f.key, name || ' ');
        }}
        style={{ border: '1px solid #d9d5cc', borderRadius: 10, padding: '10px 12px', minHeight: 44, background: '#fff' }}
        aria-label="Broker"
      >
        <option value="">No one (use the main contact)</option>
        {brokers.map((b) => <option key={b.name} value={b.name}>{b.name}</option>)}
        <option value="__other">Someone else…</option>
      </select>
      {name && !match && (
        <div className="adm-fields">
          <div className="af"><label>Contact name</label><input type="text" value={name.trim()} onChange={(e) => set(f.key, e.target.value)} /></div>
          <div className="af"><label>Contact photo</label><ImageField value={item[f.imageKey]} onChange={(u) => set(f.imageKey, u)} folder={folder} /></div>
        </div>
      )}
      {match && item[f.imageKey] && <div className="af-img"><img src={item[f.imageKey]} alt="" style={{ width: 70, height: 70, borderRadius: '50%' }} /><span className="af-hint">{match.phone} {match.email}</span></div>}
    </div>
  );
}
