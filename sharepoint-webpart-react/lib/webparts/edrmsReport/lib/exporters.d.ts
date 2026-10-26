export type Cell = string | number;
export interface IExportTable {
    /** File name without extension. */
    name: string;
    head: string[];
    rows: Cell[][];
    /** Optional total row, drawn in bold. */
    total?: Cell[];
}
/** Writes an .xlsx in the house style: ADB blue header, banding, filters. */
export declare function exportTable(t: IExportTable): Promise<void>;
/**
 * Draws the element as a picture and saves it as a landscape A4 PDF, page by
 * page. Pages break at the start of a section (a title band or panel), or else
 * between table rows, never through a panel or a row (22 Oct 2026).
 */
export declare function exportPdf(el: HTMLElement, name: string): Promise<void>;
export interface IPptMeta {
    /** Dashboard name, e.g. "Bank-wide Oversight". */
    name: string;
    /** The dashboard's one-line description. */
    desc: string;
    asOf: string;
    filter: string;
}
/**
 * One slide per breakdown (every card, opened in turn) and per section below,
 * as on screen without the controls. A tall picture continues on a second
 * slide rather than being shrunk. Leaves the reader's open card as it was.
 */
export declare function exportPptx(dashEl: HTMLElement, meta: IPptMeta): Promise<void>;
//# sourceMappingURL=exporters.d.ts.map