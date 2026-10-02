// Small pure helpers safe to use in both server and browser code (no file access).
export const usd = (n) => (n ? '$' + Number(n).toLocaleString('en-US') : 'Price on request');
