import * as React from 'react';
import { SortDir } from '../lib/format';
export interface IColumn<T> {
    key: string;
    label: string;
    /** Right aligned, and sorted largest first on its first click. */
    numeric?: boolean;
    width?: string;
    sortValue: (row: T) => string | number;
    render: (row: T) => React.ReactNode;
    className?: string;
}
export interface IDataTableProps<T> {
    columns: IColumn<T>[];
    rows: T[];
    rowKey: (row: T) => string;
    noun: string;
    pageSize?: number;
    /** The column the table opens sorted by (ascending). */
    defaultSort?: string;
    defaultDir?: SortDir;
    /** Opens a row, e.g. a department in Department Insights. */
    onRowClick?: (row: T) => void;
    highlight?: (row: T) => boolean;
    /** A bold total row under the page. */
    totalRow?: React.ReactNode[];
    /** Change it to send the table back to page 1 (a new search or filter). */
    resetKey?: string;
    /** Which page to show, e.g. the page holding a chosen row. */
    jumpTo?: (sorted: T[]) => number | undefined;
    emptyText?: string;
}
/** A sortable, paged table. Click a heading to sort, again to reverse. */
export declare function DataTable<T>(p: IDataTableProps<T>): JSX.Element;
//# sourceMappingURL=DataTable.d.ts.map