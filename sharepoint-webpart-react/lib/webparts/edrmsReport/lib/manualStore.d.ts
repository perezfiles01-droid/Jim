import { SPHttpClient } from '@microsoft/sp-http';
import { IManualData, IIssue } from './importRules';
export interface IHistoryEntry {
    at: string;
    by: string;
    fileName: string;
    status: 'loaded' | 'refused';
    sites: number;
    people: number;
    units: number;
    problems: number;
}
export interface IManualStore {
    load(): Promise<IManualData | null>;
    history(): Promise<IHistoryEntry[]>;
    save(data: IManualData): Promise<void>;
    logRefused(fileName: string, by: string, issues: IIssue[]): Promise<void>;
}
export declare function createManualStore(http: SPHttpClient, webUrl: string, webRelUrl: string): IManualStore;
//# sourceMappingURL=manualStore.d.ts.map