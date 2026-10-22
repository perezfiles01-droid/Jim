/*
 * RAC Item 5 (22 Oct 2026): dynamic categories. Each department code carries a
 * Main, Sub and Sub Sub Category, read from the merged site file (columns G to
 * I, filled by the BA team). The filter is built from whatever values are here,
 * so regrouping needs no change to the report, and the labels can be renamed.
 *
 * SAMPLE VALUES until the team's file arrives, in the agreed pattern:
 * Main = HQ / RM / RO, Sub = the department, Sub Sub = the resident mission.
 */
export const CATEGORY_LABELS: [string, string, string] = ['Main Category', 'Sub Category', 'Sub Sub Category'];

export interface ICategory { main: string; sub: string; subSub?: string }

const C: Record<string, [string, string, string?]> = {
  ITD: ['HQ', 'ITD'], SARD: ['HQ', 'SARD'], OSFG: ['HQ', 'OSFG'], FIN: ['HQ', 'FIN'], PARD: ['HQ', 'PARD'],
  HRD: ['HQ', 'HRD'], SERD: ['HQ', 'SERD'], EARD: ['HQ', 'EARD'], CWRD: ['HQ', 'CWRD'], OGC: ['HQ', 'OGC'], SPD: ['HQ', 'SPD'],
  SLRM: ['RM', 'SARD', 'SLRM'], INRM: ['RM', 'SARD', 'INRM'], PRCM: ['RM', 'EARD', 'PRCM'],
  NARO: ['RO', 'NARO'], ERO: ['RO', 'ERO']
};

/** A department's categories; one with no row sits under "Uncategorised". */
export function categoryOf(code: string): ICategory {
  const c = C[code];
  return c ? { main: c[0], sub: c[1], subSub: c[2] } : { main: 'Uncategorised', sub: code };
}

/** Main Category values in the order the list gives them (the file's own order). */
export function mainOrder(): string[] {
  const seen: string[] = [];
  Object.keys(C).forEach(k => { if (seen.indexOf(C[k][0]) < 0) seen.push(C[k][0]); });
  return seen;
}
