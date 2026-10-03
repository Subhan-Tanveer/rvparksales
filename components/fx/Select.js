'use client';
import { useEffect, useId, useRef, useState } from 'react';

// Modern dropdown used by every search / filter bar instead of the browser's
// grey select box: a pill-style trigger and a floating rounded menu with the
// current choice ticked. Works by mouse, touch and keyboard (arrows, Enter,
// Esc, type-ahead). Controlled with value/onChange, or inside a plain <form>
// with name/defaultValue (a hidden input carries the value).
// options: [[value, label], ...]
export default function Select({ options, value, defaultValue = '', onChange, name, label, className = '', variant = '' }) {
  const [inner, setInner] = useState(defaultValue);
  const current = value !== undefined ? value : inner;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef(null);
  const list = useRef(null);
  const typed = useRef({ s: '', t: 0 });
  const id = useId();
  const idx = Math.max(0, options.findIndex(([v]) => String(v) === String(current)));
  const shown = options[idx]?.[1] ?? '';

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (!root.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const pick = (i) => {
    const v = options[i][0];
    if (value === undefined) setInner(v);
    onChange?.(String(v));
    setOpen(false);
  };

  const onKey = (e) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); setActive(idx); return; }
      setActive((a) => Math.max(0, Math.min(options.length - 1, a + (e.key === 'ArrowDown' ? 1 : -1))));
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open) pick(active); else { setOpen(true); setActive(idx); }
      return;
    }
    if (e.key === 'Tab') { setOpen(false); return; }
    if (e.key.length === 1) {
      const now = Date.now();
      typed.current = { s: (now - typed.current.t < 600 ? typed.current.s : '') + e.key.toLowerCase(), t: now };
      const hit = options.findIndex(([, l]) => String(l).toLowerCase().startsWith(typed.current.s));
      if (hit >= 0) { setActive(hit); if (!open) setOpen(true); }
    }
  };

  return (
    <div className={`xsel ${open ? 'open' : ''} ${variant ? `xsel-${variant}` : ''} ${className}`} ref={root} data-lenis-prevent>
      {name && <input type="hidden" name={name} value={current ?? ''} />}
      <button
        type="button" className="xsel-btn" role="combobox" aria-haspopup="listbox" aria-expanded={open}
        aria-controls={`${id}-list`} aria-label={label ? `${label}: ${shown}` : undefined}
        onClick={() => { setOpen(!open); setActive(idx); }} onKeyDown={onKey}
      >
        <span className="xsel-val">{shown}</span>
        <svg className="xsel-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <ul className="xsel-list" id={`${id}-list`} role="listbox" ref={list} hidden={!open}>
        {options.map(([v, l], i) => (
          <li
            key={`${v}`} data-i={i} role="option" aria-selected={i === idx}
            className={`${i === idx ? 'sel' : ''} ${i === active ? 'act' : ''}`}
            onPointerEnter={() => setActive(i)} onClick={() => pick(i)}
          >
            <span>{l}</span>
            {i === idx && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </li>
        ))}
      </ul>
    </div>
  );
}
