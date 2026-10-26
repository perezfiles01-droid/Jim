import * as React from 'react';
import { IExportTable } from '../lib/exporters';
export declare const InfoGlyph: () => JSX.Element;
export declare const DownloadGlyph: () => JSX.Element;
export declare const FunnelGlyph: () => JSX.Element;
/** The arrow on drop-downs, drawn here so it does not depend on an icon font. */
export declare const Caret: () => JSX.Element;
/** The small (i) at a card's top right. The description shows on hover or keyboard focus. */
export declare const InfoIcon: React.FC<{
    text: string;
}>;
export declare const Band: React.FC<{
    title: string;
    text: string;
    tools?: React.ReactNode;
}>;
export declare const Panel: React.FC<{
    title?: string;
    sub?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}>;
export interface IKpi {
    key: string;
    label: string;
    value: string;
    /** The description behind the (i). */
    info: string;
}
/** A row of clickable cards; the one that is open shows its breakdown below. */
export declare const KpiRow: React.FC<{
    items: IKpi[];
    open: string;
    onOpen: (k: string) => void;
    stacked?: boolean;
}>;
/** Small summary cards above a table. */
export declare const Tiles: React.FC<{
    items: {
        label: string;
        value: string;
        info?: string;
    }[];
}>;
export declare const SumCard: React.FC<{
    label: string;
    value: React.ReactNode;
    hint?: string;
    swatch?: string;
    info?: string;
    children?: React.ReactNode;
}>;
export declare const Search: React.FC<{
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}>;
export declare function Segmented<T extends string>(props: {
    options: {
        key: T;
        text: string;
    }[];
    value: T;
    onChange: (v: T) => void;
    label?: string;
}): JSX.Element;
export declare const ExportButton: React.FC<{
    table: () => IExportTable;
}>;
export declare const Chip: React.FC<{
    text: string;
    onClear: () => void;
}>;
export declare const Pager: React.FC<{
    total: number;
    page: number;
    size: number;
    noun: string;
    onPage: (p: number) => void;
}>;
/** A department code and name. The underlined code opens Department Insights. */
export declare const DeptCell: React.FC<{
    code: string;
    name: string;
    plain?: boolean;
}>;
//# sourceMappingURL=ui.d.ts.map