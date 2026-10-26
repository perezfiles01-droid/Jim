/** 21646 to "21,646". */
export declare const F: (n: number) => string;
/** 3473000 to "3.47M", 640000 to "640k". */
export declare const short: (v: number) => string;
/** Share as a percentage with one decimal. */
export declare const pct: (a: number, b: number, digits?: number) => string;
/** A round number at or above x, for chart axes. */
export declare function niceMax(x: number): number;
/** Axis label: 2500 to "2.5k", 3000000 to "3M". */
export declare const axisLabel: (v: number) => string;
export type SortDir = 'asc' | 'desc';
export declare function compare(a: string | number, b: string | number): number;
/**
 * RAC Item 11 (22 Oct 2026): the data is refreshed once a week, every Monday.
 * The refresh date is the most recent Monday; the "Data as of" stamp shows it,
 * and no date picker lets a reader choose a day after it.
 */
export declare function refreshDate(): Date;
/** The refresh date as yyyy-mm-dd, for a date field's max. */
export declare const refreshIso: () => string;
/** The refresh date as "Monday 19 Oct 2026". */
export declare const refreshLabel: () => string;
//# sourceMappingURL=format.d.ts.map