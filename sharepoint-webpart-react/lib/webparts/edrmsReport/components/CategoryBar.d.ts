import * as React from 'react';
import { IDept } from '../lib/data';
/** A box like the other pickers whose list has a search field and ticks (22 Oct 2026). */
export declare const Multi: React.FC<{
    label: string;
    values: string[];
    value: string[];
    allText: string;
    onChange: (v: string[]) => void;
    text?: (v: string) => string;
    summary?: (v: string[]) => string;
}>;
export declare const CategoryBar: React.FC<{
    depts: IDept[];
    codes: string[];
    onChange: (codes: string[]) => void;
    site?: React.ReactNode;
    vertical?: boolean;
}>;
//# sourceMappingURL=CategoryBar.d.ts.map