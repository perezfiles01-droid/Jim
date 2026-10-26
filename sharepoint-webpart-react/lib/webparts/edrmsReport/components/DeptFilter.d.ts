import * as React from 'react';
import { IDept } from '../lib/data';
/**
 * The Filter button on department tables. The popup holds the same Category >
 * Sub-category > Sub-group boxes as Department Insights (RAC Item 5, 22 Oct
 * 2026); Apply narrows the table. An empty selection means every department.
 */
export declare const DeptFilter: React.FC<{
    depts: IDept[];
    selected: string[];
    onApply: (codes: string[]) => void;
}>;
/** Filters and searches a department list the same way on every table. */
export declare function filterDepts(depts: IDept[], selected: string[], query: string): IDept[];
//# sourceMappingURL=DeptFilter.d.ts.map