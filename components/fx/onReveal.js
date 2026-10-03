// Run cb once the preloader / page curtain has opened (see Chrome.js).
export default function onReveal(cb) {
  if (typeof window === 'undefined') return () => {};
  if (window.__rvReady) {
    const t = setTimeout(cb, 30);
    return () => clearTimeout(t);
  }
  const h = () => cb();
  window.addEventListener('rv:reveal', h, { once: true });
  return () => window.removeEventListener('rv:reveal', h);
}
