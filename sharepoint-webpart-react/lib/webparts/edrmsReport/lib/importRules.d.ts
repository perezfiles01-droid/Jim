export type Cell = string | number | boolean | Date | null | undefined;
export type Sheet = Cell[][];
export interface IIssue {
    tab: string;
    row: number;
    column: string;
    message: string;
}
export interface IUnitFigures {
    headcount: number;
    staff: number;
    consultant: number;
    contractor: number;
    trained: number;
    goLive: string | null;
    convUrl: string | null;
}
export interface ISiteRow {
    site: string;
    url: string;
    siteName: string;
    department: string;
    division: string;
    production: boolean;
    category: string;
    subCategory: string;
    subGroup: string | null;
    /** The unit's full name (VLOOKUP SITE "Full Name"), if given. */
    fullName?: string;
}
export interface IManualData {
    version: 2;
    importedAt: string;
    importedBy: string;
    fileName: string;
    units: {
        [code: string]: IUnitFigures;
    };
    sites: ISiteRow[];
    notes: string[];
}
export interface IValidation {
    issues: IIssue[];
    notes: string[];
    data: IManualData | null;
    summary: {
        sites: number;
        people: number;
        units: number;
        trained: number;
    };
}
export declare const TABS: {
    sites: string;
    people: string;
    departments: string;
    mapping: string;
};
export declare const COLUMNS: {
    sites: {
        name: string;
        req: boolean;
        rule: string;
    }[];
    people: {
        name: string;
        req: boolean;
        rule: string;
    }[];
    departments: {
        name: string;
        req: boolean;
        rule: string;
    }[];
    mapping: {
        name: string;
        req: boolean;
        rule: string;
    }[];
};
export declare const POLICIES: string[];
export declare function validate(book: {
    [tab: string]: Sheet;
}, fileName: string, importedBy: string): IValidation;
//# sourceMappingURL=importRules.d.ts.map