export declare const CATEGORY_LABELS: [string, string, string];
export interface ICategory {
    main: string;
    sub: string;
    subSub?: string;
}
/** A department's categories; one with no row sits under "Uncategorised". */
export declare function categoryOf(code: string): ICategory;
/** Main Category values in the order the list gives them (the file's own order). */
export declare function mainOrder(): string[];
//# sourceMappingURL=categories.d.ts.map