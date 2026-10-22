// The report's data, and the few figures it derives from it.
//
// Everything on screen is read through IReportData. Today it is filled from
// data/sampleData.json, the same sample figures as the approved prototype, so
// the two can be compared number for number. To connect the real reporting
// database, replace loadReportData() with a call to the API and return the
// same shapes; no component needs to change.

export interface IDept {
  code: string;
  name: string;
  sites: number;
  /** People active in EDRMS in the last 180 days. */
  users: number;
  /** Approximate headcount, provided by RAC. */
  head: number;
  docs: number;
  rec: number;
  phys: number;
  /** Distinct people who declared at least one record. */
  declaring: number;
  creating: number;
  idle180: number;
  visitors: number;
  views: number;
  gb: number;
  recgb: number;
}

export interface ISite {
  name: string;
  owner: string;
  docs: number;
  rec: number;
  phys: number;
  users: number;
  visitors: number;
  declaring: number;
  creating: number;
  /** Days since last activity. */
  idle: number;
  gb: number;
  ermsType: string;
}

export interface ILibrary {
  lib: string;
  site: string;
  docs: number;
  rec: number;
  phys: number;
}

export interface ITrend {
  /** First day of each month, yyyy-mm-dd. */
  keys: string[];
  values: number[];
  labels: string[];
  from: string;
  to: string;
}

export interface ITotals {
  documents: number;
  declared: number;
  withPhysical: number;
  sites: number;
  activeUsers: number;
  headcount: number;
  usersDeclaring: number;
  usersCreating: number;
  visitors: number;
  storageGb: number;
}

export interface IReportData {
  asOf: string;
  totals: ITotals;
  trend: ITrend;
  depts: IDept[];
  sites: { [code: string]: ISite[] };
  libsByDept: { [code: string]: ILibrary[] };
  libsAll: ILibrary[];
  allName: string;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SAMPLE: IReportData = require('../data/sampleData.json');

export function loadReportData(): IReportData {
  return SAMPLE;
}

/* ---------- derived figures (the same formulas as the prototype) ---------- */

/** Headcount is shown rounded to the nearest hundred. */
export const approxHead = (d: IDept): number => Math.round(d.head / 100) * 100;

function seed(text: string, mul: number, mod: number): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * mul + text.charCodeAt(i)) % mod;
  return h;
}

/** People who completed EDRMS training (sample figure until RAC supplies it). */
export function trainingDone(d: IDept): number {
  const rate = 0.6 + 0.35 * (seed(d.code, 37, 997) / 997);
  return Math.round(d.head * rate);
}

/** Internal and external visitors of a site. */
export function visitorSplit(s: ISite): { internal: number; external: number } {
  const h = seed(s.name, 33, 9973);
  const external = Math.round(s.visitors * (0.03 + 0.12 * (h / 9973)));
  return { internal: s.visitors - external, external };
}

/** The date a site was created. */
export function siteCreated(s: ISite): Date {
  const h = seed(s.name, 31, 100003);
  const m = h % 33;
  return new Date(2024 + Math.floor(m / 12), m % 12, 1 + (h % 27));
}

/** "k.aquino@adb.org" to "K Aquino". */
export function ownerName(email: string): string {
  const parts = String(email || '').split('@')[0].split(/[._-]/).filter(Boolean);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || email;
}

export function ownerInitials(email: string): string {
  return ownerName(email).split(' ').map(p => p.charAt(0)).join('').slice(0, 2);
}

/** Folders and active users of a library (sample figures). */
export function libraryExtras(l: ILibrary): { folders: number; users: number } {
  const h = seed(l.lib + '||' + l.site, 31, 9973);
  return {
    users: Math.max(1, Math.round(Math.sqrt(l.docs) / 4 + (h % 9))),
    folders: Math.max(1, Math.round(l.docs / 45 + (h % 7)))
  };
}

/* Documents over time: 33 monthly snapshots, Jan 2024 to Sep 2026. */
export const DOC_MONTHS: { y: number; m: number; lab: string }[] = (() => {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const out: { y: number; m: number; lab: string }[] = [];
  for (let i = 0; i < 33; i++) {
    const y = 2024 + Math.floor(i / 12);
    out.push({ y, m: i % 12, lab: names[i % 12] + " '" + String(y).slice(2) });
  }
  return out;
})();

/** Documents held by a department at the start, and at the end of each month. */
export function documentSeries(d: IDept): { start: number; held: number[] } {
  let s = seed(d.code, 31, 9973);
  const w: number[] = [];
  let tw = 0;
  for (let i = 0; i < DOC_MONTHS.length; i++) {
    s = (s * 7919 + 17) % 9973;
    const x = 0.6 + 0.8 * s / 9973;
    w.push(x);
    tw += x;
  }
  const start = Math.round(d.docs * 0.55), grow = d.docs - start, held: number[] = [];
  let acc = 0;
  for (let i = 0; i < DOC_MONTHS.length; i++) {
    acc += w[i];
    held.push(start + Math.round(grow * acc / tw));
  }
  held[DOC_MONTHS.length - 1] = d.docs;
  return { start, held };
}

/** Sum a numeric field over a list. */
export function sum<T>(list: T[], pick: (x: T) => number): number {
  return list.reduce((a, x) => a + (pick(x) || 0), 0);
}
