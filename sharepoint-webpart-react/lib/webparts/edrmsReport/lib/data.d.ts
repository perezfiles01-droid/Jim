export interface IDept {
    code: string;
    name: string;
    sites: number;
    /** People active in EDRMS in the last 180 days. */
    users: number;
    /** Approximate headcount, provided by RAC. */
    head: number;
    docs: number;
    rec: number;
    phys: number;
    /** Distinct people who declared at least one record. */
    declaring: number;
    creating: number;
    idle180: number;
    visitors: number;
    views: number;
    gb: number;
    recgb: number;
}
export interface ISite {
    name: string;
    owner: string;
    docs: number;
    rec: number;
    phys: number;
    users: number;
    visitors: number;
    declaring: number;
    creating: number;
    /** Days since last activity. */
    idle: number;
    gb: number;
    ermsType: string;
}
export interface ILibrary {
    lib: string;
    site: string;
    docs: number;
    rec: number;
    phys: number;
}
export interface ITrend {
    /** First day of each month, yyyy-mm-dd. */
    keys: string[];
    values: number[];
    labels: string[];
    from: string;
    to: string;
}
export interface ITotals {
    documents: number;
    declared: number;
    withPhysical: number;
    sites: number;
    activeUsers: number;
    headcount: number;
    usersDeclaring: number;
    usersCreating: number;
    visitors: number;
    storageGb: number;
}
export interface IReportData {
    asOf: string;
    totals: ITotals;
    trend: ITrend;
    depts: IDept[];
    sites: {
        [code: string]: ISite[];
    };
    libsByDept: {
        [code: string]: ILibrary[];
    };
    libsAll: ILibrary[];
    allName: string;
}
export declare function loadReportData(): IReportData;
/** Headcount is shown rounded to the nearest hundred. */
export declare const approxHead: (d: IDept) => number;
/** People who completed EDRMS training (sample figure until RAC supplies it). */
export declare function trainingDone(d: IDept): number;
/** Internal and external visitors of a site. */
export declare function visitorSplit(s: ISite): {
    internal: number;
    external: number;
};
/** The date a site was created. */
export declare function siteCreated(s: ISite): Date;
/** "k.aquino@adb.org" to "K Aquino". */
export declare function ownerName(email: string): string;
export declare function ownerInitials(email: string): string;
/** Folders and active users of a library (sample figures). */
export declare function libraryExtras(l: ILibrary): {
    folders: number;
    users: number;
};
export declare const DOC_MONTHS: {
    y: number;
    m: number;
    lab: string;
}[];
/** Documents held by a department at the start, and at the end of each month. */
export declare function documentSeries(d: IDept): {
    start: number;
    held: number[];
};
/** Sum a numeric field over a list. */
export declare function sum<T>(list: T[], pick: (x: T) => number): number;
//# sourceMappingURL=data.d.ts.map