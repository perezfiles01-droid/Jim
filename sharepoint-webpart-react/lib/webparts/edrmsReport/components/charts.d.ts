import * as React from 'react';
export interface IBarItem {
    key: string;
    name: string;
    /** Shown small after the name, e.g. the site of a library. */
    note?: string;
    value: number;
    label: string;
    title?: string;
}
export declare const BarList: React.FC<{
    items: IBarItem[];
    selected?: string | null;
    onSelect?: (key: string | null) => void;
    color?: string;
    /** "+ 39 more sites with 7 ..." under the list, when more rows tie with the tenth. */
    more?: {
        text: string;
        onClick: () => void;
    };
    valueWidth?: number;
}>;
export interface IColumnItem {
    key: string;
    label: string;
    value: number;
    title?: string;
}
export declare const ColumnChart: React.FC<{
    items: IColumnItem[];
    height?: number;
    /** Drawing width; smaller makes the text larger in a narrow box. */
    width?: number;
    color?: string;
    /** Highlights one column and fades the others. */
    selected?: string | null;
    onClick?: (key: string) => void;
    valueLabel?: (v: number) => string;
    showValues?: boolean;
    ariaLabel: string;
}>;
export declare const ComboChart: React.FC<{
    items: IColumnItem[];
    onClick?: (key: string) => void;
    ariaLabel: string;
}>;
export declare const Donut: React.FC<{
    part: number;
    total: number;
    color: string;
    rest: string;
    caption: string;
}>;
//# sourceMappingURL=charts.d.ts.map