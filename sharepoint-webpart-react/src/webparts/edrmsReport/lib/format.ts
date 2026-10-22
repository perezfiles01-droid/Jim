/** 21646 to "21,646". */
export const F = (n: number): string => Number(Math.round(n)).toLocaleString('en-US');

/** 3473000 to "3.47M", 640000 to "640k". */
export const short = (v: number): string =>
  v >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : v >= 10000 ? Math.round(v / 1000) + 'k' : F(v);

/** Share as a percentage with one decimal. */
export const pct = (a: number, b: number, digits: number = 1): string =>
  (b ? (a / b) * 100 : 0).toFixed(digits) + '%';

/** A round number at or above x, for chart axes. */
export function niceMax(x: number): number {
  const v = Math.max(x, 1);
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

/** Axis label: 2500 to "2.5k", 3000000 to "3M". */
export const axisLabel = (v: number): string =>
  v >= 1e6 ? +(v / 1e6).toFixed(2) + 'M' : v >= 1000 ? +(v / 1000).toFixed(1) + 'k' : String(Math.round(v));

export type SortDir = 'asc' | 'desc';

export function compare(a: string | number, b: string | number): number {
  return typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : (a as number) - (b as number);
}
